import { parseXLS } from './data-handler.js';
import { renderAllPages, renderPreviewPair } from './card-generator.js';
import { updateRecordCount as updateCount } from './ui-controller.js'; // Self import fix for circular dep if needed, or just function def

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
    // Használjuk a toggle második paraméterét a kényszerítéshez
    document.body.classList.toggle('has-crop-marks', isVisible);
}

export function updateRecordCount(count) {
    const el = document.getElementById('record-count-display');
    const container = document.getElementById('stats-bar');
    if (el) el.textContent = count;
    if (container) container.style.display = 'inline-flex';
}

// Segéd a globális adatok eléréséhez (closure megoldás lenne szebb, de a struktúra adott)
let currentData = [];
// Callback placeholder
let _triggerRefresh = () => {};

export function initializeUI(onSettingsChange, onDataLoaded, initialData) {
    currentData = initialData;
    
    // Callback beállítása, ha a main.js átadja
    // (A main.js-ben: handleSettingsChange hívja a renderelést)
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
            
            // Ha a vinyl randomness változik, újra kell generálni az SVG-t,
            // nem elég a CSS változó frissítése.
            if (input.id === 'vinyl-randomness' || input.id === 'vinyl-groove-color') {
                _triggerRefresh();
            }
            
            // Margók változásánál nem kell teljes újragenerálás, azt a CSS kezeli,
            // kivéve ha nagyon drasztikus layout váltás lenne.
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
