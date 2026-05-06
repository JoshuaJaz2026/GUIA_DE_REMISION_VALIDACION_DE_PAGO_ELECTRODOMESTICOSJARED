from django.contrib import admin
from django.urls import path

# --- IMPORTANTE: Agregamos TODAS las vistas, incluyendo obtener_guia y eliminar_guia ---
from .views import (
    home, login_view, logout_view, vista_impresion_prueba, 
    obtener_datos_agencia, consultar_documento, guardar_guia, 
    generar_pdf_guia, historial_guias,
    obtener_guia, eliminar_guia  # <--- ESTAS DOS FALTABAN AQUÍ Arriba
)

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

    # 9. Descargar PDF oficial
    path('api/guia/<int:guia_id>/pdf/', generar_pdf_guia, name='generar_pdf_guia'),

    # 10. API para leer el historial de la base de datos
    path('api/historial/', historial_guias, name='historial_guias'),

    # ==========================================================
    # --- AQUÍ ESTÁ LA SOLUCIÓN AL ERROR 404 (FALTABAN ESTAS 2) ---
    # ==========================================================
    path('api/guia/<int:guia_id>/', obtener_guia, name='obtener_guia'),
    path('api/guia/<int:guia_id>/eliminar/', eliminar_guia, name='eliminar_guia'),
]