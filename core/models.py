from django.db import models
from django.contrib.auth.models import User

class GuiaRemision(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE) 
    
    # Datos Antiguos
    cliente = models.CharField(max_length=200)
    dni_ruc = models.CharField(max_length=11)
    direccion = models.TextField()
    producto = models.CharField(max_length=255) # Aunque no se imprima, lo guardamos para control
    
    # --- NUEVOS DATOS PARA LA HOJA DE IMPRESIÓN JARED ---
    celular = models.CharField(max_length=20, blank=True, null=True)
    agencia = models.CharField(max_length=200, blank=True, null=True)
    referencia = models.TextField(blank=True, null=True)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.cliente} - {self.fecha_creacion.strftime('%d/%m/%Y')}"