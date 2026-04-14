from django.contrib import admin
from .models import GuiaRemision, AgenciaTransporte

# --- CONFIGURACIÓN PARA EL MODELO AGENCIA ---
class AgenciaTransporteAdmin(admin.ModelAdmin):
    # Esto activa el buscador en la parte superior
    search_fields = ('nombre', 'direccion', 'referencia')
    
    # Esto muestra las columnas en la lista (opcional, pero muy útil)
    list_display = ('nombre', 'direccion', 'referencia')
    
    # Permite filtrar por nombre en el lateral derecho
    list_filter = ('nombre',)

# --- REGISTRO DE MODELOS ---
admin.site.register(AgenciaTransporte, AgenciaTransporteAdmin)
admin.site.register(GuiaRemision)