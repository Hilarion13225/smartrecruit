from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/', include('resumes.urls')),
    path('api/', include('analysis.urls')),  # ← Ajouter cette ligne
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)