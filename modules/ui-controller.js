import { parseXLS } from './data-handler.js';

const STORAGE_KEY = 'musicstencil_v652_settings';

function saveSettings() {
    const settings = {};
    const controls = document.querySelectorAll('#settings-panel [data-css-var], #settings-panel [type="checkbox"], #settings-panel select, #settings-panel input[type="number"], #settings-panel input[type="text"]');
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

    if (cssVar.includes('text-transform')) {
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

    // Bold states - explicit value for preview
    const boldStates = [
        { id: 'bold-year', var: '--font-weight-year', weightId: 'weight-year' },
        { id: 'bold-artist', var: '--font-weight-artist', weightId: 'weight-artist' },
        { id: 'bold-title', var: '--font-weight-title', weightId: 'weight-title' },
        { id: 'bold-codes', var: '--font-weight-codes' }
    ];

    boldStates.forEach(s => {
        const chk = document.getElementById(s.id);
        const weightInput = s.weightId ? document.getElementById(s.weightId) : null;
        const val = chk && chk.checked ? (weightInput ? weightInput.value : '700') : '400';
        document.documentElement.style.setProperty(s.var, val);
    });

    // Special flags
    document.body.classList.toggle('codes-rotated', document.getElementById('rotate-codes')?.checked);

    // Glow - NEON style fix
    ['year', 'artist', 'title'].forEach(g => {
        const chk = document.getElementById(`glow-${g}`);
        // Használjuk a betű színét a derengéshez, de egy kis átlátszósággal
        const color = getComputedStyle(document.documentElement).getPropertyValue(`--color-${g}`).trim() || '#1DB954';
        const val = chk && chk.checked ? `0 0 8px ${color}, 0 0 15px ${color}88` : 'none';
        document.documentElement.style.setProperty(`--text-shadow-${g}`, val);
    });
    
    // Vinyl Spacing adjustment
    const vSpacing = document.getElementById('vinyl-spacing')?.value || 3;
    document.documentElement.style.setProperty('--vinyl-spacing', vSpacing);
}

export function initializeUI(onSettingsChange, onDataLoaded) {
    loadSettings();
    applyAllStyles();

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-pane, .tab-btn').forEach(el => el.classList.remove('active'));
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            btn.classList.add('active');
        });
    });

    document.getElementById('settings-panel').addEventListener('input', () => {
        applyAllStyles();
        saveSettings();
        if (onSettingsChange) onSettingsChange();
    });

    document.getElementById('reset-settings').addEventListener('click', () => {
        if (confirm("Minden beállítást visszaállítasz alaphelyzetbe?")) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    });

    document.getElementById('file-upload-button').addEventListener('change', async (e) => {
        const data = await parseXLS(e.target.files[0]);
        if (data) onDataLoaded(data);
    });

    document.getElementById('view-toggle-button').addEventListener('click', () => {
        document.body.classList.toggle('grid-view-active');
    });

    document.getElementById('print-button').addEventListener('click', () => {
        document.body.classList.add('grid-view-active');
        // Várjunk egy kicsit, hogy a grid renderelődhessen
        setTimeout(() => window.print(), 500);
    });

    document.body.classList.remove('loading');
}