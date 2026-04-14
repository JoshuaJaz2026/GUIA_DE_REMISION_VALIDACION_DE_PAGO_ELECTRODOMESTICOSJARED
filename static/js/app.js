// ==========================================
// 0. INTEGRACIÓN CON DJANGO (SESIÓN)
// ==========================================

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

if(btnSubmit && checkboxConfirmacion) {
    btnSubmit.disabled = !checkboxConfirmacion.checked;
}

document.addEventListener('DOMContentLoaded', mostrarGuias);

if(inputDni) {
    inputDni.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        if(this.value.length > 11) this.value = this.value.slice(0, 11);
    });
}

if(checkboxConfirmacion && btnSubmit) {
    checkboxConfirmacion.addEventListener('change', function() {
        btnSubmit.disabled = !this.checked;
    });
}

if(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const dniVal = inputDni.value;
        if (dniVal.length !== 8 && dniVal.length !== 11) {
            alert('⚠️ Error: DNI (8 dígitos) o RUC (11 dígitos).');
            inputDni.focus();
            return; 
        }

        // CAPTURA DE DATOS (Nuevos y antiguos)
        const nombreVal = document.getElementById('nombre').value;
        const celularVal = document.getElementById('celular').value;
        const agenciaVal = document.getElementById('agencia').value;
        const direccionVal = document.getElementById('direccion').value;
        const referenciaVal = document.getElementById('referencia').value;
        const productoVal = document.getElementById('producto').value;
        const fechaActual = new Date().toLocaleDateString('es-PE');

        const guia = {
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

        const llaveBD = 'guiasJAAP_' + usuarioActual; // Mantenemos la llave para no borrar tu historial anterior
        let guias = JSON.parse(localStorage.getItem(llaveBD)) || [];
        guias.push(guia);
        localStorage.setItem(llaveBD, JSON.stringify(guias));
        
        // RESUMEN ACTUALIZADO PARA WHATSAPP
        textoResumen.value = `📦 ELECTRODOMÉSTICOS JARED\n👤 Atendido por: ${usuarioActual.toUpperCase()}\n------------------------\n👤 Cliente: ${nombreVal}\n📄 DNI/RUC: ${dniVal}\n📱 Celular: ${celularVal}\n🚚 Agencia: ${agenciaVal}\n📍 Dirección: ${direccionVal}\n📌 Referencia: ${referenciaVal}\n🛒 Producto: ${productoVal}\n📅 Fecha: ${fechaActual}`;
        modalCopia.classList.add('activo');

        form.reset();
        btnSubmit.disabled = true;
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
        // Agregamos la Agencia y el botón de imprimir a la tabla
        tabla.innerHTML += `
            <tr>
                <td><strong>${g.fecha}</strong></td>
                <td>${g.nombre}</td>
                <td>${g.dni}</td>
                <td><strong>${g.agencia}</strong><br><small>${g.direccion}</small></td>
                <td>
                    <button onclick="imprimirGuia(${g.id})" style="background:#7b1fa2; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer; margin-right:5px; font-weight:bold;">🖨️</button>
                    <button onclick="eliminarGuia(${g.id})" class="btn-eliminar" style="padding:8px 12px;">🗑️</button>
                </td>
            </tr>`;
    });
}

// NUEVA FUNCIÓN: Envía los datos a la pestaña de impresión
window.imprimirGuia = function(id) {
    const llaveBD = 'guiasJAAP_' + usuarioActual;
    let guias = JSON.parse(localStorage.getItem(llaveBD)) || [];
    const guiaAImprimir = guias.find(g => g.id === id);
    
    if(guiaAImprimir) {
        // Guardamos la guía exacta que queremos imprimir en una memoria temporal
        localStorage.setItem('guiaAImprimir', JSON.stringify(guiaAImprimir));
        // Abrimos la ruta de tu hoja morada en una pestaña nueva
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