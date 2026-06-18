from django.db import models
from django.conf import settings
from jobs.models import Job

class Resume(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('analyzing', 'En cours d\'analyse'),
        ('analyzed', 'Analysé'),
        ('error', 'Erreur'),
    ]

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='resumes',
        verbose_name="Offre d'emploi"
    )
    candidate_name = models.CharField(
        max_length=200,
        verbose_name="Nom du candidat"
    )
    candidate_email = models.EmailField(
        blank=True,
        null=True,
        verbose_name="Email du candidat"
    )
    cv_file = models.FileField(
        upload_to='cvs/%Y/%m/',
        verbose_name="Fichier CV"
    )
    raw_text = models.TextField(
        blank=True,
        verbose_name="Texte extrait du CV"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    analyzed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.candidate_name} → {self.job.title}"

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "CV"