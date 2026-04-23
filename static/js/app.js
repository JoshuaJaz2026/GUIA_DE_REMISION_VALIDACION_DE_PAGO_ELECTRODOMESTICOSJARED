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
const checkboxConfirmacion = document.getElementById('confirmacion');
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
                btnSubmit.disabled = !checkboxConfirmacion.checked;

                // --- LLAMADA A LA API ---
                if (val.length === 8 || val.length === 11) {
                    buscarDatosDocumento(val);
                }
            } else {
                this.style.borderColor = ''; 
                errorDoc.style.display = 'none';
            }
        }
    });
}

// --- FUNCIÓN MEJORADA: CONSULTA DECOLECTA VÍA DJANGO ---
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
                inputNombre.style.borderColor = '#00c2b3'; // Verde éxito
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
    input.style.borderColor = '#ffa502'; // Naranja advertencia
}

if(checkboxConfirmacion && btnSubmit) {
    checkboxConfirmacion.addEventListener('change', function() {
        const tieneError = inputDni && inputDni.style.borderColor === 'rgb(255, 71, 87)';
        if (tieneError) {
            this.checked = false;
            alert("Corrija el DNI/RUC antes de continuar.");
            btnSubmit.disabled = true;
        } else {
            btnSubmit.disabled = !this.checked;
        }
    });
}

// ==========================================
// REGISTRO Y LOCALSTORAGE (NUEVO O EDICIÓN)
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

        const llaveBD = 'guiasJAAP_' + usuarioActual; 
        let guias = JSON.parse(localStorage.getItem(llaveBD)) || [];

        // CAPTURA DE DATOS ACTUALES DEL FORMULARIO
        const celularVal = document.getElementById('celular').value;
        const agenciaVal = document.getElementById('agencia').value;
        const direccionVal = document.getElementById('direccion').value;
        const referenciaVal = document.getElementById('referencia').value;
        const productoVal = document.getElementById('producto').value;
        const fechaActual = new Date().toLocaleDateString('es-PE');

        let guiaResumen = {}; // Para el mensaje de WhatsApp

        // ¿ESTAMOS EDITANDO O CREANDO?
        if (idGuiaEditando !== null) {
            // MODO EDICIÓN: Buscamos la guía y actualizamos sus datos
            const index = guias.findIndex(g => g.id === idGuiaEditando);
            if (index !== -1) {
                guias[index].dni = dniVal;
                guias[index].nombre = nombreVal;
                guias[index].celular = celularVal;
                guias[index].agencia = agenciaVal;
                guias[index].direccion = direccionVal;
                guias[index].referencia = referenciaVal;
                guias[index].producto = productoVal;
                guiaResumen = guias[index];
            }
            
            // Limpiamos el estado de edición
            idGuiaEditando = null;
            btnSubmit.innerText = "Generar Guía de Remisión"; 
            btnSubmit.style.backgroundColor = ""; 

        } else {
            // MODO NUEVO REGISTRO: Creamos uno desde cero
            const nuevaGuia = {
                id: Date.now(),
                fecha: fechaActual,
                nombre: nombreVal,
                dni: dniVal,
                celular: celularVal,
                agencia: agenciaVal,
                direccion: direccionVal,
                referencia: referenciaVal,
                producto: productoVal
            };
            guias.push(nuevaGuia);
            guiaResumen = nuevaGuia;
        }

        // GUARDAR EN MEMORIA
        localStorage.setItem(llaveBD, JSON.stringify(guias));
        
        // RESUMEN ACTUALIZADO PARA WHATSAPP
        textoResumen.value = `📦 ELECTRODOMÉSTICOS JARED\n👤 Atendido por: ${usuarioActual.toUpperCase()}\n------------------------\n👤 Cliente: ${guiaResumen.nombre}\n📄 DNI/RUC: ${guiaResumen.dni}\n📱 Celular: ${guiaResumen.celular}\n🚚 Agencia: ${guiaResumen.agencia}\n📍 Dirección: ${guiaResumen.direccion}\n📌 Referencia: ${guiaResumen.referencia}\n🛒 Producto: ${guiaResumen.producto}\n📅 Fecha: ${guiaResumen.fecha}`;
        modalCopia.classList.add('activo');

        // LIMPIEZA DEL FORMULARIO
        form.reset();
        inputDni.style.borderColor = ''; 
        document.getElementById('direccion').style.borderColor = '';
        document.getElementById('referencia').style.borderColor = '';
        document.getElementById('nombre').style.borderColor = ''; 
        if(checkboxConfirmacion) checkboxConfirmacion.checked = false;
        btnSubmit.disabled = true;
        
        // Refrescar la tabla
        mostrarGuias();
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

function mostrarGuias() {
    if(!tabla) return;
    const llaveBD = 'guiasJAAP_' + usuarioActual;
    let guias = JSON.parse(localStorage.getItem(llaveBD)) || [];
    tabla.innerHTML = '';
    
    guias.reverse().forEach(g => {
        tabla.innerHTML += `
            <tr>
                <td><strong>${g.fecha}</strong></td>
                <td>${g.nombre}</td>
                <td>${g.dni}</td>
                <td><strong>${g.agencia}</strong><br><small>${g.direccion}</small></td>
                <td>
                    <button onclick="editarGuia(${g.id})" style="background:#0097e6; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer; margin-right:5px; font-weight:bold;">✏️</button>
                    <button onclick="imprimirGuia(${g.id})" style="background:#7b1fa2; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer; margin-right:5px; font-weight:bold;">🖨️</button>
                    <button onclick="eliminarGuia(${g.id})" class="btn-eliminar" style="padding:8px 12px;">🗑️</button>
                </td>
            </tr>`;
    });
}

// --- NUEVA FUNCIÓN PARA EDITAR GUÍA ---
window.editarGuia = function(id) {
    const llaveBD = 'guiasJAAP_' + usuarioActual;
    let guias = JSON.parse(localStorage.getItem(llaveBD)) || [];
    const guia = guias.find(g => g.id === id);
    
    if(guia) {
        // Llenar el formulario con los datos guardados
        document.getElementById('dni').value = guia.dni;
        document.getElementById('nombre').value = guia.nombre;
        document.getElementById('celular').value = guia.celular || '';
        document.getElementById('agencia').value = guia.agencia || '';
        document.getElementById('direccion').value = guia.direccion || '';
        document.getElementById('referencia').value = guia.referencia || '';
        document.getElementById('producto').value = guia.producto || '';

        // Asegurarnos de que el campo nombre no esté bloqueado
        document.getElementById('nombre').disabled = false;
        document.getElementById('dni').style.borderColor = '#00c2b3';
        document.getElementById('nombre').style.borderColor = '#00c2b3';

        // Marcar que estamos en MODO EDICIÓN
        idGuiaEditando = id;

        // Cambiar el texto del botón
        if (btnSubmit) {
            btnSubmit.innerText = "Guardar Cambios";
            btnSubmit.style.backgroundColor = "#0097e6";
        }

        // Mover la pantalla al formulario
        if (sliderTrack) {
            sliderTrack.style.transform = 'translateX(0)';
        }
    }
}

window.imprimirGuia = function(id) {
    const llaveBD = 'guiasJAAP_' + usuarioActual;
    let guias = JSON.parse(localStorage.getItem(llaveBD)) || [];
    const guiaAImprimir = guias.find(g => g.id === id);
    
    if(guiaAImprimir) {
        localStorage.setItem('guiaAImprimir', JSON.stringify(guiaAImprimir));
        window.open('/imprimir-prueba/', '_blank');
    }
}

window.eliminarGuia = function(id) {
    if(confirm('¿Eliminar esta guía?')) {
        const llaveBD = 'guiasJAAP_' + usuarioActual;
        let guias = JSON.parse(localStorage.getItem(llaveBD)) || [];
        guias = guias.filter(g => g.id !== id);
        localStorage.setItem(llaveBD, JSON.stringify(guias));
        mostrarGuias();
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
// 2. FONDO DE PARTÍCULAS
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

// --- LÓGICA DE AGENCIA ---
const inputAgencia = document.getElementById('agencia');
const inputDireccion = document.getElementById('direccion');
const inputReferencia = document.getElementById('referencia');

if (inputAgencia) {
    inputAgencia.addEventListener('change', function() {
        const nombreSeleccionado = this.value;
        fetch(`/api/agencia/?nombre=${encodeURIComponent(nombreSeleccionado)}`)
            .then(response => response.json())
            .then(data => {
                if (data.direccion) {
                    inputDireccion.value = data.direccion;
                    inputReferencia.value = data.referencia || '';
                    inputDireccion.style.borderColor = '#00c2b3';
                    inputReferencia.style.borderColor = '#00c2b3';
                }
            })
            .catch(err => console.log("Agencia no encontrada:", err));
    });
}