from django.db import models
from django.conf import settings

class Job(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('active', 'Active'),
        ('closed', 'Fermée'),
    ]

    recruiter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='jobs',
        verbose_name="Recruteur"
    )
    title = models.CharField(max_length=200, verbose_name="Titre du poste")
    description = models.TextField(verbose_name="Description")
    required_skills = models.JSONField(
        default=list,
        verbose_name="Compétences requises"
    )
    required_experience = models.IntegerField(
        default=0,
        verbose_name="Expérience requise (années)"
    )
    required_education = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Niveau d'études requis"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.recruiter.username}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Offre d'emploi"