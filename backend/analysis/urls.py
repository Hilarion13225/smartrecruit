from django.urls import path
from .views import ExportCSVView, ExportPDFView

urlpatterns = [
    path('jobs/<int:job_id>/export/csv/', ExportCSVView.as_view(), name='export-csv'),
    path('jobs/<int:job_id>/export/pdf/', ExportPDFView.as_view(), name='export-pdf'),
]