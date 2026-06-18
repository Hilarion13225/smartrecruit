from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Avg, Count
from .models import User
from .serializers import UserSerializer
from jobs.models import Job
from resumes.models import Resume
from analysis.models import Analysis


class IsAdminUser(IsAuthenticated):
    """Permission : réservé aux admins uniquement"""
    def has_permission(self, request, view):
        return (
            super().has_permission(request, view)
            and request.user.role == 'admin'
        )


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        stats = {
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'inactive_users': User.objects.filter(is_active=False).count(),
            'total_jobs': Job.objects.count(),
            'active_jobs': Job.objects.filter(status='active').count(),
            'total_resumes': Resume.objects.count(),
            'analyzed_resumes': Resume.objects.filter(status='analyzed').count(),
            'pending_resumes': Resume.objects.filter(status='pending').count(),
            'average_score': Analysis.objects.aggregate(
                avg=Avg('score_total')
            )['avg'] or 0,
            'priority_count': Analysis.objects.filter(
                recommendation='priority'
            ).count(),
            'rejected_count': Analysis.objects.filter(
                recommendation='rejected'
            ).count(),
        }
        return Response(stats)


class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.annotate(
            jobs_count=Count('jobs'),
        ).order_by('-date_joined')
        serializer = UserSerializer(users, many=True)

        # Enrichir avec les stats de chaque user
        data = []
        for user, s in zip(users, serializer.data):
            item = dict(s)
            item['jobs_count'] = user.jobs_count
            item['resumes_count'] = Resume.objects.filter(
                job__recruiter=user
            ).count()
            data.append(item)

        return Response(data)


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Utilisateur non trouvé.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request, user_id):
        """Modifier un utilisateur (activer/désactiver/changer rôle)"""
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Utilisateur non trouvé.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Empêcher l'admin de se désactiver lui-même
        if user == request.user and 'is_active' in request.data:
            return Response(
                {'error': 'Vous ne pouvez pas modifier votre propre statut.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        allowed_fields = ['is_active', 'role', 'first_name',
                          'last_name', 'email', 'company']
        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()

        return Response(UserSerializer(user).data)

    def delete(self, request, user_id):
        """Supprimer un utilisateur"""
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Utilisateur non trouvé.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if user == request.user:
            return Response(
                {'error': 'Vous ne pouvez pas supprimer votre propre compte.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.delete()
        return Response({'message': 'Utilisateur supprimé.'})


class AdminAnalysisListView(APIView):
    """Supervision de toutes les analyses"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        analyses = Analysis.objects.select_related(
            'resume', 'resume__job', 'resume__job__recruiter'
        ).order_by('-created_at')[:50]

        data = []
        for a in analyses:
            data.append({
                'id': a.id,
                'candidate_name': a.resume.candidate_name,
                'job_title': a.resume.job.title,
                'recruiter': a.resume.job.recruiter.username,
                'score_total': a.score_total,
                'recommendation': a.recommendation,
                'created_at': a.created_at,
            })

        return Response(data)