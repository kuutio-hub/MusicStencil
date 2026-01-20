export async function loadSampleData() {
    try {
        const response = await fetch('./assets/sample-data.json');
        if (!response.ok) {
            throw new Error(`HTTP hiba! Státusz: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Hiba a mintaadatok betöltésekor:", error);
        // Visszaadunk egy alapértelmezett értéket hiba esetén
        return [{ year: "2024", artist: "Hiba történt", title: "Nem sikerült betölteni a mintaadatokat." }];
    }
}

export function parseXLS(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, {
                    header: ["year", "artist", "title", "qr_data"],
                    range: 1 // Első sor (fejléc) kihagyása
                });
                resolve(json);
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}
