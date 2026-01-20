const CARDS_PER_PAGE = 8;
const COLUMNS = 2; // Oszlopok száma

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
            correctLevel : QRCode.CorrectLevel.H
        });
    } catch (e) {
        console.warn("QR Error:", e);
        element.textContent = "QR";
    }
}

function createCardFront(song) {
    const card = document.createElement('div');
    card.className = 'card front';
    
    const qrContainer = document.createElement('div');
    qrContainer.className = 'qr-container';
    
    const content = document.createElement('div');
    content.className = 'card-content';
    content.innerHTML = `
        <div class="year">${song.year || ''}</div>
        <div class="artist">${song.artist || 'Ismeretlen előadó'}</div>
        <div class="title">${song.title || 'Ismeretlen cím'}</div>
    `;

    card.appendChild(qrContainer);
    card.appendChild(content);

    if (song.qr_data) {
        setTimeout(() => generateQRCode(qrContainer, song.qr_data), 0);
    }

    return card;
}

function createCardBack() {
    const card = document.createElement('div');
    card.className = 'card back';
    card.innerHTML = `
        <div class="vinyl-disc">
            <div class="vinyl-center-helper">
                <div class="vinyl-label">
                    <div class="vinyl-hole"></div>
                </div>
            </div>
        </div>
    `;
    return card;
}

export function renderAllPages(container, data) {
    container.innerHTML = ''; 

    const pageCount = Math.ceil(data.length / CARDS_PER_PAGE);

    for (let i = 0; i < pageCount; i++) {
        const dataChunk = data.slice(i * CARDS_PER_PAGE, (i + 1) * CARDS_PER_PAGE);
        const pageNum = i + 1;

        // Üres helyek kitöltése, hogy mindig tele legyen a rács
        // Ez fontos a hátlapok tükrözésénél, hogy a megfelelő helyre kerüljön az üres hátlap is
        const itemsToRender = [...dataChunk];
        while (itemsToRender.length < CARDS_PER_PAGE) {
            itemsToRender.push({ empty: true });
        }

        // --- ELŐLAPOK (FRONTS) ---
        const frontLabel = document.createElement('div');
        frontLabel.className = 'page-label';
        frontLabel.innerHTML = `<i class="fa-regular fa-file-lines"></i> ${pageNum}. Oldal - Előlap (Adatok)`;
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

        // --- HÁTLAPOK (BACKS) ---
        const backLabel = document.createElement('div');
        backLabel.className = 'page-label';
        backLabel.innerHTML = `<i class="fa-solid fa-compact-disc"></i> ${pageNum}. Oldal - Hátlap (Dizájn)`;
        container.appendChild(backLabel);

        const backPage = document.createElement('div');
        backPage.className = 'page-container';

        // TÜKRÖZÉSI LOGIKA (Imposition)
        // Kétoldalas nyomtatásnál a lap vízszintes tengelyen fordul (long edge binding).
        // Ezért a sorban lévő elemek sorrendjét meg kell fordítani.
        // Bal 1. -> Jobb 1. lesz a hátoldalon.
        
        // 1. Chunkoljuk sorokra az elemeket
        for (let r = 0; r < itemsToRender.length; r += COLUMNS) {
            const rowItems = itemsToRender.slice(r, r + COLUMNS);
            
            // 2. Megfordítjuk a sort (Jobb elem -> Bal elem)
            const mirroredRow = rowItems.reverse();

            // 3. Rendereljük a megfordított sort
            mirroredRow.forEach(song => {
                const wrapper = document.createElement('div');
                wrapper.className = 'card-wrapper';
                // Még az üres helyekre is teszünk hátlapot (vagy üres wrapper-t), 
                // de a kérés szerint "amit látsz azt kapsz", így a dizájn miatt generáljuk a hátlapot akkor is ha üres,
                // vagy dönthetünk úgy, hogy nem. A konzisztencia miatt generáljuk.
                // Ha song.empty igaz, akkor technikailag nem kellene kártya, de vágásnál jobb ha van vezető.
                // Most generálunk mindenhova.
                if (!song.empty || true) { 
                    wrapper.appendChild(createCardBack());
                }
                backPage.appendChild(wrapper);
            });
        }

        container.appendChild(backPage);
    }
}
