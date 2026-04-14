from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import User
from django.http import JsonResponse
from .models import AgenciaTransporte

@login_required 
def home(request):
    # --- CAMBIO IMPORTANTE ---
    # Traemos todas las agencias para que el datalist en el HTML las reconozca
    agencias = AgenciaTransporte.objects.all()
    return render(request, 'index.html', {'agencias': agencias})

def login_view(request):
    if request.method == 'POST':
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

# --- ESTA ES LA FUNCIÓN QUE RESPONDE AL JAVASCRIPT ---
def obtener_datos_agencia(request):
    nombre_agencia = request.GET.get('nombre', None)
    if nombre_agencia:
        try:
            agencia = AgenciaTransporte.objects.get(nombre=nombre_agencia)
            return JsonResponse({
                'direccion': agencia.direccion,
                'referencia': agencia.referencia
            })
        except AgenciaTransporte.DoesNotExist:
            return JsonResponse({'error': 'No encontrada'}, status=404)
    return JsonResponse({'error': 'Falta nombre'}, status=400)