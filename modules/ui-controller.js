import { parseXLS } from './data-handler.js';
import { renderAllPages } from './card-generator.js';

// Segédfüggvény a csúszkák melletti számok frissítésére
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

// QR Toggle logikája
function handleQRToggle(isChecked) {
    const displayValue = isChecked ? 'block' : 'none';
    document.documentElement.style.setProperty('--qr-display', displayValue);
}

// Crop Marks Toggle logikája
function handleCropMarksToggle(isChecked) {
    const containers = document.querySelectorAll('.page-container');
    containers.forEach(container => {
        if (isChecked) {
            container.classList.add('crop-marks');
        } else {
            container.classList.remove('crop-marks');
        }
    });
}

// Az aktuális adat tárolása újrarajzoláshoz
let currentData = [];

export function initializeUI(onSettingsChange, onDataLoaded, initialData) {
    currentData = initialData;
    const controls = document.querySelectorAll('#settings-panel [data-css-var]');
    
    // Kezdeti értékek beállítása
    controls.forEach(input => {
        updateCSSVariable(input);
        if (input.type === 'range') updateValueDisplay(input);
    });

    // Eseményfigyelők CSS változókhoz
    controls.forEach(input => {
        input.addEventListener('input', () => {
            updateCSSVariable(input);
            if (input.type === 'range') updateValueDisplay(input);
        });
    });

    // QR Checkbox
    const qrCheckbox = document.getElementById('show-qr');
    if(qrCheckbox) {
        qrCheckbox.addEventListener('change', (e) => {
            handleQRToggle(e.target.checked);
        });
    }

    // Crop Marks Checkbox
    const cropMarksCheckbox = document.getElementById('show-crop-marks');
    if (cropMarksCheckbox) {
        cropMarksCheckbox.addEventListener('change', (e) => {
            handleCropMarksToggle(e.target.checked);
        });
    }

    // Fájlfeltöltés kezelése
    const fileUploadButton = document.getElementById('file-upload-button');
    fileUploadButton.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const data = await parseXLS(file);
                currentData = data;
                onDataLoaded(data);
            } catch (error) {
                console.error("Hiba a fájl feldolgozása közben:", error);
                alert("Hiba történt az Excel fájl beolvasása során. Ellenőrizze a formátumot!");
            }
        }
    });

    // Nyomtatás gomb
    const printButton = document.getElementById('print-button');
    printButton.addEventListener('click', () => {
        window.print();
    });
}
