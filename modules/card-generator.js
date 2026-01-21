function generateQRCode(element, text, style, logoText) {
    element.innerHTML = "";
    if (!text) return;
    try {
        new QRCode(element, {
            text: text, width: 200, height: 200,
            colorDark : "#000000", colorLight : "#ffffff",
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
    
    // Smart Break Logic
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

    const lh = parseFloat(style.lineHeight) || fontSize * 1.2;
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
            dash.push(1000, 0);
        } else {
            const seg = circ / gCount;
            for (let g = 0; g < gCount; g++) {
                const gap = seg * (0.1 + Math.random() * 0.2);
                dash.push(seg - gap, gap);
            }
        }

        const sw = variate ? (0.4 + Math.random() * 0.4) : 0.5;
        svg += `<circle cx="50" cy="50" r="${r}" fill="none" stroke="black" stroke-width="${sw}" stroke-dasharray="${dash.join(' ')}" opacity="${0.3 + (i*0.04)}" />`;
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
        setTimeout(() => generateQRCode(qrBox, song.qr_data, 'std', logo), 50);
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
    if (!container || !data) return;
    container.innerHTML = '';
    const paper = document.getElementById('paper-size').value;
    const cardSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-size'));
    
    const pW = paper === 'A3' ? 277 : 190;
    const pH = paper === 'A3' ? 400 : 277;
    
    const cols = Math.floor(pW / cardSize);
    const rows = Math.floor(pH / cardSize);
    const perPage = cols * rows;

    for (let i = 0; i < data.length; i += perPage) {
        const chunk = data.slice(i, i + perPage);
        
        const frontPage = document.createElement('div');
        frontPage.className = `page-container ${paper}`;
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

        const backPage = document.createElement('div');
        backPage.className = `page-container ${paper}`;
        for (let r = 0; r < chunk.length; r += cols) {
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