from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

# --- MODELO: AgenciaTransporte ---
class AgenciaTransporte(models.Model):
    nombre = models.CharField(max_length=200, unique=True, help_text="Ej. SHALOM - Sede Centro")
    direccion = models.TextField(help_text="Dirección exacta de la agencia")
    referencia = models.TextField(blank=True, null=True, help_text="Ej. Frente al parque, rejas verdes")

    class Meta:
        verbose_name = "Agencia de Transporte"
        verbose_name_plural = "Agencias de Transporte"
        ordering = ['nombre'] # Ordena alfabéticamente en el panel

    def __str__(self):
        return self.nombre

# --- MODELO: GuiaRemision (CON VALIDACIÓN DE DOCUMENTO) ---
class GuiaRemision(models.Model):
    # CAMBIO CLAVE: SET_NULL protege tu historial logístico si se borra un usuario
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True) 
    cliente = models.CharField("Nombre del Cliente", max_length=200)
    
    dni_ruc = models.CharField(
        "DNI/RUC",
        max_length=11, 
        help_text="Ingrese 8 dígitos para DNI o 11 para RUC"
    )
    
    celular = models.CharField("Celular", max_length=20, blank=True, null=True)
    agencia = models.CharField("Agencia", max_length=200, blank=True, null=True)
    direccion = models.TextField("Dirección")
    referencia = models.TextField("Referencia", blank=True, null=True)
    producto = models.CharField("Producto (Categoría)", max_length=255) 
    
    fecha_creacion = models.DateTimeField("Fecha de Creación", auto_now_add=True)

    class Meta:
        verbose_name = "Guía de Remisión"
        verbose_name_plural = "Guías de Remisión"
        ordering = ['-fecha_creacion'] # Ordenar de la más nueva a la más antigua

    def __str__(self):
        return f"{self.cliente} - {self.fecha_creacion.strftime('%d/%m/%Y')}"

    # --- LÓGICA DE VALIDACIÓN PARA DNI Y RUC ---
    def clean(self):
        # 1. Quitamos espacios por si acaso, asegurando que no sea nulo
        valor = self.dni_ruc.strip() if self.dni_ruc else ""
        
        # 2. Verificamos que solo sean números
        if not valor.isdigit():
            raise ValidationError({'dni_ruc': 'El documento solo debe contener números.'})

        # 3. Validación por longitud
        largo = len(valor)
        if largo not in [8, 11]:
            raise ValidationError({'dni_ruc': f'Documento inválido. El DNI requiere 8 dígitos y el RUC 11. (Ingresaste {largo})'})

        # 4. Validación específica para RUC (Reglas de SUNAT)
        if largo == 11:
            if not valor.startswith(('10', '15', '17', '20')):
                raise ValidationError({'dni_ruc': 'RUC inválido. Debe empezar con 10, 15, 17 o 20.'})
        
        # Guardamos el valor limpio sin espacios
        self.dni_ruc = valor

    # Forzamos la validación al guardar
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)