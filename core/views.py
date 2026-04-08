from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages

@login_required # Solo entra quien esté logueado
def home(request):
    return render(request, 'index.html')

def login_view(request):
    if request.method == 'POST':
        user_val = request.POST.get('usuario')
        pass_val = request.POST.get('password')
        user = authenticate(request, username=user_val, password=pass_val)
        
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, "Usuario o contraseña incorrectos")
            
    return render(request, 'login.html')

def logout_view(request):
    logout(request)
    return redirect('login')