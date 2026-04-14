from django.contrib import admin
from django.urls import path
# --- ACTUALIZADO: Añadimos obtener_datos_agencia a la importación ---
from .views import home, login_view, logout_view, vista_impresion_prueba, obtener_datos_agencia
from core.models import GuiaRemision, AgenciaTransporte

# --- FORZAR REGISTRO DE MODELOS EN EL ADMIN ---
try:
    admin.site.register(GuiaRemision)
    admin.site.register(AgenciaTransporte)
except admin.sites.AlreadyRegistered:
    pass
# ----------------------------------------------

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
]