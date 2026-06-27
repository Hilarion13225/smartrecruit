from django.urls import path
from .views import ResumeListView, ResumeUploadView, AnalyzeResumesView, ResumeDeleteView, ResumeRetryView

urlpatterns = [
    path('jobs/<int:job_id>/resumes/', ResumeListView.as_view(), name='resume-list'),
    path('jobs/<int:job_id>/resumes/upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('jobs/<int:job_id>/analyze/', AnalyzeResumesView.as_view(), name='analyze'),
    path('resumes/<int:resume_id>/delete/', ResumeDeleteView.as_view(), name='resume-delete'),  # ← AJOUTER
    path('resumes/<int:resume_id>/retry/', ResumeRetryView.as_view()),  # ← AJOUTER
]