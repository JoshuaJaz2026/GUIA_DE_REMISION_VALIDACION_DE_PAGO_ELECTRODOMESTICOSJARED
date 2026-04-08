from django.db import models
from django.contrib.auth.models import User

class GuiaRemision(models.Model):
    usuario = models.ForeignKey(User, on_backend=models.CASCADE) # Conecta la guía con un usuario
    cliente = models.CharField(max_length=200)
    dni_ruc = models.CharField(max_length=11)
    direccion = models.TextField()
    producto = models.CharField(max_length=255)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.cliente} - {self.fecha_creacion.strftime('%d/%m/%Y')}"