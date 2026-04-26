// ===== SHADOW EFFECT =====
// Fungsi untuk Effect Shadow (fade in 5 detik, fade out 5 detik)

function showCardShadow() {
    const activeList = getActiveImagesList();
    
    if (activeList.length === 0) {
        return;
    }
    
    if (shadowFadeOutTimeout) {
        clearTimeout(shadowFadeOutTimeout);
        shadowFadeOutTimeout = null;
    }
    if (shadowWaitTimeout) {
        clearTimeout(shadowWaitTimeout);
        shadowWaitTimeout = null;
    }
    
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
    
    posX = Math.round(centerX);
    posY = Math.round(centerY);
    
    currentCardImageIndex = 0;
    card.src = activeList[0].src;
    
    card.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    
    void card.offsetHeight;
    
    card.style.animation = 'muncul 5s ease-in-out';
    
    activeImagesList = activeList;
    isSequenceActive = true;
    sequenceStage = 1;
}

function fadeOutShadowCard() {
    if (!isSequenceActive || card.style.display === 'none') return;
    
    if (shadowWaitTimeout) {
        clearTimeout(shadowWaitTimeout);
        shadowWaitTimeout = null;
    }
    if (shadowFadeOutTimeout) {
        clearTimeout(shadowFadeOutTimeout);
        shadowFadeOutTimeout = null;
    }
    
    shadowWaitTimeout = setTimeout(() => {
        if (!isSequenceActive || card.style.display === 'none') return;
        
        card.style.animation = 'none';
        
        void card.offsetHeight;
        
        card.classList.add('card-fadeout');
        
        shadowFadeOutTimeout = setTimeout(() => {
            if (isSequenceActive) {
                hideCard();
                card.classList.remove('card-fadeout');
                isSequenceActive = false;
                sequenceStage = 0;
            }
            shadowFadeOutTimeout = null;
        }, 5000);
        
        shadowWaitTimeout = null;
        
    }, 3000);
}

function goToNextImageShadow() {
    if (!isSequenceActive || activeImagesList.length === 0) return false;
    
    currentCardImageIndex++;
    
    if (currentCardImageIndex < activeImagesList.length) {
        card.src = activeImagesList[currentCardImageIndex].src;
        sequenceStage = currentCardImageIndex + 1;
        return true;
    } else {
        return false;
    }
}
