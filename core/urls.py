from django.contrib import admin
from django.urls import path
from .views import home, login_view, logout_view # Añadimos logout_view

urlpatterns = [
    # 1. Panel de Administración (Jazzmin)
    path('admin/', admin.site.urls), 
    
    # 2. Página Principal (Index)
    path('', home, name='home'), 
    
    # 3. Autenticación
    path('login/', login_view, name='login'),
    
    # 4. AÑADIDO: Ruta para cerrar sesión
    path('logout/', logout_view, name='logout'),
]