import { parseXLS } from './data-handler.js';

const STORAGE_KEY = 'musicstencil_v65_settings';

function saveSettings() {
    const settings = {};
    const controls = document.querySelectorAll('#settings-panel [data-css-var], #settings-panel [type="checkbox"], #settings-panel select, #settings-panel input[type="number"]');
    controls.forEach(ctrl => {
        if (!ctrl.id) return;
        if (ctrl.type === 'checkbox') {
            settings[ctrl.id] = ctrl.checked;
        } else {
            settings[ctrl.id] = ctrl.value;
        }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
        const settings = JSON.parse(saved);
        Object.entries(settings).forEach(([id, value]) => {
            const ctrl = document.getElementById(id);
            if (!ctrl) return;
            if (ctrl.type === 'checkbox') {
                ctrl.checked = value;
            } else {
                ctrl.value = value;
            }
        });
    } catch (e) { console.error("Settings load error", e); }
}

function updateCSSVariable(input) {
    const cssVar = input.dataset.cssVar;
    if (!cssVar) return;

    if (cssVar === '--text-transform-artist' || cssVar === '--text-transform-title') {
        const target = cssVar.includes('artist') ? 'artist' : 'title';
        if (input.value === 'small-caps') {
            document.documentElement.style.setProperty(`--text-transform-${target}`, 'none');
            document.documentElement.style.setProperty(`--font-variant-${target}`, 'small-caps');
        } else {
            document.documentElement.style.setProperty(`--text-transform-${target}`, input.value);
            document.documentElement.style.setProperty(`--font-variant-${target}`, 'normal');
        }
    } else {
        const unit = input.dataset.unit || '';
        document.documentElement.style.setProperty(cssVar, input.value + unit);
    }
}

function applyAllStyles() {
    const controls = document.querySelectorAll('#settings-panel [data-css-var], #settings-panel select');
    controls.forEach(ctrl => updateCSSVariable(ctrl));

    const states = [
        { id: 'rotate-codes', class: 'codes-rotated' },
        { id: 'bold-year', var: '--font-weight-year', type: 'bold' },
        { id: 'bold-artist', var: '--font-weight-artist', type: 'bold' },
        { id: 'bold-title', var: '--font-weight-title', type: 'bold' },
        { id: 'bold-codes', var: '--font-weight-codes', type: 'bold' },
        { id: 'italic-title', var: '--font-style-title', type: 'italic' },
        { id: 'show-qr', var: '--qr-display', type: 'flex' }
    ];

    states.forEach(s => {
        const el = document.getElementById(s.id);
        if (!el) return;
        if (s.class) document.body.classList.toggle(s.class, el.checked);
        if (s.var) {
            let val = el.checked ? (s.type || 'bold') : (s.id === 'show-qr' ? 'none' : 'normal');
            document.documentElement.style.setProperty(s.var, val);
        }
    });

    // Kód Bold speciális kezelése (ha nincs CSS var a HTML-ben)
    const codeBold = document.getElementById('bold-codes')?.checked;
    document.documentElement.style.setProperty('--font-weight-codes', codeBold ? 'bold' : 'normal');

    // Glow
    const glows = ['year', 'artist', 'title'];
    glows.forEach(g => {
        const el = document.getElementById(`glow-${g}`);
        const val = el && el.checked ? `0 0 3px var(--color-${g})` : 'none';
        document.documentElement.style.setProperty(`--text-shadow-${g}`, val);
    });

    const vinylGlow = document.getElementById('vinyl-glow');
    if (vinylGlow) {
        const vVal = vinylGlow.checked ? `drop-shadow(0 0 3px var(--vinyl-groove-color))` : 'none';
        document.documentElement.style.setProperty('--vinyl-glow-shadow', vVal);
    }
}

export function updateRecordCount(count) {
    const el = document.getElementById('record-count-display');
    const container = document.getElementById('stats-bar');
    if (el) el.textContent = count;
    if (container) container.style.display = 'inline-flex';
}

export function initializeUI(onSettingsChange, onDataLoaded) {
    loadSettings();
    applyAllStyles();

    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = `tab-${btn.dataset.tab}`;
            document.querySelectorAll('.tab-pane, .tab-btn').forEach(el => el.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            btn.classList.add('active');
        });
    });

    document.getElementById('settings-panel').addEventListener('input', (e) => {
        applyAllStyles();
        saveSettings();
        if (onSettingsChange) onSettingsChange();
    });

    document.getElementById('reset-settings').addEventListener('click', () => {
        if (confirm("Biztosan visszaállítod az alapértelmezett beállításokat?")) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    });

    document.getElementById('file-upload-button').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const data = await parseXLS(file);
                onDataLoaded(data);
            } catch (error) {
                alert(`Excel hiba: ${error.message}`);
            }
        }
    });

    document.getElementById('print-button').addEventListener('click', () => {
        document.body.classList.add('grid-view-active');
        setTimeout(() => window.print(), 500);
    });

    document.getElementById('view-toggle-button').addEventListener('click', () => {
        document.body.classList.toggle('grid-view-active');
    });

    document.body.classList.remove('loading');
}