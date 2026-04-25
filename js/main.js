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
    const cardIndicator = document.getElementById('card-indicator');
    
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
    let velocityX = 0, velocityY = 0;
    let lastPosX = 0, lastPosY = 0;
    let lastTime = 0;
    let lastTap = 0;
    let posX = window.innerWidth / 2 - 100;
    let posY = window.innerHeight + 200;
    let scale = 1;
    let isAnimatingMotion = false;
    
    // Make global for other modules
    window.activeImages = activeImages;
    window.isDragging = false;
    window.autoSave = function() { Storage.save(getSaveData()); };
    
    // Card transform functions
    function updateCardTransform() {
        if (!card) return;
        posX = Math.round(posX);
        posY = Math.round(posY);
        card.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
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
    
    function hideCard() {
        card.style.display = 'none';
        card.style.visibility = 'hidden';
        card.style.animation = 'none';
        card.classList.remove('card-fadeout');
    }
    
    function showCard() {
        card.style.display = 'block';
        card.style.visibility = 'visible';
        card.style.opacity = '1';
    }
    
    function setCardPosition(x, y) {
        posX = x;
        posY = y;
        updateCardTransform();
    }
    
    function setCardCenter() {
        const cardWidth = card.offsetWidth;
        const cardHeight = card.offsetHeight;
        posX = (window.innerWidth - cardWidth) / 2;
        posY = (window.innerHeight - cardHeight) / 2;
        updateCardTransform();
    }
    
    function getCardPosition() {
        return { x: posX, y: posY };
    }
    
    function isCardVisible() {
        return card.style.display !== 'none' && card.style.visibility === 'visible';
    }
    
    function getActiveImagesList() {
        const list = [];
        const preview1Img = preview1.querySelector('img');
        const preview2Img = preview2.querySelector('img');
        const preview3Img = preview3.querySelector('img');
        const preview4Img = preview4.querySelector('img');
        
        if (activeImages[1] && preview1Img && preview1Img.src) list.push({ index: 1, src: preview1Img.src });
        if (activeImages[2] && preview2Img && preview2Img.src) list.push({ index: 2, src: preview2Img.src });
        if (activeImages[3] && preview3Img && preview3Img.src) list.push({ index: 3, src: preview3Img.src });
        if (activeImages[4] && preview4Img && preview4Img.src) list.push({ index: 4, src: preview4Img.src });
        
        return list;
    }
    
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
        if (BackgroundRemover && BackgroundRemover.updateDownloadButtonState) {
            BackgroundRemover.updateDownloadButtonState();
        }
    }
    
    // ========== EFFECT TRIGGERS ==========
    let sequenceTimer = null;
    let touchToChangeTimeout = null;
    let indicatorTimeout = null;
    let cardAppearTimeout = null;
    let exitIndicatorTimeout = null;
    let exitCardTimeout = null;
    let shadowFadeOutTimeout = null;
    let shadowWaitTimeout = null;
    let activeImagesList = [];
    let currentCardImageIndex = 0;
    let isSequenceActive = false;
    let sequenceStage = 0;
    let isAnimating = false;
    
    function clearAllTimeouts() {
        if (sequenceTimer) { clearTimeout(sequenceTimer); sequenceTimer = null; }
        if (touchToChangeTimeout) { clearTimeout(touchToChangeTimeout); touchToChangeTimeout = null; }
        if (indicatorTimeout) { clearTimeout(indicatorTimeout); indicatorTimeout = null; }
        if (cardAppearTimeout) { clearTimeout(cardAppearTimeout); cardAppearTimeout = null; }
        if (exitIndicatorTimeout) { clearTimeout(exitIndicatorTimeout); exitIndicatorTimeout = null; }
        if (exitCardTimeout) { clearTimeout(exitCardTimeout); exitCardTimeout = null; }
        if (shadowFadeOutTimeout) { clearTimeout(shadowFadeOutTimeout); shadowFadeOutTimeout = null; }
        if (shadowWaitTimeout) { clearTimeout(shadowWaitTimeout); shadowWaitTimeout = null; }
    }
    
    function showIndicator() {
        if (cardIndicator) cardIndicator.classList.add('visible');
    }
    
    function hideIndicator() {
        if (cardIndicator) cardIndicator.classList.remove('visible');
    }
    
    // Effect Standar
    function showCardStandar() {
        const activeList = getActiveImagesList();
        if (activeList.length === 0) return;
        
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
        
        setCardPosition(centerX, centerY);
        currentCardImageIndex = 0;
        card.src = activeList[0].src;
        
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        updateCardTransform();
        
        activeImagesList = activeList;
        isSequenceActive = true;
        sequenceStage = 1;
    }
    
    // Effect Shadow
    function showCardShadow() {
        const activeList = getActiveImagesList();
        if (activeList.length === 0) return;
        
        if (shadowFadeOutTimeout) clearTimeout(shadowFadeOutTimeout);
        if (shadowWaitTimeout) clearTimeout(shadowWaitTimeout);
        
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
        
        setCardPosition(centerX, centerY);
        currentCardImageIndex = 0;
        card.src = activeList[0].src;
        
        updateCardTransform();
        void card.offsetHeight;
        card.style.animation = 'muncul 5s ease-in-out';
        
        activeImagesList = activeList;
        isSequenceActive = true;
        sequenceStage = 1;
    }
    
    function fadeOutShadowCard() {
        if (!isSequenceActive || card.style.display === 'none') return;
        
        if (shadowWaitTimeout) clearTimeout(shadowWaitTimeout);
        if (shadowFadeOutTimeout) clearTimeout(shadowFadeOutTimeout);
        
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
        }
        return false;
    }
    
    // Effect Slider
    function showCardSlider() {
        const activeList = getActiveImagesList();
        if (activeList.length === 0) return;
        
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
            
            const cardWidth = card.offsetWidth;
            const cardHeight = card.offsetHeight;
            
            const startX = (window.innerWidth / 2) - (cardWidth / 2);
            const startY = window.innerHeight + 100;
            
            setCardPosition(startX, startY);
            
            card.style.transition = 'none';
            updateCardTransform();
            
            void card.offsetHeight;
            
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            card.classList.add('card-visible');
            
            requestAnimationFrame(() => {
                card.classList.add('card-moving');
                card.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
                
                setTimeout(() => {
                    const targetX = (window.innerWidth / 2) - (cardWidth / 2);
                    const targetY = (window.innerHeight / 2) - (cardHeight / 2);
                    
                    setCardPosition(targetX, targetY);
                    updateCardTransform();
                    
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
    
    // Effect Skating
    function showCardSkating() {
        const activeList = getActiveImagesList();
        if (activeList.length === 0) return;
        
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
            
            const cardWidth = card.offsetWidth;
            const cardHeight = card.offsetHeight;
            
            const startX = (window.innerWidth / 2) - (cardWidth / 2);
            const startY = window.innerHeight + 100;
            
            setCardPosition(startX, startY);
            
            card.style.transition = 'none';
            updateCardTransform();
            
            void card.offsetHeight;
            
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            card.classList.add('card-visible');
            
            requestAnimationFrame(() => {
                card.classList.add('card-moving');
                card.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
                
                setTimeout(() => {
                    const targetX = (window.innerWidth / 2) - (cardWidth / 2);
                    const targetY = (window.innerHeight / 2) - (cardHeight / 2);
                    
                    setCardPosition(targetX, targetY);
                    updateCardTransform();
                    
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
    
    function scheduleExitSkating() {
        if (card.style.display === 'none' || !isSequenceActive) return;
        
        if (exitIndicatorTimeout) clearTimeout(exitIndicatorTimeout);
        if (exitCardTimeout) clearTimeout(exitCardTimeout);
        
        exitIndicatorTimeout = setTimeout(() => {
            if (isSequenceActive) showIndicator();
            exitIndicatorTimeout = null;
        }, 3000);
        
        exitCardTimeout = setTimeout(() => {
            if (isSequenceActive) {
                hideIndicator();
                exitCardSkating();
            }
            exitCardTimeout = null;
        }, 4000);
    }
    
    function exitCardSkating() {
        if (card.style.display === 'none' || !isSequenceActive) return;
        
        isAnimatingMotion = true;
        
        card.classList.add('card-moving');
        card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
        
        const targetY = -card.offsetHeight - 100;
        setCardPosition(posX, targetY);
        updateCardTransform();
        
        setTimeout(() => {
            hideCard();
            card.classList.remove('card-moving');
            isSequenceActive = false;
            sequenceStage = 0;
            isAnimatingMotion = false;
        }, 500);
    }
    
    function goToNextImage() {
        if (!isSequenceActive || activeImagesList.length === 0) return false;
        
        currentCardImageIndex++;
        
        if (currentCardImageIndex < activeImagesList.length) {
            card.src = activeImagesList[currentCardImageIndex].src;
            sequenceStage = currentCardImageIndex + 1;
            return true;
        }
        return false;
    }
    
    function triggerDoubleTapEffect() {
        clearAllTimeouts();
        hideIndicator();
        
        if (shadowEffectCheckbox && shadowEffectCheckbox.checked) {
            isSequenceActive = true;
            sequenceStage = 1;
            
            sequenceTimer = setTimeout(() => {
                if (isSequenceActive) {
                    showCardShadow();
                }
                sequenceTimer = null;
            }, 5000);
            
        } else if (effectStandarCheckbox && effectStandarCheckbox.checked) {
            isSequenceActive = false;
            
            sequenceTimer = setTimeout(() => {
                showCardStandar();
                sequenceTimer = null;
            }, 1000);
            
        } else if (effectSliderCheckbox && effectSliderCheckbox.checked) {
            const totalDelay = 4000;
            const indicatorDelay = 3000;
            
            indicatorTimeout = setTimeout(() => {
                showIndicator();
            }, indicatorDelay);
            
            cardAppearTimeout = setTimeout(() => {
                hideIndicator();
                showCardSlider();
            }, totalDelay);
            
        } else if (effectSkatingCheckbox && effectSkatingCheckbox.checked) {
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
    }
    
    function handleCardTap() {
        if (!isSequenceActive || !isCardVisible()) return;
        
        if (touchToChangeTimeout) clearTimeout(touchToChangeTimeout);
        
        const activeCount = activeImagesList.length;
        
        if (shadowEffectCheckbox && shadowEffectCheckbox.checked) {
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
        else if ((effectStandarCheckbox && effectStandarCheckbox.checked) || 
                 (effectSliderCheckbox && effectSliderCheckbox.checked)) {
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
        else if (effectSkatingCheckbox && effectSkatingCheckbox.checked) {
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
    }
    
    // ========== DRAG HANDLERS with Velocity Detection ==========
    function onTouchStart(e) {
        if (e.touches.length === 1) {
            isDragging = true;
            window.isDragging = true;
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
    }
    
    function onTouchMove(e) {
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
                
                setCardPosition(newPosX, newPosY);
                updateCardTransform();
                
                // Check if card is thrown out of screen
                const cardRect = card.getBoundingClientRect();
                
                if (cardRect.bottom < -10 || 
                    cardRect.top > window.innerHeight + 10 ||
                    cardRect.right < -10 || 
                    cardRect.left > window.innerWidth + 10) {
                    
                    hideCard();
                    isSequenceActive = false;
                    sequenceStage = 0;
                    isDragging = false;
                    window.isDragging = false;
                    
                    if (touchToChangeTimeout) clearTimeout(touchToChangeTimeout);
                    if (shadowFadeOutTimeout) clearTimeout(shadowFadeOutTimeout);
                    if (shadowWaitTimeout) clearTimeout(shadowWaitTimeout);
                    card.classList.remove('card-fadeout');
                    card.style.animation = 'none';
                    
                    e.preventDefault();
                    return;
                }
            }
            e.preventDefault();
        }
    }
    
    function onTouchEnd(e) {
        if (isDragging) {
            const cardRect = card.getBoundingClientRect();
            
            // Check if card is out of screen
            if (cardRect.bottom < -10 || 
                cardRect.top > window.innerHeight + 10 ||
                cardRect.right < -10 || 
                cardRect.left > window.innerWidth + 10) {
                
                hideCard();
                isSequenceActive = false;
                sequenceStage = 0;
                
                if (touchToChangeTimeout) clearTimeout(touchToChangeTimeout);
                if (shadowFadeOutTimeout) clearTimeout(shadowFadeOutTimeout);
                if (shadowWaitTimeout) clearTimeout(shadowWaitTimeout);
                card.classList.remove('card-fadeout');
                card.style.animation = 'none';
                
                isDragging = false;
                window.isDragging = false;
                return;
            }
            
            // Check velocity threshold
            const speedThreshold = 800;
            const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            
            if (currentSpeed > speedThreshold) {
                hideCard();
                isSequenceActive = false;
                sequenceStage = 0;
                
                if (touchToChangeTimeout) clearTimeout(touchToChangeTimeout);
                if (shadowFadeOutTimeout) clearTimeout(shadowFadeOutTimeout);
                if (shadowWaitTimeout) clearTimeout(shadowWaitTimeout);
                card.classList.remove('card-fadeout');
                card.style.animation = 'none';
                
                isDragging = false;
                window.isDragging = false;
                return;
            }
            
            isDragging = false;
            window.isDragging = false;
            card.style.transition = '';
            
            applyBounds();
            updateCardTransform();
        }
        
        // Double tap detection
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            triggerDoubleTapEffect();
        }
        lastTap = currentTime;
        
        // Handle single tap on card for image change (with delay)
        setTimeout(() => {
            if (isCardVisible()) {
                handleCardTap();
            }
        }, 50);
    }
    
    // ========== SENSOR HANDLER ==========
    let smoothBeta = 0;
    let smoothGamma = 0;
    const sensitivity = 0.5;
    const smoothing = 0.2;
    let isSensorEnabled = false;
    let sensorAnimationId = null;
    const sensorPermissionBtn = document.getElementById('sensor-permission');
    
    function startSensorAnimation() {
        function animate() {
            if (isSensorEnabled && !isDragging && !isAnimatingMotion && 
                sensorGerakCheckbox && sensorGerakCheckbox.checked && 
                isCardVisible()) {
                posX += smoothGamma * sensitivity;
                posY += smoothBeta * sensitivity;
                applyBounds();
                updateCardTransform();
            }
            sensorAnimationId = requestAnimationFrame(animate);
        }
        animate();
    }
    
    function handleDeviceOrientation(e) {
        const beta = e.beta || 0;
        const gamma = e.gamma || 0;
        
        const limitedBeta = Math.max(-45, Math.min(45, beta));
        const limitedGamma = Math.max(-45, Math.min(45, gamma));
        
        smoothBeta += (limitedBeta - smoothBeta) * smoothing;
        smoothGamma += (limitedGamma - smoothGamma) * smoothing;
    }
    
    function initSensor() {
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === "function") {
            if (sensorPermissionBtn) {
                sensorPermissionBtn.classList.remove('hidden');
                sensorPermissionBtn.onclick = async () => {
                    try {
                        const permission = await DeviceOrientationEvent.requestPermission();
                        if (permission === "granted") {
                            sensorPermissionBtn.classList.add('hidden');
                            isSensorEnabled = true;
                            window.addEventListener("deviceorientation", handleDeviceOrientation);
                            startSensorAnimation();
                        }
                    } catch (error) {
                        console.error("Error requesting permission:", error);
                        if (sensorPermissionBtn) {
                            sensorPermissionBtn.innerHTML = "Error requesting permission.<br>Try refreshing the page.";
                        }
                    }
                };
            }
        } else {
            if (sensorPermissionBtn) sensorPermissionBtn.classList.add('hidden');
            isSensorEnabled = true;
            if (window.DeviceOrientationEvent) {
                window.addEventListener("deviceorientation", handleDeviceOrientation);
                startSensorAnimation();
            }
        }
    }
    
    // ========== EVENT LISTENERS ==========
    function initEventListeners() {
        // Card drag with velocity detection
        card.addEventListener('touchstart', onTouchStart, { passive: false });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        card.addEventListener('touchend', onTouchEnd);
        
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
        
        // Background upload
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
        
        // Card upload
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
        
        // Close settings
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                settings.style.top = '-100%';
                autoSave();
            });
        }
        
        // Card size slider
        if (cardSizeSlider) {
            cardSizeSlider.addEventListener('input', (e) => {
                const newSize = e.target.value;
                if (sizeValue) sizeValue.textContent = newSize + 'px';
                card.style.maxWidth = newSize + 'px';
                Storage.saveCardSize(newSize);
                updatePreviewCardSize();
                if (isCardVisible()) {
                    const oldWidth = card.offsetWidth;
                    setTimeout(() => {
                        const newWidth = card.offsetWidth;
                        posX = posX - (newWidth - oldWidth) / 2;
                        applyBounds();
                        updateCardTransform();
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
        
        // Preview click handlers for GitHub picker
        if (preview1) {
            preview1.addEventListener('click', (e) => {
                if (!e.target.classList.contains('preview-toggle')) {
                    if (GithubPicker && GithubPicker.showModal) GithubPicker.showModal(1);
                }
            });
        }
        
        if (preview2) {
            preview2.addEventListener('click', (e) => {
                if (!e.target.classList.contains('preview-toggle')) {
                    if (GithubPicker && GithubPicker.showModal) GithubPicker.showModal(2);
                }
            });
        }
        
        if (preview3) {
            preview3.addEventListener('click', (e) => {
                if (!e.target.classList.contains('preview-toggle')) {
                    if (GithubPicker && GithubPicker.showModal) GithubPicker.showModal(3);
                }
            });
        }
        
        if (preview4) {
            preview4.addEventListener('click', (e) => {
                if (!e.target.classList.contains('preview-toggle')) {
                    if (GithubPicker && GithubPicker.showModal) GithubPicker.showModal(4);
                }
            });
        }
        
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
        
        // Keyboard handler (1 = tap, 2 = double tap)
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
        
        // Initialize card position (hidden offscreen)
        posX = window.innerWidth / 2 - 100;
        posY = window.innerHeight + 200;
        hideCard();
        updateCardTransform();
        
        initEventListeners();
        initSensor();
        
        if (BackgroundRemover && BackgroundRemover.init) BackgroundRemover.init();
        
        window.addEventListener('resize', () => {
            if (isCardVisible()) {
                setCardCenter();
                updateCardTransform();
            }
        });
        
        window.addEventListener('beforeunload', () => {
            autoSave();
        });
        
        setTimeout(() => {
            updatePreviewCardSize();
            updateActivePreviewStyles();
            if (BackgroundRemover && BackgroundRemover.updateDownloadButtonState) {
                BackgroundRemover.updateDownloadButtonState();
            }
        }, 200);
    }
    
    // Start the application
    init();
})();
