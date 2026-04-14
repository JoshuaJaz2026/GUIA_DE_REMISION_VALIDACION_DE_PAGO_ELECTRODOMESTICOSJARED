from django.db import models
from django.contrib.auth.models import User

# --- NUEVO MODELO: AgenciaTransporte ---
class AgenciaTransporte(models.Model):
    nombre = models.CharField(max_length=200, unique=True, help_text="Ej. SHALOM - Sede Centro")
    direccion = models.TextField(help_text="Dirección exacta de la agencia")
    referencia = models.TextField(blank=True, null=True, help_text="Ej. Frente al parque, rejas verdes")

    class Meta:
        app_label = 'core'  # <--- ESTO ES LO QUE SOLUCIONA EL ERROR

    def __str__(self):
        return self.nombre

# --- MODELO EXISTENTE: GuiaRemision ---
class GuiaRemision(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE) 
    cliente = models.CharField(max_length=200)
    dni_ruc = models.CharField(max_length=11)
    direccion = models.TextField()
    producto = models.CharField(max_length=255) 
    celular = models.CharField(max_length=20, blank=True, null=True)
    agencia = models.CharField(max_length=200, blank=True, null=True)
    referencia = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'core'  # <--- TAMBIÉN AQUÍ

    def __str__(self):
        return f"{self.cliente} - {self.fecha_creacion.strftime('%d/%m/%Y')}"