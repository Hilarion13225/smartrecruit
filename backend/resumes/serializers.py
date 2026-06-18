from rest_framework import serializers
from .models import Resume
from analysis.serializers import AnalysisSerializer

class ResumeSerializer(serializers.ModelSerializer):
    analysis = AnalysisSerializer(read_only=True)
    
    class Meta:
        model = Resume
        fields = [
            'id', 'job', 'candidate_name', 'candidate_email',
            'cv_file', 'status', 'uploaded_at', 'analyzed_at',
            'analysis'
        ]
        read_only_fields = ['id', 'status', 'uploaded_at', 
                            'analyzed_at', 'raw_text']


class ResumeUploadSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour l'upload de CV"""
    class Meta:
        model = Resume
        fields = ['id', 'job', 'candidate_name', 
                  'candidate_email', 'cv_file']