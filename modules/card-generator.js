function generateQRCode(element, text, style, logoText) {
    element.innerHTML = "";
    if (!text) return;
    try {
        // Alkalmazzuk a design stílust
        element.className = "qr-container";
        if (style === 'rounded') element.classList.add('qr-style-rounded');
        if (style === 'dots') element.classList.add('qr-style-dots');

        new QRCode(element, {
            text: text, 
            width: 256, 
            height: 256,
            colorDark : "#000000", 
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.M
        });

        if (logoText && logoText.trim().length > 0) {
            const logo = document.createElement('div');
            logo.className = 'qr-logo-overlay';
            logo.textContent = logoText.substring(0, 3);
            element.appendChild(logo);
        }
    } catch (e) { console.error("QR Error", e); }
}

function adjustText(element, isTitle = false) {
    if (!element) return;
    const maxLines = parseInt(document.getElementById('max-lines')?.value) || 2;
    const style = getComputedStyle(element);
    let fontSize = parseFloat(style.fontSize);
    
    let text = element.textContent;
    if (text.includes('\n') || text.includes('\r')) {
        element.innerHTML = text.replace(/\r?\n/g, '<br>');
    } else if (isTitle && text.length > 15 && !element.innerHTML.includes('<br>')) {
        const words = text.split(' ');
        if (words.length > 2) {
            const splitAt = Math.floor(words.length * 0.66);
            element.innerHTML = words.slice(0, splitAt).join(' ') + '<br>' + words.slice(splitAt).join(' ');
        }
    }

    const lh = parseFloat(style.lineHeight) || fontSize * 1.1;
    const maxH = lh * (maxLines + 0.1);

    while ((element.scrollHeight > maxH || element.scrollWidth > element.clientWidth) && fontSize > 4) {
        fontSize -= 0.5;
        element.style.fontSize = fontSize + 'px';
    }
}

function generateVinyl() {
    const spacing = parseFloat(document.getElementById('vinyl-spacing')?.value) || 3;
    const gMin = parseInt(document.getElementById('glitch-min')?.value) || 1;
    const gMax = parseInt(document.getElementById('glitch-max')?.value) || 3;
    const variate = document.getElementById('vinyl-variate')?.checked;

    let svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`;
    for (let i = 0; i < 15; i++) {
        const r = 48 - (i * spacing);
        if (r < 5) break;

        const gCount = Math.floor(Math.random() * (gMax - gMin + 1)) + gMin;
        const circ = 2 * Math.PI * r;
        const dash = [];
        
        if (gCount === 0) {
            dash.push(circ, 0);
        } else {
            // TELJESEN RANDOM GLITCH POZÍCIÓK - MINDEN KÖR EGYEDI
            let positions = [];
            for (let g = 0; g < gCount; g++) {
                positions.push(Math.random() * circ);
            }
            positions.sort((a, b) => a - b);
            
            let currentPos = 0;
            const gapWidth = circ * (0.05 + Math.random() * 0.1) / gCount; 
            
            for (let p of positions) {
                const drawLen = Math.max(0, p - currentPos - (gapWidth/2));
                dash.push(drawLen, gapWidth);
                currentPos = p + (gapWidth/2);
            }
            
            const lastPart = circ - currentPos;
            if (lastPart > 0) dash.push(lastPart, 0);
        }

        const sw = variate ? (0.4 + Math.random() * 0.4) : 0.5;
        svg += `<circle cx="50" cy="50" r="${r}" fill="none" stroke="black" stroke-width="${sw}" stroke-dasharray="${dash.join(' ')}" opacity="${0.2 + (i*0.05)}" />`;
    }
    svg += `</svg>`;
    return svg;
}

function createCard(song, isBack = false) {
    const card = document.createElement('div');
    card.className = `card ${isBack ? 'back' : 'front'}`;
    
    if (isBack) {
        card.innerHTML = `<div class="vinyl-bg">${generateVinyl()}</div><div class="qr-container"></div>`;
        const qrBox = card.querySelector('.qr-container');
        const logo = document.getElementById('qr-logo-text')?.value;
        const showQr = document.getElementById('show-qr')?.checked;
        const qrStyle = document.getElementById('qr-style')?.value || 'standard';
        
        if (showQr) {
            setTimeout(() => generateQRCode(qrBox, song.qr_data, qrStyle, logo), 50);
        } else {
            qrBox.style.display = 'none';
        }
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
    if (!container || !song) return;
    container.innerHTML = '';
    [false, true].forEach(isBack => {
        const wrap = document.createElement('div');
        wrap.className = 'card-wrapper';
        const card = createCard(song, isBack);
        wrap.appendChild(card);
        container.appendChild(wrap);
        if (!isBack) {
            adjustText(card.querySelector('.artist'));
            adjustText(card.querySelector('.title'), true);
        }
    });
}

export function renderAllPages(container, data) {
    if (!container || !data || data.length === 0) return;
    container.innerHTML = '';
    const paper = document.getElementById('paper-size').value;
    const cardSizeMm = parseFloat(document.getElementById('card-size').value) || 46;
    
    const pW = paper === 'A3' ? 277 : 190; 
    const pH = paper === 'A3' ? 400 : 277; 
    
    const cols = Math.floor(pW / cardSizeMm);
    const rows = Math.floor(pH / cardSizeMm);
    const perPage = cols * rows;

    if (cols < 1) return;

    // VÉGIGMEGYÜNK AZ ÖSSZES ADATON
    for (let i = 0; i < data.length; i += perPage) {
        const chunk = data.slice(i, i + perPage);
        
        // ELŐLAP OLDAL
        const frontPage = document.createElement('div');
        frontPage.className = `page-container ${paper}`;
        frontPage.style.gridTemplateColumns = `repeat(${cols}, ${cardSizeMm}mm)`;
        
        chunk.forEach(song => {
            const wrap = document.createElement('div');
            wrap.className = 'card-wrapper';
            const card = createCard(song);
            wrap.appendChild(card);
            frontPage.appendChild(wrap);
            adjustText(card.querySelector('.artist'));
            adjustText(card.querySelector('.title'), true);
        });
        container.appendChild(frontPage);

        // HÁTLAP OLDAL (Tükrözve a kétoldalas nyomtatáshoz)
        const backPage = document.createElement('div');
        backPage.className = `page-container ${paper}`;
        backPage.style.gridTemplateColumns = `repeat(${cols}, ${cardSizeMm}mm)`;
        
        for (let r = 0; r < chunk.length; r += cols) {
            const rowSongs = chunk.slice(r, r + cols);
            // Vízszintes tükrözés a soron belül
            rowSongs.reverse().forEach(song => {
                const wrap = document.createElement('div');
                wrap.className = 'card-wrapper';
                wrap.appendChild(createCard(song, true));
                backPage.appendChild(wrap);
            });
        }
        container.appendChild(backPage);
    }
}