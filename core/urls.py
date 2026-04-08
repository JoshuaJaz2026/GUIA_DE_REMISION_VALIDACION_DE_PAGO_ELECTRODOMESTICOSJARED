from django.contrib import admin
from django.urls import path
from .views import home, login_view # Importamos tus vistas

urlpatterns = [
    # CAMBIA ESTO: de admin.site.id  A  admin.site.urls
    path('admin/', admin.site.urls), 
    
    path('', home, name='home'), 
    path('login/', login_view, name='login'),
]