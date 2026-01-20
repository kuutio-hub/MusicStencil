import { parseXLS } from './data-handler.js';
import { renderAllPages, renderPreviewPair } from './card-generator.js';

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

function handleQRToggle(isChecked) {
    const displayValue = isChecked ? 'flex' : 'none';
    document.documentElement.style.setProperty('--qr-display', displayValue);
}

function handleCropMarksToggle(isChecked) {
    const isVisible = isChecked;
    document.body.classList.toggle('has-crop-marks', isVisible);
}

// UI Frissítő függvény exportálása
export function updateRecordCount(count) {
    const el = document.getElementById('record-count-display');
    const container = document.getElementById('stats-bar');
    if (el) el.textContent = count;
    if (container) container.style.display = 'inline-flex';
}

let currentData = [];

export function initializeUI(onSettingsChange, onDataLoaded, initialData) {
    currentData = initialData;
    const controls = document.querySelectorAll('#settings-panel [data-css-var]');
    
    controls.forEach(input => {
        updateCSSVariable(input);
        if (input.type === 'range') updateValueDisplay(input);
    });

    controls.forEach(input => {
        input.addEventListener('input', () => {
            updateCSSVariable(input);
            if (input.type === 'range') updateValueDisplay(input);
            // Ha dinamikus újragenerálás kellene (pl. preview-nál), itt hívható callback
        });
    });

    const qrCheckbox = document.getElementById('show-qr');
    if(qrCheckbox) {
        qrCheckbox.addEventListener('change', (e) => {
            handleQRToggle(e.target.checked);
        });
    }

    const cropMarksCheckbox = document.getElementById('show-crop-marks');
    if (cropMarksCheckbox) {
        cropMarksCheckbox.addEventListener('change', (e) => {
            handleCropMarksToggle(e.target.checked);
        });
        // Init state
        handleCropMarksToggle(cropMarksCheckbox.checked);
    }

    const fileUploadButton = document.getElementById('file-upload-button');
    fileUploadButton.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const data = await parseXLS(file);
                currentData = data;
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
