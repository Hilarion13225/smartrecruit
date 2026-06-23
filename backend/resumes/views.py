from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import cloudinary.uploader
from .models import Resume
from jobs.models import Job
from .serializers import ResumeSerializer, ResumeUploadSerializer
from analysis.tasks import analyze_resume


class ResumeListView(generics.ListAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        return Resume.objects.filter(
            job__id=job_id,
            job__recruiter=self.request.user
        ).select_related('analysis')


class ResumeUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        job = get_object_or_404(Job, id=job_id, recruiter=request.user)

        files = request.FILES.getlist('cv_files')
        if not files:
            return Response(
                {"error": "Aucun fichier reçu."},
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded = []
        for file in files:
            # ← Upload direct sur Cloudinary en raw (pour les PDFs)
            result = cloudinary.uploader.upload(
                file,
                resource_type='raw',
                folder='cvs/',
            )
            cloudinary_url = result.get('secure_url')
            print(f"  ✅ CV uploadé sur Cloudinary : {cloudinary_url}")

            resume = Resume.objects.create(
                job=job,
                candidate_name=file.name.replace('.pdf', ''),
                cv_url=cloudinary_url,  # ← URL Cloudinary directe
                status='pending'
            )
            uploaded.append(ResumeUploadSerializer(resume).data)

        return Response({
            "message": f"{len(uploaded)} CV uploadé(s) avec succès.",
            "resumes": uploaded
        }, status=status.HTTP_201_CREATED)


class AnalyzeResumesView(APIView):
    """Lance l'analyse IA sur tous les CV d'une offre"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        job = get_object_or_404(Job, id=job_id, recruiter=request.user)
        resumes = Resume.objects.filter(job=job, status='pending')

        if not resumes.exists():
            return Response(
                {"error": "Aucun CV en attente d'analyse."},
                status=status.HTTP_400_BAD_REQUEST
            )

        for resume in resumes:
            resume.status = 'analyzing'
            resume.save()
            analyze_resume(resume.id)

        return Response({
            "message": f"Analyse lancée pour {resumes.count()} CV.",
        })


class ResumeDeleteView(APIView):
    """Supprime un CV uploadé"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, resume_id):
        resume = get_object_or_404(
            Resume,
            id=resume_id,
            job__recruiter=request.user
        )
        # Supprimer sur Cloudinary si cv_url existe
        if resume.cv_url:
            try:
                public_id = resume.cv_url.split('/cvs/')[-1].split('.')[0]
                cloudinary.uploader.destroy(f"cvs/{public_id}", resource_type='raw')
            except Exception:
                pass
        elif resume.cv_file:
            resume.cv_file.delete(save=False)

        resume.delete()
        return Response(
            {"message": "CV supprimé avec succès."},
            status=status.HTTP_204_NO_CONTENT
        )