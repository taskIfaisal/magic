// ===== SLIDER EFFECT =====
// Fungsi untuk Effect Slider (slide dari bawah ke tengah)

function showCardSlider() {
    const activeList = getActiveImagesList();
    
    if (activeList.length === 0) {
        return;
    }
    
    hasBeenTouched = false;

    if (touchToChangeTimeout) {
        clearTimeout(touchToChangeTimeout);
        touchToChangeTimeout = null;
    }

    if (isAnimating) return;
    isAnimating = true;
    
    clearAllTimeouts();
    
    currentCardImageIndex = 0;
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
        isAnimatingMotion = true;
        
        const cardRect = card.getBoundingClientRect();
        const cardWidth = cardRect.width;
        const cardHeight = cardRect.height;
        
        posX = (window.innerWidth / 2) - (cardWidth / 2);
        posY = window.innerHeight + 100;
        
        card.style.transition = 'none';
        card.style.transform = `translate(${posX}px, ${posY}px)`;
        
        void card.offsetHeight;
        
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.classList.add('card-visible');
        
        requestAnimationFrame(() => {
            card.classList.add('card-moving');
            card.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
            
            setTimeout(() => {
                posX = (window.innerWidth / 2) - (cardWidth / 2);
                posY = (window.innerHeight / 2) - (cardHeight / 2);
                
                card.style.transform = `translate(${posX}px, ${posY}px)`;
                
                setTimeout(() => {
                    isAnimating = false;
                    isAnimatingMotion = false;
                    card.classList.remove('card-moving');
                    
                    activeImagesList = activeList;
                    isSequenceActive = true;
                    sequenceStage = 1;
                }, 800);
            }, 50);
        });
    }
}
