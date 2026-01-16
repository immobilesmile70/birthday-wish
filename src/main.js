import confetti from 'canvas-confetti';
import { inject } from '@vercel/analytics';
import { InteractionParticles } from './interaction-particles.js';

new InteractionParticles();

inject();

const app = document.getElementById('router-view');
const toast = document.getElementById('toast');

async function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const name = params.get('name');
    const description = params.get('description');

    if (id) {
        await fetchWish(id);
    } else if (name && description) {
        renderViewMode(name, description);
        document.title = `Happy Birthday, ${name}!`;
    } else {
        renderCreateMode();
        document.title = "Birthday Wish";
    }
}

async function fetchWish(id) {
    renderLoading();
    try {
        const res = await fetch(`/api/get-wish?id=${id}`);
        if (!res.ok) {
            if (res.status === 404) throw new Error('Wish not found or expired');
            throw new Error('Failed to load wish');
        }
        const data = await res.json();
        renderViewMode(data.name, data.description);
        document.title = `Happy Birthday, ${data.name}!`;
    } catch (err) {
        renderError(err.message);
    }
}

function renderLoading() {
    app.innerHTML = `
        <div class="glass-container" style="text-align: center; min-height: 300px; display: flex; align-items: center; justify-content: center;">
            <div class="content">
                <div class="loading-spinner"></div>
                <p class="message" style="margin-top: 1rem;">Unwrapping the wish...</p>
            </div>
        </div>
    `;
}

function renderError(message) {
    app.innerHTML = `
        <div class="glass-container" style="text-align: center;">
            <div class="content">
                <h1 class="title">Oops!</h1>
                <p class="message">${message}</p>
                <button onclick="window.location.href='/'" class="btn primary" style="margin-top: 2rem;">
                    <span class="btn-text">Create a New Wish</span>
                    <div class="btn-glow"></div>
                </button>
            </div>
        </div>
    `;
}

function renderCreateMode() {
    app.innerHTML = `
        <div class="glass-container">
            <div class="content">
                <div class="badge">Create a Wish</div>
                <h1 class="title">Birthday Wish</h1>
                <p class="message">Create a birthday greeting for someone special ;)</p>
                
                <form id="create-form">
                    <div class="input-group">
                        <label class="input-label" for="param-name">Their Name</label>
                        <input type="text" id="param-name" class="form-input" placeholder="e.g. Rick" required>
                    </div>
                    
                    <div class="input-group">
                        <label class="input-label" for="param-desc">Your Message</label>
                        <textarea id="param-desc" class="form-textarea" placeholder="Write something heartfelt..." required></textarea>
                    </div>

                    <button type="submit" id="submit-btn" class="btn primary" style="width: 100%;">
                        <span class="btn-text">Generate Wish Link</span>
                        <div class="btn-glow"></div>
                    </button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('create-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');

        const name = document.getElementById('param-name').value.trim();
        const description = document.getElementById('param-desc').value.trim();

        if (!name || !description) return;

        submitBtn.disabled = true;
        btnText.textContent = 'Generating...';

        try {
            const res = await fetch('/api/create-wish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });

            if (!res.ok) {
                if (res.status === 429) throw new Error('Too many requests. Please try again later.');
                throw new Error('Failed to create wish');
            }

            const data = await res.json();
            window.location.search = `?id=${data.id}`;
        } catch (err) {
            console.error(err);
            alert(err.message || 'Something went wrong');
            submitBtn.disabled = false;
            btnText.textContent = 'Generate Wish Link';
        }
    });
}

function renderViewMode(name, description) {
    app.innerHTML = `
        <div class="glass-container">
            <div class="content">
                <div class="badge">Celebration Time</div>
                <h1 class="title">Happy Birthday, <br>${escapeHtml(name)}!</h1>
                
                <div class="actions">
                    <button id="celebrate-btn" class="btn primary">
                        <span class="btn-text">Make a Wish</span>
                        <div class="btn-glow"></div>
                    </button>
                </div>

                <div class="letter-container" id="letter-trigger">
                    <div class="letter-folded">
                        <span id="letter-icon" style="font-size: 2rem;">💌</span>
                        <div class="tap-hint">Tap to read the letter</div>
                        <div id="hidden-message" class="hidden">
                            <div class="letter-content">
                                ${escapeHtml(description).replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    </div>
                </div>
                
                 <div style="margin-top: 2rem; font-size: 0.9rem; opacity: 0.7;">
                    <a href="/" style="color: inherit; text-decoration: none; border-bottom: 1px dashed currentColor;">Create your own wish</a>
                </div>
            </div>
        </div>
    `;

    setupInteractions();
}

function setupInteractions() {
    const celebrateBtn = document.getElementById('celebrate-btn');
    if (celebrateBtn) {
        celebrateBtn.addEventListener('click', () => {
            triggerConfetti();
            playMusic();

            celebrateBtn.style.transform = 'scale(0.95)';
            setTimeout(() => celebrateBtn.style.transform = '', 100);
        });
    }

    const letterTrigger = document.getElementById('letter-trigger');
    const hiddenMsg = document.getElementById('hidden-message');
    const letterIcon = document.getElementById('letter-icon');
    const tapHint = document.querySelector('.tap-hint');

    let isOpen = false;
    if (letterTrigger) {
        letterTrigger.addEventListener('click', () => {
            if (!isOpen) {
                hiddenMsg.classList.remove('hidden');
                hiddenMsg.classList.add('fade-in');
                letterIcon.style.display = 'none';
                tapHint.style.display = 'none';
                isOpen = true;
            }
        });
    }
}

function triggerConfetti() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4d6d', '#7209b7', '#4cc9f0']
    });

    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ff4d6d', '#7209b7', '#4cc9f0']
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ff4d6d', '#7209b7', '#4cc9f0']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

function playMusic() {
    const audio = new Audio('/wish.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => {
        console.log("Audio autoplay blocked or file missing:", err);
    });
}

function showToast() {
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

init();