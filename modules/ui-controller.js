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

    let unit = input.dataset.unit || '';
    // Speciális eset a százalékos méretezéshez
    if (input.id === 'qr-size') {
        unit = '%';
    }
    document.documentElement.style.setProperty(cssVar, input.value + unit);
}


function handleSimpleToggle(elementId, classToToggle) {
    const checkbox = document.getElementById(elementId);
    if (checkbox) {
        const toggleAction = (e) => {
            document.body.classList.toggle(classToToggle, e.target.checked);
            _triggerRefresh();
        };
        checkbox.addEventListener('change', toggleAction);
        document.body.classList.toggle(classToToggle, checkbox.checked);
    }
}

function handleBoldToggle(elementId, cssVarName) {
    const checkbox = document.getElementById(elementId);
    if(checkbox) {
        const toggleAction = (e) => {
            document.documentElement.style.setProperty(cssVarName, e.target.checked ? 'bold' : 'normal');
            _triggerRefresh();
        }
        checkbox.addEventListener('change', toggleAction);
        document.documentElement.style.setProperty(cssVarName, checkbox.checked ? 'bold' : 'normal');
    }
}

function handleGlowToggle(elementId, cssVarShadow, cssVarColor) {
     const checkbox = document.getElementById(elementId);
    if(checkbox) {
        const toggleAction = (e) => {
            const glowValue = e.target.checked ? `0 0 3px var(${cssVarColor})` : 'none';
            document.documentElement.style.setProperty(cssVarShadow, glowValue);
            _triggerRefresh();
        }
        checkbox.addEventListener('change', toggleAction);
        // Kezdeti állapot beállítása
        const initialGlowValue = checkbox.checked ? `0 0 3px var(${cssVarColor})` : 'none';
        document.documentElement.style.setProperty(cssVarShadow, initialGlowValue);
    }
}


export function updateRecordCount(count) {
    const el = document.getElementById('record-count-display');
    const container = document.getElementById('stats-bar');
    if (el) el.textContent = count;
    if (container) container.style.display = 'inline-flex';
}

let _triggerRefresh = () => {};

export function initializeUI(onSettingsChange, onDataLoaded) {
    
    if (onSettingsChange) {
        _triggerRefresh = () => onSettingsChange();
    }

    const controls = document.querySelectorAll('#settings-panel [data-css-var]');
    
    controls.forEach(input => {
        updateCSSVariable(input);
        if (input.type === 'range') updateValueDisplay(input);
    });

    document.getElementById('settings-panel').addEventListener('input', (e) => {
        if (e.target.matches('[data-css-var]')) {
            updateCSSVariable(e.target);
            if (e.target.type === 'range') {
                updateValueDisplay(e.target);
            }
        }
    });

    document.getElementById('settings-panel').addEventListener('change', (e) => {
        if (e.target.matches('[data-css-var]')) {
             _triggerRefresh();
        }
    });

    const qrCheckbox = document.getElementById('show-qr');
    if(qrCheckbox) {
        const setQrDisplay = (checked) => {
            const displayValue = checked ? 'flex' : 'none';
            document.documentElement.style.setProperty('--qr-display', displayValue);
        };
        qrCheckbox.addEventListener('change', (e) => {
            setQrDisplay(e.target.checked);
            _triggerRefresh();
        });
        setQrDisplay(qrCheckbox.checked);
    }

    // Toggle-ök inicializálása
    handleSimpleToggle('rotate-codes', 'codes-rotated');
    handleBoldToggle('bold-year', '--font-weight-year');
    handleBoldToggle('bold-artist', '--font-weight-artist');
    handleBoldToggle('bold-title', '--font-weight-title');
    handleBoldToggle('bold-codes', '--font-weight-codes');
    handleGlowToggle('glow-year', '--text-shadow-year', '--color-year');
    handleGlowToggle('glow-artist', '--text-shadow-artist', '--color-artist');
    handleGlowToggle('glow-title', '--text-shadow-title', '--color-title');


    const fileUploadButton = document.getElementById('file-upload-button');
    fileUploadButton.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const data = await parseXLS(file);
                onDataLoaded(data);
            } catch (error) {
                throw new Error(`Hiba az Excel fájl ("${file.name}") feldolgozása közben: ${error.message}`);
            }
        }
    });

    const printButton = document.getElementById('print-button');
    printButton.addEventListener('click', () => {
        // Mielőtt nyomtatunk, győződjünk meg róla, hogy a rácsnézet aktív
        if (!document.body.classList.contains('grid-view-active')) {
            document.body.classList.add('grid-view-active');
        }
        window.print();
    });

    const viewToggleButton = document.getElementById('view-toggle-button');
    if (viewToggleButton) {
        viewToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('grid-view-active');
            const isGridView = document.body.classList.contains('grid-view-active');
            const icon = viewToggleButton.querySelector('i');
            
            if (isGridView) {
                viewToggleButton.title = 'Előnézet';
                icon.className = 'fa-solid fa-eye';
            } else {
                viewToggleButton.title = 'Rácsnézet';
                icon.className = 'fa-solid fa-grip';
            }
        });
    }
}