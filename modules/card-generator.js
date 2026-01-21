const CARDS_PER_PAGE = 24;
const COLUMNS = 4;

function generateQRCode(element, text) {
    element.innerHTML = "";
    if (!text) return;
    try {
        new QRCode(element, {
            text: text,
            width: 256, // Nagyobb felbontás a tisztább képért
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
 * Intelligens szövegtördelés:
 * Ha a szöveg nem fér el egy sorban, megkeresi az ideális töréspontot.
 * A felhasználói kérés alapján az "upward break" logikát preferálja:
 * Az első sor legyen rövidebb/könnyebb, a második pedig tartalmasabb.
 */
function smartWrap(text, element) {
    if (!text) return text;
    const words = text.split(/\s+/);
    if (words.length <= 1) return text;

    // Próbáljuk megmérni, hol lenne esztétikus a törés
    // A cél: a törés utáni rész legyen a "súlyosabb"
    let bestWrap = text;
    let minDiff = Infinity;

    // Ha nagyon hosszú a cím, az első harmadnál próbálunk törni
    const splitIdx = Math.max(1, Math.floor(words.length * 0.4));
    const firstPart = words.slice(0, splitIdx).join(' ');
    const secondPart = words.slice(splitIdx).join(' ');
    
    return `${firstPart}<br>${secondPart}`;
}

function adjustTextForOverflow(element, isTitle = false) {
    if (!element) return;
    
    const text = element.textContent;
    const computedStyle = window.getComputedStyle(element);
    let currentFontSize = parseFloat(computedStyle.fontSize);
    const minFontSize = 4;
    
    // Ha cím, először próbáljuk az okos tördelést
    if (isTitle && text.length > 15 && !element.innerHTML.includes('<br>')) {
        element.innerHTML = smartWrap(text, element);
    }

    const maxHeight = parseFloat(computedStyle.lineHeight) * 2.2; // Max 2 sor

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
    
    let svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`;
    for (let i = 0; i < count; i++) {
        const r = 45 - (i * spacing * 0.5);
        if (r < 5) break;
        const dash = (Math.random() * 50 + 50);
        const gap = (Math.random() * 20 + 5);
        svg += `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="0.5" stroke-dasharray="${dash} ${gap}" opacity="${0.3 + (i*0.05)}" />`;
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

export function renderAllPages(container, data) {
    container.innerHTML = '';
    const pageCount = Math.ceil(data.length / CARDS_PER_PAGE);

    for (let i = 0; i < pageCount; i++) {
        const chunk = data.slice(i * CARDS_PER_PAGE, (i + 1) * CARDS_PER_PAGE);
        
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

        // Back Page (Mirrored row-by-row)
        const backPage = document.createElement('div');
        backPage.className = 'page-container';
        for (let r = 0; r < chunk.length; r += COLUMNS) {
            const row = chunk.slice(r, r + COLUMNS).reverse();
            row.forEach(song => {
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