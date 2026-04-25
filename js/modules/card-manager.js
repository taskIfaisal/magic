// ===== CARD MANAGER MODULE (Compatibility Layer) =====
// This file is kept for compatibility with other modules
// Main functionality is now in main.js

window.CardManager = {
    getCard: () => document.getElementById('card'),
    getCardPreview: () => document.getElementById('main-card-preview'),
    updateCardImage: (src) => {
        const card = document.getElementById('card');
        const preview = document.getElementById('main-card-preview');
        if (card) card.src = src;
        if (preview) preview.src = src;
    },
    hideCard: () => {
        const card = document.getElementById('card');
        if (card) {
            card.style.display = 'none';
            card.style.visibility = 'hidden';
        }
    },
    isCardVisible: () => {
        const card = document.getElementById('card');
        return card && card.style.display !== 'none' && card.style.visibility === 'visible';
    }
};
