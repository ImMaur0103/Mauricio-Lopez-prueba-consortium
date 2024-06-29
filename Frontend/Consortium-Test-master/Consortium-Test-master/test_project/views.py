from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.contrib.auth.views import LoginView, LogoutView 
from django.views.generic import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages


class IndexView(LoginRequiredMixin, View):
    @staticmethod
    def get(request):
        return redirect('spending_control:spending-list')
    

class SignInView(LoginView):
    template_name = 'login.html'
    success_url = reverse_lazy('spending_control:spending-list')
    
class SignOutView(LogoutView):
    next_page = reverse_lazy('login')  # Redirecciona a la página de login después de cerrar sesión
    
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            messages.info(request, "Has cerrado sesión exitosamente.")
        return super().dispatch(request, *args, **kwargs)