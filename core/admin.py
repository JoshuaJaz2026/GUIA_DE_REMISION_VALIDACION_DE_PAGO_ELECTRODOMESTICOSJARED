from django.contrib import admin
from .models import GuiaRemision, AgenciaTransporte

# Registramos los modelos para que aparezcan en el panel de Jazzmin
admin.site.register(GuiaRemision)
admin.site.register(AgenciaTransporte)