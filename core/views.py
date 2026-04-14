from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import User  # <-- Importación vital para crear el usuario

@login_required 
def home(request):
    return render(request, 'index.html')

def login_view(request):
    
    if request.method == 'POST':
        # ¡AQUÍ ESTÁ EL CAMBIO! Quitamos el .lower()
        user_val = request.POST.get('username', '').strip() 
        pass_val = request.POST.get('password', '').strip()
        
        # DEBUG: Esto lo verás en los Logs de Render
        print(f"--- Intento de Login: {user_val} ---")
        
        user = authenticate(request, username=user_val, password=pass_val)
        
        if user is not None:
            login(request, user)
            print(f"+++ Login Exitoso: {user_val} +++")
            return redirect('home')
        else:
            print(f"--- Login Fallido para: {user_val} ---")
            messages.error(request, "Usuario o contraseña incorrectos")
            
    return render(request, 'login.html')

def logout_view(request):
    logout(request)
    return redirect('login')

def vista_impresion_prueba(request):
    return render(request, 'imprimir_guia.html')