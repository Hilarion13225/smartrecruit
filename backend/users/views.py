from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer, RegisterSerializer, ChangePasswordSerializer
from rest_framework.permissions import IsAuthenticated
from jobs.models import Job
from resumes.models import Resume
from analysis.models import Analysis
from django.db.models import Avg, Count

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.data['old_password']):
                return Response(
                    {"old_password": "Mot de passe incorrect."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(serializer.data['new_password'])
            user.save()
            return Response({"message": "Mot de passe modifié avec succès."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Déconnexion réussie."})
        except Exception:
            return Response(
                {"error": "Token invalide."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        jobs = Job.objects.filter(recruiter=user)
        resumes = Resume.objects.filter(job__recruiter=user)
        analyses = Analysis.objects.filter(resume__job__recruiter=user)

        stats = {
            'total_jobs': jobs.filter(status='active').count(),
            'total_resumes': resumes.count(),
            'analyzed_resumes': resumes.filter(status='analyzed').count(),
            'pending_resumes': resumes.filter(status='pending').count(),
            'priority_candidates': analyses.filter(recommendation='priority').count(),
            'possible_candidates': analyses.filter(recommendation='possible').count(),
            'reserve_candidates': analyses.filter(recommendation='reserve').count(),
            'rejected_candidates': analyses.filter(recommendation='rejected').count(),
            'average_score': analyses.aggregate(avg=Avg('score_total'))['avg'] or 0,
            'recent_jobs': list(jobs.order_by('-created_at')[:5].values(
                'id', 'title', 'status', 'created_at'
            )),
        }

        # Ajouter le nombre de CV par offre récente
        for job in stats['recent_jobs']:
            job['resumes_count'] = Resume.objects.filter(job_id=job['id']).count()
            job['analyzed_count'] = Resume.objects.filter(
                job_id=job['id'], status='analyzed'
            ).count()

        return Response(stats)