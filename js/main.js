// ===== MAIN APPLICATION =====
// Elements
const background = document.getElementById('background');
let card = document.getElementById('card');
const settings = document.getElementById('settings');
const bgUpload = document.getElementById('bg-upload');
const cardUpload = document.getElementById('card-upload');
const closeSettingsBtn = document.getElementById('close-settings');
const sensorPermissionBtn = document.getElementById('sensor-permission');
const cardIndicator = document.getElementById('card-indicator');

const cardSizeSlider = document.getElementById('card-size-slider');
const sizeValue = document.getElementById('size-value');

const mainCardPreview = document.getElementById('main-card-preview');
const preview1 = document.getElementById('preview-1');
const preview2 = document.getElementById('preview-2');
const preview3 = document.getElementById('preview-3');
const preview4 = document.getElementById('preview-4');

const effectStandarCheckbox = document.getElementById('effect-standar');
const shadowEffectCheckbox = document.getElementById('shadow-effect');
const effectSliderCheckbox = document.getElementById('effect-slider');
const effectSkatingCheckbox = document.getElementById('effect-skating');
const effectFlipCheckbox = document.getElementById('effect-flip');
const sensorGerakCheckbox = document.getElementById('sensor-gerak');

const removeBgBtn = document.getElementById('remove-bg-btn');
const downloadBtn = document.getElementById('download-result-btn');
const removeBgStatus = document.getElementById('remove-bg-status');

const GITHUB_API_URL = 'https://api.github.com/repos/taskIfaisal/sw/contents/images';

let currentFolder = null;
let selectedImage = null;
let modalElement = null;
let activePreview = 1;

let activeImages = {
    1: true, 2: true, 3: true, 4: true
};

let posX = window.innerWidth / 2 - 100;
let posY = window.innerHeight + 200;
let scale = 1;
let isDragging = false;
let startX, startY;
let velocityX = 0;
let velocityY = 0;
let lastPosX = 0;
let lastPosY = 0;
let lastTime = 0;

let smoothBeta = 0;
let smoothGamma = 0;
const sensitivity = 0.5;
const smoothing = 0.2;
let isSensorEnabled = false;
let isSensorActive = true;
let isAnimatingMotion = false;

let sequenceTimer = null;
let sequenceStage = 0;
let isSequenceActive = false;
let activeImagesList = [];

let touchToChangeTimeout = null;

let indicatorTimeout = null;
let cardAppearTimeout = null;
let isAnimating = false;
let hasBeenTouched = false;
let currentCardImageIndex = 0;

let exitIndicatorTimeout = null;
let exitCardTimeout = null;

// Variabel untuk Shadow Effect
let shadowFadeOutTimeout = null;
let shadowWaitTimeout = null;

const STORAGE_KEY = 'magic_card_data';

loadFromStorage();

let currentCardSize = parseInt(localStorage.getItem('card_size')) || 200;

card.style.maxWidth = currentCardSize + 'px';
sizeValue.textContent = currentCardSize + 'px';
cardSizeSlider.value = currentCardSize;

function updatePreviewCardSize() {
    mainCardPreview.style.width = currentCardSize + 'px';
    mainCardPreview.style.height = 'auto';
    mainCardPreview.style.position = 'absolute';
    mainCardPreview.style.top = '30px';
    mainCardPreview.style.left = '50%';
    mainCardPreview.style.transform = 'translateX(-50%)';
}

function updateMainCardPreview() {
    mainCardPreview.src = card.src;
}

updatePreviewCardSize();
updateMainCardPreview();

cardSizeSlider.addEventListener('input', (e) => {
    const newSize = e.target.value;
    sizeValue.textContent = newSize + 'px';
    card.style.maxWidth = newSize + 'px';
    
    currentCardSize = parseInt(newSize);
    updatePreviewCardSize();
    
    if (card.style.display !== 'none') {
        const oldWidth = card.offsetWidth;
        setTimeout(() => {
            const newWidth = card.offsetWidth;
            posX = posX - (newWidth - oldWidth) / 2;
            applyBounds();
            updateCardTransform();
        }, 10);
    }
});

cardSizeSlider.addEventListener('change', (e) => {
    localStorage.setItem('card_size', e.target.value);
    currentCardSize = parseInt(e.target.value);
    autoSave();
});

updateCardTransform();

document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

initSensor();

// Keyboard Input Handler
function handleTapOne() {
    if (card.style.display !== 'none' && card.style.visibility === 'visible') {
        triggerCardTap();
    }
}

function handleTapTwo() {
    triggerDoubleTapEffect();
}

function triggerCardTap() {
    if (!isSequenceActive || card.style.display === 'none' || card.style.visibility !== 'visible') {
        return;
    }
    
    if (touchToChangeTimeout) {
        clearTimeout(touchToChangeTimeout);
    }
    
    const activeCount = activeImagesList.length;
    
    if (shadowEffectCheckbox.checked) {
        if (sequenceStage < activeCount) {
            touchToChangeTimeout = setTimeout(() => {
                if (isSequenceActive) {
                    goToNextImageShadow();
                }
                touchToChangeTimeout = null;
            }, 3000);
        } 
        else if (sequenceStage === activeCount && activeCount > 0) {
            if (touchToChangeTimeout) clearTimeout(touchToChangeTimeout);
            fadeOutShadowCard();
        }
    } 
    else if (effectStandarCheckbox.checked || effectSliderCheckbox.checked) {
        if (sequenceStage < activeCount) {
            touchToChangeTimeout = setTimeout(() => {
                if (isSequenceActive) {
                    if (!goToNextImage()) {
                        isSequenceActive = false;
                        sequenceStage = 0;
                    }
                }
                touchToChangeTimeout = null;
            }, 3000);
        } else {
            isSequenceActive = false;
            sequenceStage = 0;
        }
    }
    else if (effectSkatingCheckbox.checked) {
        if (sequenceStage < activeCount) {
            touchToChangeTimeout = setTimeout(() => {
                if (isSequenceActive) {
                    goToNextImage();
                }
                touchToChangeTimeout = null;
            }, 3000);
        } 
        else if (sequenceStage === activeCount && activeCount > 0) {
            scheduleExitSkating();
        }
    }
    else if (effectFlipCheckbox && effectFlipCheckbox.checked) {
        if (typeof handleFlipCardTap === 'function') {
            handleFlipCardTap();
        } else {
            // Fallback ke standar
            if (sequenceStage < activeCount) {
                touchToChangeTimeout = setTimeout(() => {
                    if (isSequenceActive) {
                        if (!goToNextImage()) {
                            isSequenceActive = false;
                            sequenceStage = 0;
                        }
                    }
                    touchToChangeTimeout = null;
                }, 3000);
            } else {
                isSequenceActive = false;
                sequenceStage = 0;
            }
        }
    }
}

// ===== DOUBLE TAP EFFECT HANDLER =====
function triggerDoubleTapEffect() {
    // Bersihkan semua timeout yang berjalan
    clearAllTimeouts();
    hideIndicator();
    
    // Reset flip effect jika ada
    if (typeof resetFlipEffect === 'function') {
        resetFlipEffect();
    }
    
    // CEK EFEK SHADOW
    if (shadowEffectCheckbox.checked) {
        isSequenceActive = true;
        sequenceStage = 1;
        
        sequenceTimer = setTimeout(() => {
            if (isSequenceActive) {
                showCardShadow();
            }
            sequenceTimer = null;
        }, 5000);
        
    } 
    // CEK EFEK STANDAR
    else if (effectStandarCheckbox.checked) {
        isSequenceActive = false;
        
        sequenceTimer = setTimeout(() => {
            showCardStandar();
            sequenceTimer = null;
        }, 1000);
        
    } 
    // CEK EFEK SLIDER
    else if (effectSliderCheckbox.checked) {
        const totalDelay = 4000;
        const indicatorDelay = 3000;
        
        indicatorTimeout = setTimeout(() => {
            showIndicator();
        }, indicatorDelay);
        
        cardAppearTimeout = setTimeout(() => {
            hideIndicator();
            showCardSlider();
        }, totalDelay);
        
    } 
    // CEK EFEK SKATING
    else if (effectSkatingCheckbox.checked) {
        const totalDelay = 4000;
        const indicatorDelay = 3000;
        
        indicatorTimeout = setTimeout(() => {
            showIndicator();
        }, indicatorDelay);
        
        cardAppearTimeout = setTimeout(() => {
            hideIndicator();
            showCardSkating();
        }, totalDelay);
        
    } 
    // CEK EFEK FLIP 3D
    else if (effectFlipCheckbox && effectFlipCheckbox.checked) {
        isSequenceActive = false;
        
        sequenceTimer = setTimeout(() => {
            showCardFlip();
            sequenceTimer = null;
        }, 1000);
    }
    
    // Jika tidak ada efek yang dipilih, lakukan efek standar default
    else {
        isSequenceActive = false;
        
        sequenceTimer = setTimeout(() => {
            showCardStandar();
            sequenceTimer = null;
        }, 1000);
    }
}

// ===== CLEAR ALL TIMEOUTS =====
function clearAllTimeouts() {
    // Timeout untuk sequence timer (double tap delay)
    if (sequenceTimer) {
        clearTimeout(sequenceTimer);
        sequenceTimer = null;
    }
    
    // Timeout untuk touch to change (pergantian gambar setelah tap)
    if (touchToChangeTimeout) {
        clearTimeout(touchToChangeTimeout);
        touchToChangeTimeout = null;
    }
    
    // Timeout untuk indicator (titik kecil di pojok)
    if (indicatorTimeout) {
        clearTimeout(indicatorTimeout);
        indicatorTimeout = null;
    }
    
    // Timeout untuk card appear (kemunculan kartu)
    if (cardAppearTimeout) {
        clearTimeout(cardAppearTimeout);
        cardAppearTimeout = null;
    }
    
    // Timeout untuk exit indicator (skating)
    if (exitIndicatorTimeout) {
        clearTimeout(exitIndicatorTimeout);
        exitIndicatorTimeout = null;
    }
    
    // Timeout untuk exit card (skating)
    if (exitCardTimeout) {
        clearTimeout(exitCardTimeout);
        exitCardTimeout = null;
    }
    
    // Timeout untuk shadow effect fade out
    if (shadowFadeOutTimeout) {
        clearTimeout(shadowFadeOutTimeout);
        shadowFadeOutTimeout = null;
    }
    
    // Timeout untuk shadow effect wait
    if (shadowWaitTimeout) {
        clearTimeout(shadowWaitTimeout);
        shadowWaitTimeout = null;
    }
    
    // Timeout untuk flip effect
    if (typeof clearFlipTimeouts === 'function') {
        clearFlipTimeouts();
    }
    
    // Hentikan animasi yang sedang berjalan
    isAnimating = false;
    isAnimatingMotion = false;
}

// Keyboard event listener
document.addEventListener('keydown', function(event) {
    if (event.key === '1' || event.key === '2') {
        event.preventDefault();
        
        if (event.key === '1') {
            handleTapOne();
        } else if (event.key === '2') {
            handleTapTwo();
        }
    }
});

function getActiveImagesList() {
    const list = [];
    if (activeImages[1]) list.push({ index: 1, element: preview1, src: getPreviewSrc(1) });
    if (activeImages[2]) list.push({ index: 2, element: preview2, src: getPreviewSrc(2) });
    if (activeImages[3]) list.push({ index: 3, element: preview3, src: getPreviewSrc(3) });
    if (activeImages[4]) list.push({ index: 4, element: preview4, src: getPreviewSrc(4) });
    return list;
}

function getPreviewSrc(index) {
    const preview = document.getElementById(`preview-${index}`);
    const img = preview.querySelector('img');
    return img ? img.src : '';
}

function updateActivePreviewStyles() {
    [preview1, preview2, preview3, preview4].forEach((preview, idx) => {
        const index = idx + 1;
        if (activeImages[index]) {
            preview.classList.add('active');
        } else {
            preview.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.preview-toggle').forEach(toggle => {
        const toggleIndex = parseInt(toggle.dataset.toggle);
        if (activeImages[toggleIndex]) {
            toggle.classList.remove('inactive');
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
            toggle.classList.add('inactive');
        }
    });
}

async function loadRootFolders() {
    try {
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        const folders = data.filter(item => item.type === "dir");
        
        folders.sort((a, b) => {
            return a.name.localeCompare(b.name, undefined, { 
                numeric: true,
                sensitivity: 'base' 
            });
        });
        
        return folders;
    } catch (error) {
        console.error('Error loading root folders:', error);
        return [];
    }
}

async function loadFolderContents(folderName) {
    try {
        const folderUrl = `${GITHUB_API_URL}/${folderName}`;
        const response = await fetch(folderUrl);
        if (!response.ok) throw new Error('Failed to fetch folder');
        
        const data = await response.json();
        
        const images = data.filter(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            return ['png', 'jpg', 'jpeg', 'gif'].includes(ext);
        });
        
        images.sort((a, b) => {
            return a.name.localeCompare(b.name, undefined, { 
                numeric: true,
                sensitivity: 'base' 
            });
        });
        
        return images;
    } catch (error) {
        console.error('Error loading folder contents:', error);
        return [];
    }
}

function showGithubModal(previewNumber) {
    activePreview = previewNumber;
    selectedImage = null;
    currentFolder = null;
    
    modalElement = document.createElement('div');
    modalElement.className = 'github-modal';
    modalElement.innerHTML = `
        <div class="modal-header">
            <h3>📁 Pilih Gambar untuk Preview ${previewNumber}</h3>
            <button id="close-modal">✕</button>
        </div>
        <div id="modal-content">
            <div class="loading">Loading folders from GitHub...</div>
        </div>
    `;
    
    document.body.appendChild(modalElement);
    
    document.getElementById('close-modal').addEventListener('click', () => {
        document.body.removeChild(modalElement);
        modalElement = null;
    });
    
    renderFolders();
}

async function renderFolders() {
    const contentElement = document.getElementById('modal-content');
    
    const folders = await loadRootFolders();
    
    if (folders.length === 0) {
        contentElement.innerHTML = '<div class="error-msg">Tidak ada folder ditemukan</div>';
        return;
    }
    
    let html = '<div class="albums-grid">';
    
    folders.forEach(folder => {
        html += `
            <div class="album-item" onclick="window.openFolder('${folder.name}')">
                <div class="folder-icon">📁</div>
                <div class="folder-name">${folder.name}</div>
            </div>
        `;
    });
    
    html += '</div>';
    contentElement.innerHTML = html;
}

window.openFolder = async function(folderName) {
    currentFolder = folderName;
    selectedImage = null;
    
    const contentElement = document.getElementById('modal-content');
    contentElement.innerHTML = '<div class="loading">Loading images...</div>';
    
    const images = await loadFolderContents(folderName);
    
    if (images.length === 0) {
        contentElement.innerHTML = `
            <div class="folder-header">
                <button class="back-button" onclick="window.goBackToFolders()">← Back</button>
                <h3>${folderName}</h3>
            </div>
            <div class="error-msg">Tidak ada gambar dalam folder ini</div>
        `;
        return;
    }
    
    let html = `
        <div class="folder-header">
            <button class="back-button" onclick="window.goBackToFolders()">← Back</button>
            <h3>${folderName}</h3>
        </div>
        <div class="image-grid">
    `;
    
    images.forEach(img => {
        const downloadUrl = img.download_url || `https://raw.githubusercontent.com/taskIfaisal/sw/main/images/${folderName}/${img.name}`;
        
        html += `
            <div class="grid-item" data-url="${downloadUrl}">
                <img src="${downloadUrl}" alt="${img.name}" loading="lazy">
            </div>
        `;
    });
    
    html += '</div>';
    contentElement.innerHTML = html;
    
    document.querySelectorAll('.grid-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const imageUrl = this.dataset.url;
            
            const previewBox = document.getElementById(`preview-${activePreview}`);
            const previewImg = previewBox.querySelector('img');
            previewImg.src = imageUrl;
            
            if (activePreview === 1) {
                updateCardImage(imageUrl);
            }
            
            document.querySelectorAll('.preview-box').forEach(p => p.classList.remove('selected'));
            previewBox.classList.add('selected');
            
            autoSave();
            
            document.body.removeChild(modalElement);
            modalElement = null;
        });
    });
};

window.goBackToFolders = function() {
    currentFolder = null;
    selectedImage = null;
    
    renderFolders();
};

preview1.addEventListener('click', (e) => {
    if (!e.target.classList.contains('preview-toggle')) {
        showGithubModal(1);
    }
});

preview2.addEventListener('click', (e) => {
    if (!e.target.classList.contains('preview-toggle')) {
        showGithubModal(2);
    }
});

preview3.addEventListener('click', (e) => {
    if (!e.target.classList.contains('preview-toggle')) {
        showGithubModal(3);
    }
});

preview4.addEventListener('click', (e) => {
    if (!e.target.classList.contains('preview-toggle')) {
        showGithubModal(4);
    }
});

document.querySelectorAll('.preview-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const previewIndex = parseInt(toggle.dataset.toggle);
        
        activeImages[previewIndex] = !activeImages[previewIndex];
        
        updateActivePreviewStyles();
        
        autoSave();
    });
});

function updateCardImage(imageSrc) {
    const preview1Img = preview1.querySelector('img');
    if (preview1Img) {
        preview1Img.src = imageSrc;
    }
    
    card.src = imageSrc;
    
    mainCardPreview.src = imageSrc;
    updateMainCardPreview();
    
    scale = 1;
    updateCardTransform();
    
    autoSave();
    
    updateDownloadButtonState();
}

function loadFromStorage() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const data = JSON.parse(savedData);
            
            if (data.background) {
                background.style.backgroundImage = `url(${data.background})`;
            }
            
            if (data.effectStandar !== undefined) effectStandarCheckbox.checked = data.effectStandar;
            if (data.shadowEffect !== undefined) shadowEffectCheckbox.checked = data.shadowEffect;
            if (data.effectSlider !== undefined) effectSliderCheckbox.checked = data.effectSlider;
            if (data.effectSkating !== undefined) effectSkatingCheckbox.checked = data.effectSkating;
            if (data.effectFlip !== undefined && effectFlipCheckbox) effectFlipCheckbox.checked = data.effectFlip;
            if (data.sensorGerak !== undefined) {
                sensorGerakCheckbox.checked = data.sensorGerak;
                isSensorActive = data.sensorGerak;
            }
            
            if (data.activeImages) activeImages = data.activeImages;
            
            if (data.preview1) {
                const preview1Img = preview1.querySelector('img');
                if (preview1Img) preview1Img.src = data.preview1;
            }
            if (data.preview2) {
                const preview2Img = preview2.querySelector('img');
                if (preview2Img) preview2Img.src = data.preview2;
            }
            if (data.preview3) {
                const preview3Img = preview3.querySelector('img');
                if (preview3Img) preview3Img.src = data.preview3;
            }
            if (data.preview4) {
                const preview4Img = preview4.querySelector('img');
                if (preview4Img) preview4Img.src = data.preview4;
            }
            
            if (data.preview1) {
                card.src = data.preview1;
                mainCardPreview.src = data.preview1;
                updateMainCardPreview();
            }
        }
        
        const savedSize = localStorage.getItem('card_size');
        if (savedSize) {
            currentCardSize = parseInt(savedSize);
            card.style.maxWidth = currentCardSize + 'px';
            cardSizeSlider.value = currentCardSize;
            sizeValue.textContent = currentCardSize + 'px';
            updatePreviewCardSize();
        }
        
        updateActivePreviewStyles();
        
    } catch (error) {
        console.error('Error loading from storage:', error);
    }
}

function saveToStorage() {
    try {
        const preview1Img = preview1.querySelector('img');
        const preview2Img = preview2.querySelector('img');
        const preview3Img = preview3.querySelector('img');
        const preview4Img = preview4.querySelector('img');
        
        const data = {
            background: background.style.backgroundImage.replace('url("', '').replace('")', ''),
            effectStandar: effectStandarCheckbox.checked,
            shadowEffect: shadowEffectCheckbox.checked,
            effectSlider: effectSliderCheckbox.checked,
            effectSkating: effectSkatingCheckbox.checked,
            effectFlip: effectFlipCheckbox ? effectFlipCheckbox.checked : false,
            sensorGerak: sensorGerakCheckbox.checked,
            activeImages: activeImages,
            preview1: preview1Img ? preview1Img.src : '',
            preview2: preview2Img ? preview2Img.src : '',
            preview3: preview3Img ? preview3Img.src : '',
            preview4: preview4Img ? preview4Img.src : ''
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to storage:', error);
    }
}

function autoSave() {
    saveToStorage();
}

// Effect checkboxes mutual exclusion
effectStandarCheckbox.addEventListener('change', (e) => {
    if (effectStandarCheckbox.checked) {
        shadowEffectCheckbox.checked = false;
        effectSliderCheckbox.checked = false;
        effectSkatingCheckbox.checked = false;
        if (effectFlipCheckbox) effectFlipCheckbox.checked = false;
    }
    autoSave();
});

shadowEffectCheckbox.addEventListener('change', (e) => {
    if (shadowEffectCheckbox.checked) {
        effectStandarCheckbox.checked = false;
        effectSliderCheckbox.checked = false;
        effectSkatingCheckbox.checked = false;
        if (effectFlipCheckbox) effectFlipCheckbox.checked = false;
    }
    autoSave();
});

effectSliderCheckbox.addEventListener('change', (e) => {
    if (effectSliderCheckbox.checked) {
        effectStandarCheckbox.checked = false;
        shadowEffectCheckbox.checked = false;
        effectSkatingCheckbox.checked = false;
        if (effectFlipCheckbox) effectFlipCheckbox.checked = false;
    }
    autoSave();
});

effectSkatingCheckbox.addEventListener('change', (e) => {
    if (effectSkatingCheckbox.checked) {
        effectStandarCheckbox.checked = false;
        shadowEffectCheckbox.checked = false;
        effectSliderCheckbox.checked = false;
        if (effectFlipCheckbox) effectFlipCheckbox.checked = false;
    }
    autoSave();
});

if (effectFlipCheckbox) {
    effectFlipCheckbox.addEventListener('change', (e) => {
        if (effectFlipCheckbox.checked) {
            effectStandarCheckbox.checked = false;
            shadowEffectCheckbox.checked = false;
            effectSliderCheckbox.checked = false;
            effectSkatingCheckbox.checked = false;
        }
        autoSave();
    });
}

sensorGerakCheckbox.addEventListener('change', (e) => {
    isSensorActive = sensorGerakCheckbox.checked;
    autoSave();
});

let startYPos = 0;
document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        startYPos = e.touches[0].clientY;
    }
}, {passive: false});

document.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        const currentY = e.touches[0].clientY;
        if (currentY - startYPos > 100) {
            e.preventDefault();
            settings.style.top = '0';
        }
    }
}, {passive: false});

let lastTap = 0;
document.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 300 && tapLength > 0) {
        e.preventDefault();
        
        // Bersihkan semua timeout sebelum menjalankan effect baru
        clearAllTimeouts();
        hideIndicator();
        
        // Reset flip effect
        if (typeof resetFlipEffect === 'function') {
            resetFlipEffect();
        }
        
        // CEK EFEK SHADOW
        if (shadowEffectCheckbox.checked) {
            isSequenceActive = true;
            sequenceStage = 1;
            
            sequenceTimer = setTimeout(() => {
                if (isSequenceActive) {
                    showCardShadow();
                }
                sequenceTimer = null;
            }, 5000);
            
        } 
        // CEK EFEK STANDAR
        else if (effectStandarCheckbox.checked) {
            isSequenceActive = false;
            
            sequenceTimer = setTimeout(() => {
                showCardStandar();
                sequenceTimer = null;
            }, 1000);
            
        } 
        // CEK EFEK SLIDER
        else if (effectSliderCheckbox.checked) {
            const totalDelay = 4000;
            const indicatorDelay = 3000;
            
            indicatorTimeout = setTimeout(() => {
                showIndicator();
            }, indicatorDelay);
            
            cardAppearTimeout = setTimeout(() => {
                hideIndicator();
                showCardSlider();
            }, totalDelay);
            
        } 
        // CEK EFEK SKATING
        else if (effectSkatingCheckbox.checked) {
            const totalDelay = 4000;
            const indicatorDelay = 3000;
            
            indicatorTimeout = setTimeout(() => {
                showIndicator();
            }, indicatorDelay);
            
            cardAppearTimeout = setTimeout(() => {
                hideIndicator();
                showCardSkating();
            }, totalDelay);
            
        } 
        // CEK EFEK FLIP 3D
        else if (effectFlipCheckbox && effectFlipCheckbox.checked) {
            isSequenceActive = false;
            
            sequenceTimer = setTimeout(() => {
                showCardFlip();
                sequenceTimer = null;
            }, 1000);
        }
    }
    lastTap = currentTime;
});

function showIndicator() {
    if (cardIndicator) {
        cardIndicator.classList.add('visible');
    }
}

function hideIndicator() {
    if (cardIndicator) {
        cardIndicator.classList.remove('visible');
    }
}

// Drag handlers
card.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX - posX;
        startY = e.touches[0].clientY - posY;
        velocityX = 0;
        velocityY = 0;
        lastPosX = posX;
        lastPosY = posY;
        lastTime = Date.now();
        card.style.transition = 'none';
        card.style.animation = 'none';
        e.preventDefault();
    }
}, {passive: false});

document.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
        const now = Date.now();
        const deltaTime = now - lastTime;
        
        if (deltaTime > 0) {
            const newPosX = e.touches[0].clientX - startX;
            const newPosY = e.touches[0].clientY - startY;
            
            velocityX = (newPosX - lastPosX) / deltaTime * 1000;
            velocityY = (newPosY - lastPosY) / deltaTime * 1000;
            
            lastPosX = newPosX;
            lastPosY = newPosY;
            lastTime = now;
            
            posX = newPosX;
            posY = newPosY;
            
            updateCardTransform();
            
            const cardRect = card.getBoundingClientRect();
            
            if (cardRect.bottom < -10 || 
                cardRect.top > window.innerHeight + 10 ||
                cardRect.right < -10 || 
                cardRect.left > window.innerWidth + 10) {
                
                hideCard();
                
                isSequenceActive = false;
                sequenceStage = 0;
                isDragging = false;
                
                if (touchToChangeTimeout) {
                    clearTimeout(touchToChangeTimeout);
                    touchToChangeTimeout = null;
                }
                if (shadowFadeOutTimeout) {
                    clearTimeout(shadowFadeOutTimeout);
                    shadowFadeOutTimeout = null;
                }
                if (shadowWaitTimeout) {
                    clearTimeout(shadowWaitTimeout);
                    shadowWaitTimeout = null;
                }
                card.classList.remove('card-fadeout');
                card.style.animation = 'none';
                
                e.preventDefault();
                return;
            }
        }
        e.preventDefault();
    }
}, {passive: false});

card.addEventListener('touchend', (e) => {
    if (isDragging) {
        const cardRect = card.getBoundingClientRect();
        
        if (cardRect.bottom < -10 || 
            cardRect.top > window.innerHeight + 10 ||
            cardRect.right < -10 || 
            cardRect.left > window.innerWidth + 10) {
            
            hideCard();
            isSequenceActive = false;
            sequenceStage = 0;
            
            if (touchToChangeTimeout) {
                clearTimeout(touchToChangeTimeout);
                touchToChangeTimeout = null;
            }
            if (shadowFadeOutTimeout) {
                clearTimeout(shadowFadeOutTimeout);
                shadowFadeOutTimeout = null;
            }
            if (shadowWaitTimeout) {
                clearTimeout(shadowWaitTimeout);
                shadowWaitTimeout = null;
            }
            card.classList.remove('card-fadeout');
            card.style.animation = 'none';
            
            isDragging = false;
            return;
        }
        
        const speedThreshold = 800;
        const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        
        if (currentSpeed > speedThreshold) {
            hideCard();
            isSequenceActive = false;
            sequenceStage = 0;
            
            if (touchToChangeTimeout) {
                clearTimeout(touchToChangeTimeout);
                touchToChangeTimeout = null;
            }
            if (shadowFadeOutTimeout) {
                clearTimeout(shadowFadeOutTimeout);
                shadowFadeOutTimeout = null;
            }
            if (shadowWaitTimeout) {
                clearTimeout(shadowWaitTimeout);
                shadowWaitTimeout = null;
            }
            card.classList.remove('card-fadeout');
            card.style.animation = 'none';
            
            isDragging = false;
            return;
        }
        
        isDragging = false;
        card.style.transition = '';
        
        applyBounds();
        updateCardTransform();
    }
    
    setTimeout(() => {
        if (!isSequenceActive || card.style.display === 'none' || card.style.visibility !== 'visible') {
            return;
        }
        
        if (touchToChangeTimeout) {
            clearTimeout(touchToChangeTimeout);
        }
        
        const activeCount = activeImagesList.length;
        
        if (shadowEffectCheckbox.checked) {
            if (sequenceStage < activeCount) {
                touchToChangeTimeout = setTimeout(() => {
                    if (isSequenceActive) {
                        goToNextImageShadow();
                    }
                    touchToChangeTimeout = null;
                }, 3000);
            } 
            else if (sequenceStage === activeCount && activeCount > 0) {
                if (touchToChangeTimeout) clearTimeout(touchToChangeTimeout);
                fadeOutShadowCard();
            }
        } 
        else if (effectStandarCheckbox.checked || effectSliderCheckbox.checked) {
            if (sequenceStage < activeCount) {
                touchToChangeTimeout = setTimeout(() => {
                    if (isSequenceActive) {
                        if (!goToNextImage()) {
                            isSequenceActive = false;
                            sequenceStage = 0;
                        }
                    }
                    touchToChangeTimeout = null;
                }, 3000);
            } else {
                isSequenceActive = false;
                sequenceStage = 0;
            }
        }
        else if (effectSkatingCheckbox.checked) {
            if (sequenceStage < activeCount) {
                touchToChangeTimeout = setTimeout(() => {
                    if (isSequenceActive) {
                        goToNextImage();
                    }
                    touchToChangeTimeout = null;
                }, 3000);
            } 
            else if (sequenceStage === activeCount && activeCount > 0) {
                scheduleExitSkating();
            }
        }
        else if (effectFlipCheckbox && effectFlipCheckbox.checked) {
            if (typeof handleFlipCardTap === 'function') {
                handleFlipCardTap();
            } else {
                // Fallback ke standar
                if (sequenceStage < activeCount) {
                    touchToChangeTimeout = setTimeout(() => {
                        if (isSequenceActive) {
                            if (!goToNextImage()) {
                                isSequenceActive = false;
                                sequenceStage = 0;
                            }
                        }
                        touchToChangeTimeout = null;
                    }, 3000);
                } else {
                    isSequenceActive = false;
                    sequenceStage = 0;
                }
            }
        }
    }, 50);
});

bgUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            background.style.backgroundImage = `url(${event.target.result})`;
            autoSave();
        };
        reader.readAsDataURL(file);
    }
});

cardUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageSrc = event.target.result;
            updateCardImage(imageSrc);
        };
        reader.readAsDataURL(file);
    }
});

if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        settings.style.top = '-100%';
        autoSave();
    });
}

function initSensor() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === "function") {
        sensorPermissionBtn.classList.remove('hidden');
        
        sensorPermissionBtn.onclick = async () => {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                
                if (permission === "granted") {
                    sensorPermissionBtn.classList.add('hidden');
                    startSensor();
                }
            } catch (error) {
                console.error("Error requesting permission:", error);
                sensorPermissionBtn.innerHTML = "Error requesting permission.<br>Try refreshing the page.";
            }
        };
    } else {
        sensorPermissionBtn.classList.add('hidden');
        startSensor();
    }
}

function startSensor() {
    isSensorEnabled = true;
    
    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", handleDeviceOrientation);
        startSensorAnimation();
    }
}

function handleDeviceOrientation(e) {
    if (isDragging) return;

    const beta = e.beta || 0;
    const gamma = e.gamma || 0;
    
    const limitedBeta = Math.max(-45, Math.min(45, beta));
    const limitedGamma = Math.max(-45, Math.min(45, gamma));

    smoothBeta += (limitedBeta - smoothBeta) * smoothing;
    smoothGamma += (limitedGamma - smoothGamma) * smoothing;
}

function startSensorAnimation() {
    function animate() {
        if (isSensorEnabled && !isDragging && !isAnimatingMotion && sensorGerakCheckbox.checked && card.style.display !== 'none') {
            posX += smoothGamma * sensitivity;
            posY += smoothBeta * sensitivity;
            applyBounds();
            updateCardTransform();
        }
        requestAnimationFrame(animate);
    }
    animate();
}

function applyBounds() {
    const cardWidth = card.offsetWidth * scale;
    const cardHeight = card.offsetHeight * scale;
    
    const minX = 0;
    const maxX = window.innerWidth - cardWidth;
    const minY = 0;
    const maxY = window.innerHeight - cardHeight;
    
    posX = Math.max(minX, Math.min(maxX, posX));
    posY = Math.max(minY, Math.min(maxY, posY));
}

function updateCardTransform() {
    posX = Math.round(posX);
    posY = Math.round(posY);
    card.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

function hideCard() {
    card.style.display = 'none';
    card.style.visibility = 'hidden';
    card.style.animation = 'none';
    card.classList.remove('card-fadeout');
}

function isCardVisible() {
    return card.style.display !== 'none' && card.style.visibility === 'visible';
}

window.addEventListener('resize', () => {
    if (card.style.display !== 'none') {
        const cardWidth = card.offsetWidth;
        const cardHeight = card.offsetHeight;
        posX = (window.innerWidth - cardWidth) / 2;
        posY = (window.innerHeight - cardHeight) / 2;
        posX = Math.round(posX);
        posY = Math.round(posY);
        updateCardTransform();
    }
});

window.addEventListener('beforeunload', () => {
    saveToStorage();
});

window.addEventListener('load', () => {
    loadRootFolders();
    setTimeout(() => {
        updateMainCardPreview();
        updatePreviewCardSize();
        updateActivePreviewStyles();
        
        updateDownloadButtonState();
        
        card.style.display = 'block';
        card.style.animation = 'none';
        card.style.opacity = '1';
        
        posX = (window.innerWidth / 2) - (card.offsetWidth / 2);
        posY = window.innerHeight + card.offsetHeight + 100;
        posX = Math.round(posX);
        posY = Math.round(posY);
        updateCardTransform();
        
        card.style.display = 'none';
        card.style.visibility = 'hidden';
    }, 200);
});

// ===== REMOVE BACKGROUND FUNCTIONALITY =====
const REMOVE_BG_API_KEY = '2crJY3ybEroko55EEQeVFh9C';
const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';

let processedImageBlob = null;

function updateDownloadButtonState() {
    const hasImage = mainCardPreview.src && mainCardPreview.src !== '' && !mainCardPreview.src.includes('undefined');
    downloadBtn.disabled = !hasImage;
}

function showRemoveBgStatus(message, isError = false) {
    removeBgStatus.style.display = 'block';
    removeBgStatus.textContent = message;
    removeBgStatus.className = 'remove-bg-status ' + (isError ? 'error' : 'success');
}

function hideRemoveBgStatus() {
    removeBgStatus.style.display = 'none';
}

function autoCropImage(imageSrc) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            ctx.drawImage(img, 0, 0);
            
            let imageData;
            try {
                imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            } catch (e) {
                resolve(imageSrc);
                return;
            }
            
            const data = imageData.data;
            
            let top = canvas.height;
            let bottom = 0;
            let left = canvas.width;
            let right = 0;
            let foundPixel = false;
            
            const threshold = 1;
            
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const index = (y * canvas.width + x) * 4;
                    const alpha = data[index + 3];
                    
                    if (alpha > threshold) {
                        if (!foundPixel) foundPixel = true;
                        top = Math.min(top, y);
                        bottom = Math.max(bottom, y);
                        left = Math.min(left, x);
                        right = Math.max(right, x);
                    }
                }
            }
            
            if (!foundPixel) {
                resolve(imageSrc);
                return;
            }
            
            const objWidth = right - left + 1;
            const objHeight = bottom - top + 1;
            
            if (objWidth > canvas.width * 0.9 && objHeight > canvas.height * 0.9) {
                resolve(imageSrc);
                return;
            }
            
            const padding = 2;
            const cropLeft = Math.max(0, left - padding);
            const cropTop = Math.max(0, top - padding);
            const cropRight = Math.min(canvas.width, right + padding);
            const cropBottom = Math.min(canvas.height, bottom + padding);
            
            const cropWidth = cropRight - cropLeft;
            const cropHeight = cropBottom - cropTop;
            
            const cropCanvas = document.createElement('canvas');
            cropCanvas.width = cropWidth;
            cropCanvas.height = cropHeight;
            const cropCtx = cropCanvas.getContext('2d');
            
            cropCtx.drawImage(
                img, 
                cropLeft, cropTop, cropWidth, cropHeight,
                0, 0, cropWidth, cropHeight
            );
            
            const croppedDataUrl = cropCanvas.toDataURL('image/png');
            
            resolve(croppedDataUrl);
        };
        
        img.onerror = function(err) {
            reject(new Error('Gagal memuat gambar untuk auto-crop'));
        };
        
        img.src = imageSrc;
    });
}

function setRemoveBgLoading(isLoading) {
    if (isLoading) {
        removeBgBtn.disabled = true;
        removeBgBtn.innerHTML = '⏳ Memproses...';
        
        const editorFrame = document.querySelector('.editor-frame');
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'bg-loading-overlay';
        loadingOverlay.className = 'bg-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="bg-spinner"></div>
            <div style="color: white; font-size: 14px;">Menghapus background...</div>
        `;
        
        if (!document.getElementById('bg-loading-overlay')) {
            editorFrame.style.position = 'relative';
            editorFrame.appendChild(loadingOverlay);
        }
    } else {
        removeBgBtn.disabled = false;
        removeBgBtn.innerHTML = '🧹 Hapus Background';
        
        const loadingOverlay = document.getElementById('bg-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }
}

removeBgBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const currentImageSrc = mainCardPreview.src;
    
    if (!currentImageSrc || currentImageSrc === '') {
        showRemoveBgStatus('Tidak ada gambar yang diproses', true);
        setTimeout(hideRemoveBgStatus, 3000);
        return;
    }
    
    try {
        setRemoveBgLoading(true);
        hideRemoveBgStatus();
        
        processedImageBlob = null;
        
        let imageBlob;
        
        if (currentImageSrc.startsWith('data:')) {
            const response = await fetch(currentImageSrc);
            imageBlob = await response.blob();
        } else {
            try {
                const headResponse = await fetch(currentImageSrc, { method: 'HEAD' });
                const contentLength = headResponse.headers.get('content-length');
                
                if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
                    throw new Error('Ukuran file terlalu besar (maks 5MB)');
                }
                
                const response = await fetch(currentImageSrc);
                imageBlob = await response.blob();
            } catch (fetchError) {
                throw new Error('Gagal mengambil gambar dari URL. Pastikan gambar dapat diakses.');
            }
        }
        
        if (imageBlob.size > 5 * 1024 * 1024) {
            throw new Error('Ukuran file maksimal 5MB');
        }
        
        const formData = new FormData();
        formData.append('image_file', imageBlob, 'image.png');
        formData.append('size', 'auto');
        
        const response = await fetch(REMOVE_BG_API_URL, {
            method: 'POST',
            headers: {
                'X-Api-Key': REMOVE_BG_API_KEY
            },
            body: formData
        });
        
        if (!response.ok) {
            let errorText = '';
            try {
                errorText = await response.text();
            } catch (e) {
                errorText = response.statusText;
            }
            
            if (response.status === 402) {
                throw new Error('API key tidak memiliki cukup kredit');
            } else if (response.status === 400) {
                throw new Error('Gambar tidak valid atau format tidak didukung');
            } else {
                throw new Error(`Error ${response.status}: ${errorText.substring(0, 100)}`);
            }
        }
        
        const resultBlob = await response.blob();
        processedImageBlob = resultBlob;
        
        const reader = new FileReader();
        reader.onload = async function(event) {
            const resultImageUrl = event.target.result;
            
            try {
                showRemoveBgStatus('⏳ Merapikan pinggiran gambar...', false);
                const croppedImageUrl = await autoCropImage(resultImageUrl);
                updateCardImage(croppedImageUrl);
                const croppedResponse = await fetch(croppedImageUrl);
                processedImageBlob = await croppedResponse.blob();
                setRemoveBgLoading(false);
                showRemoveBgStatus('✅ Background terhapus & pinggiran dirapikan!');
                setTimeout(hideRemoveBgStatus, 3000);
            } catch (cropError) {
                updateCardImage(resultImageUrl);
                setRemoveBgLoading(false);
                showRemoveBgStatus('✅ Background terhapus (tanpa crop)', false);
                setTimeout(hideRemoveBgStatus, 3000);
            }
        };
        
        reader.readAsDataURL(resultBlob);
        
    } catch (error) {
        setRemoveBgLoading(false);
        let errorMessage = error.message;
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = 'Error CORS atau jaringan. Gunakan extension CORS Unblock atau coba gambar lain.';
        }
        showRemoveBgStatus(`❌ Gagal: ${errorMessage}`, true);
        setTimeout(hideRemoveBgStatus, 5000);
    }
});

downloadBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (processedImageBlob) {
        const url = URL.createObjectURL(processedImageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'removed-background-cropped.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showRemoveBgStatus('✅ Gambar hasil diunduh!');
        setTimeout(hideRemoveBgStatus, 2000);
    } else {
        const currentImageSrc = mainCardPreview.src;
        if (currentImageSrc && currentImageSrc !== '') {
            const a = document.createElement('a');
            a.href = currentImageSrc;
            a.download = 'gambar-asli.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showRemoveBgStatus('✅ Gambar asli diunduh!');
            setTimeout(hideRemoveBgStatus, 2000);
        } else {
            showRemoveBgStatus('Tidak ada gambar untuk diunduh', true);
            setTimeout(hideRemoveBgStatus, 2000);
        }
    }
});

updateDownloadButtonState();
