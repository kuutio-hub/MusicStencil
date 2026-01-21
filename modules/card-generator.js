function generateQRCode(element, text, style, logoText) {
    element.innerHTML = "";
    if (!text) return;
    try {
        new QRCode(element, {
            text: text, width: 256, height: 256,
            colorDark : "#000000", colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.M
        });
        if (style === 'modern') element.classList.add('qr-modern');
        
        if (logoText && logoText.trim().length > 0) {
            const logo = document.createElement('div');
            logo.className = 'qr-logo-overlay';
            logo.textContent = logoText.substring(0, 3);
            element.appendChild(logo);
        }
    } catch (e) { console.warn("QR Error:", e); }
}

function adjustTextForOverflow(element, isTitle = false) {
    if (!element) return;
    const maxLines = parseInt(document.getElementById('max-lines')?.value) || 2;
    const computedStyle = window.getComputedStyle(element);
    let fontSize = parseFloat(computedStyle.fontSize);
    
    // Alt+Enter handling
    if (element.textContent.includes('\n') || element.textContent.includes('\r')) {
        element.innerHTML = element.textContent.replace(/\r?\n/g, '<br>');
    } else if (isTitle && element.textContent.length > 15 && !element.innerHTML.includes('<br>')) {
        // Smart Break at ~66%
        const words = element.textContent.split(' ');
        if (words.length > 2) {
            const splitAt = Math.floor(words.length * 0.66);
            element.innerHTML = words.slice(0, splitAt).join(' ') + '<br>' + words.slice(splitAt).join(' ');
        }
    }

    const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.2;
    const maxHeight = lineHeight * (maxLines + 0.1);

    // Shrink font until it fits maxLines
    while ((element.scrollHeight > maxHeight || element.scrollWidth > element.clientWidth) && fontSize > 4) {
        fontSize -= 0.5;
        element.style.fontSize = fontSize + 'px';
    }
}

function generateVinylSVG() {
    const color = getComputedStyle(document.documentElement).getPropertyValue('--vinyl-groove-color').trim() || '#000000';
    const spacing = parseFloat(document.getElementById('vinyl-spacing')?.value) || 3;
    const thickness = parseFloat(document.getElementById('vinyl-thickness')?.value) || 0.5;
    const variate = document.getElementById('vinyl-variate')?.checked;
    const gMin = parseInt(document.getElementById('glitch-min')?.value) || 1;
    const gMax = parseInt(document.getElementById('glitch-max')?.value) || 3;

    let svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`;
    for (let i = 0; i < 15; i++) {
        const r = 47 - (i * spacing);
        if (r < 5) break;
        
        // Randomly decide number of glitches for this circle
        const glitchCount = Math.floor(Math.random() * (gMax - gMin + 1)) + gMin;
        const dashArray = [];
        
        if (glitchCount === 0) {
            dashArray.push(1000, 0);
        } else {
            const circ = 2 * Math.PI * r;
            // Distribute glitches somewhat evenly
            const segment = circ / glitchCount;
            for (let g = 0; g < glitchCount; g++) {
                const gapLen = segment * (0.15 + Math.random() * 0.25);
                dashArray.push(segment - gapLen, gapLen);
            }
        }

        const sw = variate ? (thickness * (0.7 + Math.random() * 0.6)) : thickness;
        svg += `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-dasharray="${dashArray.join(' ')}" opacity="${0.3 + (i*0.04)}" />`;
    }
    svg += `</svg>`;
    return svg;
}

function createCard(song, isBack = false) {
    const card = document.createElement('div');
    card.className = `card ${isBack ? 'back' : 'front'}`;
    
    if (isBack) {
        card.innerHTML = `<div class="vinyl-bg">${generateVinylSVG()}</div><div class="qr-container"></div>`;
        const qrBox = card.querySelector('.qr-container');
        const style = document.getElementById('qr-style').value;
        const logo = document.getElementById('qr-logo-text').value;
        // Kisebb timeout a QR generáláshoz
        setTimeout(() => generateQRCode(qrBox, song.qr_data, style, logo), 50);
    } else {
        card.innerHTML = `
            <div class="artist">${song.artist || ''}</div>
            <div class="year">${song.year || ''}</div>
            <div class="title">${song.title || ''}</div>
            ${song.code1 ? `<div class="code1">${song.code1}</div>` : ''}
            ${song.code2 ? `<div class="code2">${song.code2}</div>` : ''}
        `;
    }
    return card;
}

export function renderPreviewPair(container, song) {
    container.innerHTML = '';
    [false, true].forEach(isBack => {
        const wrap = document.createElement('div');
        wrap.className = 'card-wrapper';
        const card = createCard(song, isBack);
        wrap.appendChild(card);
        container.appendChild(wrap);
        if (!isBack) {
            adjustTextForOverflow(card.querySelector('.artist'));
            adjustTextForOverflow(card.querySelector('.title'), true);
        }
    });
}

export function renderAllPages(container, data) {
    container.innerHTML = '';
    const paper = document.getElementById('paper-size').value;
    const cardSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-size'));
    
    // Margók figyelembe vétele (A4/A3)
    const pW = paper === 'A3' ? 277 : 190;
    const pH = paper === 'A3' ? 400 : 277;
    
    const cols = Math.floor(pW / cardSize);
    const rows = Math.floor(pH / cardSize);
    const perPage = cols * rows;

    for (let i = 0; i < data.length; i += perPage) {
        const chunk = data.slice(i, i + perPage);
        
        // ELŐLAP OLDAL
        const frontPage = document.createElement('div');
        frontPage.className = `page-container ${paper}`;
        chunk.forEach(song => {
            const wrap = document.createElement('div');
            wrap.className = 'card-wrapper';
            const card = createCard(song);
            wrap.appendChild(card);
            frontPage.appendChild(wrap);
            adjustTextForOverflow(card.querySelector('.artist'));
            adjustTextForOverflow(card.querySelector('.title'), true);
        });
        container.appendChild(frontPage);

        // HÁTLAP OLDAL (Tükrözve a kétoldalas nyomtatáshoz)
        const backPage = document.createElement('div');
        backPage.className = `page-container ${paper}`;
        for (let r = 0; r < chunk.length; r += cols) {
            // Soronként megfordítjuk a sorrendet
            chunk.slice(r, r + cols).reverse().forEach(song => {
                const wrap = document.createElement('div');
                wrap.className = 'card-wrapper';
                wrap.appendChild(createCard(song, true));
                backPage.appendChild(wrap);
            });
        }
        container.appendChild(backPage);
    }
}