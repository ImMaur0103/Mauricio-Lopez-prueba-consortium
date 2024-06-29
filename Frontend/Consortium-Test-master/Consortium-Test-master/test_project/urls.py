from django.conf import settings
from django.conf.urls.static import static

from django.contrib import admin
from django.urls import path, include

from test_project.views import IndexView, SignInView, SignOutView

urlpatterns = [
    path('', IndexView.as_view(), name="index"),
    path("admin/", admin.site.urls),
    path('', include("spending_control.urls")),
    
    path('login/', SignInView.as_view(), name="login"),
    path('logout/', SignOutView.as_view(), name="logout"),
]
