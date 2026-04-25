// ===== SLIDER EFFECT =====
const SliderEffect = (function() {
    let cardAppearTimeout = null;
    let indicatorTimeout = null;
    let isAnimating = false;
    
    function trigger() {
        clearAllTimeouts();
        hideIndicator();
        
        const totalDelay = CONFIG.EFFECTS.SLIDER_DELAY;
        const indicatorDelay = CONFIG.EFFECTS.SLIDER_INDICATOR_DELAY;
        
        indicatorTimeout = setTimeout(() => {
            showIndicator();
        }, indicatorDelay);
        
        cardAppearTimeout = setTimeout(() => {
            hideIndicator();
            showCardSlider();
        }, totalDelay);
    }
    
    function showCardSlider() {
        const activeList = CardManager.getActiveImagesList();
        
        if (activeList.length === 0) return;
        
        if (isAnimating) return;
        isAnimating = true;
        
        clearAllTimeouts();
        
        const card = CardManager.getCard();
        
        CardManager.setCurrentImageIndex(0);
        card.src = activeList[0].src;
        
        card.style.animation = 'none';
        card.style.opacity = '0';
        card.style.visibility = 'hidden';
        card.style.display = 'block';
        card.classList.remove('card-fadeout');
        card.style.left = '0';
        card.style.top = '0';
        card.style.right = 'auto';
        card.style.bottom = 'auto';
        card.style.margin = '0';
        
        card.classList.remove('card-moving', 'card-flipping', 'card-visible');
        
        requestAnimationFrame(() => {
            if (card.complete) {
                initCardAnimation();
            } else {
                card.onload = initCardAnimation;
                setTimeout(initCardAnimation, 500);
            }
        });
        
        function initCardAnimation() {
            CardManager.setAnimatingMotion(true);
            
            const cardWidth = card.offsetWidth;
            const cardHeight = card.offsetHeight;
            
            const startX = (window.innerWidth / 2) - (cardWidth / 2);
            const startY = window.innerHeight + 100;
            
            CardManager.setCardPosition(startX, startY);
            
            card.style.transition = 'none';
            CardManager.updateCardTransform();
            
            void card.offsetHeight;
            
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            card.classList.add('card-visible');
            
            requestAnimationFrame(() => {
                card.classList.add('card-moving');
                card.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
                
                setTimeout(() => {
                    const targetX = (window.innerWidth / 2) - (cardWidth / 2);
                    const targetY = (window.innerHeight / 2) - (cardHeight / 2);
                    
                    CardManager.setCardPosition(targetX, targetY);
                    CardManager.updateCardTransform();
                    
                    setTimeout(() => {
                        isAnimating = false;
                        CardManager.setAnimatingMotion(false);
                        card.classList.remove('card-moving');
                        
                        CardManager.setActiveImagesList(activeList);
                        CardManager.setSequenceActive(true);
                        CardManager.setSequenceStage(1);
                    }, 800);
                }, 50);
            });
        }
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
    
    function clearAllTimeouts() {
        if (cardAppearTimeout) {
            clearTimeout(cardAppearTimeout);
            cardAppearTimeout = null;
        }
        if (indicatorTimeout) {
            clearTimeout(indicatorTimeout);
            indicatorTimeout = null;
        }
        CardManager.clearTouchToChangeTimeout();
    }
    
    function showIndicator() {
        const indicator = document.getElementById('card-indicator');
        if (indicator) indicator.classList.add('visible');
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
