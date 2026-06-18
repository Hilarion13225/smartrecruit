from django.db import models
from resumes.models import Resume

class Analysis(models.Model):
    resume = models.OneToOneField(
        Resume,
        on_delete=models.CASCADE,
        related_name='analysis',
        verbose_name="CV"
    )

    # Scores détaillés (sur 100)
    score_total = models.FloatField(default=0, verbose_name="Score total")
    score_skills = models.FloatField(default=0, verbose_name="Score compétences")
    score_experience = models.FloatField(default=0, verbose_name="Score expérience")
    score_education = models.FloatField(default=0, verbose_name="Score formation")
    score_semantic = models.FloatField(default=0, verbose_name="Score sémantique")

    # Données extraites du CV
    extracted_skills = models.JSONField(default=list, verbose_name="Compétences extraites")
    missing_skills = models.JSONField(default=list, verbose_name="Compétences manquantes")
    extracted_experience = models.IntegerField(default=0, verbose_name="Expérience extraite (années)")
    extracted_education = models.CharField(max_length=200, blank=True)

    # Recommandation finale
    RECOMMENDATION_CHOICES = [
        ('priority', '⭐ Prioritaire'),
        ('possible', '✅ Possible'),
        ('reserve', '⚠️ Réserve'),
        ('rejected', '❌ Rejeté'),
    ]
    recommendation = models.CharField(
        max_length=20,
        choices=RECOMMENDATION_CHOICES,
        default='reserve'
    )

    # Questions d'entretien générées
    interview_questions = models.JSONField(
        default=list,
        verbose_name="Questions d'entretien"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analyse de {self.resume.candidate_name} — Score: {self.score_total:.1f}/100"

    class Meta:
        verbose_name = "Analyse"