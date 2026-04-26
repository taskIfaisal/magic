// ===== FLIP 3D EFFECT =====
// Sederhana seperti effect standar, tapi setelah gambar terakhir kartu keluar ke atas

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
    if (card.style.display === 'none') return;
    
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
    
    // Bersihkan timeout sebelumnya
    if (flipExitIndicatorTimeout) {
        clearTimeout(flipExitIndicatorTimeout);
        flipExitIndicatorTimeout = null;
    }
    if (flipExitCardTimeout) {
        clearTimeout(flipExitCardTimeout);
        flipExitCardTimeout = null;
    }
    
    // Tampilkan indikator setelah 3 detik (sama seperti skating)
    flipExitIndicatorTimeout = setTimeout(() => {
        if (isSequenceActive) {
            showIndicator();
        }
        flipExitIndicatorTimeout = null;
    }, 3000);
    
    // Exit kartu setelah 4 detik (sama seperti skating)
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
    
    // Hapus timeout yang sedang berjalan untuk exit
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
    }
    
    const activeCount = activeImagesList.length;
    
    // Cek apakah ini gambar terakhir
    const isLastImage = (sequenceStage === activeCount);
    
    if (sequenceStage < activeCount) {
        // Masih ada gambar berikutnya
        touchToChangeTimeout = setTimeout(() => {
            if (isSequenceActive) {
                goToNextImageFlip();
                
                // Setelah ganti gambar, cek apakah itu gambar terakhir
                if (sequenceStage === activeCount) {
                    // Ini gambar terakhir, schedule exit
                    scheduleExitFlip();
                }
            }
            touchToChangeTimeout = null;
        }, 3000);
    } else if (isLastImage && activeCount > 0) {
        // Ini gambar terakhir, langsung schedule exit (tanpa perlu tap lagi)
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
