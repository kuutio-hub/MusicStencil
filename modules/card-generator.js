// 46x46mm kártya esetén az A4 (210mm) lapon 4 oszlop fér el kényelmesen (184mm).
// 297mm magasságon 6 sor fér el (276mm).
// Összesen 24 kártya / oldal.
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

function createCardFront(song) {
    const card = document.createElement('div');
    card.className = 'card front';
    card.innerHTML = `
        <div class="year">${song.year || ''}</div>
        <div class="artist">${song.artist || 'Ismeretlen'}</div>
        <div class="title">${song.title || 'Ismeretlen'}</div>
    `;
    return card;
}

function createCardBack(song) {
    const card = document.createElement('div');
    card.className = 'card back';
    
    const vinylBg = document.createElement('div');
    vinylBg.className = 'vinyl-bg';
    
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

// ÚJ: Csak egyetlen kártya pár (elő+hátlap) renderelése előnézethez
export function renderPreviewPair(container, song) {
    container.innerHTML = '';

    // Wrapper az előlapnak
    const frontWrapper = document.createElement('div');
    frontWrapper.className = 'card-wrapper';
    
    const frontLabel = document.createElement('div');
    frontLabel.className = 'preview-label';
    frontLabel.textContent = "Előlap";
    frontWrapper.appendChild(frontLabel);
    
    frontWrapper.appendChild(createCardFront(song));
    container.appendChild(frontWrapper);

    // Wrapper a hátlapnak
    const backWrapper = document.createElement('div');
    backWrapper.className = 'card-wrapper';
    
    const backLabel = document.createElement('div');
    backLabel.className = 'preview-label';
    backLabel.textContent = "Hátlap";
    backWrapper.appendChild(backLabel);

    backWrapper.appendChild(createCardBack(song));
    container.appendChild(backWrapper);
}

// Megmarad a nyomtatáshoz: összes oldal generálása
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
