import { initializeUI, updateRecordCount } from './modules/ui-controller.js';
import { loadSampleData } from './modules/data-handler.js';
import { renderAllPages, renderPreviewPair } from './modules/card-generator.js';

const showError = (message, error) => {
    console.error(message, error);
    const previewArea = document.getElementById('preview-area');
    if (previewArea) {
        const errorMessage = `<strong>Hiba!</strong><br>${message}<br><small>${error?.message || ''}</small>`;
        previewArea.innerHTML = `<div style="color: #f44; padding: 20px; text-align: center;">${errorMessage}</div>`;
    }
};

const App = {
    data: [],
    previewIntervalId: null,
    currentPreviewIndex: 0, 

    async init() {
        try {
            console.log("MusicStencil v6.5.4 indítása...");

            this.data = await loadSampleData();
            
            initializeUI(
                () => this.handleSettingsChange(),
                (d) => this.handleDataLoaded(d)
            );
            
            if (this.data && this.data.length > 0) {
                this.updateStats();
                this.renderPrintView();
                this.startPreviewCycle();
                
                // KATTINTÁSRA KÖVETKEZŐ ELŐNÉZET
                document.getElementById('preview-area').addEventListener('click', () => {
                    this.showNextPreview();
                    this.resetCycle();
                });
            }

        } catch (error) {
            showError("Hiba az inicializáláskor:", error);
        }
    },

    handleSettingsChange() {
        this.renderPrintView();
        this.refreshCurrentPreview();
    },

    handleDataLoaded(newData) {
        if (!newData || newData.length === 0) return;
        this.data = newData;
        this.updateStats();
        this.renderPrintView();
        this.currentPreviewIndex = 0;
        this.refreshCurrentPreview();
        this.resetCycle();
    },

    updateStats() {
        updateRecordCount(this.data.length);
    },

    renderPrintView() {
        if (!this.data || this.data.length === 0) return;
        const printArea = document.getElementById('print-area');
        renderAllPages(printArea, this.data);
    },

    showNextPreview() {
        if (!this.data || this.data.length === 0) return;
        this.currentPreviewIndex = (this.currentPreviewIndex + 1) % this.data.length;
        this.refreshCurrentPreview();
    },

    refreshCurrentPreview() {
        if (!this.data || this.data.length === 0) return;
        const previewArea = document.getElementById('preview-area');
        renderPreviewPair(previewArea, this.data[this.currentPreviewIndex]);
    },

    resetCycle() {
        if (this.previewIntervalId) clearInterval(this.previewIntervalId);
        this.startPreviewCycle();
    },

    startPreviewCycle() {
        if (this.previewIntervalId) clearInterval(this.previewIntervalId);
        this.refreshCurrentPreview();
        this.previewIntervalId = setInterval(() => {
            this.showNextPreview();
        }, 8000); 
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});