import { parseXLS } from './data-handler.js';

const STORAGE_KEY = 'musicstencil_v659_settings';

// Helper to convert HEX to RGBA
function hexToRgba(hex, alphaPercent) {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+(alphaPercent/100)+')';
    }
    return hex; // Fallback
}

export function applyAllStyles() {
    const controls = document.querySelectorAll('#settings-panel [data-css-var], #settings-panel select, #settings-panel input');
    
    controls.forEach(ctrl => {
        const cssVar = ctrl.dataset.cssVar;
        if (!cssVar) return;

        const unit = ctrl.dataset.unit || '';
        document.documentElement.style.setProperty(cssVar, ctrl.value + unit);
    });

    // BORDER OPACITY Logic
    const borderColor = document.getElementById('primary-color').value;
    const borderOpacity = document.getElementById('border-opacity').value;
    const borderRgba = hexToRgba(borderColor, borderOpacity);
    document.documentElement.style.setProperty('--border-color-rgba', borderRgba);

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

    // Flags & Modes
    document.body.classList.toggle('codes-rotated', document.getElementById('rotate-codes')?.checked);
    
    // Border Mode
    const borderMode = document.getElementById('border-mode')?.value || 'both';
    document.body.classList.remove('border-mode-both', 'border-mode-front', 'border-mode-back', 'border-mode-none');
    document.body.classList.add(`border-mode-${borderMode}`);

    // Glow (Music Cards)
    ['year', 'artist', 'title'].forEach(g => {
        const chk = document.getElementById(`glow-${g}`);
        const val = chk && chk.checked ? `0 0 8px rgba(0,0,0,0.3)` : 'none';
        document.documentElement.style.setProperty(`--text-shadow-${g}`, val);
    });

    // Token Glow (Solid Stroke Effect)
    const tokenGlowActive = document.getElementById('token-glow-active')?.checked;
    const tokenGlowSize = document.getElementById('token-glow-size')?.value || 0;
    
    if (!tokenGlowActive) {
        document.documentElement.style.setProperty('--token-glow-size', '0px');
    } else {
        // Just enforce what the input says (unit is handled by data-unit in general loop above)
        // But we need to make sure the loop above ran. It did.
    }
}

function updateModeVisibility() {
    const isToken = document.getElementById('mode-token').checked;
    
    // Music vs Token specific elements
    document.getElementById('music-actions').style.display = isToken ? 'none' : 'contents';
    document.getElementById('token-settings-group').style.display = isToken ? 'block' : 'none';
    
    // Hide music-only fields in typography/layout
    document.querySelectorAll('.music-only-option').forEach(el => {
        el.style.display = isToken ? 'none' : (el.classList.contains('typo-tools') ? 'flex' : 'block');
    });

    document.querySelectorAll('.token-only-msg').forEach(el => {
        el.style.display = isToken ? 'block' : 'none';
    });

    // Update body class for styling if needed
    if (isToken) {
        document.body.classList.remove('app-mode-music');
        document.body.classList.add('app-mode-token');
    } else {
        document.body.classList.remove('app-mode-token');
        document.body.classList.add('app-mode-music');
    }
}

export function initializeUI(onSettingsChange, onDataLoaded) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            Object.entries(settings).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.type === 'radio' && el.name === 'app-mode') {
                        // Skip radios here, handle separately or ensure id matches
                        if(el.id === 'mode-music' && value === 'music') el.checked = true;
                        if(el.id === 'mode-token' && value === 'token') el.checked = true;
                    } else if (el.type === 'checkbox') {
                        el.checked = value;
                    } else {
                        el.value = value;
                    }
                }
            });
        } catch (e) { console.error("Load error", e); }
    }

    applyAllStyles();
    updateModeVisibility();

    // Mode Switcher Listeners
    document.querySelectorAll('input[name="app-mode"]').forEach(radio => {
        radio.addEventListener('change', () => {
            updateModeVisibility();
            if (onSettingsChange) onSettingsChange(true);
        });
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-pane, .tab-btn').forEach(el => el.classList.remove('active'));
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            btn.classList.add('active');
        };
    });

    document.getElementById('settings-panel').oninput = (e) => {
        applyAllStyles();
        
        // Save Settings
        const settings = {};
        document.querySelectorAll('#settings-panel input, #settings-panel select').forEach(el => {
             if (el.id) {
                 if(el.type === 'radio') {
                     if(el.checked) settings['app-mode-val'] = el.value; // Helper
                 } else {
                     settings[el.id] = el.type === 'checkbox' ? el.checked : el.value;
                 }
             }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        
        const redrawIds = [
            'paper-size', 'card-size', 'qr-size-percent', 'page-padding',
            'vinyl-spacing', 'vinyl-count', 'vinyl-variate', 'vinyl-thickness', 'vinyl-opacity',
            'glitch-width-min', 'glitch-width-max', 'glitch-min', 'glitch-max',
            'border-mode', 'rotate-codes', 'qr-round', 'qr-invert', 'qr-logo-text', 'show-qr', 'qr-border-width',
            'token-main-text', 'token-sub-text',
            'token-glow-active', 'token-glow-color', 'token-glow-size' // Token triggers
        ];
        if (redrawIds.includes(e.target.id) || e.target.type === 'radio') {
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
        document.body.classList.remove('is-printing');
        window.dispatchEvent(new Event('resize'));
        if (onSettingsChange) onSettingsChange(true);
    };

    document.getElementById('print-button').onclick = () => {
        document.body.classList.add('grid-view-active');
        document.body.classList.add('is-printing'); 
        
        if (onSettingsChange) onSettingsChange(true);

        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.body.classList.remove('is-printing');
                if (onSettingsChange) onSettingsChange(true); 
            }, 1000);
        }, 800);
    };

    const previewArea = document.getElementById('preview-area');
    if(previewArea) {
        previewArea.onclick = () => {
            previewArea.classList.toggle('zoomed');
        };
    }

    document.getElementById('reset-settings').onclick = () => {
        if (confirm("Minden beállítást alaphelyzetbe állítasz?")) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    };

    document.body.classList.remove('loading');
}

export function updateRecordCount(count, isVisible) {
    const el = document.getElementById('record-count-display');
    const bar = document.getElementById('stats-bar');
    if (el) el.textContent = count + ' db';
    if (bar) {
        bar.style.visibility = isVisible ? 'visible' : 'hidden';
    }
}