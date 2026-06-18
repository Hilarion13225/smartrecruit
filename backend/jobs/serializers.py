from rest_framework import serializers
from .models import Job

class JobSerializer(serializers.ModelSerializer):
    recruiter_name = serializers.CharField(
        source='recruiter.get_full_name', 
        read_only=True
    )
    resumes_count = serializers.IntegerField(
        source='resumes.count', 
        read_only=True
    )

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'required_skills',
            'required_experience', 'required_education',
            'status', 'recruiter', 'recruiter_name',
            'resumes_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'recruiter', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Le recruteur est automatiquement l'utilisateur connecté
        validated_data['recruiter'] = self.context['request'].user
        return super().create(validated_data)