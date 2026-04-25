// ===== STANDAR EFFECT =====
// Fungsi untuk Effect Standar (delay 1 detik, muncul langsung di tengah)

function showCardStandar() {
    const activeList = getActiveImagesList();
    
    if (activeList.length === 0) {
        return;
    }
    
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
    
    posX = Math.round(centerX);
    posY = Math.round(centerY);
    
    currentCardImageIndex = 0;
    card.src = activeList[0].src;
    
    card.style.opacity = '1';
    card.style.visibility = 'visible';
    card.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    
    activeImagesList = activeList;
    isSequenceActive = true;
    sequenceStage = 1;
}
