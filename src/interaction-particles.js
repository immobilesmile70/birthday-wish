
export class InteractionParticles {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.tintedImages = {};

        this.colors = [
            '#ff8656ff',
            '#7209b7',
            '#ff4d6d',
            '#f909ff',
            '#47a3ffff',
        ];

        this.sparkleImage = new Image();
        this.sparkleImage.src = '/sparkles.svg';
        this.sparkleImage.onload = () => {
            this.preRenderColors();
        };

        this.init();
    }

    init() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.addParticles(e.clientX, e.clientY));
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.addParticles(e.touches[0].clientX, e.touches[0].clientY);
            }
        });

        this.resize();
        this.animate();
    }

    preRenderColors() {
        const size = 64;

        this.colors.forEach(color => {
            const buffer = document.createElement('canvas');
            buffer.width = size;
            buffer.height = size;
            const ctx = buffer.getContext('2d');

            ctx.drawImage(this.sparkleImage, 0, 0, size, size);

            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, size, size);

            ctx.globalCompositeOperation = 'source-over';

            this.tintedImages[color] = buffer;
        });
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    addParticles(x, y) {
        if (Object.keys(this.tintedImages).length === 0) return;

        for (let i = 0; i < 0.7; i++) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const coloredImage = this.tintedImages[color];

            if (coloredImage) {
                this.particles.push(new Particle(x, y, coloredImage));
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update();
            this.particles[i].draw(this.ctx);

            if (this.particles[i].opacity <= 0) {
                this.particles.splice(i, 1);
                i--;
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.size = Math.random() * 40 + 10;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
        this.opacity = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.opacity > 0) this.opacity -= 0.02;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, this.opacity);

        ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);

        ctx.restore();
    }
}
