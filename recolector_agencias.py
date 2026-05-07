import os
import django
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from webdriver_manager.chrome import ChromeDriverManager

# Configuración Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from core.models import AgenciaTransporte

def ejecutar_recolector():
    agencias_pendientes = AgenciaTransporte.objects.filter(ubicacion="-")
    total = agencias_pendientes.count()

    if total == 0:
        print("¡Todas las agencias ya tienen ubicación!")
        return

    print(f"--- REINICIANDO NAVEGACIÓN SEGURA ({total} agencias) ---")

    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

    try:
        driver.get("https://shalom.com.pe/agencias")
        print("Esperando a que cargue el mapa...")
        time.sleep(8)
        
        # Eliminamos el cartel de cookies que sale abajo para que no estorbe
        try:
            driver.execute_script("""
                var cookies = document.querySelectorAll('.cc-window, .cookie-banner, #cookie-notice');
                cookies.forEach(c => c.style.display = 'none');
            """)
        except:
            pass

        contador = 0

        for agencia in agencias_pendientes:
            # Seguro 1: Si el robot se salió de la página, lo regresamos
            if "agencias" not in driver.current_url:
                print("⚠️ Se detectó un desvío. Regresando al mapa...")
                driver.get("https://shalom.com.pe/agencias")
                time.sleep(5)

            nombre_buscar = agencia.nombre.replace("SHALOM -", "").replace("SHALOM", "").strip()

            try:
                buscador = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='departamento']")
                
                # Limpiamos el buscador
                buscador.click()
                time.sleep(0.5)
                buscador.send_keys(Keys.CONTROL + "a")
                buscador.send_keys(Keys.BACKSPACE)
                driver.execute_script("arguments[0].value = '';", buscador)
                time.sleep(0.5)
                
                print(f"Buscando: {nombre_buscar}...")
                buscador.send_keys(nombre_buscar)
                time.sleep(3) 
                
                # Seguro 2: Buscamos específicamente el elemento de la sugerencia que dice "km"
                sugerencias = driver.find_elements(By.XPATH, "//*[contains(text(), 'km')]")
                click_exitoso = False
                
                for sug in sugerencias:
                    # Si la sugerencia tiene el nombre que buscamos, le damos clic
                    if nombre_buscar.lower() in sug.text.lower():
                        ActionChains(driver).move_to_element(sug).click().perform()
                        click_exitoso = True
                        break

                # Si no encontró los "km", intenta con el teclado
                if not click_exitoso:
                    buscador.send_keys(Keys.DOWN)
                    time.sleep(0.5)
                    buscador.send_keys(Keys.ENTER)
                
                time.sleep(3) # Esperamos a que la tarjeta blanca se abra
                
                texto_pagina = driver.execute_script("return document.body.innerText;")
                
                ubicacion_encontrada = ""
                for linea in texto_pagina.split('\n'):
                    linea = linea.strip()
                    if " / " in linea and linea.count("/") >= 2:
                        if "Izipay" not in linea and "Openpay" not in linea:
                            ubicacion_encontrada = linea
                            break 
                
                if ubicacion_encontrada:
                    agencia.ubicacion = ubicacion_encontrada
                    agencia.save()
                    contador += 1
                    print(f"✅ ¡Éxito! -> {ubicacion_encontrada}")
                    
                    # Cerramos la tarjeta para limpiar el mapa
                    ActionChains(driver).send_keys(Keys.ESCAPE).perform()
                    time.sleep(1)
                else:
                    print(f"⚠️ No apareció el ubigeo para: {nombre_buscar}")

            except Exception as e:
                print(f"❌ Error en {nombre_buscar}")
                driver.refresh()
                time.sleep(5)

    except Exception as e:
        print(f"❌ Error crítico del navegador: {e}")
    finally:
        print(f"\n--- MISIÓN FINALIZADA: {contador} sedes actualizadas ---")
        driver.quit()

if __name__ == "__main__":
    ejecutar_recolector()