function generateQRCode(element, text, logoText) {
    element.innerHTML = "";
    if (!text) return;
    try {
        element.className = "qr-container";

        // Fix standard high res QR
        new QRCode(element, {
            text: text, 
            width: 400, 
            height: 400,
            colorDark : "#000000", 
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        if (logoText && logoText.trim().length > 0) {
            const logo = document.createElement('div');
            logo.className = 'qr-logo-overlay';
            
            // Stílusok alkalmazása
            if (document.getElementById('qr-round')?.checked) logo.classList.add('rounded');
            if (document.getElementById('qr-invert')?.checked) logo.classList.add('inverted');
            
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
            const splitAt = Math.ceil(words.length * 0.5);
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
    const spacing = parseFloat(document.getElementById('vinyl-spacing')?.value) || 2.5;
    const thickness = parseFloat(document.getElementById('vinyl-thickness')?.value) || 0.4; // Mostantól nincs külön input, de kód szinten marad
    const grooveCount = parseInt(document.getElementById('vinyl-count')?.value) || 12;
    
    const gMin = parseInt(document.getElementById('glitch-min')?.value) || 1;
    const gMax = parseInt(document.getElementById('glitch-max')?.value) || 2;
    
    const gWidthMin = parseFloat(document.getElementById('glitch-width-min')?.value) || 25;
    const gWidthMax = parseFloat(document.getElementById('glitch-width-max')?.value) || 30;
    
    const variate = document.getElementById('vinyl-variate')?.checked;

    let svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`;
    let lastRandomShift = 0;

    for (let i = 0; i < grooveCount; i++) {
        const r = 48 - (i * spacing);
        if (r < 5) break;

        const gCount = Math.floor(Math.random() * (gMax - gMin + 1)) + gMin;
        const circ = 2 * Math.PI * r;
        const dash = [];
        
        if (gCount === 0) {
            dash.push(circ, 0);
        } else {
            // Intelligens offset: próbálunk olyan elforgatást adni, ami távol van az előzőtől
            let shift = Math.random() * circ;
            if (Math.abs(shift - lastRandomShift) < (circ * 0.1)) {
                 shift = (shift + (circ * 0.3)) % circ;
            }
            lastRandomShift = shift;

            let segments = [];
            for (let g = 0; g < gCount; g++) {
                // Hozzáadjuk a shiftet a véletlen pozíciókhoz
                segments.push((Math.random() * circ + shift) % circ);
            }
            segments.sort((a, b) => a - b);
            
            let lastPos = 0;
            for (let p of segments) {
                const randomWidthPercent = Math.random() * (gWidthMax - gWidthMin) + gWidthMin;
                const gapWidth = circ * (randomWidthPercent / 100) / gCount; 
                
                const drawLen = Math.max(0, p - lastPos - (gapWidth / 2));
                dash.push(drawLen, gapWidth);
                lastPos = p + (gapWidth / 2);
            }
            const finalPart = Math.max(0, circ - lastPos);
            if (finalPart > 0) dash.push(finalPart, 0);
        }

        const sw = variate ? (0.4 * (0.6 + Math.random() * 0.8)) : 0.4;
        svg += `<circle cx="50" cy="50" r="${r}" fill="none" stroke="black" stroke-width="${sw}" stroke-dasharray="${dash.join(' ')}" opacity="${0.12 + (i * (0.8 / grooveCount))}" />`;
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
        
        if (showQr) {
            setTimeout(() => generateQRCode(qrBox, song.qr_data, logo), 10);
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
    const isPrinting = window.matchMedia('print').matches; // Ez JS-ben nem mindig reaktív, de a logika: 
    // Grid View-ban (képernyőn) limitálunk. 
    // Mivel a nyomtatást külön gomb indítja, ott majd felülbíráljuk, 
    // de egyelőre a képernyős megjelenítéshez feltételezünk egy limitet, 
    // kivéve ha a hívó expliciten jelzi a teljes renderelést.
    // A main.js-ben a 'print-button' kezeli a teljes renderelést.
    
    // De itt egyszerűsítünk: Ha a container ID-je 'print-area' ÉS NEM nyomtatunk épp,
    // akkor limitáljuk. Viszont a main.js meghívja a renderelést.
    // Megoldás: Adunk egy paramétert a függvénynek vagy a main.js-ben szűrünk.
    // Itt a legbiztosabb: Ha a body nem 'printing' állapotú (amit majd a main.js rak rá),
    // akkor vágjuk az adatot. De a 'grid-view-active' alatt látni akarjuk a mintát.
    
    const pW = paper === 'A3' ? 277 : 190; 
    const pH = paper === 'A3' ? 400 : 277; 
    
    const cols = Math.floor(pW / cardSizeMm);
    const rows = Math.floor(pH / cardSizeMm);
    const perPage = cols * rows;

    if (cols < 1) return;

    // LIMIT LOGIKA: Ha a body-n nincs 'is-printing' osztály, akkor csak 1 lapnyi adatot dolgozunk fel.
    // (Azaz 1 front + 1 back page)
    let processData = data;
    if (!document.body.classList.contains('is-printing')) {
        processData = data.slice(0, perPage); 
    }

    for (let i = 0; i < processData.length; i += perPage) {
        const chunk = processData.slice(i, i + perPage);
        
        // ELŐLAPOK
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

        // HÁTLAPOK
        const backPage = document.createElement('div');
        backPage.className = `page-container ${paper}`;
        backPage.style.gridTemplateColumns = `repeat(${cols}, ${cardSizeMm}mm)`;
        
        for (let r = 0; r < chunk.length; r += cols) {
            const rowSongs = chunk.slice(r, r + cols);
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