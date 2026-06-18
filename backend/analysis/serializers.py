from rest_framework import serializers
from .models import Analysis

class AnalysisSerializer(serializers.ModelSerializer):
    recommendation_display = serializers.CharField(
        source='get_recommendation_display',
        read_only=True
    )

    class Meta:
        model = Analysis
        fields = [
            'id', 'score_total', 'score_skills',
            'score_experience', 'score_education', 'score_semantic',
            'extracted_skills', 'missing_skills',
            'extracted_experience', 'extracted_education',
            'recommendation', 'recommendation_display',
            'interview_questions', 'created_at'
        ]
        read_only_fields = fields