from django.contrib import admin
from django.urls import path
# ¡AQUÍ ESTÁ LA MAGIA! Añadimos vista_impresion_prueba a la lista
from .views import home, login_view, logout_view, vista_impresion_prueba

urlpatterns = [
    # 1. Panel de Administración (Jazzmin)
    path('admin/', admin.site.urls), 
    
    # 2. Página Principal (Index)
    path('', home, name='home'), 
    
    # 3. Autenticación
    path('login/', login_view, name='login'),
    
    # 4. Ruta para cerrar sesión
    path('logout/', logout_view, name='logout'),

    # 5. Ruta para la prueba de impresión
    path('imprimir-prueba/', vista_impresion_prueba, name='imprimir_prueba'),
]