from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, ProfileView, ChangePasswordView, LogoutView, DashboardStatsView

from .admin_views import (
    AdminStatsView,
    AdminUserListView,
    AdminUserDetailView,
    AdminAnalysisListView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # Admin
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/analyses/', AdminAnalysisListView.as_view(), name='admin-analyses'),
]