// ===== SHADOW EFFECT =====
const ShadowEffect = (function() {
    let sequenceTimer = null;
    let shadowFadeOutTimeout = null;
    let shadowWaitTimeout = null;
    
    function trigger() {
        clearAllTimeouts();
        hideIndicator();
        
        CardManager.resetSequence();
        
        sequenceTimer = setTimeout(() => {
            if (true) {
                showCardShadow();
            }
            sequenceTimer = null;
        }, CONFIG.EFFECTS.SHADOW_DELAY);
    }
    
    function showCardShadow() {
        const activeList = CardManager.getActiveImagesList();
        
        if (activeList.length === 0) return;
        
        const card = CardManager.getCard();
        
        clearShadowTimeouts();
        
        card.style.animation = 'none';
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.style.display = 'block';
        card.style.transition = 'none';
        card.style.transform = 'none';
        card.style.left = '0';
        card.style.top = '0';
        card.classList.remove('card-fadeout');
        
        const cardWidth = card.offsetWidth;
        const cardHeight = card.offsetHeight;
        
        const centerX = (window.innerWidth - cardWidth) / 2;
        const centerY = (window.innerHeight - cardHeight) / 2;
        
        CardManager.setCardPosition(centerX, centerY);
        CardManager.setCurrentImageIndex(0);
        card.src = activeList[0].src;
        
        CardManager.updateCardTransform();
        
        void card.offsetHeight;
        
        card.style.animation = 'muncul 5s ease-in-out';
        
        CardManager.setActiveImagesList(activeList);
        CardManager.setSequenceActive(true);
        CardManager.setSequenceStage(1);
    }
    
    function fadeOutShadowCard() {
        const card = CardManager.getCard();
        
        if (!CardManager.isSequenceCurrentlyActive() || card.style.display === 'none') return;
        
        clearShadowTimeouts();
        
        shadowWaitTimeout = setTimeout(() => {
            if (!CardManager.isSequenceCurrentlyActive() || card.style.display === 'none') return;
            
            card.style.animation = 'none';
            void card.offsetHeight;
            card.classList.add('card-fadeout');
            
            shadowFadeOutTimeout = setTimeout(() => {
                if (CardManager.isSequenceCurrentlyActive()) {
                    CardManager.hideCard();
                    card.classList.remove('card-fadeout');
                    CardManager.setSequenceActive(false);
                    CardManager.setSequenceStage(0);
                }
                shadowFadeOutTimeout = null;
            }, CONFIG.EFFECTS.SHADOW_FADE_DURATION);
            
            shadowWaitTimeout = null;
            
        }, CONFIG.EFFECTS.SHADOW_WAIT_BEFORE_FADEOUT);
    }
    
    function goToNextImageShadow() {
        if (!CardManager.isSequenceCurrentlyActive() || CardManager.getTotalImagesCount() === 0) return false;
        
        const currentIndex = CardManager.getCurrentImageIndex() + 1;
        CardManager.setCurrentImageIndex(currentIndex);
        
        if (currentIndex < CardManager.getTotalImagesCount()) {
            const card = CardManager.getCard();
            const activeList = CardManager.getActiveImagesListData();
            card.src = activeList[currentIndex].src;
            CardManager.setSequenceStage(currentIndex + 1);
            return true;
        }
        return false;
    }
    
    function handleCardTap() {
        if (!CardManager.isSequenceCurrentlyActive() || !CardManager.isCardVisible()) return;
        
        CardManager.clearTouchToChangeTimeout();
        
        const activeCount = CardManager.getTotalImagesCount();
        const currentStage = CardManager.getSequenceStage();
        
        if (currentStage < activeCount) {
            CardManager.setTouchToChangeTimeout(() => {
                if (CardManager.isSequenceCurrentlyActive()) {
                    goToNextImageShadow();
                }
                CardManager.clearTouchToChangeTimeout();
            }, CONFIG.EFFECTS.SHADOW_WAIT_AFTER_TAP);
        } 
        else if (currentStage === activeCount && activeCount > 0) {
            CardManager.clearTouchToChangeTimeout();
            fadeOutShadowCard();
        }
    }
    
    function clearShadowTimeouts() {
        if (shadowWaitTimeout) {
            clearTimeout(shadowWaitTimeout);
            shadowWaitTimeout = null;
        }
        if (shadowFadeOutTimeout) {
            clearTimeout(shadowFadeOutTimeout);
            shadowFadeOutTimeout = null;
        }
    }
    
    function clearAllTimeouts() {
        if (sequenceTimer) {
            clearTimeout(sequenceTimer);
            sequenceTimer = null;
        }
        CardManager.clearTouchToChangeTimeout();
        clearShadowTimeouts();
    }
    
    function hideIndicator() {
        const indicator = document.getElementById('card-indicator');
        if (indicator) indicator.classList.remove('visible');
    }
    
    return {
        trigger,
        handleCardTap,
        clearAllTimeouts
    };
})();
