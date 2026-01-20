// 46x46mm kártya esetén az A4 (210mm) lapon 4 oszlop fér el kényelmesen (184mm).
// 297mm magasságon 6 sor fér el (276mm).
// Összesen 24 kártya / oldal.
const CARDS_PER_PAGE = 24;
const COLUMNS = 4;

function generateQRCode(element, text) {
    element.innerHTML = "";
    if (!text) return;
    
    try {
        // Alapbeállítások felülírhatók CSS-el, de itt a librarynak kell méret
        new QRCode(element, {
            text: text,
            width: 128, 
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.L // Alacsonyabb hibajavítás = kevésbé sűrű QR, jobban olvasható kis méretben
        });
    } catch (e) {
        console.warn("QR Error:", e);
        element.textContent = "QR";
    }
}

function createCardFront(song) {
    const card = document.createElement('div');
    card.className = 'card front';
    
    // Front: Csak szöveg (Év, Előadó, Cím)
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
    
    // Háttér dizájn elem (Vinyl)
    const vinylBg = document.createElement('div');
    vinylBg.className = 'vinyl-bg';
    
    // QR Konténer
    const qrContainer = document.createElement('div');
    qrContainer.className = 'qr-container';

    card.appendChild(vinylBg);
    card.appendChild(qrContainer);

    // QR generálás a hátlapra
    if (song && song.qr_data) {
        // Timeout kell, hogy a DOM elem létezzen, amikor a library dolgozik
        setTimeout(() => generateQRCode(qrContainer, song.qr_data), 0);
    } else if (song && !song.qr_data) {
        // Ha nincs adat, de nem üres placeholder
        qrContainer.style.display = 'none';
    }

    return card;
}

export function renderAllPages(container, data) {
    container.innerHTML = ''; 

    const pageCount = Math.ceil(data.length / CARDS_PER_PAGE);

    for (let i = 0; i < pageCount; i++) {
        const dataChunk = data.slice(i * CARDS_PER_PAGE, (i + 1) * CARDS_PER_PAGE);
        const pageNum = i + 1;

        const itemsToRender = [...dataChunk];
        // Kitöltés üres elemekkel, hogy a grid teljes legyen (fontos a tükrözéshez)
        while (itemsToRender.length < CARDS_PER_PAGE) {
            itemsToRender.push({ empty: true });
        }

        // --- ELŐLAPOK (Szöveg) ---
        const frontLabel = document.createElement('div');
        frontLabel.className = 'page-label';
        frontLabel.innerHTML = `<i class="fa-regular fa-file-lines"></i> ${pageNum}. Oldal - Előlap (Szöveg)`;
        container.appendChild(frontLabel);

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

        // --- HÁTLAPOK (QR + Dizájn) ---
        const backLabel = document.createElement('div');
        backLabel.className = 'page-label';
        backLabel.innerHTML = `<i class="fa-solid fa-qrcode"></i> ${pageNum}. Oldal - Hátlap (QR & Dizájn)`;
        container.appendChild(backLabel);

        const backPage = document.createElement('div');
        backPage.className = 'page-container';

        // TÜKRÖZÉS LOGIKA (Imposition)
        // 4 oszlop esetén: [A, B, C, D] -> [D, C, B, A] a hátoldalon.
        
        for (let r = 0; r < itemsToRender.length; r += COLUMNS) {
            const rowItems = itemsToRender.slice(r, r + COLUMNS);
            const mirroredRow = rowItems.reverse(); // Sorrend megfordítása

            mirroredRow.forEach(song => {
                const wrapper = document.createElement('div');
                wrapper.className = 'card-wrapper';
                
                // Hátlap generálása
                // Még az üres helyekre is teszünk wrapper-t a rács miatt,
                // és opcionálisan üres hátlapot, ha a dizájn megköveteli (pl. vágójelek miatt).
                if (!song.empty) { 
                    wrapper.appendChild(createCardBack(song));
                } else {
                    // Üres kártya helye a hátoldalon (üres papír)
                    // De ha vágójeleket akarunk, érdemes lehet berakni egy üres divet
                    // Most üresen hagyjuk a contentet
                }
                backPage.appendChild(wrapper);
            });
        }

        container.appendChild(backPage);
    }
}
