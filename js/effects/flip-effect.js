// ===== FLIP 3D EFFECT =====
// Dasar dari Effect Standar, dengan tambahan animasi flip 3D saat ganti gambar

let flipAnimationTimeout = null;
let isFlipping = false;

function showCardFlip() {
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

function flipToNextImage() {
    if (!isSequenceActive || activeImagesList.length === 0) return false;
    
    const nextIndex = currentCardImageIndex + 1;
    
    if (nextIndex < activeImagesList.length) {
        // Mulai animasi flip
        if (isFlipping) return false;
        isFlipping = true;
        
        // Tambah class flip
        card.classList.add('card-flipping');
        
        // Di tengah animasi flip (setelah 500ms), ganti gambar
        flipAnimationTimeout = setTimeout(() => {
            // Ganti gambar di tengah flip
            card.src = activeImagesList[nextIndex].src;
            currentCardImageIndex = nextIndex;
            sequenceStage = currentCardImageIndex + 1;
            
            // Hapus class flip setelah animasi selesai
            setTimeout(() => {
                card.classList.remove('card-flipping');
                isFlipping = false;
                flipAnimationTimeout = null;
            }, 500);
            
        }, 500);
        
        return true;
    }
    return false;
}

// Trigger untuk flip effect saat tap pada kartu
function handleFlipCardTap() {
    if (!isSequenceActive || !isCardVisible()) return;
    
    if (touchToChangeTimeout) {
        clearTimeout(touchToChangeTimeout);
    }
    
    const activeCount = activeImagesList.length;
    
    if (sequenceStage < activeCount) {
        touchToChangeTimeout = setTimeout(() => {
            if (isSequenceActive) {
                flipToNextImage();
            }
            touchToChangeTimeout = null;
        }, 3000);
    } else {
        isSequenceActive = false;
        sequenceStage = 0;
    }
}

// Membersihkan timeout untuk flip effect
function clearFlipTimeouts() {
    if (flipAnimationTimeout) {
        clearTimeout(flipAnimationTimeout);
        flipAnimationTimeout = null;
    }
    isFlipping = false;
    if (card) card.classList.remove('card-flipping');
}
