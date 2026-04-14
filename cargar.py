import os
import django
import json

# Configuración necesaria para usar los modelos fuera del servidor
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from core.models import AgenciaTransporte

def iniciar_carga():
    archivo = 'sedes_shalom.txt'
    if not os.path.exists(archivo):
        print(f"Error: No se encuentra el archivo {archivo}")
        return

    with open(archivo, 'r', encoding='utf-8') as f:
        lista_cruda = json.load(f)

    contador = 0
    for item in lista_cruda:
        nombre = item.get('nombre', '')
        direccion = item.get('direccion', '')
        referencia = item.get('referencia', '')

        # Filtrar ruido (kms y textos cortos)
        if " km" in nombre.lower() or len(direccion) < 5:
            continue

        # Limpiar referencias mezcladas en la dirección
        if "Ref." in direccion:
            partes = direccion.split("Ref.")
            direccion = partes[0].strip().rstrip(',')
            if referencia == "Sin referencia" and len(partes) > 1:
                referencia = partes[1].strip()

        # Cargar a la base de datos
        obj, created = AgenciaTransporte.objects.get_or_create(
            nombre=nombre.strip(),
            defaults={
                'direccion': direccion.strip(),
                'referencia': referencia.strip()
            }
        )
        if created:
            contador += 1
    
    print(f"--- PROCESO TERMINADO ---")
    print(f"Se han registrado {contador} sedes nuevas correctamente.")

if __name__ == "__main__":
    iniciar_carga()