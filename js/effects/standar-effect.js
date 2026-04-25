// ===== STANDAR EFFECT =====
const StandarEffect = (function() {
    let sequenceTimer = null;
    
    function trigger() {
        clearAllTimeouts();
        hideIndicator();
        
        CardManager.resetSequence();
        
        sequenceTimer = setTimeout(() => {
            showCardStandar();
            sequenceTimer = null;
        }, CONFIG.EFFECTS.STANDAR_DELAY);
    }
    
    function showCardStandar() {
        const activeList = CardManager.getActiveImagesList();
        
        if (activeList.length === 0) return;
        
        const card = CardManager.getCard();
        
        card.style.transition = 'none';
        card.style.transform = 'none';
        card.style.left = '0';
        card.style.top = '0';
        card.style.display = 'block';
        card.style.animation = 'none';
        card.classList.remove('card-fadeout');
        
        const cardWidth = card.offsetWidth;
        const cardHeight = card.offsetHeight;
        
        const centerX = (window.innerWidth - cardWidth) / 2;
        const centerY = (window.innerHeight - cardHeight) / 2;
        
        CardManager.setCardPosition(centerX, centerY);
        CardManager.setCurrentImageIndex(0);
        card.src = activeList[0].src;
        
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        CardManager.updateCardTransform();
        
        CardManager.setActiveImagesList(activeList);
        CardManager.setSequenceActive(true);
        CardManager.setSequenceStage(1);
    }
    
    function clearAllTimeouts() {
        if (sequenceTimer) {
            clearTimeout(sequenceTimer);
            sequenceTimer = null;
        }
        CardManager.clearTouchToChangeTimeout();
    }
    
    function hideIndicator() {
        const indicator = document.getElementById('card-indicator');
        if (indicator) indicator.classList.remove('visible');
    }
    
    function handleCardTap() {
        if (!CardManager.isSequenceCurrentlyActive() || !CardManager.isCardVisible()) return;
        
        const activeCount = CardManager.getTotalImagesCount();
        
        if (CardManager.getSequenceStage() < activeCount) {
            CardManager.setTouchToChangeTimeout(() => {
                if (CardManager.isSequenceCurrentlyActive()) {
                    if (!CardManager.goToNextImage()) {
                        CardManager.setSequenceActive(false);
                        CardManager.setSequenceStage(0);
                    }
                }
                CardManager.clearTouchToChangeTimeout();
            }, CONFIG.EFFECTS.TAP_TO_CHANGE_DELAY);
        } else {
            CardManager.setSequenceActive(false);
            CardManager.setSequenceStage(0);
        }
    }
    
    return {
        trigger,
        handleCardTap,
        clearAllTimeouts
    };
})();
