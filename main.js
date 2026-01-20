import { initializeUI, updateRecordCount } from './modules/ui-controller.js';
import { loadSampleData } from './modules/data-handler.js';
import { renderAllPages, renderPreviewPair } from './modules/card-generator.js';

const App = {
    data: [],
    previewIntervalId: null,
    currentPreviewIndex: 0, 

    async init() {
        console.log("MusicStencil v3.0 (Rebuilt) indítása...");
        try {
            // 1. Adatok betöltése
            this.data = await loadSampleData();
            if (!this.data || this.data.length === 0) {
                throw new Error("Nem sikerült betölteni az adatokat, vagy a fájl üres.");
            }
            console.log(`${this.data.length} dal betöltve.`);

            // 2. Statisztika frissítése
            this.updateStats(); 
            
            // 3. Kezelőfelület eseménykezelőinek beállítása
            initializeUI(
                () => this.handleSettingsChange(),
                (newData) => this.handleDataLoaded(newData)
            );

            // 4. Kezdeti renderelés
            console.log("Kezdeti nézetek generálása...");
            this.renderPrintView();
            this.refreshCurrentPreview();
            
            // 5. Előnézeti ciklus indítása
            this.startPreviewCycle(); 
            console.log("Inicializálás sikeres.");

        } catch (error) {
            console.error("KRITIKUS HIBA az alkalmazás inicializálása során:", error);
            document.body.innerHTML = `<div style="padding: 2rem; font-family: sans-serif; color: #333;"><h1>Alkalmazás Hiba</h1><p>Hoppá, valami elromlott indítás közben. Kérlek, ellenőrizd a böngésző konzolját (F12) a részletekért.</p><pre style="background: #eee; padding: 1rem; border-radius: 4px; white-space: pre-wrap;">${error.stack}</pre></div>`;
        }
    },

    handleSettingsChange() {
        this.renderPrintView();
        this.refreshCurrentPreview();
    },

    handleDataLoaded(newData) {
        this.data = newData;
        this.updateStats(); 
        this.renderPrintView();
        this.startPreviewCycle();
    },

    updateStats() {
        updateRecordCount(this.data.length);
    },

    renderPrintView() {
        if (!this.data || this.data.length === 0) return;
        const printArea = document.getElementById('print-area');
        renderAllPages(printArea, this.data);
    },

    showRandomPreview() {
        if (!this.data || this.data.length === 0) return;
        this.currentPreviewIndex = Math.floor(Math.random() * this.data.length);
        this.refreshCurrentPreview();
    },

    refreshCurrentPreview() {
        if (!this.data || this.data.length === 0) return;
        const previewArea = document.getElementById('preview-area');
        const placeholder = previewArea.querySelector('.preview-placeholder');
        if (placeholder) placeholder.style.display = 'none';

        if (this.currentPreviewIndex >= this.data.length) this.currentPreviewIndex = 0;
        
        renderPreviewPair(previewArea, this.data[this.currentPreviewIndex]);
    },

    startPreviewCycle() {
        if (this.previewIntervalId) clearInterval(this.previewIntervalId);
        
        this.showRandomPreview();

        this.previewIntervalId = setInterval(() => {
            this.showRandomPreview();
        }, 15000); 
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());