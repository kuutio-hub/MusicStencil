const CARDS_PER_PAGE = 100;

function generateQRCode(element, text, style) {
    element.innerHTML = "";
    if (!text) return;
    try {
        const qr = new QRCode(element, {
            text: text,
            width: 256,
            height: 256,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.L
        });
        if (style === 'modern') {
            element.classList.add('qr-modern');
        } else {
            element.classList.remove('qr-modern');
        }
    } catch (e) {
        console.warn("QR Error:", e);
    }
}

/**
 * Smart Break (v6.5.0): 2/3 arányú törés (kb. 66%)
 */
function smartWrap(text) {
    if (!text) return text;
    if (text.includes('\n') || text.includes('\r')) {
        return text.replace(/\r?\n/g, '<br>');
    }
    const words = text.split(/\s+/);
    if (words.length <= 1) return text;

    // 2/3-nál próbálkozunk (utolsó harmad elé törünk)
    const splitIdx = Math.max(1, Math.floor(words.length * 0.66));
    const firstPart = words.slice(0, splitIdx).join(' ');
    const secondPart = words.slice(splitIdx).join(' ');
    return `${firstPart}<br>${secondPart}`;
}

function adjustTextForOverflow(element, isTitle = false) {
    if (!element) return;
    let text = element.textContent;
    const computedStyle = window.getComputedStyle(element);
    let currentFontSize = parseFloat(computedStyle.fontSize);
    const minFontSize = 4;
    
    // Manuális sortörés vagy okos tördelés
    if (text.includes('\n') || text.includes('\r')) {
        element.innerHTML = text.replace(/\r?\n/g, '<br>');
    } else if (isTitle && text.length > 15 && !element.innerHTML.includes('<br>')) {
        element.innerHTML = smartWrap(text);
    }

    const maxHeight = parseFloat(computedStyle.lineHeight) * 2.3; 
    while ((element.scrollHeight > maxHeight || element.scrollWidth > element.clientWidth) && currentFontSize > minFontSize) {
        currentFontSize -= 0.5;
        element.style.fontSize = `${currentFontSize}px`;
    }
}

/**
 * Vinyl Engine 2.0 (v6.5.0)
 */
function generateVinylSVG() {
    const getVal = (id) => parseFloat(document.getElementById(id)?.value);
    
    const computedStyle = getComputedStyle(document.documentElement);
    const color = computedStyle.getPropertyValue('--vinyl-groove-color').trim();
    const count = parseInt(computedStyle.getPropertyValue('--vinyl-groove-count')) || 8;
    const spacing = parseFloat(computedStyle.getPropertyValue('--vinyl-spacing')) || 4;
    const thickness = parseFloat(computedStyle.getPropertyValue('--vinyl-thickness')) || 0.5;
    const variate = document.getElementById('vinyl-variate')?.checked;

    const glitchMin = getVal('glitch-min') || 1;
    const glitchMax = getVal('glitch-max') || 3;
    const gapMin = getVal('gap-min') || 15;
    const gapMax = getVal('gap-max') || 45;
    
    let svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`;
    
    for (let i = 0; i < count; i++) {
        const r = 45 - (i * spacing); 
        if (r < 2) break;
        
        // Explicit glitch szám
        const glitchCount = Math.floor(Math.random() * (glitchMax - glitchMin + 1)) + glitchMin;
        let dashes = [];
        
        if (glitchCount === 0) {
            dashes = [1000, 0];
        } else {
            const circumference = 2 * Math.PI * r;
            // Körfelosztás a glitch szám alapján
            for (let g = 0; g < glitchCount; g++) {
                const gapPercent = (Math.random() * (gapMax - gapMin) + gapMin) / 100;
                const gapLen = circumference * gapPercent / glitchCount;
                const dashLen = (circumference / glitchCount) - gapLen;
                dashes.push(dashLen, gapLen);
            }
        }

        const strokeW = variate ? (thickness * (0.5 + Math.random())) : thickness;

        svg += `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" 
                stroke-width="${strokeW}" 
                stroke-dasharray="${dashes.join(' ')}" 
                opacity="${0.4 + (i*0.05)}" />`;
    }
    svg += `</svg>`;
    return svg;
}

/**
 * Small Caps kezelés segédfüggvény
 */
function applyTrueSmallCaps(element, text) {
    if (!text) return;
    const words = text.split(' ').map(word => {
        if (word.length === 0) return '';
        const first = word[0];
        const rest = word.slice(1);
        return `<span class="first-letter">${first}</span><span class="rest">${rest}</span>`;
    });
    element.innerHTML = words.join(' ');
    element.classList.add('true-small-caps');
}

function createCardFront(song) {
    const card = document.createElement('div');
    card.className = 'card front';
    
    const code1Html = song.code1 ? `<div class="code1">${song.code1}</div>` : '';
    const code2Html = song.code2 ? `<div class="code2">${song.code2}</div>` : '';

    card.innerHTML = `
        <div class="artist">${song.artist || ''}</div>
        <div class="year">${song.year || ''}</div>
        <div class="title">${song.title || ''}</div>
        ${code1Html}
        ${code2Html}
    `;

    // Small Caps kezelés ha be van állítva
    const artistStyle = getComputedStyle(document.documentElement).getPropertyValue('--font-variant-artist').trim();
    const titleStyle = getComputedStyle(document.documentElement).getPropertyValue('--font-variant-title').trim();

    if (artistStyle === 'small-caps') applyTrueSmallCaps(card.querySelector('.artist'), song.artist);
    if (titleStyle === 'small-caps') applyTrueSmallCaps(card.querySelector('.title'), song.title);

    return card;
}

function createCardBack(song) {
    const card = document.createElement('div');
    card.className = 'card back';
    card.innerHTML = `
        <div class="vinyl-bg">${generateVinylSVG()}</div>
        <div class="qr-container"></div>
    `;
    if (song.qr_data) {
        const qrBox = card.querySelector('.qr-container');
        const style = document.getElementById('qr-style')?.value || 'standard';
        setTimeout(() => generateQRCode(qrBox, song.qr_data, style), 10);
    }
    return card;
}

export function renderPreviewPair(container, song) {
    container.innerHTML = '';
    const createFrame = (label, card) => {
        const frame = document.createElement('div');
        frame.className = 'preview-frame';
        frame.innerHTML = `<div class="preview-label">${label}</div>`;
        const wrap = document.createElement('div');
        wrap.className = 'card-wrapper';
        wrap.appendChild(card);
        frame.appendChild(wrap);
        return frame;
    };
    const front = createCardFront(song);
    const back = createCardBack(song);
    container.appendChild(createFrame("Előlap", front));
    container.appendChild(createFrame("Hátlap", back));
    adjustTextForOverflow(front.querySelector('.artist'));
    adjustTextForOverflow(front.querySelector('.title'), true);
}

function calculateColumns() {
    const cardSizeMm = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-size'));
    const usableWidthMm = 190;
    return Math.floor(usableWidthMm / cardSizeMm) || 1;
}

function calculateRows() {
    const cardSizeMm = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-size'));
    const usableHeightMm = 277;
    return Math.floor(usableHeightMm / cardSizeMm) || 1;
}

export function renderAllPages(container, data) {
    container.innerHTML = '';
    const cols = calculateColumns();
    const rows = calculateRows();
    const perPage = cols * rows;
    const pageCount = Math.ceil(data.length / perPage);

    for (let i = 0; i < pageCount; i++) {
        const chunk = data.slice(i * perPage, (i + 1) * perPage);
        const frontPage = document.createElement('div');
        frontPage.className = 'page-container';
        chunk.forEach(song => {
            const card = createCardFront(song);
            const wrap = document.createElement('div');
            wrap.className = 'card-wrapper';
            wrap.appendChild(card);
            frontPage.appendChild(wrap);
            adjustTextForOverflow(card.querySelector('.artist'));
            adjustTextForOverflow(card.querySelector('.title'), true);
        });
        container.appendChild(frontPage);

        const backPage = document.createElement('div');
        backPage.className = 'page-container';
        for (let r = 0; r < chunk.length; r += cols) {
            const rowSlice = chunk.slice(r, r + cols).reverse();
            rowSlice.forEach(song => {
                const card = createCardBack(song);
                const wrap = document.createElement('div');
                wrap.className = 'card-wrapper';
                wrap.appendChild(card);
                backPage.appendChild(wrap);
            });
        }
        container.appendChild(backPage);
    }
}