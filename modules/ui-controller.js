import { parseXLS } from './data-handler.js';

const STORAGE_KEY = 'musicstencil_v658_settings';

export function applyAllStyles() {
    const controls = document.querySelectorAll('#settings-panel [data-css-var], #settings-panel select, #settings-panel input');
    
    controls.forEach(ctrl => {
        const cssVar = ctrl.dataset.cssVar;
        if (!cssVar) return;

        const unit = ctrl.dataset.unit || '';
        document.documentElement.style.setProperty(cssVar, ctrl.value + unit);
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
    document.body.classList.toggle('back-border-off', document.getElementById('border-front-only')?.checked);

    // Glow - Neon Style (Only in preview via CSS)
    ['year', 'artist', 'title'].forEach(g => {
        const chk = document.getElementById(`glow-${g}`);
        const val = chk && chk.checked ? `0 0 8px rgba(0,0,0,0.3)` : 'none';
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

    document.getElementById('settings-panel').oninput = (e) => {
        applyAllStyles();
        const settings = {};
        document.querySelectorAll('#settings-panel input, #settings-panel select').forEach(el => {
            if (el.id) settings[el.id] = el.type === 'checkbox' ? el.checked : el.value;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        
        const redrawIds = [
            'paper-size', 'card-size', 'qr-style', 'qr-size-percent', 
            'vinyl-spacing', 'vinyl-thickness', 'vinyl-count', 
            'glitch-width-percent', 'glitch-min', 'glitch-max',
            'border-front-only', 'rotate-codes'
        ];
        if (redrawIds.includes(e.target.id)) {
             if (onSettingsChange) onSettingsChange(true); 
        } else {
             if (onSettingsChange) onSettingsChange(false);
        }
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
        if (confirm("Minden beállítást alaphelyzetbe állítasz?")) {
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