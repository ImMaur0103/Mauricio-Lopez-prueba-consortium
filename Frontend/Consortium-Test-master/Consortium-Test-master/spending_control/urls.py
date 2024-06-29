from django.urls import path

from spending_control.api.urls import urlpatterns as api_urlpatterns

from spending_control.views import SpendingListView

app_name = 'spending_control'

urlpatterns = [
    path('spendings/', SpendingListView.as_view(), name='spending-list'),
]

urlpatterns += api_urlpatterns
