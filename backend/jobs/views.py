from rest_framework import generics, permissions, filters
from rest_framework.response import Response
from .models import Job
from .serializers import JobSerializer
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .parsers import parse_json_job, parse_txt_job, parse_docx_job
from .models import Job
from .serializers import JobSerializer

class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        # Chaque recruteur voit uniquement ses propres offres
        return Job.objects.filter(recruiter=self.request.user)


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Job.objects.filter(recruiter=self.request.user)
    
class ImportJobView(APIView):
    """Importe une offre depuis un fichier JSON, TXT ou Word"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'Aucun fichier reçu.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        filename = file.name.lower()

        try:
            if filename.endswith('.json'):
                data = parse_json_job(file)
            elif filename.endswith('.txt'):
                data = parse_txt_job(file)
            elif filename.endswith('.docx'):
                data = parse_docx_job(file)
            else:
                return Response(
                    {'error': 'Format non supporté. Utilisez JSON, TXT ou DOCX.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mode preview : retourne les données sans sauvegarder
        if request.data.get('preview') == 'true':
            return Response({'preview': data})

        # Mode save : crée l'offre directement
        data['recruiter'] = request.user
        job = Job.objects.create(**data)
        serializer = JobSerializer(job, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)