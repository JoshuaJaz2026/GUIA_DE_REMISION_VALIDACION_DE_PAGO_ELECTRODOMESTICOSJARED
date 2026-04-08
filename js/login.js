// Base de datos simulada de trabajadores
const dbUsuarios = {
    "joshua": "admin123",
    "maria": "ventas2026",
    "carlos": "almacen01"
};

const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

// Si ya hay alguien logueado, lo mandamos directo al sistema
if (localStorage.getItem('sesionActiva_JAAP')) {
    // ACTUALIZADO: Salimos de pages para ir a index.html
    window.location.href = '../index.html';
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.toLowerCase();
    const pass = document.getElementById('loginPass').value;

    if (dbUsuarios[user] && dbUsuarios[user] === pass) {
        localStorage.setItem('sesionActiva_JAAP', user);
        
        // ACTUALIZADO: Salimos de pages para ir a index.html
        window.location.href = '../index.html';
    } else {
        loginError.style.display = 'block';
        const card = document.querySelector('.login-card');
        card.style.transform = "translateX(-10px)";
        setTimeout(() => card.style.transform = "translateX(10px)", 50);
        setTimeout(() => card.style.transform = "translateX(-10px)", 100);
        setTimeout(() => card.style.transform = "translateX(0)", 150);
    }
});

// --- Animación de Partículas para el Login ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
let particlesArray = [];
class Particle {
    constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.size = Math.random() * 2 + 1; this.speedX = (Math.random() * 0.8) - 0.4; this.speedY = (Math.random() * 0.8) - 0.4; }
    update() { this.x += this.speedX; this.y += this.speedY; if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX; if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY; }
    draw() { ctx.fillStyle = 'rgba(0, 194, 179, 0.4)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.closePath(); ctx.fill(); }
}
function initCanvas() { particlesArray = []; for (let i = 0; i < 80; i++) { particlesArray.push(new Particle()); } }
function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update(); particlesArray[i].draw();
        for (let j = i; j < particlesArray.length; j++) {
            const dx = particlesArray[i].x - particlesArray[j].x; const dy = particlesArray[i].y - particlesArray[j].y; const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 120) { ctx.beginPath(); ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'; ctx.lineWidth = 0.5; ctx.moveTo(particlesArray[i].x, particlesArray[i].y); ctx.lineTo(particlesArray[j].x, particlesArray[j].y); ctx.stroke(); ctx.closePath(); }
        }
    }
    requestAnimationFrame(animateCanvas);
}
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initCanvas(); });
initCanvas(); animateCanvas();