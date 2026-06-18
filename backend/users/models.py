from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('recruiter', 'Recruteur'),
        ('admin', 'Administrateur'),
    ]
    
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='recruiter'
    )
    company = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        verbose_name="Entreprise"
    )
    phone = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        verbose_name="Téléphone"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_recruiter(self):
        return self.role == 'recruiter'

    @property
    def is_admin_user(self):
        return self.role == 'admin'