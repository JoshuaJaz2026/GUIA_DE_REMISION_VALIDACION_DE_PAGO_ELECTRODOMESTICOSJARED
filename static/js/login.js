// login.js - Optimizado para Sublimaciones JAAP
// Este código solo se encarga del fondo visual, dejando que Django maneje el login.

// --- Fondo de Partículas Animado ---
const canvas = document.getElementById('bg-canvas');

if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight;
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
            this.x += this.speedX; 
            this.y += this.speedY; 
            // Rebote en los bordes
            if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX; 
            if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY; 
        }
        draw() { 
            ctx.fillStyle = 'rgba(0, 194, 179, 0.4)'; 
            ctx.beginPath(); 
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); 
            ctx.fill(); 
        }
    }

    function init() { 
        particlesArray = []; 
        for (let i = 0; i < 80; i++) {
            particlesArray.push(new Particle());
        } 
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesArray.forEach(p => { 
            p.update(); 
            p.draw(); 
        });
        requestAnimationFrame(animate);
    }

    // Ajuste al cambiar tamaño de ventana
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });

    init(); 
    animate();
}