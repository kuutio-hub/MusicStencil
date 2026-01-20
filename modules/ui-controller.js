import { parseXLS } from './data-handler.js';

function updateValueDisplay(input) {
    const displayId = `val-${input.id}`;
    const displayEl = document.getElementById(displayId);
    if (displayEl) {
        displayEl.textContent = input.value;
    }
}

function updateCSSVariable(input) {
    const cssVar = input.dataset.cssVar;
    if (!cssVar) return;

    const unit = input.dataset.unit || '';
    document.documentElement.style.setProperty(cssVar, input.value + unit);
}

function handleToggle(elementId, classToToggle, bodyClass = true) {
    const checkbox = document.getElementById(elementId);
    if (checkbox) {
        const toggleAction = (e) => {
            document.body.classList.toggle(classToToggle, e.target.checked);
        };
        checkbox.addEventListener('change', toggleAction);
        // Kezdeti állapot beállítása
        document.body.classList.toggle(classToToggle, checkbox.checked);
    }
}

export function updateRecordCount(count) {
    const el = document.getElementById('record-count-display');
    const container = document.getElementById('stats-bar');
    if (el) el.textContent = count;
    if (container) container.style.display = 'inline-flex';
}

let _triggerRefresh = () => {};

export function initializeUI(onSettingsChange, onDataLoaded, initialData) {
    
    if (onSettingsChange) {
        _triggerRefresh = () => onSettingsChange();
    }

    const controls = document.querySelectorAll('#settings-panel [data-css-var]');
    
    controls.forEach(input => {
        updateCSSVariable(input);
        if (input.type === 'range') updateValueDisplay(input);
    });

    controls.forEach(input => {
        input.addEventListener('input', () => {
            updateCSSVariable(input);
            if (input.type === 'range') updateValueDisplay(input);
            
            if (input.id.startsWith('vinyl-') || input.id === 'vinyl-groove-color') {
                _triggerRefresh();
            }
        });
    });

    const qrCheckbox = document.getElementById('show-qr');
    if(qrCheckbox) {
        qrCheckbox.addEventListener('change', (e) => {
            const displayValue = e.target.checked ? 'flex' : 'none';
            document.documentElement.style.setProperty('--qr-display', displayValue);
        });
    }

    // Toggle-ök inicializálása
    handleToggle('show-crop-marks', 'has-crop-marks');
    handleToggle('rotate-codes', 'codes-rotated');


    const fileUploadButton = document.getElementById('file-upload-button');
    fileUploadButton.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const data = await parseXLS(file);
                onDataLoaded(data);
            } catch (error) {
                console.error("Hiba:", error);
                alert("Excel hiba: " + error.message);
            }
        }
    });

    const printButton = document.getElementById('print-button');
    printButton.addEventListener('click', () => {
        window.print();
    });
}