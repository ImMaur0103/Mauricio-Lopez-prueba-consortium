from django.urls import path

from spending_control.api.views import SpendingControlListCreateAPIView, SpendingRetrieveAPIView, generate_liquidation_certificate

urlpatterns = [
    path('api/spendings/', SpendingControlListCreateAPIView.as_view(),
         name='spending-list-create'),
    path('api/spendings/<int:pk>/', SpendingRetrieveAPIView.as_view(), name='spending-retrieve'),
    path('generate-liquidation-certificate/<int:pk>/', generate_liquidation_certificate, name='generate-liquidation-certificate')
]
