import confetti from 'canvas-confetti';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Vercel Analytics and Speed Insights
inject();
injectSpeedInsights();

// DOM Elements
const app = document.getElementById('router-view');
const toast = document.getElementById('toast');

// --- State & Router ---

function init() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const description = params.get('description');

    if (name && description) {
        renderViewMode(name, description);
        document.title = `Happy Birthday, ${name}!`;
    } else {
        renderCreateMode();
        document.title = "Birthday Wish";
    }
}

// --- View: Create Mode ---

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

                    <button type="submit" class="btn primary" style="width: 100%;">
                        <span class="btn-text">Generate Wish Link</span>
                        <div class="btn-glow"></div>
                    </button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('create-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('param-name').value.trim();
        const desc = document.getElementById('param-desc').value.trim();

        if (name && desc) {
            const params = new URLSearchParams();
            params.set('name', name);
            params.set('description', desc);
            window.location.search = params.toString();
        }
    });
}

// --- View: View Mode (Birthday Wish) ---

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
            </div>
        </div>
    `;

    // Event Listeners
    setupInteractions();
}

// --- Actions & Helpers ---

function setupInteractions() {
    // 1. Celebrate Button
    const celebrateBtn = document.getElementById('celebrate-btn');
    celebrateBtn.addEventListener('click', () => {
        triggerConfetti();
        playMusic();

        // Button Pulse
        celebrateBtn.style.transform = 'scale(0.95)';
        setTimeout(() => celebrateBtn.style.transform = '', 100);
    });

    // 2. Letter/Description Toggle
    const letterTrigger = document.getElementById('letter-trigger');
    const hiddenMsg = document.getElementById('hidden-message');
    const letterIcon = document.getElementById('letter-icon');
    const tapHint = document.querySelector('.tap-hint');

    let isOpen = false;
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

function triggerConfetti() {
    // Blast confetti!
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4d6d', '#7209b7', '#4cc9f0']
    });

    // Side cannons
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

// Start
init();
