// 46x46mm -> 4 oszlop. Max biztonságos méret kb 48mm.
const CARDS_PER_PAGE = 24;
const COLUMNS = 4;

function generateQRCode(element, text) {
    element.innerHTML = "";
    if (!text) return;
    
    try {
        new QRCode(element, {
            text: text,
            width: 128, 
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.L
        });
    } catch (e) {
        console.warn("QR Error:", e);
        element.textContent = "QR";
    }
}


function generateVinylSVG() {
    const computedStyle = getComputedStyle(document.documentElement);
    const color = computedStyle.getPropertyValue('--vinyl-groove-color').trim() || '#000000';
    
    // Glitch paraméterek
    const sections = parseInt(computedStyle.getPropertyValue('--vinyl-sections').trim()) || 3;
    const gapMinP = parseFloat(computedStyle.getPropertyValue('--vinyl-gap-min').trim()) || 10; // %
    const gapMaxP = parseFloat(computedStyle.getPropertyValue('--vinyl-gap-max').trim()) || 40; // %

    const size = 100;
    const center = size / 2;
    const maxRadius = 45; 
    const grooveCount = 8; 

    let svgContent = `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Alap külső kör
    svgContent += `<circle cx="${center}" cy="${center}" r="${maxRadius}" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.5" />`;

    for (let i = 1; i <= grooveCount; i++) {
        const radius = (maxRadius / grooveCount) * i;
        const circumference = 2 * Math.PI * radius;
        
        const sectionLength = circumference / sections;
        const dashArrayParts = [];
        
        const offset = Math.random() * circumference;

        for (let s = 0; s < sections; s++) {
            const gapPercent = gapMinP + Math.random() * (gapMaxP - gapMinP);
            const gapLen = sectionLength * (gapPercent / 100);
            const dashLen = sectionLength - gapLen;
            
            if (dashLen > 0) {
                dashArrayParts.push(`${dashLen.toFixed(2)} ${gapLen.toFixed(2)}`);
            }
        }
        
        const strokeDashArray = dashArrayParts.join(' ');
        const strokeWidth = (0.8 + (i * 0.15));

        svgContent += `<circle cx="${center}" cy="${center}" r="${radius}" 
            fill="none" stroke="${color}" stroke-width="${strokeWidth.toFixed(2)}" 
            stroke-dasharray="${strokeDashArray}" 
            stroke-dashoffset="${offset}" />`;
    }

    svgContent += `</svg>`;
    return svgContent;
}

function createCardFront(song) {
    const card = document.createElement('div');
    card.className = 'card front';
    card.innerHTML = `
        <div class="artist">${song.artist || 'Ismeretlen'}</div>
        <div class="year">${song.year || ''}</div>
        <div class="title">${song.title || 'Ismeretlen'}</div>
        
        <div class="code1">${song.code1 || ''}</div>
        <div class="code2">${song.code2 || ''}</div>
    `;
    return card;
}

function createCardBack(song) {
    const card = document.createElement('div');
    card.className = 'card back';
    
    const vinylBg = document.createElement('div');
    vinylBg.className = 'vinyl-bg';
    vinylBg.innerHTML = generateVinylSVG();
    
    const qrContainer = document.createElement('div');
    qrContainer.className = 'qr-container';

    card.appendChild(vinylBg);
    card.appendChild(qrContainer);

    if (song && song.qr_data) {
        setTimeout(() => generateQRCode(qrContainer, song.qr_data), 0);
    } else if (song && !song.qr_data) {
        qrContainer.style.display = 'none';
    }

    return card;
}

export function renderPreviewPair(container, song) {
    container.innerHTML = '';

    const frontWrapper = document.createElement('div');
    frontWrapper.className = 'card-wrapper';
    const frontLabel = document.createElement('div');
    frontLabel.className = 'preview-label';
    frontLabel.textContent = "Előlap";
    frontWrapper.appendChild(frontLabel);
    frontWrapper.appendChild(createCardFront(song));
    container.appendChild(frontWrapper);

    const backWrapper = document.createElement('div');
    backWrapper.className = 'card-wrapper';
    const backLabel = document.createElement('div');
    backLabel.className = 'preview-label';
    backLabel.textContent = "Hátlap";
    backWrapper.appendChild(backLabel);
    backWrapper.appendChild(createCardBack(song));
    container.appendChild(backWrapper);
}

export function renderAllPages(container, data) {
    container.innerHTML = ''; 

    const pageCount = Math.ceil(data.length / CARDS_PER_PAGE);

    for (let i = 0; i < pageCount; i++) {
        const dataChunk = data.slice(i * CARDS_PER_PAGE, (i + 1) * CARDS_PER_PAGE);
        
        const itemsToRender = [...dataChunk];
        while (itemsToRender.length < CARDS_PER_PAGE) {
            itemsToRender.push({ empty: true });
        }

        // --- ELŐLAPOK ---
        const frontPage = document.createElement('div');
        frontPage.className = 'page-container';
        
        itemsToRender.forEach(song => {
            const wrapper = document.createElement('div');
            wrapper.className = 'card-wrapper';
            if (!song.empty) {
                wrapper.appendChild(createCardFront(song));
            }
            frontPage.appendChild(wrapper);
        });
        container.appendChild(frontPage);

        // --- HÁTLAPOK ---
        const backPage = document.createElement('div');
        backPage.className = 'page-container';

        // Tükrözés
        for (let r = 0; r < itemsToRender.length; r += COLUMNS) {
            const rowItems = itemsToRender.slice(r, r + COLUMNS);
            const mirroredRow = rowItems.reverse();

            mirroredRow.forEach(song => {
                const wrapper = document.createElement('div');
                wrapper.className = 'card-wrapper';
                if (!song.empty) { 
                    wrapper.appendChild(createCardBack(song));
                }
                backPage.appendChild(wrapper);
            });
        }
        container.appendChild(backPage);
    }
}