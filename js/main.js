// ===== MAIN APPLICATION =====
(function() {
    // DOM Elements
    const background = document.getElementById('background');
    const card = document.getElementById('card');
    const settings = document.getElementById('settings');
    const bgUpload = document.getElementById('bg-upload');
    const cardUpload = document.getElementById('card-upload');
    const closeSettingsBtn = document.getElementById('close-settings');
    const cardSizeSlider = document.getElementById('card-size-slider');
    const sizeValue = document.getElementById('size-value');
    const mainCardPreview = document.getElementById('main-card-preview');
    
    // Preview elements
    const preview1 = document.getElementById('preview-1');
    const preview2 = document.getElementById('preview-2');
    const preview3 = document.getElementById('preview-3');
    const preview4 = document.getElementById('preview-4');
    
    // Checkbox elements
    const effectStandarCheckbox = document.getElementById('effect-standar');
    const shadowEffectCheckbox = document.getElementById('shadow-effect');
    const effectSliderCheckbox = document.getElementById('effect-slider');
    const effectSkatingCheckbox = document.getElementById('effect-skating');
    const sensorGerakCheckbox = document.getElementById('sensor-gerak');
    
    // State
    let activeImages = { 1: true, 2: true, 3: true, 4: true };
    let isDragging = false;
    let startX, startY;
    let lastTap = 0;
    
    // Make global for other modules
    window.activeImages = activeImages;
    window.isDragging = false;
    window.autoSave = function() { Storage.save(getSaveData()); };
    
    function getSaveData() {
        const preview1Img = preview1.querySelector('img');
        const preview2Img = preview2.querySelector('img');
        const preview3Img = preview3.querySelector('img');
        const preview4Img = preview4.querySelector('img');
        
        return {
            background: background.style.backgroundImage.replace('url("', '').replace('")', ''),
            effectStandar: effectStandarCheckbox.checked,
            shadowEffect: shadowEffectCheckbox.checked,
            effectSlider: effectSliderCheckbox.checked,
            effectSkating: effectSkatingCheckbox.checked,
            sensorGerak: sensorGerakCheckbox.checked,
            activeImages: activeImages,
            preview1: preview1Img ? preview1Img.src : '',
            preview2: preview2Img ? preview2Img.src : '',
            preview3: preview3Img ? preview3Img.src : '',
            preview4: preview4Img ? preview4Img.src : ''
        };
    }
    
    function loadFromStorage() {
        const data = Storage.load();
        if (data) {
            if (data.background) background.style.backgroundImage = `url(${data.background})`;
            if (data.effectStandar !== undefined) effectStandarCheckbox.checked = data.effectStandar;
            if (data.shadowEffect !== undefined) shadowEffectCheckbox.checked = data.shadowEffect;
            if (data.effectSlider !== undefined) effectSliderCheckbox.checked = data.effectSlider;
            if (data.effectSkating !== undefined) effectSkatingCheckbox.checked = data.effectSkating;
            if (data.sensorGerak !== undefined) sensorGerakCheckbox.checked = data.sensorGerak;
            if (data.activeImages) {
                activeImages = data.activeImages;
                window.activeImages = activeImages;
            }
            
            const preview1Img = preview1.querySelector('img');
            const preview2Img = preview2.querySelector('img');
            const preview3Img = preview3.querySelector('img');
            const preview4Img = preview4.querySelector('img');
            
            if (data.preview1 && preview1Img) preview1Img.src = data.preview1;
            if (data.preview2 && preview2Img) preview2Img.src = data.preview2;
            if (data.preview3 && preview3Img) preview3Img.src = data.preview3;
            if (data.preview4 && preview4Img) preview4Img.src = data.preview4;
            
            if (data.preview1) {
                card.src = data.preview1;
                if (mainCardPreview) mainCardPreview.src = data.preview1;
            }
        }
        
        const savedSize = Storage.loadCardSize();
        card.style.maxWidth = savedSize + 'px';
        if (cardSizeSlider) cardSizeSlider.value = savedSize;
        if (sizeValue) sizeValue.textContent = savedSize + 'px';
        updatePreviewCardSize();
        
        updateActivePreviewStyles();
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
    
    function updatePreviewCardSize() {
        if (!mainCardPreview) return;
        const currentSize = parseInt(card.style.maxWidth) || 200;
        mainCardPreview.style.width = currentSize + 'px';
        mainCardPreview.style.height = 'auto';
        mainCardPreview.style.position = 'absolute';
        mainCardPreview.style.top = '30px';
        mainCardPreview.style.left = '50%';
        mainCardPreview.style.transform = 'translateX(-50%)';
    }
    
    function updateCardImage(imageSrc) {
        const preview1Img = preview1.querySelector('img');
        if (preview1Img) preview1Img.src = imageSrc;
        card.src = imageSrc;
        if (mainCardPreview) mainCardPreview.src = imageSrc;
        autoSave();
        BackgroundRemover.updateDownloadButtonState();
    }
    
    function triggerDoubleTapEffect() {
        if (effectStandarCheckbox && effectStandarCheckbox.checked) {
            StandarEffect.clearAllTimeouts();
            StandarEffect.trigger();
        } else if (shadowEffectCheckbox && shadowEffectCheckbox.checked) {
            ShadowEffect.clearAllTimeouts();
            ShadowEffect.trigger();
        } else if (effectSliderCheckbox && effectSliderCheckbox.checked) {
            SliderEffect.clearAllTimeouts();
            SliderEffect.trigger();
        } else if (effectSkatingCheckbox && effectSkatingCheckbox.checked) {
            SkatingEffect.clearAllTimeouts();
            SkatingEffect.trigger();
        }
    }
    
    function handleCardTap() {
        if (effectStandarCheckbox && effectStandarCheckbox.checked) {
            StandarEffect.handleCardTap();
        } else if (shadowEffectCheckbox && shadowEffectCheckbox.checked) {
            ShadowEffect.handleCardTap();
        } else if (effectSliderCheckbox && effectSliderCheckbox.checked) {
            SliderEffect.handleCardTap();
        } else if (effectSkatingCheckbox && effectSkatingCheckbox.checked) {
            SkatingEffect.handleCardTap();
        }
    }
    
    // Drag handlers
    function onTouchStart(e) {
        if (e.touches.length === 1) {
            isDragging = true;
            window.isDragging = true;
            startX = e.touches[0].clientX - CardManager.getCardPosition().x;
            startY = e.touches[0].clientY - CardManager.getCardPosition().y;
            card.style.transition = 'none';
            card.style.animation = 'none';
            e.preventDefault();
        }
    }
    
    function onTouchMove(e) {
        if (isDragging && e.touches.length === 1) {
            const newPosX = e.touches[0].clientX - startX;
            const newPosY = e.touches[0].clientY - startY;
            CardManager.setCardPosition(newPosX, newPosY);
            CardManager.updateCardTransform();
            e.preventDefault();
        }
    }
    
    function onTouchEnd(e) {
        if (isDragging) {
            isDragging = false;
            window.isDragging = false;
            CardManager.applyBounds();
            CardManager.updateCardTransform();
            card.style.transition = '';
        }
        
        // Double tap detection
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            triggerDoubleTapEffect();
        }
        lastTap = currentTime;
        
        // Handle single tap on card for image change
        if (CardManager.isCardVisible()) {
            handleCardTap();
        }
    }
    
    function initEventListeners() {
        // Card drag
        card.addEventListener('touchstart', onTouchStart, { passive: false });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        card.addEventListener('touchend', onTouchEnd);
        
        // Settings
        if (bgUpload) {
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
        }
        
        if (cardUpload) {
            cardUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        updateCardImage(event.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                settings.style.top = '-100%';
                autoSave();
            });
        }
        
        // Two finger swipe to open settings
        let startYPos = 0;
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                startYPos = e.touches[0].clientY;
            }
        });
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const currentY = e.touches[0].clientY;
                if (currentY - startYPos > 100) {
                    e.preventDefault();
                    settings.style.top = '0';
                }
            }
        });
        
        // Card size slider
        if (cardSizeSlider) {
            cardSizeSlider.addEventListener('input', (e) => {
                const newSize = e.target.value;
                if (sizeValue) sizeValue.textContent = newSize + 'px';
                card.style.maxWidth = newSize + 'px';
                Storage.saveCardSize(newSize);
                updatePreviewCardSize();
                if (CardManager.isCardVisible()) {
                    const oldWidth = card.offsetWidth;
                    setTimeout(() => {
                        const newWidth = card.offsetWidth;
                        const pos = CardManager.getCardPosition();
                        CardManager.setCardPosition(pos.x - (newWidth - oldWidth) / 2, pos.y);
                        CardManager.applyBounds();
                        CardManager.updateCardTransform();
                    }, 10);
                }
                autoSave();
            });
        }
        
        // Effect checkboxes mutual exclusion
        effectStandarCheckbox.addEventListener('change', () => {
            if (effectStandarCheckbox.checked) {
                shadowEffectCheckbox.checked = false;
                effectSliderCheckbox.checked = false;
                effectSkatingCheckbox.checked = false;
            }
            autoSave();
        });
        
        shadowEffectCheckbox.addEventListener('change', () => {
            if (shadowEffectCheckbox.checked) {
                effectStandarCheckbox.checked = false;
                effectSliderCheckbox.checked = false;
                effectSkatingCheckbox.checked = false;
            }
            autoSave();
        });
        
        effectSliderCheckbox.addEventListener('change', () => {
            if (effectSliderCheckbox.checked) {
                effectStandarCheckbox.checked = false;
                shadowEffectCheckbox.checked = false;
                effectSkatingCheckbox.checked = false;
            }
            autoSave();
        });
        
        effectSkatingCheckbox.addEventListener('change', () => {
            if (effectSkatingCheckbox.checked) {
                effectStandarCheckbox.checked = false;
                shadowEffectCheckbox.checked = false;
                effectSliderCheckbox.checked = false;
            }
            autoSave();
        });
        
        sensorGerakCheckbox.addEventListener('change', () => {
            autoSave();
        });
        
        // Preview click handlers
        preview1.addEventListener('click', (e) => {
            if (!e.target.classList.contains('preview-toggle')) {
                GithubPicker.showModal(1);
            }
        });
        
        preview2.addEventListener('click', (e) => {
            if (!e.target.classList.contains('preview-toggle')) {
                GithubPicker.showModal(2);
            }
        });
        
        preview3.addEventListener('click', (e) => {
            if (!e.target.classList.contains('preview-toggle')) {
                GithubPicker.showModal(3);
            }
        });
        
        preview4.addEventListener('click', (e) => {
            if (!e.target.classList.contains('preview-toggle')) {
                GithubPicker.showModal(4);
            }
        });
        
        // Preview toggle buttons
        document.querySelectorAll('.preview-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const previewIndex = parseInt(toggle.dataset.toggle);
                activeImages[previewIndex] = !activeImages[previewIndex];
                window.activeImages = activeImages;
                updateActivePreviewStyles();
                autoSave();
            });
        });
        
        // Keyboard handler
        document.addEventListener('keydown', (event) => {
            if (event.key === '1' || event.key === '2') {
                event.preventDefault();
                if (event.key === '1') {
                    handleCardTap();
                } else if (event.key === '2') {
                    triggerDoubleTapEffect();
                }
            }
        });
    }
    
    function init() {
        loadFromStorage();
        CardManager.setCardPosition(window.innerWidth / 2 - 100, window.innerHeight + 200);
        CardManager.hideCard();
        
        initEventListeners();
        Sensor.init();
        BackgroundRemover.init();
        
        window.addEventListener('resize', () => {
            if (CardManager.isCardVisible()) {
                CardManager.setCardCenter();
                CardManager.updateCardTransform();
            }
        });
        
        window.addEventListener('beforeunload', () => {
            autoSave();
        });
        
        // Initialize previews
        setTimeout(() => {
            updatePreviewCardSize();
            updateActivePreviewStyles();
            BackgroundRemover.updateDownloadButtonState();
        }, 200);
    }
    
    // Start the application
    init();
})();
