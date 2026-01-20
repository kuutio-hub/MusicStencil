import { parseXLS } from './data-handler.js';
import { renderAllPages } from './card-generator.js';

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
    // Flex-et használunk a középre igazításhoz a CSS-ben
    const displayValue = isChecked ? 'flex' : 'none';
    document.documentElement.style.setProperty('--qr-display', displayValue);
}

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
            // Mivel a page-container elemek dinamikusan jönnek létre rendereléskor,
            // de a toggle csak osztályt ad hozzá/vesz el, ez a meglévőkre hat.
            // Új renderelésnél a CSS osztály alapból nincs rajta a JS generátorban, 
            // ezért a legegyszerűbb, ha renderelés után mindig ellenőrizzük a checkbox állapotát
            // a main.js-ben vagy a generátorban. 
            // De egyszerűbb megoldás: CSS-el kezelni globálisan, vagy a generátorban alapból rárakni ha kell.
            // Jelenlegi megoldás csak a már renderelt oldalakra hat.
            // Javítás: A generátornak tudnia kellene róla, vagy globális state.
            // Egyszerűsítés: Force re-render vagy body class használat.
            // Legjobb: document.body.classList.toggle('show-crop-marks', isChecked) és CSS szelektor módosítás.
            // De maradjunk a re-rendernél a konzisztencia miatt:
            renderAllPages(document.getElementById('preview-area'), currentData);
            // Ez újraépíti a DOM-ot, de elveszti a crop-marks osztályt, amit a generátor nem rak rá.
            // Helyette: A crop marks állapotot tároljuk, és a renderAllPages olvassa, vagy
            // a legegyszerűbb: A CSS-t írjuk át, hogy body class-ra figyeljen.
            // Mivel most XML output van, a CSS selector módosítás biztonságosabb.
            document.body.classList.toggle('has-crop-marks', isChecked);
        });
        // Init state
        document.body.classList.toggle('has-crop-marks', cropMarksCheckbox.checked);
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
                alert("Excel hiba.");
            }
        }
    });

    const printButton = document.getElementById('print-button');
    printButton.addEventListener('click', () => {
        window.print();
    });
}
