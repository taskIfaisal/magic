// ===== STORAGE MODULE =====
const Storage = (function() {
    function save(data) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }
    
    function load() {
        try {
            const savedData = localStorage.getItem(CONFIG.STORAGE_KEY);
            return savedData ? JSON.parse(savedData) : null;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return null;
        }
    }
    
    function saveCardSize(size) {
        localStorage.setItem('card_size', size);
    }
    
    function loadCardSize() {
        return parseInt(localStorage.getItem('card_size')) || 200;
    }
    
    return {
        save,
        load,
        saveCardSize,
        loadCardSize
    };
})();
