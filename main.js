import { initializeUI, updateRecordCount } from './modules/ui-controller.js';
import { loadSampleData } from './modules/data-handler.js';
import { renderAllPages, renderPreviewPair } from './modules/card-generator.js';

const App = {
    data: [],
    previewIntervalId: null,
    currentPreviewIndex: 0, 

    async init() {
        console.log("MusicStencil indítása...");

        this.data = await loadSampleData();
        
        initializeUI(
            () => this.handleSettingsChange(),
            (d) => this.handleDataLoaded(d), 
            this.data
        );
        
        // Statisztika sávot itt már NEM frissítjük, csak fájlbetöltéskor
        this.renderPrintView();
        this.showRandomPreview();
    },

    handleSettingsChange() {
        this.renderPrintView();
        this.refreshCurrentPreview();
    },

    handleDataLoaded(newData) {
        this.data = newData;
        this.updateStats(); // CSAK itt hívjuk meg
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
