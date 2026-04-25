// ===== CARD MANAGER MODULE =====
const CardManager = (function() {
    let card = document.getElementById('card');
    let mainCardPreview = document.getElementById('main-card-preview');
    
    let posX = window.innerWidth / 2 - 100;
    let posY = window.innerHeight + 200;
    let scale = 1;
    let isDragging = false;
    let startX, startY;
    let velocityX = 0, velocityY = 0;
    let lastPosX = 0, lastPosY = 0;
    let lastTime = 0;
    let isAnimatingMotion = false;
    
    // Active images for effects
    let activeImagesList = [];
    let currentCardImageIndex = 0;
    let isSequenceActive = false;
    let sequenceStage = 0;
    
    // Timeouts
    let touchToChangeTimeout = null;
    
    function getCard() { return card; }
    function getCardPreview() { return mainCardPreview; }
    
    function getActiveImagesList() {
        const list = [];
        const activeImages = window.activeImages || {1: true, 2: true, 3: true, 4: true};
        
        const preview1 = document.getElementById('preview-1');
        const preview2 = document.getElementById('preview-2');
        const preview3 = document.getElementById('preview-3');
        const preview4 = document.getElementById('preview-4');
        
        function getSrc(preview, index) {
            if (preview && activeImages[index]) {
                const img = preview.querySelector('img');
                return img ? img.src : '';
            }
            return null;
        }
        
        const src1 = getSrc(preview1, 1);
        const src2 = getSrc(preview2, 2);
        const src3 = getSrc(preview3, 3);
        const src4 = getSrc(preview4, 4);
        
        if (src1) list.push({ index: 1, src: src1 });
        if (src2) list.push({ index: 2, src: src2 });
        if (src3) list.push({ index: 3, src: src3 });
        if (src4) list.push({ index: 4, src: src4 });
        
        return list;
    }
    
    function updateCardImage(imageSrc) {
        card.src = imageSrc;
        if (mainCardPreview) mainCardPreview.src = imageSrc;
        
        scale = 1;
        updateCardTransform();
        
        window.autoSave();
    }
    
    function updateCardTransform() {
        if (!card) return;
        posX = Math.round(posX);
        posY = Math.round(posY);
        card.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    }
    
    function applyBounds() {
        const cardWidth = card.offsetWidth * scale;
        const cardHeight = card.offsetHeight * scale;
        
        const minX = 0;
        const maxX = window.innerWidth - cardWidth;
        const minY = 0;
        const maxY = window.innerHeight - cardHeight;
        
        posX = Math.max(minX, Math.min(maxX, posX));
        posY = Math.max(minY, Math.min(maxY, posY));
    }
    
    function hideCard() {
        card.style.display = 'none';
        card.style.visibility = 'hidden';
        card.style.animation = 'none';
        card.classList.remove('card-fadeout');
    }
    
    function showCard() {
        card.style.display = 'block';
        card.style.visibility = 'visible';
        card.style.opacity = '1';
    }
    
    function setCardPosition(x, y) {
        posX = x;
        posY = y;
        updateCardTransform();
    }
    
    function setCardCenter() {
        const cardWidth = card.offsetWidth;
        const cardHeight = card.offsetHeight;
        posX = (window.innerWidth - cardWidth) / 2;
        posY = (window.innerHeight - cardHeight) / 2;
        updateCardTransform();
    }
    
    function getCardPosition() {
        return { x: posX, y: posY };
    }
    
    function isCardVisible() {
        return card.style.display !== 'none' && card.style.visibility === 'visible';
    }
    
    function resetSequence() {
        isSequenceActive = false;
        sequenceStage = 0;
        if (touchToChangeTimeout) {
            clearTimeout(touchToChangeTimeout);
            touchToChangeTimeout = null;
        }
    }
    
    function setSequenceActive(active) {
        isSequenceActive = active;
    }
    
    function isSequenceCurrentlyActive() {
        return isSequenceActive;
    }
    
    function setSequenceStage(stage) {
        sequenceStage = stage;
    }
    
    function getSequenceStage() {
        return sequenceStage;
    }
    
    function setCurrentImageIndex(index) {
        currentCardImageIndex = index;
    }
    
    function getCurrentImageIndex() {
        return currentCardImageIndex;
    }
    
    function setActiveImagesList(list) {
        activeImagesList = list;
    }
    
    function getActiveImagesListData() {
        return activeImagesList;
    }
    
    function goToNextImage() {
        if (activeImagesList.length === 0) return false;
        
        currentCardImageIndex++;
        
        if (currentCardImageIndex < activeImagesList.length) {
            card.src = activeImagesList[currentCardImageIndex].src;
            sequenceStage = currentCardImageIndex + 1;
            return true;
        }
        return false;
    }
    
    function isLastImage() {
        return currentCardImageIndex >= activeImagesList.length - 1;
    }
    
    function getTotalImagesCount() {
        return activeImagesList.length;
    }
    
    function setTouchToChangeTimeout(callback, delay) {
        if (touchToChangeTimeout) clearTimeout(touchToChangeTimeout);
        touchToChangeTimeout = setTimeout(callback, delay);
    }
    
    function clearTouchToChangeTimeout() {
        if (touchToChangeTimeout) {
            clearTimeout(touchToChangeTimeout);
            touchToChangeTimeout = null;
        }
    }
    
    return {
        getCard,
        getCardPreview,
        updateCardImage,
        updateCardTransform,
        applyBounds,
        hideCard,
        showCard,
        setCardPosition,
        setCardCenter,
        getCardPosition,
        isCardVisible,
        resetSequence,
        setSequenceActive,
        isSequenceCurrentlyActive,
        setSequenceStage,
        getSequenceStage,
        setCurrentImageIndex,
        getCurrentImageIndex,
        setActiveImagesList,
        getActiveImagesListData,
        getActiveImagesList,
        goToNextImage,
        isLastImage,
        getTotalImagesCount,
        setTouchToChangeTimeout,
        clearTouchToChangeTimeout,
        isAnimatingMotion: () => isAnimatingMotion,
        setAnimatingMotion: (val) => { isAnimatingMotion = val; }
    };
})();
