import { initializeUI, updateRecordCount } from './modules/ui-controller.js';
import { loadSampleData } from './modules/data-handler.js';
import { renderAllPages, renderPreviewPair } from './modules/card-generator.js';

const App = {
    data: [],
    previewIntervalId: null,
    currentPreviewIndex: 0, 
    isExternalDataLoaded: false,

    async init() {
        try {
            this.data = await loadSampleData();
            
            initializeUI(
                (fullReload) => this.handleSettingsChange(fullReload),
                (d) => this.handleDataLoaded(d)
            );
            
            if (this.data && this.data.length > 0) {
                this.updateStats(); // Initially might show visibility:hidden or 0
                this.renderPrintView();
                this.startPreviewCycle();
                
                document.getElementById('preview-area').addEventListener('click', () => {
                    this.showNextPreview();
                    this.resetCycle();
                });
            }
        } catch (error) {
            console.error("Init error:", error);
        }
    },

    handleSettingsChange(fullReload = false) {
        if (fullReload) {
            this.renderPrintView();
        }
        this.refreshCurrentPreview();
    },

    handleDataLoaded(newData) {
        if (!newData || newData.length === 0) return;
        this.data = newData;
        this.isExternalDataLoaded = true;
        this.updateStats();
        this.renderPrintView();
        this.currentPreviewIndex = 0;
        this.refreshCurrentPreview();
        this.resetCycle();
    },

    updateStats() {
        updateRecordCount(this.data.length, this.isExternalDataLoaded);
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