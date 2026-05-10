// ==========================================
// 0. INTEGRACIÓN CON DJANGO (SESIÓN)
// ==========================================
// Variable para controlar si estamos creando o editando
let idGuiaEditando = null;

const nombreElement = document.getElementById('nombreUsuario');
let usuarioActual = nombreElement ? nombreElement.innerText.trim().toLowerCase() : 'usuario_jared';

if (!usuarioActual || usuarioActual === '') {
    usuarioActual = 'usuario_jared';
}

const btnLogout = document.getElementById('btnLogout');
if(btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/logout/';
    });
}

// ==========================================
// 0.5 SEGURIDAD: CIERRE DE SESIÓN POR INACTIVIDAD
// ==========================================
let tiempoInactividad;
const TIEMPO_LIMITE = 30 * 60 * 1000; // 30 minutos en milisegundos

function reiniciarTemporizador() {
    clearTimeout(tiempoInactividad);
    // Si pasan 30 minutos sin hacer nada, redirigir al logout
    tiempoInactividad = setTimeout(() => {
        alert("Tu sesión ha expirado por inactividad. Serás redirigido al inicio.");
        window.location.href = '/logout/';
    }, TIEMPO_LIMITE);
}

window.addEventListener('mousemove', reiniciarTemporizador);
window.addEventListener('keypress', reiniciarTemporizador);
window.addEventListener('click', reiniciarTemporizador);
window.addEventListener('scroll', reiniciarTemporizador);
reiniciarTemporizador();

// ==========================================
// 1. LÓGICA DE NAVEGACIÓN Y FORMULARIO
// ==========================================
const form = document.getElementById('guiaForm');
const tabla = document.getElementById('listaCuerpo');
const buscador = document.getElementById('buscador');
const sliderTrack = document.getElementById('sliderTrack');
const btnGoHistory = document.getElementById('btnGoHistory');
const btnGoForm = document.getElementById('btnGoForm');
const inputDni = document.getElementById('dni');
const errorDoc = document.getElementById('error-doc'); 
const btnSubmit = document.getElementById('btnSubmit');
const modalCopia = document.getElementById('modalCopia');
const textoResumen = document.getElementById('textoResumen');
const btnCopiar = document.getElementById('btnCopiar');
const btnCerrarModal = document.getElementById('btnCerrarModal');

if(btnGoHistory && sliderTrack) {
    btnGoHistory.addEventListener('click', () => {
        sliderTrack.style.transform = 'translateX(-50%)';
    });
}

if(btnGoForm && sliderTrack) {
    btnGoForm.addEventListener('click', () => {
        sliderTrack.style.transform = 'translateX(0)';
        // Resetear el estado de edición al ir a "Nuevo Registro"
        idGuiaEditando = null;
        form.reset();
        btnSubmit.innerText = "Generar y Guardar Guía";
        btnSubmit.style.backgroundColor = ""; 
    });
}

document.addEventListener('DOMContentLoaded', mostrarGuias);

// --- LÓGICA DE VALIDACIÓN EN TIEMPO REAL CON API ---
if(inputDni) {
    inputDni.addEventListener('input', function(e) {
        let val = this.value.replace(/[^0-9]/g, '');
        if(val.length > 11) val = val.slice(0, 11);
        this.value = val;

        let mensaje = "";
        let esValido = true;

        if (val.length > 0) {
            if (val.length !== 8 && val.length !== 11) {
                mensaje = `Faltan dígitos (${val.length}/8 o 11).`;
                esValido = false;
            } else if (val.length === 11) {
                const inicio = val.substring(0, 2);
                if (!['10', '15', '17', '20'].includes(inicio)) {
                    mensaje = "RUC inválido.";
                    esValido = false;
                }
            }
        }

        if (errorDoc) {
            if (!esValido && val.length > 0) {
                this.style.borderColor = '#ff4757'; 
                errorDoc.innerText = mensaje;
                errorDoc.style.display = 'block';
                btnSubmit.disabled = true;
                document.getElementById('nombre').value = ""; 
            } else if (esValido && val.length > 0) {
                this.style.borderColor = '#00c2b3'; 
                errorDoc.style.display = 'none';
                btnSubmit.disabled = false;

                if (val.length === 8 || val.length === 11) {
                    buscarDatosDocumento(val);
                }
            } else {
                this.style.borderColor = ''; 
                errorDoc.style.display = 'none';
                btnSubmit.disabled = false;
            }
        }
    });
}

// --- CONSULTA DECOLECTA VÍA DJANGO ---
function buscarDatosDocumento(numero) {
    const inputNombre = document.getElementById('nombre');
    
    inputNombre.value = "";
    inputNombre.placeholder = "Consultando base de datos...";
    inputNombre.disabled = true;
    inputNombre.style.borderColor = '';

    fetch(`/api/documento/?numero=${numero}`)
        .then(response => {
            if (!response.ok) throw new Error('No encontrado');
            return response.json();
        })
        .then(data => {
            inputNombre.disabled = false;
            if (data.nombre) {
                inputNombre.value = data.nombre;
                inputNombre.style.borderColor = '#00c2b3'; 
            } else {
                lanzarFallback(inputNombre, "No encontrado. Ingrese manual.");
            }
        })
        .catch(error => {
            console.error("Error API:", error);
            inputNombre.disabled = false;
            lanzarFallback(inputNombre, "No encontrado o límite excedido.");
        });
}

function lanzarFallback(input, mensaje) {
    input.value = "";
    input.placeholder = mensaje;
    input.style.borderColor = '#ffa502'; 
}

// ==========================================
// REGISTRO OFICIAL EN BASE DE DATOS Y PDF
// ==========================================
if(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const dniVal = inputDni.value;
        const nombreVal = document.getElementById('nombre').value;

        if (!nombreVal) {
            alert("Por favor, ingrese el nombre del cliente.");
            document.getElementById('nombre').focus();
            return;
        }

        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        const datosGuia = {
            dni: dniVal,
            nombre: nombreVal,
            celular: document.getElementById('celular').value,
            agencia: document.getElementById('agencia').value,
            ubigeo: document.getElementById('ubigeo').value,
            direccion: document.getElementById('direccion').value,
            referencia: document.getElementById('referencia').value,
            producto: document.getElementById('producto').value
        };

        const textoOriginalBtn = btnSubmit.innerText;
        btnSubmit.innerText = idGuiaEditando ? "Actualizando Guía..." : "Guardando y Generando PDF...";
        btnSubmit.disabled = true;

        const urlApi = idGuiaEditando ? `/api/guardar-guia/?id=${idGuiaEditando}` : '/api/guardar-guia/';

        fetch(urlApi, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(datosGuia)
        })
        .then(response => {
            if (!response.ok) throw new Error("Error en el servidor");
            return response.json();
        })
        .then(data => {
            
            if (data.id_guia && !idGuiaEditando) {
                imprimirGuia(data.id_guia);
            } else if (idGuiaEditando) {
                alert("¡Guía actualizada correctamente!");
            }

            mostrarGuias();

            // --- NUEVO: Separamos la cabecera visual del texto a copiar ---
            
            // --- FORMATO FORMAL PARA SEDE SHALOM ---
            
            // 1. Llenamos la cabecera visual del sistema (no se copia)
            const modalAtendido = document.getElementById('modalAtendido');
            if(modalAtendido) {
                modalAtendido.innerText = usuarioActual.toUpperCase();
            }

            // 2. Llenamos el cuadro con el formato solicitado (esto sí se copia)
            textoResumen.value = `ENTREGAR A SEDE SHALOM: ${datosGuia.agencia} (${datosGuia.ubigeo})\nDIRECCION: ${datosGuia.direccion}\nREFERENCIA: ${datosGuia.referencia}\n\nNOMBRE/RAZON SOCIAL: ${datosGuia.nombre}\nTELEFONO: ${datosGuia.celular}\nDNI/RUC: ${datosGuia.dni}`;
            
            modalCopia.classList.add('activo');

            // Limpiamos todo
            form.reset();
            inputDni.style.borderColor = ''; 
            document.getElementById('ubigeo').style.borderColor = '';
            document.getElementById('direccion').style.borderColor = '';
            document.getElementById('referencia').style.borderColor = '';
            document.getElementById('nombre').style.borderColor = ''; 
            
            idGuiaEditando = null;
            btnSubmit.innerText = "Generar y Guardar Guía";
            btnSubmit.style.backgroundColor = ""; 
            btnSubmit.disabled = false;
        })
        .catch(error => {
            console.error("Error al guardar:", error);
            alert("Hubo un problema al guardar la guía. Revisa la consola.");
            btnSubmit.innerText = textoOriginalBtn;
            btnSubmit.disabled = false;
        });
    });
}

if(btnCopiar && textoResumen) {
    btnCopiar.addEventListener('click', () => {
        textoResumen.select();
        document.execCommand('copy');
        btnCopiar.innerText = '¡Copiado!';
        btnCopiar.style.backgroundColor = '#28a745'; 
        setTimeout(() => {
            btnCopiar.innerText = 'Copiar al Portapapeles';
            btnCopiar.style.backgroundColor = '';
        }, 2000);
    });
}

if(btnCerrarModal && modalCopia) {
    btnCerrarModal.addEventListener('click', () => modalCopia.classList.remove('activo'));
}

// ==========================================
// 3. LECTURA Y MANEJO DE HISTORIAL (CRUD API)
// ==========================================
function mostrarGuias() {
    if(!tabla) return;
    
    tabla.innerHTML = '<tr><td colspan="5" style="text-align: center;">Consultando Base de Datos...</td></tr>';
    
    fetch('/api/historial/')
        .then(response => response.json())
        .then(guias => {
            tabla.innerHTML = ''; 
            
            guias.forEach(g => {
                tabla.innerHTML += `
                    <tr>
                        <td><strong>${g.fecha}</strong></td>
                        <td>${g.nombre}</td>
                        <td>${g.dni}</td>
                        <td><strong>${g.agencia}</strong><br><small>${g.direccion}</small></td>
                        <td>
                            <div style="display: flex; gap: 8px; flex-wrap: nowrap; justify-content: flex-start;">
                                <button onclick="editarGuia(${g.id})" style="background:#0097e6; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer;" title="Editar">✏️</button>
                                <button onclick="imprimirGuia(${g.id})" style="background:#7b1fa2; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer; font-weight:bold;" title="Imprimir Guía">🖨️</button>
                                <button onclick="eliminarGuia(${g.id})" style="background: #ff4757; color: white; border: none; padding:8px 12px; border-radius: 5px; cursor: pointer;" title="Eliminar">🗑️</button>
                            </div>
                        </td>
                    </tr>`;
            });
        })
        .catch(error => {
            console.error("Error cargando historial:", error);
            tabla.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error de conexión con la base de datos</td></tr>';
        });
}

window.imprimirGuia = function(id) {
    const nuevaPestana = window.open('', '_blank');
    nuevaPestana.document.write('<h3 style="font-family:sans-serif; padding: 20px; color:#7b1fa2;">Preparando diseño de impresión...</h3>');

    fetch(`/api/guia/${id}/`)
        .then(response => response.json())
        .then(guia => {
            if (guia.error) {
                nuevaPestana.close();
                return alert(guia.error);
            }
            
            localStorage.setItem('guiaAImprimir', JSON.stringify(guia));
            nuevaPestana.location.href = '/imprimir-prueba/';
        })
        .catch(error => {
            nuevaPestana.close();
            console.error("Error al preparar impresión:", error);
            alert("Error de conexión con la base de datos.");
        });
}

window.editarGuia = function(id) {
    fetch(`/api/guia/${id}/`)
        .then(response => response.json())
        .then(g => {
            if (g.error) return alert(g.error);

            document.getElementById('dni').value = g.dni;
            document.getElementById('nombre').value = g.nombre;
            document.getElementById('celular').value = g.celular || '';
            document.getElementById('agencia').value = g.agencia || '';
            document.getElementById('ubigeo').value = g.ubigeo || ''; 
            document.getElementById('direccion').value = g.direccion || '';
            document.getElementById('referencia').value = g.referencia || '';
            document.getElementById('producto').value = g.producto || '';

            document.getElementById('nombre').disabled = false;
            document.getElementById('dni').style.borderColor = '#00c2b3';
            document.getElementById('nombre').style.borderColor = '#00c2b3';

            idGuiaEditando = id;
            if(btnSubmit) {
                btnSubmit.innerText = "Guardar Cambios Actualizados";
                btnSubmit.style.backgroundColor = "#0097e6";
                btnSubmit.disabled = false;
            }

            if(sliderTrack) {
                sliderTrack.style.transform = 'translateX(0)';
            }
        })
        .catch(error => console.error("Error al cargar la guía:", error));
}

window.eliminarGuia = function(id) {
    if (confirm('¿Estás seguro de eliminar esta guía de la base de datos? Esta acción no se puede deshacer.')) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]') ? document.querySelector('[name=csrfmiddlewaretoken]').value : '';
        
        fetch(`/api/guia/${id}/eliminar/`, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': csrfToken }
        })
        .then(response => {
            if (response.ok) {
                mostrarGuias(); 
            } else {
                alert("No tienes permisos para eliminar este registro.");
            }
        })
        .catch(error => console.error("Error al eliminar:", error));
    }
}

if(buscador) {
    buscador.addEventListener('keyup', () => {
        let filtro = buscador.value.toLowerCase();
        Array.from(tabla.getElementsByTagName('tr')).forEach(fila => {
            fila.style.display = fila.innerText.toLowerCase().includes(filtro) ? '' : 'none';
        });
    });
}

// ==========================================
// 4. ANIMACIÓN DE FONDO DE PARTÍCULAS
// ==========================================
const canvas = document.getElementById('bg-canvas');
if(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let particlesArray = [];
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = (Math.random() * 0.8) - 0.4;
            this.speedY = (Math.random() * 0.8) - 0.4;
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
            if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
        }
        draw() {
            ctx.fillStyle = 'rgba(0, 194, 179, 0.4)';
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        }
    }
    function init() {
        particlesArray = [];
        for (let i = 0; i < 80; i++) particlesArray.push(new Particle());
    }
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesArray.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); });
    init(); animate();
}

// ==========================================
// 5. BUSCADOR PERSONALIZADO DE AGENCIAS
// ==========================================
const inputAgencia = document.getElementById('agencia');
const resultadosContainer = document.getElementById('agencia-results');
const agenciasDataScript = document.getElementById('agencias-data');

let agenciasData = [];

// Leemos el JSON inyectado desde Django en el HTML
if (agenciasDataScript) {
    try {
        agenciasData = JSON.parse(agenciasDataScript.textContent);
    } catch(e) {
        console.error("Error cargando datos de agencias:", e);
    }
}

if (inputAgencia && resultadosContainer) {
    // Al escribir en el input...
    inputAgencia.addEventListener('input', function() {
        const val = this.value.toLowerCase();
        resultadosContainer.innerHTML = '';
        
        if (!val) {
            resultadosContainer.style.display = 'none';
            return;
        }

        // Filtramos buscando el texto
        const filtradas = agenciasData.filter(a => a.nombre.toLowerCase().includes(val));

        if (filtradas.length > 0) {
            // Mostramos máximo 10 resultados para no hacer scroll infinito
            filtradas.slice(0, 10).forEach(agencia => {
                const div = document.createElement('div');
                div.classList.add('autocomplete-item');
                div.innerHTML = `<strong>${agencia.nombre}</strong><br><small style="color: #00C2B3; font-size: 10px;">${agencia.ubigeo !== '-' ? agencia.ubigeo : 'Sin Ubigeo'}</small>`;
                
                // Al hacer clic en un resultado...
                div.addEventListener('click', function() {
                    inputAgencia.value = agencia.nombre;
                    document.getElementById('ubigeo').value = (agencia.ubigeo !== '-' && agencia.ubigeo !== 'None') ? agencia.ubigeo : '';
                    document.getElementById('direccion').value = (agencia.direccion !== 'None') ? agencia.direccion : '';
                    document.getElementById('referencia').value = (agencia.referencia !== 'Sin referencia' && agencia.referencia !== 'None') ? agencia.referencia : '';
                    
                    resultadosContainer.style.display = 'none';
                });
                
                resultadosContainer.appendChild(div);
            });
            resultadosContainer.style.display = 'block';
        } else {
            resultadosContainer.style.display = 'none';
        }
    });

    // Cerrar la lista de sugerencias si el usuario hace clic en cualquier otra parte
    document.addEventListener('click', function(e) {
        if (e.target !== inputAgencia) {
            resultadosContainer.style.display = 'none';
        }
    });
}