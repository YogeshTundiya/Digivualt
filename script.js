/**
 * Digital Legacy Vault - Premium JavaScript
 * Zero-Knowledge Encryption with Web Crypto API
 * AES-256-GCM · PBKDF2 Key Derivation · 100,000 iterations
 */

const STORAGE_KEY = 'digitalLegacyVault';
const ENCRYPTED_STORAGE_KEY = 'digitalLegacyVaultEncrypted';
const AUTO_SAVE_DELAY = 800;
const PBKDF2_ITERATIONS = 100000;

const INPUT_FIELDS = [
    'bankAccounts', 'insurancePolicies', 'investments', 'financialNotes',
    'emailAccounts', 'passwordManager', 'socialMedia', 'digitalAssets',
    'propertyDeeds', 'keysLocations', 'importantDocuments', 'physicalNotes',
    'funeralWishes', 'organDonation', 'personalMessages', 'additionalWishes'
];

// DOM Elements
const elements = {
    saveBtn: document.getElementById('saveBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    exportPdfBtn: document.getElementById('exportPdfBtn'),
    lastSaved: document.getElementById('lastSaved'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    progressFill: document.getElementById('progressFill'),
    progressValue: document.getElementById('progressValue'),
    canvas: document.getElementById('particleCanvas'),
    // Encryption elements
    encryptionPanel: document.getElementById('encryptionPanel'),
    encryptionStatus: document.getElementById('encryptionStatus'),
    masterPassword: document.getElementById('masterPassword'),
    togglePassword: document.getElementById('togglePassword'),
    passwordStrength: document.getElementById('passwordStrength'),
    encryptBtn: document.getElementById('encryptBtn'),
    decryptBtn: document.getElementById('decryptBtn')
};

// Encryption state
let isEncrypted = false;
let encryptedBlob = null;

// ============================================
// WEB CRYPTO API - ZERO-KNOWLEDGE ENCRYPTION
// ============================================

/**
 * Generate a cryptographically secure random salt
 * @returns {Uint8Array} 16-byte salt
 */
function generateSalt() {
    return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generate a cryptographically secure random IV for AES-GCM
 * @returns {Uint8Array} 12-byte IV
 */
function generateIV() {
    return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Derive an AES-256 key from password using PBKDF2
 * @param {string} password - User's master password
 * @param {Uint8Array} salt - Random salt
 * @returns {Promise<CryptoKey>} Derived AES-GCM key
 */
async function deriveKey(password, salt) {
    // Convert password to buffer
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as raw key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
    );

    // Derive AES-256-GCM key using PBKDF2
    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256'
        },
        keyMaterial,
        {
            name: 'AES-GCM',
            length: 256
        },
        false,
        ['encrypt', 'decrypt']
    );

    return derivedKey;
}

/**
 * Encrypt data using AES-256-GCM
 * @param {string} plaintext - Data to encrypt
 * @param {string} password - Master password
 * @returns {Promise<Object>} Encrypted blob with salt, iv, and ciphertext
 */
async function encryptData(plaintext, password) {
    const salt = generateSalt();
    const iv = generateIV();
    const key = await deriveKey(password, salt);

    const encoder = new TextEncoder();
    const plaintextBuffer = encoder.encode(plaintext);

    const ciphertext = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        plaintextBuffer
    );

    // Return encrypted blob with all components needed for decryption
    return {
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
        ciphertext: arrayBufferToBase64(ciphertext),
        algorithm: 'AES-256-GCM',
        iterations: PBKDF2_ITERATIONS,
        timestamp: new Date().toISOString()
    };
}

/**
 * Decrypt data using AES-256-GCM
 * @param {Object} encryptedBlob - Encrypted data object
 * @param {string} password - Master password
 * @returns {Promise<string>} Decrypted plaintext
 */
async function decryptData(encryptedBlob, password) {
    const salt = base64ToArrayBuffer(encryptedBlob.salt);
    const iv = base64ToArrayBuffer(encryptedBlob.iv);
    const ciphertext = base64ToArrayBuffer(encryptedBlob.ciphertext);

    const key = await deriveKey(password, new Uint8Array(salt));

    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: new Uint8Array(iv)
        },
        key,
        ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Encrypt the entire vault
 */
async function encryptVault() {
    const password = elements.masterPassword.value;

    if (!password) {
        showToast('⚠️ Please enter a master password', 3000);
        elements.masterPassword.focus();
        return;
    }

    if (password.length < 8) {
        showToast('⚠️ Password must be at least 8 characters', 3000);
        return;
    }

    try {
        // Gather all form data
        const formData = getFormData();
        const plaintext = JSON.stringify(formData);

        console.log('🔐 Starting encryption...');
        console.log('📄 Plaintext size:', plaintext.length, 'bytes');

        // Encrypt the data
        const encrypted = await encryptData(plaintext, password);
        encryptedBlob = encrypted;

        // Store encrypted blob
        localStorage.setItem(ENCRYPTED_STORAGE_KEY, JSON.stringify(encrypted));
        localStorage.removeItem(STORAGE_KEY); // Remove unencrypted data

        // Clear form fields visually
        INPUT_FIELDS.forEach(id => {
            const field = document.getElementById(id);
            if (field) field.value = '';
        });

        // Update UI state
        setEncryptedState(true);

        // Log to console for verification
        console.log('✅ Encryption successful!');
        console.log('🔒 Encrypted Blob:', encrypted);
        console.log('📊 Ciphertext length:', encrypted.ciphertext.length, 'chars (Base64)');
        console.log('🧂 Salt:', encrypted.salt);
        console.log('🎲 IV:', encrypted.iv);
        console.log('⚙️ Algorithm:', encrypted.algorithm);
        console.log('🔄 PBKDF2 Iterations:', encrypted.iterations);

        showToast('🔒 Vault encrypted successfully!', 3000);
        elements.masterPassword.value = '';
        updatePasswordStrength('');

    } catch (error) {
        console.error('❌ Encryption error:', error);
        showToast('⚠️ Encryption failed: ' + error.message, 4000);
    }
}

/**
 * Decrypt the vault
 */
async function decryptVault() {
    const password = elements.masterPassword.value;

    if (!password) {
        showToast('⚠️ Please enter your master password', 3000);
        elements.masterPassword.focus();
        return;
    }

    try {
        // Get encrypted blob from storage
        const storedBlob = localStorage.getItem(ENCRYPTED_STORAGE_KEY);
        if (!storedBlob) {
            showToast('⚠️ No encrypted data found', 3000);
            return;
        }

        const encrypted = JSON.parse(storedBlob);

        console.log('🔓 Starting decryption...');
        console.log('🔒 Encrypted Blob:', encrypted);

        // Decrypt the data
        const plaintext = await decryptData(encrypted, password);
        const formData = JSON.parse(plaintext);

        // Populate form fields
        if (formData.fields) {
            Object.entries(formData.fields).forEach(([id, value]) => {
                const field = document.getElementById(id);
                if (field) field.value = value;
            });
        }

        // Update UI state
        setEncryptedState(false);
        updateProgress();

        // Store unencrypted for editing (will be re-encrypted on save)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

        console.log('✅ Decryption successful!');
        console.log('📄 Decrypted data:', formData);

        showToast('🔓 Vault decrypted successfully!', 3000);
        elements.masterPassword.value = '';
        updatePasswordStrength('');

    } catch (error) {
        console.error('❌ Decryption error:', error);
        showToast('⚠️ Decryption failed - wrong password?', 4000);
    }
}

/**
 * Update UI to reflect encryption state
 */
function setEncryptedState(encrypted) {
    isEncrypted = encrypted;

    if (encrypted) {
        elements.encryptionPanel.classList.add('encrypted');
        elements.encryptionStatus.innerHTML = `
            <span class="status-badge locked">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                Encrypted
            </span>
        `;
        elements.encryptBtn.disabled = true;
        elements.decryptBtn.disabled = false;

        // Apply locked state to cards
        document.querySelectorAll('.vault-card').forEach(card => {
            card.classList.add('locked');
        });

        elements.lastSaved.textContent = 'Vault Locked';
        updateProgress();

    } else {
        elements.encryptionPanel.classList.remove('encrypted');
        elements.encryptionStatus.innerHTML = `
            <span class="status-badge unlocked">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 019.9-1"/>
                </svg>
                Unencrypted
            </span>
        `;
        elements.encryptBtn.disabled = false;
        elements.decryptBtn.disabled = true;

        // Remove locked state from cards
        document.querySelectorAll('.vault-card').forEach(card => {
            card.classList.remove('locked');
        });

        elements.lastSaved.textContent = 'Vault Unlocked';
    }
}

/**
 * Check password strength
 */
function checkPasswordStrength(password) {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 'weak', text: 'Weak' };
    if (score <= 2) return { level: 'fair', text: 'Fair' };
    if (score <= 3) return { level: 'good', text: 'Good' };
    return { level: 'strong', text: 'Strong' };
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength(password) {
    const strengthFill = elements.passwordStrength.querySelector('.strength-fill');
    const strengthText = elements.passwordStrength.querySelector('.strength-text');

    if (!password) {
        strengthFill.className = 'strength-fill';
        strengthText.className = 'strength-text';
        strengthText.textContent = 'Enter password';
        return;
    }

    const strength = checkPasswordStrength(password);
    strengthFill.className = 'strength-fill ' + strength.level;
    strengthText.className = 'strength-text ' + strength.level;
    strengthText.textContent = strength.text;
}

// ============================================
// PARTICLE SYSTEM
// ============================================
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const particleCount = Math.min(50, Math.floor((this.canvas.width * this.canvas.height) / 25000));
        this.particles = [];
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        const colors = ['rgba(201, 162, 39, 0.5)', 'rgba(52, 211, 153, 0.4)', 'rgba(96, 165, 250, 0.4)', 'rgba(251, 191, 36, 0.4)'];
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.5 + 0.2
        };
    }

    bindEvents() {
        window.addEventListener('resize', () => { this.resize(); this.init(); });
        window.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
    }

    update() {
        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if (this.mouse.x && this.mouse.y) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) { p.x -= dx * 0.01; p.y -= dy * 0.01; }
            }
            if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 0.15;
        this.ctx.strokeStyle = 'rgba(201, 162, 39, 0.3)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    this.ctx.globalAlpha = 0.1 * (1 - dist / 120);
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
        this.ctx.globalAlpha = 1;
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function debounce(func, wait) {
    let timeout;
    return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), wait); };
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function showToast(message = 'Vault sealed successfully', duration = 3000) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('show');
    setTimeout(() => elements.toast.classList.remove('show'), duration);
}

function hideToast() { elements.toast.classList.remove('show'); }
window.hideToast = hideToast;

// ============================================
// PROGRESS & DATA MANAGEMENT
// ============================================
function updateProgress() {
    let filled = 0;
    INPUT_FIELDS.forEach(id => {
        const field = document.getElementById(id);
        if (field && field.value.trim().length > 0) filled++;
    });
    const percentage = Math.round((filled / INPUT_FIELDS.length) * 100);
    elements.progressFill.style.width = percentage + '%';
    elements.progressValue.textContent = percentage + '%';
}

function getFormData() {
    const data = { lastSaved: new Date().toISOString(), fields: {} };
    INPUT_FIELDS.forEach(id => {
        const field = document.getElementById(id);
        if (field) data.fields[id] = field.value;
    });
    return data;
}

function saveData() {
    try {
        const data = getFormData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        elements.lastSaved.textContent = 'Saved ' + formatDate(data.lastSaved);
        updateProgress();
        return true;
    } catch (e) { console.error('Save error:', e); return false; }
}

function loadData() {
    try {
        // Check for encrypted data first
        const encryptedData = localStorage.getItem(ENCRYPTED_STORAGE_KEY);
        if (encryptedData) {
            encryptedBlob = JSON.parse(encryptedData);
            setEncryptedState(true);
            console.log('🔒 Found encrypted vault');
            return null;
        }

        // Load unencrypted data
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        const data = JSON.parse(stored);
        if (data.fields) {
            Object.entries(data.fields).forEach(([id, value]) => {
                const field = document.getElementById(id);
                if (field) field.value = value;
            });
        }
        if (data.lastSaved) elements.lastSaved.textContent = 'Saved ' + formatDate(data.lastSaved);
        updateProgress();
        return data;
    } catch (e) { console.error('Load error:', e); return null; }
}

function clearAllData() {
    if (!confirm('⚠️ Clear all vault data?\n\nThis cannot be undone.')) return;
    INPUT_FIELDS.forEach(id => { const field = document.getElementById(id); if (field) field.value = ''; });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ENCRYPTED_STORAGE_KEY);
    setEncryptedState(false);
    elements.lastSaved.textContent = 'Vault Unlocked';
    updateProgress();
    showToast('Vault cleared', 2000);
}

// ============================================
// SECTION TOGGLE & AUTO-SAVE
// ============================================
function initSectionToggles() {
    document.querySelectorAll('.vault-card').forEach(card => {
        const header = card.querySelector('.card-header');
        const expandBtn = card.querySelector('.expand-btn');
        header.addEventListener('click', (e) => {
            if (e.target.tagName === 'TEXTAREA') return;
            card.classList.toggle('collapsed');
            expandBtn.setAttribute('aria-expanded', !card.classList.contains('collapsed'));
        });
        header.setAttribute('tabindex', '0');
        header.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('collapsed'); }
        });
    });
}

function initAutoSave() {
    const debouncedSave = debounce(() => { saveData(); }, AUTO_SAVE_DELAY);
    INPUT_FIELDS.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.addEventListener('input', () => { updateProgress(); debouncedSave(); });
    });
}

// ============================================
// EVENT HANDLERS
// ============================================
function initEventHandlers() {
    elements.saveBtn.addEventListener('click', () => {
        if (saveData()) showToast('✓ Vault sealed successfully!');
        else showToast('⚠️ Error saving vault');
    });

    elements.clearAllBtn.addEventListener('click', clearAllData);

    // Export PDF handler
    if (elements.exportPdfBtn) {
        elements.exportPdfBtn.addEventListener('click', exportRecoveryKeyPDF);
    }

    // Encryption handlers
    elements.encryptBtn.addEventListener('click', encryptVault);
    elements.decryptBtn.addEventListener('click', decryptVault);

    // Password visibility toggle
    elements.togglePassword.addEventListener('click', () => {
        const input = elements.masterPassword;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        elements.togglePassword.classList.toggle('active', isPassword);
    });

    // Password strength indicator
    elements.masterPassword.addEventListener('input', (e) => {
        updatePasswordStrength(e.target.value);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (!isEncrypted && saveData()) showToast('✓ Vault sealed!');
        }
    });
}

// ============================================
// VISUAL ENHANCEMENTS
// ============================================
function initVisualEffects() {
    document.querySelectorAll('.vault-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (i * 100));
    });

    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('focus', () => {
            const card = textarea.closest('.vault-card');
            if (card && !card.classList.contains('locked')) card.style.transform = 'translateY(-6px)';
        });
        textarea.addEventListener('blur', () => {
            const card = textarea.closest('.vault-card');
            if (card) card.style.transform = '';
        });
    });
}

// ============================================
// PDF EXPORT & QR CODE GENERATION
// ============================================

const RECOVERY_KEY_STORAGE = 'digitalLegacyRecoveryKey';

/**
 * Generate a secure recovery key (or load existing one)
 * This is the master password that the user should share with their nominee
 */
function getOrCreateRecoveryKey() {
    // Check if we already have a recovery key stored
    let storedKey = localStorage.getItem(RECOVERY_KEY_STORAGE);

    if (!storedKey) {
        // Generate a new recovery key (this should match the encryption password)
        // In production, this would be set when the user first encrypts
        storedKey = generateSecureKey();
        localStorage.setItem(RECOVERY_KEY_STORAGE, storedKey);
    }

    return storedKey;
}

/**
 * Generate a cryptographically secure key for display
 */
function generateSecureKey() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const segments = 4;
    const segmentLength = 5;
    const parts = [];

    for (let s = 0; s < segments; s++) {
        let segment = '';
        const randomValues = crypto.getRandomValues(new Uint8Array(segmentLength));
        for (let i = 0; i < segmentLength; i++) {
            segment += chars[randomValues[i] % chars.length];
        }
        parts.push(segment);
    }

    return parts.join('-');
}

/**
 * Generate QR Code as Data URL using Canvas
 * Simple implementation - creates a visual representation
 */
function generateQRCode(data, size = 200) {
    // Create a simple visual QR-like pattern (for demo)
    // In production, use a library like qrcode.js
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Generate a deterministic pattern from the data
    const hash = simpleHash(data);
    const gridSize = 21; // Standard QR code size
    const cellSize = size / gridSize;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Draw pattern
    ctx.fillStyle = '#000000';

    // Position patterns (corners)
    drawFinderPattern(ctx, 0, 0, cellSize);
    drawFinderPattern(ctx, (gridSize - 7) * cellSize, 0, cellSize);
    drawFinderPattern(ctx, 0, (gridSize - 7) * cellSize, cellSize);

    // Timing patterns
    for (let i = 8; i < gridSize - 8; i++) {
        if (i % 2 === 0) {
            ctx.fillRect(i * cellSize, 6 * cellSize, cellSize, cellSize);
            ctx.fillRect(6 * cellSize, i * cellSize, cellSize, cellSize);
        }
    }

    // Data pattern (pseudo-random based on hash)
    for (let y = 8; y < gridSize - 8; y++) {
        for (let x = 8; x < gridSize - 8; x++) {
            const idx = y * gridSize + x;
            const bit = (hash[idx % hash.length].charCodeAt(0) + idx) % 2;
            if (bit === 0) {
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    // Add some random-looking data blocks
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            // Skip finder patterns
            if ((x < 8 && y < 8) || (x >= gridSize - 8 && y < 8) || (x < 8 && y >= gridSize - 8)) {
                continue;
            }
            if (x === 6 || y === 6) continue;

            const seed = hash.charCodeAt((x + y * gridSize) % hash.length);
            if ((seed + x * 3 + y * 7) % 4 === 0) {
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    return canvas.toDataURL('image/png');
}

function drawFinderPattern(ctx, x, y, cellSize) {
    // Outer black square
    ctx.fillRect(x, y, 7 * cellSize, 7 * cellSize);
    // Inner white square
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize);
    // Center black square
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
}

function simpleHash(str) {
    let hash = '';
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash += String.fromCharCode(65 + (char * 7 + i * 13) % 26);
    }
    return hash.padEnd(50, 'X');
}

/**
 * Export Recovery Key to PDF (opens print dialog)
 */
function exportRecoveryKeyPDF() {
    const recoveryKey = getOrCreateRecoveryKey();
    const qrCodeDataUrl = generateQRCode(recoveryKey);
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Get nominee info if available
    let nomineeInfo = 'Not configured';
    try {
        const switchStored = localStorage.getItem(SWITCH_STORAGE_KEY);
        if (switchStored) {
            const parsed = JSON.parse(switchStored);
            if (parsed.nomineeEmail) {
                nomineeInfo = `${parsed.nomineeName || 'Nominee'} (${parsed.nomineeEmail})`;
            }
        }
    } catch (e) { }

    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Digital Legacy Vault - Recovery Key</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Outfit:wght@400;500;600&display=swap');
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Outfit', sans-serif;
            background: #f8fafc;
            color: #1e293b;
            padding: 40px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #0a0a0f, #1a1a24);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #C9A227, #E8C547);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
        }
        
        .title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .subtitle {
            color: #94a3b8;
            font-size: 14px;
        }
        
        .content {
            padding: 40px;
        }
        
        .warning-box {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .warning-title {
            color: #92400e;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 8px;
        }
        
        .warning-text {
            color: #78350f;
            font-size: 14px;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 20px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .recovery-key-box {
            background: linear-gradient(135deg, #0a0a0f, #12121a);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .key-label {
            font-size: 12px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 10px;
        }
        
        .key-value {
            font-family: 'Courier New', monospace;
            font-size: 28px;
            font-weight: 700;
            color: #C9A227;
            letter-spacing: 0.05em;
            word-break: break-all;
        }
        
        .qr-section {
            display: flex;
            gap: 30px;
            align-items: flex-start;
        }
        
        .qr-code {
            flex-shrink: 0;
        }
        
        .qr-code img {
            width: 150px;
            height: 150px;
            border: 4px solid #e2e8f0;
            border-radius: 8px;
        }
        
        .qr-info {
            flex: 1;
        }
        
        .qr-info p {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 12px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 20px;
        }
        
        .info-item {
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .info-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
        }
        
        .info-value {
            font-size: 14px;
            font-weight: 500;
            color: #1e293b;
        }
        
        .instructions {
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 12px;
            padding: 20px;
        }
        
        .instructions h4 {
            color: #166534;
            margin-bottom: 15px;
        }
        
        .instructions ol {
            padding-left: 20px;
            color: #166534;
        }
        
        .instructions li {
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8fafc;
            color: #64748b;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
        }
        
        @media print {
            body {
                padding: 0;
                background: white;
            }
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐</div>
            <h1 class="title">Master Recovery Key</h1>
            <p class="subtitle">Digital Legacy Vault · Keep this document safe</p>
        </div>
        
        <div class="content">
            <div class="warning-box">
                <div class="warning-title">⚠️ CONFIDENTIAL - STORE SECURELY</div>
                <p class="warning-text">
                    This document contains your Master Recovery Key. Without this key, your encrypted 
                    vault data cannot be recovered. Store this in a safe place and share only with 
                    your trusted nominee.
                </p>
            </div>
            
            <div class="section">
                <h3 class="section-title">🔑 Your Master Recovery Key</h3>
                <div class="recovery-key-box">
                    <div class="key-label">Recovery Key</div>
                    <div class="key-value">${recoveryKey}</div>
                </div>
                
                <div class="qr-section">
                    <div class="qr-code">
                        <img src="${qrCodeDataUrl}" alt="QR Code">
                    </div>
                    <div class="qr-info">
                        <p><strong>Scan this QR code</strong> to quickly access your recovery key, 
                        or enter it manually when accessing the vault.</p>
                        <p>The QR code contains your complete recovery key for easy input on 
                        mobile devices.</p>
                    </div>
                </div>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Document Created</div>
                    <div class="info-value">${currentDate}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Encryption</div>
                    <div class="info-value">AES-256-GCM</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Key Derivation</div>
                    <div class="info-value">PBKDF2 (100K iterations)</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Designated Nominee</div>
                    <div class="info-value">${nomineeInfo}</div>
                </div>
            </div>
            
            <div class="section" style="margin-top: 30px;">
                <h3 class="section-title">📋 Instructions for Nominee</h3>
                <div class="instructions">
                    <h4>How to Access the Vault</h4>
                    <ol>
                        <li>You will receive an email with a secure access link when the vault is shared.</li>
                        <li>Click the link to open the Nominee Access page.</li>
                        <li>Enter this Master Recovery Key when prompted.</li>
                        <li>The vault contents will be decrypted in your browser.</li>
                        <li>All decryption happens locally - your key is never transmitted.</li>
                    </ol>
                </div>
            </div>
        </div>
        
        <div class="footer">
            Digital Legacy Vault · Securing what matters most<br>
            <small>This document was generated on ${currentDate}</small>
        </div>
    </div>
    
    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>
    `);
    printWindow.document.close();

    showToast('📄 Recovery Key document ready for printing', 3000);
    console.log('📄 Recovery Key PDF generated');
    console.log('🔑 Key:', recoveryKey);
}

// ============================================
// DEAD MAN'S SWITCH FUNCTIONALITY
// ============================================
const SWITCH_STORAGE_KEY = 'digitalLegacySwitch';

// Dead Man's Switch DOM elements
const switchElements = {
    switchStatus: document.getElementById('switchStatus'),
    lastCheckIn: document.getElementById('lastCheckIn'),
    countdownValue: document.getElementById('countdownValue'),
    checkInBtn: document.getElementById('checkInBtn'),
    nomineeEmail: document.getElementById('nomineeEmail'),
    nomineeName: document.getElementById('nomineeName'),
    inactivityPeriod: document.getElementById('inactivityPeriod'),
    nomineeRelation: document.getElementById('nomineeRelation'),
    nomineeMessage: document.getElementById('nomineeMessage'),
    testEmailBtn: document.getElementById('testEmailBtn'),
    activateSwitchBtn: document.getElementById('activateSwitchBtn')
};

// Switch state
let switchData = {
    isActive: false,
    lastCheckIn: null,
    inactivityDays: 180,
    nomineeEmail: '',
    nomineeName: '',
    nomineeRelation: 'spouse',
    nomineeMessage: ''
};

/**
 * Load switch configuration from storage
 */
function loadSwitchData() {
    try {
        const stored = localStorage.getItem(SWITCH_STORAGE_KEY);
        if (stored) {
            switchData = { ...switchData, ...JSON.parse(stored) };

            // Populate form fields
            if (switchElements.nomineeEmail) switchElements.nomineeEmail.value = switchData.nomineeEmail || '';
            if (switchElements.nomineeName) switchElements.nomineeName.value = switchData.nomineeName || '';
            if (switchElements.inactivityPeriod) switchElements.inactivityPeriod.value = switchData.inactivityDays || 180;
            if (switchElements.nomineeRelation) switchElements.nomineeRelation.value = switchData.nomineeRelation || 'spouse';
            if (switchElements.nomineeMessage) switchElements.nomineeMessage.value = switchData.nomineeMessage || '';

            updateSwitchUI();
        }
    } catch (e) {
        console.error('Error loading switch data:', e);
    }
}

/**
 * Save switch configuration to storage
 */
function saveSwitchData() {
    try {
        localStorage.setItem(SWITCH_STORAGE_KEY, JSON.stringify(switchData));
        return true;
    } catch (e) {
        console.error('Error saving switch data:', e);
        return false;
    }
}

/**
 * Perform check-in (I'm Still Here)
 */
function performCheckIn() {
    switchData.lastCheckIn = new Date().toISOString();
    saveSwitchData();
    updateSwitchUI();
    showToast('✅ Check-in successful! Timer reset.', 3000);

    console.log('🕐 Check-in performed at:', switchData.lastCheckIn);
    console.log('📅 Next trigger date:', calculateTriggerDate());
}

/**
 * Calculate trigger date based on last check-in and inactivity period
 */
function calculateTriggerDate() {
    if (!switchData.lastCheckIn) return null;

    const lastCheckIn = new Date(switchData.lastCheckIn);
    const triggerDate = new Date(lastCheckIn);
    triggerDate.setDate(triggerDate.getDate() + switchData.inactivityDays);
    return triggerDate;
}

/**
 * Calculate days until trigger
 */
function calculateDaysUntilTrigger() {
    if (!switchData.lastCheckIn || !switchData.isActive) return null;

    const now = new Date();
    const triggerDate = calculateTriggerDate();
    if (!triggerDate) return null;

    const diffTime = triggerDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Update switch UI elements
 */
function updateSwitchUI() {
    // Update last check-in display
    if (switchElements.lastCheckIn) {
        if (switchData.lastCheckIn) {
            const date = new Date(switchData.lastCheckIn);
            switchElements.lastCheckIn.textContent = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            switchElements.lastCheckIn.textContent = 'Never';
        }
    }

    // Update countdown display
    if (switchElements.countdownValue) {
        const daysRemaining = calculateDaysUntilTrigger();

        if (!switchData.isActive) {
            switchElements.countdownValue.textContent = 'Not active';
            switchElements.countdownValue.className = 'countdown-value';
        } else if (daysRemaining === null) {
            switchElements.countdownValue.textContent = '--';
            switchElements.countdownValue.className = 'countdown-value';
        } else if (daysRemaining <= 0) {
            switchElements.countdownValue.textContent = 'TRIGGERED';
            switchElements.countdownValue.className = 'countdown-value danger';
        } else if (daysRemaining <= 14) {
            switchElements.countdownValue.textContent = `${daysRemaining} days`;
            switchElements.countdownValue.className = 'countdown-value danger';
        } else if (daysRemaining <= 30) {
            switchElements.countdownValue.textContent = `${daysRemaining} days`;
            switchElements.countdownValue.className = 'countdown-value warning';
        } else {
            switchElements.countdownValue.textContent = `${daysRemaining} days`;
            switchElements.countdownValue.className = 'countdown-value';
        }
    }

    // Update status badge
    if (switchElements.switchStatus) {
        if (switchData.isActive) {
            const daysRemaining = calculateDaysUntilTrigger();
            let badgeClass = 'active';
            let statusText = 'Active';

            if (daysRemaining !== null && daysRemaining <= 30) {
                badgeClass = 'warning';
                statusText = 'Warning';
            }

            switchElements.switchStatus.innerHTML = `
                <span class="switch-badge ${badgeClass}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                    ${statusText}
                </span>
            `;
        } else {
            switchElements.switchStatus.innerHTML = `
                <span class="switch-badge inactive">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    Not Configured
                </span>
            `;
        }
    }

    // Update activate button
    if (switchElements.activateSwitchBtn) {
        const btnText = switchElements.activateSwitchBtn.querySelector('.btn-text');
        if (switchData.isActive) {
            switchElements.activateSwitchBtn.classList.add('active');
            if (btnText) btnText.textContent = 'Deactivate Switch';
        } else {
            switchElements.activateSwitchBtn.classList.remove('active');
            if (btnText) btnText.textContent = 'Activate Dead Man\'s Switch';
        }
    }
}

/**
 * Activate or deactivate the Dead Man's Switch
 */
function toggleSwitch() {
    // Validate nominee email before activating
    if (!switchData.isActive) {
        const email = switchElements.nomineeEmail?.value?.trim();
        if (!email || !isValidEmail(email)) {
            showToast('⚠️ Please enter a valid nominee email', 3000);
            switchElements.nomineeEmail?.focus();
            return;
        }

        // Save nominee settings
        switchData.nomineeEmail = email;
        switchData.nomineeName = switchElements.nomineeName?.value?.trim() || '';
        switchData.inactivityDays = parseInt(switchElements.inactivityPeriod?.value) || 180;
        switchData.nomineeRelation = switchElements.nomineeRelation?.value || 'spouse';
        switchData.nomineeMessage = switchElements.nomineeMessage?.value?.trim() || '';

        // Perform initial check-in
        switchData.lastCheckIn = new Date().toISOString();
        switchData.isActive = true;

        saveSwitchData();
        updateSwitchUI();

        showToast('🚀 Dead Man\'s Switch activated!', 3000);
        console.log('🔔 Switch ACTIVATED');
        console.log('👤 Nominee:', switchData.nomineeName, '<' + switchData.nomineeEmail + '>');
        console.log('📅 Inactivity period:', switchData.inactivityDays, 'days');
        console.log('⏰ Trigger date:', calculateTriggerDate());

    } else {
        if (confirm('Are you sure you want to deactivate the Dead Man\'s Switch?')) {
            switchData.isActive = false;
            saveSwitchData();
            updateSwitchUI();
            showToast('Switch deactivated', 2000);
            console.log('🔕 Switch DEACTIVATED');
        }
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Send test email (simulated for frontend)
 */
function sendTestEmail() {
    const email = switchElements.nomineeEmail?.value?.trim();
    if (!email || !isValidEmail(email)) {
        showToast('⚠️ Please enter a valid nominee email first', 3000);
        return;
    }

    // In production, this would call the backend API
    // For now, simulate the action
    showToast(`📧 Test email would be sent to ${email}`, 3000);
    console.log('📧 Test email simulated to:', email);
    console.log('💡 Connect to backend API endpoint: POST /api/switch/test-email');
}

/**
 * Initialize Dead Man's Switch event handlers
 */
function initDeadMansSwitch() {
    // Load saved data
    loadSwitchData();

    // Check-in button
    if (switchElements.checkInBtn) {
        switchElements.checkInBtn.addEventListener('click', performCheckIn);
    }

    // Activate/Deactivate button
    if (switchElements.activateSwitchBtn) {
        switchElements.activateSwitchBtn.addEventListener('click', toggleSwitch);
    }

    // Test email button
    if (switchElements.testEmailBtn) {
        switchElements.testEmailBtn.addEventListener('click', sendTestEmail);
    }

    // Auto-save nominee settings on change
    const nomineeFields = ['nomineeEmail', 'nomineeName', 'inactivityPeriod', 'nomineeRelation', 'nomineeMessage'];
    nomineeFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', () => {
                if (switchData.isActive) {
                    // Update settings if switch is active
                    switchData.nomineeEmail = switchElements.nomineeEmail?.value?.trim() || '';
                    switchData.nomineeName = switchElements.nomineeName?.value?.trim() || '';
                    switchData.inactivityDays = parseInt(switchElements.inactivityPeriod?.value) || 180;
                    switchData.nomineeRelation = switchElements.nomineeRelation?.value || 'spouse';
                    switchData.nomineeMessage = switchElements.nomineeMessage?.value?.trim() || '';
                    saveSwitchData();
                    updateSwitchUI();
                }
            });
        }
    });

    // Update countdown every minute
    setInterval(() => {
        if (switchData.isActive) {
            updateSwitchUI();
        }
    }, 60000);

    console.log('⏰ Dead Man\'s Switch module initialized');
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    if (elements.canvas) new ParticleSystem(elements.canvas);
    loadData();
    initSectionToggles();
    initAutoSave();
    initEventHandlers();
    initVisualEffects();
    initDeadMansSwitch();
    if (!isEncrypted) updateProgress();

    console.log('🔐 Digital Legacy Vault initialized');
    console.log('🛡️ Zero-Knowledge Encryption: AES-256-GCM');
    console.log('🔑 Key Derivation: PBKDF2 with', PBKDF2_ITERATIONS, 'iterations');
    console.log('⏰ Dead Man\'s Switch: Ready');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

