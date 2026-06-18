from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from jobs.models import Job
from .exporters import export_csv, export_pdf


class ExportCSVView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        job = get_object_or_404(Job, id=job_id, recruiter=request.user)
        csv_content = export_csv(job)

        response = HttpResponse(csv_content, content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = (
            f'attachment; filename="smartrecruit_{job.title}_{job.id}.csv"'
        )
        return response


class ExportPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        job = get_object_or_404(Job, id=job_id, recruiter=request.user)
        pdf_buffer = export_pdf(job)

        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = (
            f'attachment; filename="smartrecruit_{job.title}_{job.id}.pdf"'
        )
        return response