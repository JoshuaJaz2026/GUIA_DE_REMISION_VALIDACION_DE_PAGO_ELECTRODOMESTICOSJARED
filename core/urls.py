from django.contrib import admin
from django.urls import path
from .views import home, login_view, logout_view, vista_impresion_prueba, obtener_datos_agencia

urlpatterns = [
    # 1. Panel de Administración (Jazzmin)
    # Al quitar el registro forzado de aquí, Django usará la configuración de admin.py
    path('admin/', admin.site.urls), 
    
    # 2. Página Principal (Index)
    path('', home, name='home'), 
    
    # 3. Autenticación
    path('login/', login_view, name='login'),
    
    # 4. Ruta para cerrar sesión
    path('logout/', logout_view, name='logout'),

    # 5. Ruta para la impresión
    path('imprimir-prueba/', vista_impresion_prueba, name='imprimir_prueba'),

    # 6. API para autocompletar agencias (Mantenemos esta ruta vital)
    path('api/agencia/', obtener_datos_agencia, name='obtener_datos_agencia'),
]