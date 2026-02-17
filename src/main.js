import confetti from 'canvas-confetti';
import { inject } from '@vercel/analytics';
import { InteractionParticles } from './interaction-particles.js';

new InteractionParticles();

inject();

const throbberHTML = `<svg stroke="var(--text-white)" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><circle cx="12" cy="12" r="9.5" fill="none" stroke-width="3" stroke-linecap="round"><animate attributeName="stroke-dasharray" dur="1.5s" calcMode="spline" values="0 150;42 150;42 150;42 150" keyTimes="0;0.475;0.95;1" keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1" repeatCount="indefinite"></animate><animate attributeName="stroke-dashoffset" dur="1.5s" calcMode="spline" values="0;-16;-59;-59" keyTimes="0;0.475;0.95;1" keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1" repeatCount="indefinite"></animate></circle><animateTransform attributeName="transform" type="rotate" dur="2s" values="0 12 12;360 12 12" repeatCount="indefinite"></animateTransform></g></svg>`;

const app = document.getElementById('router-view');

const cachedAudio = new Audio('/wish.mp3');
cachedAudio.volume = 0.6;
cachedAudio.preload = 'auto';

let lastCelebrationTime = 0;
const CELEBRATION_COOLDOWN_MS = 5000;

async function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const name = params.get('name');
    const description = params.get('description');
    const sender = params.get('sender');

    if (id) {
        await fetchWish(id);
    } else if (name && description) {
        renderViewMode(name, description, sender);
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
        renderViewMode(data.name, data.description, data.sender);
        document.title = `Happy Birthday, ${data.name}!`;
    } catch (err) {
        renderError(err.message);
    }
}

function renderLoading() {
    app.innerHTML = `
        <div class="glass-container" style="text-align: center; min-height: 300px; display: flex; align-items: center; justify-content: center;">
            <div class="content">
    <div style="
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
">
                <div class="loading-spinner" style="
    width: 30px;
    height: 30px;
"><svg stroke="var(--text-dim)" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><circle cx="12" cy="12" r="9.5" fill="none" stroke-width="3" stroke-linecap="round"><animate attributeName="stroke-dasharray" dur="1.5s" calcMode="spline" values="0 150;42 150;42 150;42 150" keyTimes="0;0.475;0.95;1" keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1" repeatCount="indefinite"></animate><animate attributeName="stroke-dashoffset" dur="1.5s" calcMode="spline" values="0;-16;-59;-59" keyTimes="0;0.475;0.95;1" keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1" repeatCount="indefinite"></animate></circle><animateTransform attributeName="transform" type="rotate" dur="2s" values="0 12 12;360 12 12" repeatCount="indefinite"></animateTransform></g></svg></div>
                <p class="message" style="
    font-size: 1.25rem;
    font-weight: 600;
">Unwrapping the wish...</p>
            </div>
</div>
        </div>
    `;
}

function renderError(message) {
    app.innerHTML = `
        <div class="glass-container" style="text-align: center;">
            <div class="content">
                <h1 class="title"><p>Oops!</p></h1>
                <p class="message">${message}</p>
                <button onclick="window.location.href='/'" class="btn primary" style="margin-top: 2rem;">
                    <span class="btn-text">Create a New Wish</span>
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
                <h1 class="title"><p>Birthday Wish</p></h1>
                <p class="message">Create a birthday greeting for someone special ;)</p>
                
                <form id="create-form">
                    <div class="input-group">
                        <label class="input-label" for="param-name">Their Name</label>
                        <input type="text" id="param-name" maxlength="50" class="form-input" placeholder="e.g. Rick" required>
                    </div>
                    
                    <div class="input-group">
                        <label class="input-label" for="param-desc">Your Message</label>
                        <textarea id="param-desc" class="form-textarea" placeholder="Write something heartfelt..." maxlength="1200" required></textarea>
                    </div>
                    
                    <div class="input-group">
                        <label class="input-label" for="param-sender">Your Name</label>
                        <input type="text" id="param-sender" maxlength="50" class="form-input" placeholder="e.g. Shourya" required>
                    </div>

                    <button type="submit" id="submit-btn" class="btn primary" style="width: 100%;">
                        Generate Wish Link
                    </button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('create-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');

        const name = document.getElementById('param-name').value.trim();
        const description = document.getElementById('param-desc').value.trim();
        const sender = document.getElementById('param-sender').value.trim();

        if (!name || !description || !sender) return;

        if(name.length > 50 || description.length > 1200 || sender.length > 50) {
            alert('Input exceeds maximum allowed length.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<div class="loading-spinner" style="width: 20px; height: 20px;">${throbberHTML}</div> Generating...`;

        try {
            const res = await fetch('/api/create-wish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, sender })
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
            submitBtn.textContent = 'Generate Wish Link';
        }
    });
}

function renderViewMode(name, description, sender) {
    app.innerHTML = `
        <div class="glass-container">
            <div class="content">
                <div class="badge">Celebration Time</div>
                <h1 class="title"><p>Happy Birthday, <br>${escapeHtml(name)}!</p></h1>
                
                <div class="actions">
                    <button id="celebrate-btn" class="btn primary">
                        <span class="btn-text">Make a Wish</span>
                    </button>
                </div>

                <div class="letter-container" id="letter-trigger">
                    <div class="letter-folded">
                        <span id="letter-icon" style="font-size: 2rem;">💌</span>
                        <div class="tap-hint">Tap to read the letter</div>
                        <div id="hidden-message" class="hidden">
                            <div class="letter-content">
                                ${escapeHtml(description).replace(/\n/g, '<br>')}
                                ${sender ? `<div class="sender-name">— ${escapeHtml(sender)}</div>` : ''}
                            </div>
                        </div>
                    </div>
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
            const now = Date.now();

            if (now - lastCelebrationTime < CELEBRATION_COOLDOWN_MS) {
                console.log('Celebration cooldown active. Please wait before celebrating again.');
                return;
            }

            triggerConfetti();
            playMusic();

            lastCelebrationTime = now;

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
    cachedAudio.currentTime = 0;
    cachedAudio.play().catch(err => {
        console.log("Audio autoplay blocked or file missing:", err);
    });
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