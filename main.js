import { initializeUI, updateRecordCount } from './modules/ui-controller.js';
import { loadSampleData } from './modules/data-handler.js';
import { renderAllPages, renderPreviewPair } from './modules/card-generator.js';

const showError = (message, error) => {
    console.error(message, error);
    const previewArea = document.getElementById('preview-area');
    if (previewArea) {
        const errorMessage = `<strong>Hiba történt!</strong><br><br>${message}<br><br>Részletek: ${error ? error.stack : 'N/A'}`;
        previewArea.innerHTML = `<div class="preview-placeholder error">${errorMessage}</div>`;
    }
};

window.addEventListener('unhandledrejection', event => {
  showError('Kezeletlen Promise hiba:', event.reason);
});

window.addEventListener('error', event => {
  showError('Kezeletlen hiba:', event.error);
});


const App = {
    data: [],
    previewIntervalId: null,
    currentPreviewIndex: 0, 

    async init() {
        try {
            console.log("MusicStencil indítása...");

            this.data = await loadSampleData();
            
            initializeUI(
                () => this.handleSettingsChange(),
                (d) => this.handleDataLoaded(d)
            );
            
            if (this.data && this.data.length > 0) {
                this.renderPrintView();
                this.startPreviewCycle();
            } else {
                 showError("Nem sikerült betölteni a minta adatokat.", "Az adatforrás üresnek tűnik.");
            }

        } catch (error) {
            showError("Végzetes hiba az App.init során:", error);
        }
    },

    handleSettingsChange() {
        this.renderPrintView();
        this.refreshCurrentPreview();
    },

    handleDataLoaded(newData) {
        if (!newData || newData.length === 0) {
            showError("A feltöltött fájl üres vagy hibás formátumú.", "Nincsenek feldolgozható adatok.");
            return;
        }
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

document.addEventListener('DOMContentLoaded', () => {
    try {
        App.init();
    } catch(error) {
        showError('Kritikus hiba az alkalmazás indítása során:', error);
    }
});