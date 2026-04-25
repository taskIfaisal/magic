// ===== FLIP 3D EFFECT =====
// Spesifikasi:
// - Gambar 1 (front) dari preview-1
// - Gambar 2 (back) dari preview-2
// - Transisi 1→2: LANGSUNG flip 3D (tanpa delay 3 detik)
// - Transisi 2→3, 3→4, dst: delay 3 detik, ganti langsung (tanpa flip)
// - Setelah semua gambar habis: delay 3 detik → slide keluar ke atas

let flipAnimationTimeout = null;
let isFlipping = false;
let hasFlippedToSecond = false; // Flag apakah sudah flip ke gambar ke-2
let flipExitIndicatorTimeout = null;
let flipExitCardTimeout = null;
let isFlipAnimating = false;

// Mendapatkan gambar untuk sisi front (preview-1)
function getFrontImageSrc() {
    const preview1Img = preview1.querySelector('img');
    return preview1Img ? preview1Img.src : '';
}

// Mendapatkan gambar untuk sisi back (preview-2)
function getBackImageSrc() {
    const preview2Img = preview2.querySelector('img');
    return preview2Img ? preview2Img.src : '';
}

// Fungsi untuk membuat kartu memiliki 2 sisi (front dan back)
function setupFlipCard() {
    // Simpan posisi saat ini
    const currentPosX = posX;
    const currentPosY = posY;
    const currentScale = scale;
    const currentWidth = card.offsetWidth;
    const currentHeight = card.offsetHeight;
    
    // Hapus semua child
    while (card.firstChild) {
        card.removeChild(card.firstChild);
    }
    
    // Set style untuk card container
    card.style.transformStyle = 'preserve-3d';
    card.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)';
    card.style.position = 'absolute';
    card.style.width = currentWidth + 'px';
    card.style.height = currentHeight + 'px';
    card.style.display = 'block';
    card.style.maxWidth = currentCardSize + 'px';
    
    // Buat front side
    const frontDiv = document.createElement('div');
    frontDiv.className = 'card-front card-face';
    frontDiv.style.position = 'absolute';
    frontDiv.style.width = '100%';
    frontDiv.style.height = '100%';
    frontDiv.style.backfaceVisibility = 'hidden';
    frontDiv.style.backgroundSize = 'contain';
    frontDiv.style.backgroundRepeat = 'no-repeat';
    frontDiv.style.backgroundPosition = 'center';
    frontDiv.style.backgroundImage = `url('${getFrontImageSrc()}')`;
    frontDiv.style.borderRadius = '12px';
    
    // Buat back side
    const backDiv = document.createElement('div');
    backDiv.className = 'card-back card-face';
    backDiv.style.position = 'absolute';
    backDiv.style.width = '100%';
    backDiv.style.height = '100%';
    backDiv.style.backfaceVisibility = 'hidden';
    backDiv.style.transform = 'rotateY(180deg)';
    backDiv.style.backgroundSize = 'contain';
    backDiv.style.backgroundRepeat = 'no-repeat';
    backDiv.style.backgroundPosition = 'center';
    backDiv.style.backgroundImage = `url('${getBackImageSrc()}')`;
    backDiv.style.borderRadius = '12px';
    
    card.appendChild(frontDiv);
    card.appendChild(backDiv);
    
    // Kembalikan posisi
    card.style.transform = `translate(${currentPosX}px, ${currentPosY}px) scale(${currentScale})`;
}

// Kembalikan kartu ke mode normal (image biasa)
function teardownFlipCard() {
    if (!card) return;
    
    // Hapus class flip
    card.classList.remove('flip');
    isFlipping = false;
    
    // Ambil src dari front image
    const frontDiv = card.querySelector('.card-front');
    let currentSrc = '';
    if (frontDiv) {
        const bgImage = frontDiv.style.backgroundImage;
        currentSrc = bgImage.replace(/url\(["']?|["']?\)/g, '');
    }
    
    // Hapus innerHTML
    while (card.firstChild) {
        card.removeChild(card.firstChild);
    }
    
    // Reset style card
    card.style.transformStyle = '';
    card.style.transition = '';
    card.style.position = 'absolute';
    card.style.width = 'auto';
    card.style.height = 'auto';
    card.style.display = 'block';
    
    // Set gambar kembali
    if (currentSrc && currentSrc !== '') {
        card.src = currentSrc;
    }
    
    // Update transform
    updateCardTransform();
}

// Fungsi exit kartu ke atas (seperti skating)
function exitCardFlipUp() {
    if (card.style.display === 'none' || !isSequenceActive) return;
    
    isFlipAnimating = true;
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
        isFlipAnimating = false;
        isAnimatingMotion = false;
        
        // Clean up flip card structure
        teardownFlipCard();
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

function showCardFlip() {
    const activeList = getActiveImagesList();
    
    if (activeList.length === 0) {
        return;
    }
    
    // Reset flag
    hasFlippedToSecond = false;
    isFlipAnimating = false;
    
    // Setup flip card structure
    setupFlipCard();
    
    // Pastikan kartu tidak dalam keadaan flip
    card.classList.remove('flip');
    isFlipping = false;
    
    // Atur posisi kartu
    card.style.transition = 'none';
    card.style.left = '0';
    card.style.top = '0';
    card.style.display = 'block';
    card.style.position = 'absolute';
    card.style.visibility = 'visible';
    card.style.opacity = '1';
    
    const cardWidth = card.offsetWidth;
    const cardHeight = card.offsetHeight;
    
    const centerX = (window.innerWidth - cardWidth) / 2;
    const centerY = (window.innerHeight - cardHeight) / 2;
    
    posX = Math.round(centerX);
    posY = Math.round(centerY);
    
    card.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    
    // Setup active images list
    activeImagesList = activeList;
    isSequenceActive = true;
    sequenceStage = 1;
    currentCardImageIndex = 0;
}

function flipToSecondImage() {
    if (isFlipping) return false;
    if (hasFlippedToSecond) return false;
    if (!isSequenceActive) return false;
    
    // Cek apakah gambar ke-2 tersedia (preview-2 aktif)
    const backImageSrc = getBackImageSrc();
    if (!backImageSrc || backImageSrc === '' || activeImagesList.length < 2) {
        // Jika tidak ada gambar ke-2, langsung ke gambar ke-3 jika ada
        if (activeImagesList.length >= 3) {
            goToNextImageFlip(0);
            hasFlippedToSecond = true;
        } else if (activeImagesList.length === 2) {
            // Hanya ada 2 gambar, setelah flip selesai, schedule exit
            hasFlippedToSecond = true;
        }
        return false;
    }
    
    isFlipping = true;
    
    // Update back image dengan gambar preview-2
    const backDiv = card.querySelector('.card-back');
    if (backDiv) {
        backDiv.style.backgroundImage = `url('${backImageSrc}')`;
    }
    
    // Tambah class flip untuk animasi 3D
    card.classList.add('flip');
    
    // Setelah animasi flip selesai (0.6 detik)
    flipAnimationTimeout = setTimeout(() => {
        // Update current image index ke gambar ke-2
        currentCardImageIndex = 1;
        sequenceStage = 2;
        
        // Update front image dengan gambar ke-2 (setelah flip balik)
        const frontDiv = card.querySelector('.card-front');
        if (frontDiv) {
            frontDiv.style.backgroundImage = `url('${backImageSrc}')`;
        }
        
        // Hapus class flip untuk kembali ke posisi normal
        card.classList.remove('flip');
        
        // Tandai sudah melakukan flip ke gambar kedua
        hasFlippedToSecond = true;
        isFlipping = false;
        flipAnimationTimeout = null;
        
        // Jika hanya ada 2 gambar dan sudah flip, schedule exit
        if (activeImagesList.length === 2) {
            isSequenceActive = false;
            sequenceStage = 0;
            scheduleExitFlip();
        }
        
    }, 600);
    
    return true;
}

function goToNextImageFlip(currentIndex) {
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < activeImagesList.length) {
        // Update src gambar
        const newSrc = activeImagesList[nextIndex].src;
        
        // Update front side image
        const frontDiv = card.querySelector('.card-front');
        if (frontDiv) {
            frontDiv.style.backgroundImage = `url('${newSrc}')`;
        }
        
        currentCardImageIndex = nextIndex;
        sequenceStage = currentCardImageIndex + 1;
        return true;
    }
    return false;
}

// Handler untuk tap pada kartu saat effect flip aktif
function handleFlipCardTap() {
    if (!isSequenceActive || !isCardVisible()) return;
    if (isFlipAnimating) return;
    
    // Hapus timeout yang sedang berjalan
    if (touchToChangeTimeout) {
        clearTimeout(touchToChangeTimeout);
        touchToChangeTimeout = null;
    }
    
    // Cek apakah ini transisi dari gambar 1 ke gambar 2 (belum pernah flip)
    if (!hasFlippedToSecond && currentCardImageIndex === 0) {
        // Transisi 1 → 2: LANGSUNG flip (tanpa delay)
        flipToSecondImage();
        return;
    }
    
    // Untuk transisi selanjutnya (2→3, 3→4, dst): delay 3 detik
    const activeCount = activeImagesList.length;
    
    if (sequenceStage < activeCount) {
        touchToChangeTimeout = setTimeout(() => {
            if (isSequenceActive) {
                const success = goToNextImageFlip(currentCardImageIndex);
                if (!success) {
                    // Semua gambar sudah habis
                    isSequenceActive = false;
                    sequenceStage = 0;
                    scheduleExitFlip();
                }
            }
            touchToChangeTimeout = null;
        }, 3000);
    } else {
        // Semua gambar sudah habis
        isSequenceActive = false;
        sequenceStage = 0;
        scheduleExitFlip();
    }
}

function clearFlipTimeouts() {
    if (flipAnimationTimeout) {
        clearTimeout(flipAnimationTimeout);
        flipAnimationTimeout = null;
    }
    if (flipExitIndicatorTimeout) {
        clearTimeout(flipExitIndicatorTimeout);
        flipExitIndicatorTimeout = null;
    }
    if (flipExitCardTimeout) {
        clearTimeout(flipExitCardTimeout);
        flipExitCardTimeout = null;
    }
    isFlipping = false;
    if (card) card.classList.remove('flip');
}

// Reset flip effect untuk double tap baru
function resetFlipEffect() {
    // Bersihkan semua timeout
    clearFlipTimeouts();
    
    // Reset flag
    hasFlippedToSecond = false;
    isFlipAnimating = false;
    
    // Kembalikan kartu ke mode normal (jika sedang dalam mode flip card)
    if (card && card.querySelector('.card-front')) {
        teardownFlipCard();
    }
}

// Ekspos fungsi ke global
window.resetFlipEffect = resetFlipEffect;
window.clearFlipTimeouts = clearFlipTimeouts;
