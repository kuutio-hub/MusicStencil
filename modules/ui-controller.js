import { parseXLS } from './data-handler.js';

const STORAGE_KEY = 'musicstencil_v653_settings';

export function applyAllStyles() {
    const controls = document.querySelectorAll('#settings-panel [data-css-var], #settings-panel select, #settings-panel input');
    
    controls.forEach(ctrl => {
        const cssVar = ctrl.dataset.cssVar;
        if (!cssVar) return;

        if (cssVar.includes('text-transform')) {
            const target = cssVar.includes('artist') ? 'artist' : 'title';
            if (ctrl.value === 'small-caps') {
                document.documentElement.style.setProperty(`--text-transform-${target}`, 'none');
                document.documentElement.style.setProperty(`--font-variant-${target}`, 'small-caps');
            } else {
                document.documentElement.style.setProperty(`--text-transform-${target}`, ctrl.value);
                document.documentElement.style.setProperty(`--font-variant-${target}`, 'normal');
            }
        } else {
            const unit = ctrl.dataset.unit || '';
            document.documentElement.style.setProperty(cssVar, ctrl.value + unit);
        }
    });

    // Bold states
    const boldConfigs = [
        { id: 'bold-year', var: '--font-weight-year', weightId: 'weight-year' },
        { id: 'bold-artist', var: '--font-weight-artist', weightId: 'weight-artist' },
        { id: 'bold-title', var: '--font-weight-title', weightId: 'weight-title' },
        { id: 'bold-codes', var: '--font-weight-codes' }
    ];

    boldConfigs.forEach(conf => {
        const chk = document.getElementById(conf.id);
        const weightInput = conf.weightId ? document.getElementById(conf.weightId) : null;
        const val = chk && chk.checked ? (weightInput ? weightInput.value : '700') : '400';
        document.documentElement.style.setProperty(conf.var, val);
    });

    // Flags
    document.body.classList.toggle('codes-rotated', document.getElementById('rotate-codes')?.checked);

    // Glow - Neon Style
    ['year', 'artist', 'title'].forEach(g => {
        const chk = document.getElementById(`glow-${g}`);
        const color = getComputedStyle(document.documentElement).getPropertyValue(`--color-${g}`).trim() || '#000000';
        const val = chk && chk.checked ? `0 0 8px ${color}` : 'none';
        document.documentElement.style.setProperty(`--text-shadow-${g}`, val);
    });
}

export function initializeUI(onSettingsChange, onDataLoaded) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            Object.entries(settings).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.type === 'checkbox') el.checked = value;
                    else el.value = value;
                }
            });
        } catch (e) { console.error("Load error", e); }
    }

    applyAllStyles();

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-pane, .tab-btn').forEach(el => el.classList.remove('active'));
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            btn.classList.add('active');
        };
    });

    document.getElementById('settings-panel').oninput = () => {
        applyAllStyles();
        const settings = {};
        document.querySelectorAll('#settings-panel input, #settings-panel select').forEach(el => {
            if (el.id) settings[el.id] = el.type === 'checkbox' ? el.checked : el.value;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        if (onSettingsChange) onSettingsChange();
    };

    document.getElementById('file-upload-button').onchange = async (e) => {
        const data = await parseXLS(e.target.files[0]);
        if (data) onDataLoaded(data);
    };

    document.getElementById('view-toggle-button').onclick = () => {
        document.body.classList.toggle('grid-view-active');
    };

    document.getElementById('print-button').onclick = () => {
        document.body.classList.add('grid-view-active');
        setTimeout(() => window.print(), 500);
    };

    document.getElementById('reset-settings').onclick = () => {
        if (confirm("Alaphelyzetbe állítás?")) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    };

    document.body.classList.remove('loading');
}

export function updateRecordCount(count) {
    const el = document.getElementById('record-count-display');
    const bar = document.getElementById('stats-bar');
    if (el) el.textContent = count;
    if (bar) bar.style.display = 'flex';
}