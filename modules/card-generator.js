const CARDS_PER_PAGE = 100; // Majd a rács kitölti

function generateQRCode(element, text) {
    element.innerHTML = "";
    if (!text) return;
    try {
        new QRCode(element, {
            text: text,
            width: 256,
            height: 256,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.L
        });
    } catch (e) {
        console.warn("QR Error:", e);
    }
}

/**
 * Intelligens szövegtördelés (v6.4.2):
 * Prioritás: Ha a szöveg tartalmaz már sortörést (\n vagy \r), azt használja.
 * Különben alkalmazza az upward-break logikát.
 */
function smartWrap(text, element) {
    if (!text) return text;

    // Ha van benne manuális sortörés (Excel Alt+Enter), alakítsuk <br>-ré
    if (text.includes('\n') || text.includes('\r')) {
        return text.replace(/\r?\n/g, '<br>');
    }

    const words = text.split(/\s+/);
    if (words.length <= 1) return text;

    // Upward break: első rész legyen rövidebb (kb 40%)
    const splitIdx = Math.max(1, Math.floor(words.length * 0.4));
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
    
    // Ha van benne manuális sortörés, azonnal cseréljük
    if (text.includes('\n') || text.includes('\r')) {
        element.innerHTML = text.replace(/\r?\n/g, '<br>');
    } 
    // Különben ha cím és elég hosszú, próbáljuk az okos tördelést
    else if (isTitle && text.length > 15 && !element.innerHTML.includes('<br>')) {
        element.innerHTML = smartWrap(text, element);
    }

    const maxHeight = parseFloat(computedStyle.lineHeight) * 2.3; 

    while ((element.scrollHeight > maxHeight || element.scrollWidth > element.clientWidth) && currentFontSize > minFontSize) {
        currentFontSize -= 0.5;
        element.style.fontSize = `${currentFontSize}px`;
    }
}

function generateVinylSVG() {
    const computedStyle = getComputedStyle(document.documentElement);
    const color = computedStyle.getPropertyValue('--vinyl-groove-color').trim();
    const count = parseInt(computedStyle.getPropertyValue('--vinyl-groove-count')) || 8;
    const spacing = parseFloat(computedStyle.getPropertyValue('--vinyl-spacing')) || 4;
    const thickness = parseFloat(computedStyle.getPropertyValue('--vinyl-thickness')) || 0.5;
    
    let svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`;
    for (let i = 0; i < count; i++) {
        const r = 45 - (i * spacing * 0.5);
        if (r < 5) break;
        const dash = (Math.random() * 50 + 50);
        const gap = (Math.random() * 20 + 5);
        svg += `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="${thickness}" stroke-dasharray="${dash} ${gap}" opacity="${0.3 + (i*0.05)}" />`;
    }
    svg += `</svg>`;
    return svg;
}

function createCardFront(song) {
    const card = document.createElement('div');
    card.className = 'card front';
    card.innerHTML = `
        <div class="artist">${song.artist || ''}</div>
        <div class="year">${song.year || ''}</div>
        <div class="title">${song.title || ''}</div>
        <div class="code1">${song.code1 || ''}</div>
        <div class="code2">${song.code2 || ''}</div>
    `;
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
        setTimeout(() => generateQRCode(qrBox, song.qr_data), 0);
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

/**
 * Kiszámolja, hány oszlop fér el egy oldalon (v6.4.2)
 */
function calculateColumns() {
    const cardSizeMm = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-size'));
    const usableWidthMm = 190; // A4 (210) - 2x10mm margó
    return Math.floor(usableWidthMm / cardSizeMm) || 1;
}

function calculateRows() {
    const cardSizeMm = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-size'));
    const usableHeightMm = 277; // A4 (297) - 2x10mm margó
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
        
        // Front Page
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

        // Back Page (Mirrored dynamically based on columns)
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