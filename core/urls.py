from django.contrib import admin
from django.urls import path
# --- IMPORTANTE: Agregamos guardar_guia al final de esta lista ---
from .views import home, login_view, logout_view, vista_impresion_prueba, obtener_datos_agencia, consultar_documento, guardar_guia

urlpatterns = [
    # 1. Panel de Administración (Jazzmin)
    path('admin/', admin.site.urls), 
    
    # 2. Página Principal (Index)
    path('', home, name='home'), 
    
    # 3. Autenticación
    path('login/', login_view, name='login'),
    
    # 4. Ruta para cerrar sesión
    path('logout/', logout_view, name='logout'),

    # 5. Ruta para la impresión
    path('imprimir-prueba/', vista_impresion_prueba, name='imprimir_prueba'),

    # 6. API para autocompletar agencias 
    path('api/agencia/', obtener_datos_agencia, name='obtener_datos_agencia'),
    
    # 7. API para consultar DNI/RUC en SUNAT/RENIEC
    path('api/documento/', consultar_documento, name='consultar_documento'),

    # 8. NUEVA API para guardar la guía directo en la Base de Datos
    path('api/guardar-guia/', guardar_guia, name='guardar_guia'),
]