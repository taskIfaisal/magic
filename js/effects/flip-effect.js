// ===== FLIP 3D EFFECT =====
// Sederhana seperti effect standar, tapi kartu keluar ke atas setelah gambar terakhir

let flipExitIndicatorTimeout = null;
let flipExitCardTimeout = null;

function showCardFlip() {
    const activeList = getActiveImagesList();
    
    if (activeList.length === 0) {
        return;
    }
    
    // Hapus struktur flip sebelumnya jika ada
    if (card.querySelector('.card-front')) {
        while (card.firstChild) {
            card.removeChild(card.firstChild);
        }
        card.style.transformStyle = '';
        card.style.transition = '';
    }
    
    // Reset kartu ke mode normal
    card.style.transition = 'none';
    card.style.transform = 'none';
    card.style.left = '0';
    card.style.top = '0';
    card.style.display = 'block';
    card.style.animation = 'none';
    card.classList.remove('card-fadeout');
    card.classList.remove('card-flipping');
    
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

function goToNextImageFlip() {
    if (!isSequenceActive || activeImagesList.length === 0) return false;
    
    const nextIndex = currentCardImageIndex + 1;
    
    if (nextIndex < activeImagesList.length) {
        card.src = activeImagesList[nextIndex].src;
        currentCardImageIndex = nextIndex;
        sequenceStage = currentCardImageIndex + 1;
        return true;
    }
    return false;
}

function exitCardFlipUp() {
    if (card.style.display === 'none' || !isSequenceActive) return;
    
    isAnimatingMotion = true;
    
    card.classList.add('card-moving');
    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
    
    const targetY = -card.offsetHeight - 100;
    card.style.transform = `translate(${posX}px, ${targetY}px) scale(${scale})`;
    
    setTimeout(() => {
        hideCard();
        card.classList.remove('card-moving');
        isSequenceActive = false;
        sequenceStage = 0;
        isAnimatingMotion = false;
    }, 500);
}

function scheduleExitFlip() {
    if (card.style.display === 'none' || !isSequenceActive) return;
    
    if (flipExitIndicatorTimeout) {
        clearTimeout(flipExitIndicatorTimeout);
        flipExitIndicatorTimeout = null;
    }
    if (flipExitCardTimeout) {
        clearTimeout(flipExitCardTimeout);
        flipExitCardTimeout = null;
    }
    
    // Tampilkan indikator setelah 3 detik
    flipExitIndicatorTimeout = setTimeout(() => {
        if (isSequenceActive) {
            showIndicator();
        }
        flipExitIndicatorTimeout = null;
    }, 3000);
    
    // Exit kartu setelah 4 detik
    flipExitCardTimeout = setTimeout(() => {
        if (isSequenceActive) {
            hideIndicator();
            exitCardFlipUp();
        }
        flipExitCardTimeout = null;
    }, 4000);
}

function handleFlipCardTap() {
    if (!isSequenceActive || !isCardVisible()) return;
    
    if (touchToChangeTimeout) {
        clearTimeout(touchToChangeTimeout);
    }
    
    const activeCount = activeImagesList.length;
    
    if (sequenceStage < activeCount) {
        // Masih ada gambar berikutnya
        touchToChangeTimeout = setTimeout(() => {
            if (isSequenceActive) {
                if (!goToNextImageFlip()) {
                    isSequenceActive = false;
                    sequenceStage = 0;
                }
            }
            touchToChangeTimeout = null;
        }, 3000);
    } else {
        // Gambar terakhir sudah tampil, schedule exit ke atas
        isSequenceActive = false;
        sequenceStage = 0;
        scheduleExitFlip();
    }
}

function clearFlipTimeouts() {
    if (flipExitIndicatorTimeout) {
        clearTimeout(flipExitIndicatorTimeout);
        flipExitIndicatorTimeout = null;
    }
    if (flipExitCardTimeout) {
        clearTimeout(flipExitCardTimeout);
        flipExitCardTimeout = null;
    }
    if (touchToChangeTimeout) {
        clearTimeout(touchToChangeTimeout);
        touchToChangeTimeout = null;
    }
}

function resetFlipEffect() {
    clearFlipTimeouts();
    // Kembalikan kartu ke mode normal jika perlu
    if (card && card.querySelector('.card-front')) {
        while (card.firstChild) {
            card.removeChild(card.firstChild);
        }
        card.style.transformStyle = '';
        card.style.transition = '';
    }
}

// Ekspos ke global
window.resetFlipEffect = resetFlipEffect;
window.clearFlipTimeouts = clearFlipTimeouts;
