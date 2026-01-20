import { initializeUI, updateRecordCount } from './modules/ui-controller.js';
import { loadSampleData } from './modules/data-handler.js';
import { renderAllPages, renderPreviewPair } from './modules/card-generator.js';

const App = {
    data: [],
    previewIntervalId: null,

    async init() {
        console.log("MusicStencil indítása...");

        // Alapértelmezett mintaadatok
        this.data = await loadSampleData();
        
        // UI inicializálás
        initializeUI(this.handleSettingsChange, this.handleDataLoaded, this.data);
        
        // Kezdeti állapot beállítása (véletlen dal)
        this.updateStats();
        this.renderPrintView(); // Háttérben legeneráljuk az összeset
        this.showRandomPreview(); // Képernyőre egy véletlen
    },

    handleSettingsChange: () => {
        // Ha változik a beállítás (pl. méret), újra kell rajzolni a nézeteket
        // (A CSS változók automatikusak, de ha strukturális változás lenne, itt kellene kezelni)
        // A biztonság kedvéért újrarajzolhatjuk a QR kódok miatt
    },

    handleDataLoaded: (newData) => {
        App.data = newData;
        App.updateStats();
        
        // Nyomtatási nézet frissítése az új adatokkal
        App.renderPrintView();

        // Előnézeti ciklus indítása (15mp-enként új kártya)
        App.startPreviewCycle();
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
        const previewArea = document.getElementById('preview-area');
        const randomIndex = Math.floor(Math.random() * this.data.length);
        renderPreviewPair(previewArea, this.data[randomIndex]);
    },

    startPreviewCycle() {
        // Előző törlése ha van
        if (this.previewIntervalId) clearInterval(this.previewIntervalId);
        
        // Azonnal mutatunk egyet
        this.showRandomPreview();

        // Indítjuk az időzítőt
        this.previewIntervalId = setInterval(() => {
            this.showRandomPreview();
        }, 15000); // 15 másodperc
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
