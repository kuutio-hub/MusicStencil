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

function handleToggle(elementId, classToToggle) {
    const checkbox = document.getElementById(elementId);
    if (checkbox) {
        // Kezdeti állapot beállítása a HTML alapján
        document.body.classList.toggle(classToToggle, checkbox.checked);
        // Eseményfigyelő a változásokra
        checkbox.addEventListener('change', (e) => {
            document.body.classList.toggle(classToToggle, e.target.checked);
        });
    }
}

export function updateRecordCount(count) {
    const el = document.getElementById('record-count-display');
    const container = document.getElementById('stats-bar');
    if (el) el.textContent = count;
    if (container) container.style.display = 'inline-flex';
}


export function initializeUI(onSettingsChange, onDataLoaded) {
    if (!onSettingsChange || !onDataLoaded) {
        console.error("initializeUI: A callback függvények megadása kötelező!");
        return;
    }

    const controls = document.querySelectorAll('#settings-panel [data-css-var]');
    
    // Kezdeti CSS változók és kijelzők beállítása
    controls.forEach(input => {
        updateCSSVariable(input);
        if (input.type === 'range') updateValueDisplay(input);
    });

    // Eseményfigyelők hozzáadása a vezérlőkhöz
    controls.forEach(input => {
        input.addEventListener('input', () => {
            updateCSSVariable(input);
            if (input.type === 'range') updateValueDisplay(input);
            onSettingsChange(); // MINDEN beállításváltozás után frissítünk!
        });
    });

    // Speciális QR checkbox kezelés
    const qrCheckbox = document.getElementById('show-qr');
    if(qrCheckbox) {
        const setQrDisplay = () => {
            const displayValue = qrCheckbox.checked ? 'flex' : 'none';
            document.documentElement.style.setProperty('--qr-display', displayValue);
        };
        setQrDisplay(); // Kezdeti állapot
        qrCheckbox.addEventListener('change', () => {
            setQrDisplay();
            onSettingsChange();
        });
    }

    // Toggle-ök inicializálása
    handleToggle('show-crop-marks', 'has-crop-marks');
    handleToggle('rotate-codes', 'codes-rotated');
    // A toggle-ök is hívjanak frissítést
    ['show-crop-marks', 'rotate-codes'].forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.addEventListener('change', onSettingsChange);
    });

    // Fájlfeltöltés
    const fileUploadButton = document.getElementById('file-upload-button');
    fileUploadButton.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const data = await parseXLS(file);
                onDataLoaded(data);
            } catch (error) {
                console.error("Hiba a fájl feldolgozásakor:", error);
                alert("Hiba az Excel fájl feldolgozása közben: " + error.message);
            }
        }
    });

    // Nyomtatás
    const printButton = document.getElementById('print-button');
    printButton.addEventListener('click', () => {
        window.print();
    });

    console.log("UI eseményfigyelők sikeresen beállítva.");
}