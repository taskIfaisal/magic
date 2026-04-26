// ===== FLIP 3D EFFECT =====
// Menggunakan efek flip 3D dari contoh (front/back div terpisah)
// Flip hanya untuk transisi gambar 1 → gambar 2
// Setelah gambar 2, pergantian berikutnya normal (tanpa flip)

let flipAnimationTimeout = null;
let isFlipping = false;
let hasFlippedToSecond = false; // Flag apakah sudah flip ke gambar ke-2
let flipExitIndicatorTimeout = null;
let flipExitCardTimeout = null;
let isFlipAnimating = false;
let flipCardElement = null; // Referensi ke elemen card flip

// Mendapatkan gambar untuk sisi front (gambar 1)
function getFrontImageSrc() {
    const preview1Img = preview1.querySelector('img');
    return preview1Img ? preview1Img.src : '';
}

// Mendapatkan gambar untuk sisi back (gambar 2)
function getBackImageSrc() {
    const preview2Img = preview2.querySelector('img');
    return preview2Img ? preview2Img.src : '';
}

// Membuat struktur flip card seperti contoh
function setupFlipCardStructure() {
    // Simpan posisi saat ini
    const currentPosX = posX;
    const currentPosY = posY;
    const currentScale = scale;
    const currentWidth = card.offsetWidth;
    const currentHeight = card.offsetHeight;
    
    // Buat container baru
    const container = document.createElement('div');
    container.className = 'card-container';
    container.style.perspective = '1200px';
    container.style.display = 'inline-block';
    
    // Buat card flip
    const flipCard = document.createElement('div');
    flipCard.className = 'card';
    flipCard.style.width = currentWidth + 'px';
    flipCard.style.height = currentHeight + 'px';
    flipCard.style.position = 'relative';
    flipCard.style.transformStyle = 'preserve-3d';
    flipCard.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)';
    
    // Buat front side
    const frontDiv = document.createElement('div');
    frontDiv.className = 'card-face front';
    frontDiv.style.position = 'absolute';
    frontDiv.style.width = '100%';
    frontDiv.style.height = '100%';
    frontDiv.style.backfaceVisibility = 'hidden';
    frontDiv.style.backgroundSize = 'contain';
    frontDiv.style.backgroundRepeat = 'no-repeat';
    frontDiv.style.backgroundPosition = 'center';
    frontDiv.style.backgroundImage = `url('${getFrontImageSrc()}')`;
    
    // Buat back side
    const backDiv = document.createElement('div');
    backDiv.className = 'card-face back';
    backDiv.style.position = 'absolute';
    backDiv.style.width = '100%';
    backDiv.style.height = '100%';
    backDiv.style.backfaceVisibility = 'hidden';
    backDiv.style.transform = 'rotateY(180deg)';
    backDiv.style.backgroundSize = 'contain';
    backDiv.style.backgroundRepeat = 'no-repeat';
    backDiv.style.backgroundPosition = 'center';
    backDiv.style.backgroundImage = `url('${getBackImageSrc()}')`;
    
    flipCard.appendChild(frontDiv);
    flipCard.appendChild(backDiv);
    container.appendChild(flipCard);
    
    // Ganti card dengan container baru
    const parent = card.parentNode;
    const cardId = card.id;
    const cardStyle = card.style.cssText;
    
    parent.replaceChild(container, card);
    container.id = 'card-container';
    flipCard.id = cardId;
    flipCard.style.cssText = cardStyle;
    flipCard.style.width = currentWidth + 'px';
    flipCard.style.height = currentHeight + 'px';
    flipCard.style.position = 'absolute';
    flipCard.style.left = '0';
    flipCard.style.top = '0';
    flipCard.style.transform = `translate(${currentPosX}px, ${currentPosY}px) scale(${currentScale})`;
    
    // Update global card reference
    window.card = flipCard;
    card = flipCard;
    flipCardElement = flipCard;
    
    return { flipCard, frontDiv, backDiv };
}

// Kembalikan kartu ke mode biasa (img element)
function teardownFlipCardStructure() {
    if (!flipCardElement) return;
    
    // Ambil src dari front image
    const frontDiv = flipCardElement.querySelector('.front');
    let currentSrc = '';
    if (frontDiv) {
        const bgImage = frontDiv.style.backgroundImage;
        currentSrc = bgImage.replace(/url\(["']?|["']?\)/g, '');
    }
    
    // Ambil posisi saat ini
    const currentPosX = posX;
    const currentPosY = posY;
    const currentScale = scale;
    
    // Hapus container dan buat img baru
    const container = document.getElementById('card-container');
    if (container && container.parentNode) {
        const img = document.createElement('img');
        img.id = 'card';
        img.src = currentSrc;
        img.style.position = 'absolute';
        img.style.maxWidth = currentCardSize + 'px';
        img.style.transform = `translate(${currentPosX}px, ${currentPosY}px) scale(${currentScale})`;
        img.style.display = 'block';
        img.style.visibility = 'visible';
        img.style.opacity = '1';
        
        container.parentNode.replaceChild(img, container);
        
        // Update global card reference
        window.card = img;
        card = img;
        flipCardElement = null;
        
        updateCardTransform();
    }
}

function showCardFlip() {
    const activeList = getActiveImagesList();
    
    if (activeList.length === 0) {
        return;
    }
    
    // Reset flag
    hasFlippedToSecond = false;
    isFlipAnimating = false;
    isFlipping = false;
    
    // Setup flip card structure seperti contoh
    setupFlipCardStructure();
    
    // Pastikan kartu tidak dalam keadaan flip
    if (flipCardElement) {
        flipCardElement.classList.remove('flip');
    }
    
    // Atur posisi kartu
    const cardWidth = card.offsetWidth;
    const cardHeight = card.offsetHeight;
    
    const centerX = (window.innerWidth - cardWidth) / 2;
    const centerY = (window.innerHeight - cardHeight) / 2;
    
    posX = Math.round(centerX);
    posY = Math.round(centerY);
    
    card.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    card.style.opacity = '1';
    card.style.visibility = 'visible';
    
    // Setup active images list
    activeImagesList = activeList;
    isSequenceActive = true;
    sequenceStage = 1;
    currentCardImageIndex = 0;
}

// Fungsi flip 3D untuk transisi gambar 1 → gambar 2 (seperti contoh)
function flipToSecondImage() {
    if (isFlipping) return false;
    if (hasFlippedToSecond) return false;
    if (!isSequenceActive) return false;
    if (!flipCardElement) return false;
    
    // Cek apakah gambar ke-2 tersedia
    const backImageSrc = getBackImageSrc();
    if (!backImageSrc || backImageSrc === '' || activeImagesList.length < 2) {
        // Jika tidak ada gambar ke-2, langsung ke gambar ke-3
        if (activeImagesList.length >= 3) {
            goToNextImageFlipNormal(0);
            hasFlippedToSecond = true;
        } else if (activeImagesList.length === 2) {
            hasFlippedToSecond = true;
        }
        return false;
    }
    
    isFlipping = true;
    
    // Update back image dengan gambar preview-2
    const backDiv = flipCardElement.querySelector('.back');
    if (backDiv) {
        backDiv.style.backgroundImage = `url('${backImageSrc}')`;
    }
    
    // Tambah class flip untuk animasi 3D (seperti contoh)
    flipCardElement.classList.add('flip');
    
    // Setelah animasi flip selesai (0.6 detik)
    flipAnimationTimeout = setTimeout(() => {
        // Update current image index ke gambar ke-2
        currentCardImageIndex = 1;
        sequenceStage = 2;
        
        // Update front image dengan gambar ke-2 (setelah flip balik)
        const frontDiv = flipCardElement.querySelector('.front');
        if (frontDiv) {
            frontDiv.style.backgroundImage = `url('${backImageSrc}')`;
        }
        
        // Hapus class flip untuk kembali ke posisi normal
        flipCardElement.classList.remove('flip');
        
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

// Pergantian gambar normal (tanpa flip) untuk gambar ke-3, ke-4, dst
function goToNextImageFlipNormal(currentIndex) {
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < activeImagesList.length) {
        const newSrc = activeImagesList[nextIndex].src;
        
        // Update front image
        if (flipCardElement) {
            const frontDiv = flipCardElement.querySelector('.front');
            if (frontDiv) {
                frontDiv.style.backgroundImage = `url('${newSrc}')`;
            }
        } else {
            card.src = newSrc;
        }
        
        currentCardImageIndex = nextIndex;
        sequenceStage = currentCardImageIndex + 1;
        return true;
    }
    return false;
}

function exitCardFlipUp() {
    if (card.style.display === 'none') return;
    
    isAnimatingMotion = true;
    isFlipAnimating = true;
    
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
        isFlipAnimating = false;
        
        // Kembalikan ke struktur normal
        teardownFlipCardStructure();
    }, 500);
}

function scheduleExitFlip() {
    if (card.style.display === 'none' || !isSequenceActive) return;
    
    if (flipExitIndicatorTimeout) clearTimeout(flipExitIndicatorTimeout);
    if (flipExitCardTimeout) clearTimeout(flipExitCardTimeout);
    
    flipExitIndicatorTimeout = setTimeout(() => {
        if (isSequenceActive) showIndicator();
        flipExitIndicatorTimeout = null;
    }, 3000);
    
    flipExitCardTimeout = setTimeout(() => {
        if (isSequenceActive) {
            hideIndicator();
            exitCardFlipUp();
        }
        flipExitCardTimeout = null;
    }, 4000);
}

// Handler untuk tap pada kartu
function handleFlipCardTap() {
    if (!isSequenceActive || !isCardVisible()) return;
    if (isFlipAnimating) return;
    
    if (touchToChangeTimeout) clearTimeout(touchToChangeTimeout);
    
    // CEK: Apakah ini transisi dari gambar 1 ke gambar 2?
    if (!hasFlippedToSecond && currentCardImageIndex === 0) {
        // Transisi 1 → 2: LANGSUNG flip 3D (tanpa delay)
        flipToSecondImage();
        return;
    }
    
    // Untuk transisi selanjutnya (2→3, 3→4, dst): delay 3 detik, ganti langsung
    const activeCount = activeImagesList.length;
    
    if (sequenceStage < activeCount) {
        touchToChangeTimeout = setTimeout(() => {
            if (isSequenceActive) {
                const success = goToNextImageFlipNormal(currentCardImageIndex);
                if (!success) {
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
    if (touchToChangeTimeout) {
        clearTimeout(touchToChangeTimeout);
        touchToChangeTimeout = null;
    }
    isFlipping = false;
    if (flipCardElement) flipCardElement.classList.remove('flip');
}

function resetFlipEffect() {
    clearFlipTimeouts();
    hasFlippedToSecond = false;
    isFlipAnimating = false;
    teardownFlipCardStructure();
}

// Ekspos ke global
window.resetFlipEffect = resetFlipEffect;
window.clearFlipTimeouts = clearFlipTimeouts;
