export async function loadSampleData() {
    try {
        const response = await fetch('./assets/sample-data.json');
        if (!response.ok) {
            throw new Error(`HTTP hiba! Státusz: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Hiba a mintaadatok betöltésekor:", error);
        return [{ 
            year: "2024", 
            artist: "Hiba történt", 
            title: "Mintaadat hiba",
            code1: "ERR",
            code2: "000"
        }];
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
                
                // Tömbök tömbjeként olvassuk be (header: 1), így fixen index alapján dolgozhatunk
                const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Első sor a fejléc, ezt eldobjuk
                const rows = rawData.slice(1);
                
                const json = rows.filter(row => row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== '')).map(row => {
                    // Megfeleltetés a képen látható sorrend alapján:
                    // Col 0: Artist
                    // Col 1: Title
                    // Col 2: Year
                    // Col 3: URL (-> qr_data)
                    // Col 4: Code1
                    // Col 5: Code2
                    return {
                        artist: row[0],
                        title: row[1],
                        year: row[2],
                        qr_data: row[3],
                        code1: row[4],
                        code2: row[5]
                    };
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