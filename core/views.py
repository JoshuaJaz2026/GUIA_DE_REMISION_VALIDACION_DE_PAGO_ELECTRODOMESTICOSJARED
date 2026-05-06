from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
import json
import urllib.request
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import User
from django.http import JsonResponse
# --- AQUÍ AGREGAMOS LA IMPORTACIÓN DE GuiaRemision ---
from .models import AgenciaTransporte, GuiaRemision 

@login_required 
def home(request):
    # Traemos todas las agencias para que el datalist en el HTML las reconozca
    agencias = AgenciaTransporte.objects.all()
    return render(request, 'index.html', {'agencias': agencias})

def login_view(request):
    if request.method == 'POST':
        user_val = request.POST.get('username', '').strip() 
        pass_val = request.POST.get('password', '').strip()
        
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

def obtener_datos_agencia(request):
    nombre_agencia = request.GET.get('nombre', None)
    if nombre_agencia:
        try:
            agencia = AgenciaTransporte.objects.get(nombre=nombre_agencia)
            return JsonResponse({
                'ubicacion': agencia.ubicacion, # <-- Enviamos el nuevo dato
                'direccion': agencia.direccion,
                'referencia': agencia.referencia
            })
        except AgenciaTransporte.DoesNotExist:
            return JsonResponse({'error': 'No encontrada'}, status=404)
    return JsonResponse({'error': 'Falta nombre'}, status=400)

# --- VISTA ACTUALIZADA CON TOKEN DE SEGURIDAD ---
def consultar_documento(request):
    numero = request.GET.get('numero', '')
    token = "sk_14858.6ICrHBfmdsVRy0GAYGoo2Ng2FvQqhLWy"
    
    if len(numero) == 8:
        url = f"https://api.decolecta.com/v1/reniec/dni?numero={numero}&token={token}"
    elif len(numero) == 11:
        url = f"https://api.decolecta.com/v1/sunat/ruc?numero={numero}&token={token}"
    else:
        return JsonResponse({'error': 'Formato incorrecto'}, status=400)

    try:
        headers = {
            'Authorization': f'Bearer {token}',
            'User-Agent': 'Mozilla/5.0'
        }
        
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            
            # --- CORRECCIÓN DE NOMBRES DE CAMPOS SEGÚN TU TERMINAL ---
            if len(numero) == 11:
                nombre_completo = data.get('razon_social') or data.get('nombre')
            else:
                nombres = data.get('nombres', '')
                ap_paterno = data.get('apellido_paterno', '') or data.get('apellidoPaterno', '')
                ap_materno = data.get('apellido_materno', '') or data.get('apellidoMaterno', '')
                nombre_completo = f"{nombres} {ap_paterno} {ap_materno}".strip()
            
            if nombre_completo:
                return JsonResponse({'nombre': nombre_completo})
            else:
                return JsonResponse({'error': 'No se pudo extraer el nombre'}, status=404)
                
    except Exception as e:
        print(f"Error crítico en consulta: {e}")
        return JsonResponse({'error': 'Servicio no disponible'}, status=404)

# =====================================================================
# --- NUEVA VISTA PARA GUARDAR LA GUÍA DIRECTO EN LA BASE DE DATOS ---
# =====================================================================
@login_required
def guardar_guia(request):
    if request.method == 'POST':
        try:
            # 1. Leemos los datos en formato JSON que enviará JS
            data = json.loads(request.body)
            
            # 2. Creamos y guardamos el registro en la Base de Datos
            nueva_guia = GuiaRemision.objects.create(
                usuario=request.user, # Asigna automáticamente el usuario logueado
                cliente=data.get('nombre', ''),
                dni_ruc=data.get('dni', ''),
                celular=data.get('celular', ''),
                agencia=data.get('agencia', ''),
                direccion=data.get('direccion', ''),
                referencia=data.get('referencia', ''),
                producto=data.get('producto', '')
            )
            
            # 3. Respondemos que todo salió perfecto
            return JsonResponse({
                'mensaje': 'Guía guardada correctamente en la base de datos',
                'id_guia': nueva_guia.id
            })
            
        except Exception as e:
            print(f"Error al guardar: {e}")
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)

# ==========================================
# GENERADOR DE PDF OFICIAL
# ==========================================
@login_required
def generar_pdf_guia(request, guia_id):
    try:
        # Buscamos la guía exacta en la base de datos
        guia = GuiaRemision.objects.get(id=guia_id)
    except GuiaRemision.DoesNotExist:
        return HttpResponse("Error: La guía no existe", status=404)

    # Le pasamos los datos a una plantilla HTML especial para el PDF
    template = get_template('guia_pdf.html')
    context = {
        'guia': guia,
        'empresa': 'ELECTRODOMÉSTICOS JARED S.A.C.'
    }
    html = template.render(context)

    # Preparamos la respuesta como un archivo PDF descargable
    response = HttpResponse(content_type='application/pdf')
    # "attachment" hace que se descargue. Si pones "inline", se abre en el navegador.
    nombre_archivo = f"Guia_Remision_{guia.id:04d}_{guia.cliente.replace(' ', '_')}.pdf"
    response['Content-Disposition'] = f'inline; filename="{nombre_archivo}"'

    # Convertimos el HTML a PDF
    pisa_status = pisa.CreatePDF(html, dest=response)

    if pisa_status.err:
        return HttpResponse('Hubo un error al generar el PDF', status=500)
    
    return response

# Agregar esto al final de views.py
@login_required
def historial_guias(request):
    # FILTRO DE SEGURIDAD: Solo traemos las guías donde 'usuario' sea el que está logueado
    guias = GuiaRemision.objects.filter(usuario=request.user).order_by('-fecha_creacion')
    
    data = []
    for g in guias:
        data.append({
            'id': g.id,
            'fecha': g.fecha_creacion.strftime('%d/%m/%Y'),
            'nombre': g.cliente,
            'dni': g.dni_ruc,
            'agencia': g.agencia if g.agencia else '-',
            'direccion': g.direccion
        })
        
    return JsonResponse(data, safe=False)

# Agrega estas funciones al final de views.py

@login_required
def obtener_guia(request, guia_id):
    try:
        # Solo permitimos obtener guías que pertenezcan al usuario logueado
        guia = GuiaRemision.objects.get(id=guia_id, usuario=request.user)
        return JsonResponse({
            'id': guia.id,
            'dni': guia.dni_ruc,
            'nombre': guia.cliente,
            'celular': guia.celular,
            'agencia': guia.agencia,
            'direccion': guia.direccion,
            'referencia': guia.referencia,
            'producto': guia.producto
        })
    except GuiaRemision.DoesNotExist:
        return JsonResponse({'error': 'Guía no encontrada'}, status=404)

@login_required
def eliminar_guia(request, guia_id):
    if request.method == 'DELETE':
        try:
            guia = GuiaRemision.objects.get(id=guia_id, usuario=request.user)
            guia.delete()
            return JsonResponse({'mensaje': 'Eliminado correctamente'})
        except GuiaRemision.DoesNotExist:
            return JsonResponse({'error': 'No se pudo eliminar'}, status=404)
    return JsonResponse({'error': 'Método no permitido'}, status=405)