import { initializeUI } from './modules/ui-controller.js';
import { loadSampleData } from './modules/data-handler.js';
import { renderAllPages } from './modules/card-generator.js';

const App = {
    data: [],
    settings: {},

    async init() {
        console.log("MusicStencil indítása...");

        // Mintaadatok betöltése
        this.data = await loadSampleData();

        // UI inicializálása, átadjuk az adatokat is, hogy a QR generálás működjön resize-nál ha kellene
        initializeUI(this.handleSettingsChange, this.handleDataLoaded, this.data);

        // Első renderelés
        this.render();
    },

    handleSettingsChange: (newSettings) => {
        App.settings = { ...App.settings, ...newSettings };
        // A renderelés CSS változókon keresztül történik nagyrészt, 
        // de ha strukturális változás van, itt hívhatnánk a render-t.
    },

    handleDataLoaded: (newData) => {
        App.data = newData;
        App.render();
    },

    render() {
        if (!this.data || this.data.length === 0) {
            console.warn("Nincs adat a rendereléshez.");
            return;
        }
        const previewArea = document.getElementById('preview-area');
        renderAllPages(previewArea, this.data);
    }
};

// Alkalmazás indítása
document.addEventListener('DOMContentLoaded', () => App.init());
