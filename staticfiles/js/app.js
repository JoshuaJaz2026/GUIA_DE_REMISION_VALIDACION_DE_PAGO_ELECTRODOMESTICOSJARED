// ==========================================
// 0. VERIFICACIÓN DE SEGURIDAD (SESIÓN)
// ==========================================
const usuarioActual = localStorage.getItem('sesionActiva_JAAP');

// Si no hay login, lo enviamos a la página de login (en la carpeta pages)
if (!usuarioActual) {
    window.location.href = 'pages/login.html';
}

// Colocamos el nombre en el header si el elemento existe en el HTML
const nombreElement = document.getElementById('nombreUsuario');
if(nombreElement) {
    nombreElement.innerText = usuarioActual.toUpperCase();
}

// Lógica del botón de Cerrar Sesión
const btnLogout = document.getElementById('btnLogout');
if(btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('sesionActiva_JAAP');
        window.location.href = 'pages/login.html';
    });
}

// ==========================================
// 1. LÓGICA DE NAVEGACIÓN Y FORMULARIO
// ==========================================
const form = document.getElementById('guiaForm');
const tabla = document.getElementById('listaCuerpo');
const buscador = document.getElementById('buscador');

// Referencias de navegación (SLIDER)
const sliderTrack = document.getElementById('sliderTrack');
const btnGoHistory = document.getElementById('btnGoHistory');
const btnGoForm = document.getElementById('btnGoForm');

// Referencias para validación inteligente
const inputDni = document.getElementById('dni');
const checkboxConfirmacion = document.getElementById('confirmacion');
const btnSubmit = document.getElementById('btnSubmit');

// Referencias al Modal
const modalCopia = document.getElementById('modalCopia');
const textoResumen = document.getElementById('textoResumen');
const btnCopiar = document.getElementById('btnCopiar');
const btnCerrarModal = document.getElementById('btnCerrarModal');

// --- EVENTOS DE NAVEGACIÓN DEL SLIDER ---
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

// Desactivar el botón al iniciar
if(btnSubmit && checkboxConfirmacion) {
    btnSubmit.disabled = !checkboxConfirmacion.checked;
}

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', mostrarGuias);

// --- CAMPO DNI INTELIGENTE (Solo números) ---
if(inputDni) {
    inputDni.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        if(this.value.length > 11) {
            this.value = this.value.slice(0, 11);
        }
    });
}

// --- ACTIVAR BOTÓN CON CHECKBOX ---
if(checkboxConfirmacion && btnSubmit) {
    checkboxConfirmacion.addEventListener('change', function() {
        btnSubmit.disabled = !this.checked;
    });
}

if(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Si por alguna razón no hay usuario, detener proceso
        if(!usuarioActual) return;
        
        // Capturamos los datos
        const dniVal = inputDni.value;
        
        if (dniVal.length !== 8 && dniVal.length !== 11) {
            alert('⚠️ Error: El documento debe ser un DNI válido (8 dígitos) o un RUC válido (11 dígitos).');
            inputDni.focus();
            return; 
        }

        const nombreVal = document.getElementById('nombre').value;
        const direccionVal = document.getElementById('direccion').value;
        const productoVal = document.getElementById('producto').value;
        const fechaActual = new Date().toLocaleDateString('es-PE');

        const guia = {
            id: Date.now(),
            fecha: fechaActual,
            nombre: nombreVal,
            dni: dniVal,
            direccion: direccionVal,
            producto: productoVal
        };

        // Guardamos en la base de datos ESPECÍFICA del usuario actual
        const llaveBD = 'guiasJAAP_' + usuarioActual;
        let guias = JSON.parse(localStorage.getItem(llaveBD)) || [];
        guias.push(guia);
        localStorage.setItem(llaveBD, JSON.stringify(guias));
        
        // Añadimos quién lo atendió al resumen
        const resumenFormateado = `📦 SUBLIMACIONES JAAP\n👤 Atendido por: ${usuarioActual.toUpperCase()}\n------------------------\n👤 Cliente: ${nombreVal}\n📄 DNI/RUC: ${dniVal}\n📍 Dirección: ${direccionVal}\n🛒 Producto: ${productoVal}\n📅 Fecha: ${fechaActual}`;
        
        textoResumen.value = resumenFormateado;
        modalCopia.classList.add('activo');

        form.reset();
        btnSubmit.disabled = true;
        mostrarGuias();
    });
}

// Funciones de la ventana emergente
if(btnCopiar && textoResumen) {
    btnCopiar.addEventListener('click', () => {
        textoResumen.select();
        document.execCommand('copy');
        
        const textoOriginal = btnCopiar.innerText;
        btnCopiar.innerText = '¡Copiado con éxito!';
        btnCopiar.style.backgroundColor = '#28a745'; 
        
        setTimeout(() => {
            btnCopiar.innerText = 'Copiar al Portapapeles';
            btnCopiar.style.backgroundColor = '';
        }, 2000);
    });
}

if(btnCerrarModal && modalCopia) {
    btnCerrarModal.addEventListener('click', () => {
        modalCopia.classList.remove('activo');
    });
}

function mostrarGuias() {
    if(!tabla || !usuarioActual) return;

    // Leemos de la base de datos ESPECÍFICA del usuario actual
    const llaveBD = 'guiasJAAP_' + usuarioActual;
    let guias = JSON.parse(localStorage.getItem(llaveBD)) || [];
    tabla.innerHTML = '';
    
    guias.reverse().forEach(g => {
        tabla.innerHTML += `
            <tr>
                <td><strong>${g.fecha}</strong></td>
                <td>${g.nombre}</td>
                <td>${g.dni}</td>
                <td>
                    <strong>${g.producto}</strong><br>
                    <small style="color: #888;">Envío a: ${g.direccion}</small>
                </td>
                <td><button onclick="eliminarGuia(${g.id})" class="btn-eliminar">Eliminar</button></td>
            </tr>
        `;
    });
}

// Función global (por eso debe estar disponible en window para el onclick del HTML)
window.eliminarGuia = function(id) {
    if(confirm('¿Seguro que deseas eliminar esta guía de remisión?')) {
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
        let filas = tabla.getElementsByTagName('tr');

        Array.from(filas).forEach(fila => {
            let texto = fila.innerText.toLowerCase();
            fila.style.display = texto.includes(filtro) ? '' : 'none';
        });
    });
}

// ==========================================
// 2. LÓGICA DEL FONDO ANIMADO (PARTÍCULAS)
// ==========================================
const canvas = document.getElementById('bg-canvas');
if(canvas) {
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];
    const numberOfParticles = 80;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = (Math.random() * 0.8) - 0.4;
            this.speedY = (Math.random() * 0.8) - 0.4;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
            if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
        }
        
        draw() {
            ctx.fillStyle = 'rgba(0, 194, 179, 0.4)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    function initCanvas() {
        particlesArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function handleParticles() {
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
            
            for (let j = i; j < particlesArray.length; j++) {
                const dx = particlesArray[i].x - particlesArray[j].x;
                const dy = particlesArray[i].y - particlesArray[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    }

    function animateCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        handleParticles();
        requestAnimationFrame(animateCanvas);
    }

    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initCanvas();
    });

    initCanvas();
    animateCanvas();
}