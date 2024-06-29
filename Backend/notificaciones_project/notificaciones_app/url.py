from django.urls import path
from .api import TestDatabaseConnection, CustomObtainAuthToken, TestAuthentication, Notificationentry, Notificationdelivery

urlpatterns = [
    path('test-db/', TestDatabaseConnection.as_view(), name='test-db'),
    path('api-token-auth/', CustomObtainAuthToken.as_view(), name='api_token_auth'),
    path('test-auth/', TestAuthentication.as_view(), name='test-auth'),
    path('Notification/', Notificationentry.as_view(), name='test-auth'),
    path('Notification/Ingresada/', Notificationdelivery.as_view(), name='test-auth')
]