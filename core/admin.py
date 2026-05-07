from django.contrib import admin
from .models import GuiaRemision, AgenciaTransporte

# --- CONFIGURACIÓN PARA EL MODELO AGENCIA ---
@admin.register(AgenciaTransporte)
class AgenciaTransporteAdmin(admin.ModelAdmin):
    # Activa el buscador en la parte superior
    search_fields = ('nombre', 'ubicacion', 'direccion', 'referencia')
    
    # Muestra las columnas en la lista principal
    list_display = ('nombre', 'ubicacion', 'direccion', 'referencia')
    
    # ESTA LÍNEA PERMITE EDITAR LA UBICACIÓN SIN ENTRAR A CADA SEDE
    list_editable = ('ubicacion',)
    
    # Permite filtrar por nombre en el lateral derecho
    list_filter = ('nombre',)
    
    # Muestra 50 sedes por página para que puedas guardar cambios en bloque
    list_per_page = 50


# --- CONFIGURACIÓN PARA EL MODELO GUÍA DE REMISIÓN ---
@admin.register(GuiaRemision)
class GuiaRemisionAdmin(admin.ModelAdmin):
    # Columnas que se verán en la tabla principal de Django/Jazzmin
    list_display = ('id', 'cliente', 'dni_ruc', 'agencia', 'producto', 'fecha_creacion', 'usuario')
    
    # Barra de búsqueda (esencial si tienes miles de guías)
    search_fields = ('cliente', 'dni_ruc', 'producto', 'agencia')
    
    # Filtros laterales (para buscar por fechas específicas o qué empleado hizo qué guía)
    list_filter = ('fecha_creacion', 'agencia', 'usuario')
    
    # Protegemos la fecha de creación para que nadie pueda falsearla modificándola a mano
    readonly_fields = ('fecha_creacion',)
    
    # Orden de los campos al abrir una guía para editarla
    fieldsets = (
        ('Información del Documento', {
            'fields': ('usuario', 'fecha_creacion')
        }),
        ('Datos del Cliente', {
            'fields': ('cliente', 'dni_ruc', 'celular')
        }),
        ('Datos de Envío', {
            'fields': ('agencia', 'direccion', 'referencia', 'producto')
        }),
    )