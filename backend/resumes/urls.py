from django.urls import path
from .views import ResumeListView, ResumeUploadView, AnalyzeResumesView

urlpatterns = [
    path('jobs/<int:job_id>/resumes/', ResumeListView.as_view(), name='resume-list'),
    path('jobs/<int:job_id>/resumes/upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('jobs/<int:job_id>/analyze/', AnalyzeResumesView.as_view(), name='analyze'),
]