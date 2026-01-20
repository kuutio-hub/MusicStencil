const CARDS_PER_PAGE = 8;

function generateQRCode(element, text) {
    // Töröljük az előző tartalmat
    element.innerHTML = "";
    if (!text) return;
    
    // QRCode.js használata
    try {
        new QRCode(element, {
            text: text,
            width: 128, // Nagyobb felbontásban generáljuk, CSS méretezi
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    } catch (e) {
        console.warn("QR kód generálási hiba (lehet, hogy a lib még nem töltött be):", e);
        element.textContent = "QR Error";
    }
}

function createCardFront(song) {
    const card = document.createElement('div');
    card.className = 'card front';
    
    // QR konténer
    const qrContainer = document.createElement('div');
    qrContainer.className = 'qr-container';
    
    // Tartalom konténer
    const content = document.createElement('div');
    content.className = 'card-content';
    content.innerHTML = `
        <div class="year">${song.year || ''}</div>
        <div class="artist">${song.artist || 'Ismeretlen előadó'}</div>
        <div class="title">${song.title || 'Ismeretlen cím'}</div>
    `;

    // Felépítés: QR felül (vagy alul, flex-orderrel cserélhető lenne), szöveg alatta
    card.appendChild(qrContainer);
    card.appendChild(content);

    // QR generálása (aszinkron is lehetne, de a lib szinkron)
    if (song.qr_data) {
        // Kis késleltetés, hogy a DOM-ban biztosan ott legyen, bár createElemnél nem feltétlen kell
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
    container.innerHTML = ''; // Konténer ürítése

    const pageCount = Math.ceil(data.length / CARDS_PER_PAGE);

    for (let i = 0; i < pageCount; i++) {
        const dataChunk = data.slice(i * CARDS_PER_PAGE, (i + 1) * CARDS_PER_PAGE);
        const pageNum = i + 1;

        // --- Előlapok ---
        
        // Címke az előnézethez
        const frontLabel = document.createElement('div');
        frontLabel.className = 'page-label';
        frontLabel.innerHTML = `<i class="fa-regular fa-file-lines"></i> ${pageNum}. Oldal - Előlap (Adatok)`;
        container.appendChild(frontLabel);

        const frontPage = document.createElement('div');
        frontPage.className = 'page-container';
        
        // Üres helyek kitöltése, ha az utolsó oldalon vagyunk
        const itemsToRender = [...dataChunk];
        while (itemsToRender.length < CARDS_PER_PAGE) {
            itemsToRender.push({ empty: true }); // Üres placeholder
        }

        itemsToRender.forEach(song => {
            const wrapper = document.createElement('div');
            wrapper.className = 'card-wrapper';
            if (!song.empty) {
                wrapper.appendChild(createCardFront(song));
            }
            frontPage.appendChild(wrapper);
        });
        container.appendChild(frontPage);

        // --- Hátlapok ---

        // Címke az előnézethez
        const backLabel = document.createElement('div');
        backLabel.className = 'page-label';
        backLabel.innerHTML = `<i class="fa-solid fa-compact-disc"></i> ${pageNum}. Oldal - Hátlap (Dizájn)`;
        container.appendChild(backLabel);

        const backPage = document.createElement('div');
        backPage.className = 'page-container';
        
        // Hátlapoknál tükrözni kell a sorrendet a kétoldalas nyomtatáshoz!
        // A papír vízszintes tengelyen fordul általában, de itt rácsos elrendezés van.
        // A standard elv: A kártya hátulja ugyanott legyen fizikailag.
        // Ha bal-felső az első kártya (Front), akkor a hátoldalon a jobb-felső lesz az (Back), ha "short edge" fordítás van?
        // Egyszerűsítés: Mindenhova ugyanazt a hátlapot rakjuk, így a sorrend mindegy.
        
        for (let j = 0; j < CARDS_PER_PAGE; j++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'card-wrapper';
            // Csak akkor rajzolunk hátlapot, ha van ott kártya az előlapon (opcionális, de szebb ha van mindenhol)
            // A kérés szerint: "amit látsz azt kapod", általában tele nyomtatják a lapot.
            wrapper.appendChild(createCardBack());
            backPage.appendChild(wrapper);
        }
        container.appendChild(backPage);
    }
}
