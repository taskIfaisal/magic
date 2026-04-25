// ===== SENSOR MODULE =====
const Sensor = (function() {
    let smoothBeta = 0;
    let smoothGamma = 0;
    const sensitivity = 0.5;
    const smoothing = 0.2;
    let isSensorEnabled = false;
    let animationFrameId = null;
    
    const sensorPermissionBtn = document.getElementById('sensor-permission');
    const sensorGerakCheckbox = document.getElementById('sensor-gerak');
    
    function init() {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === "function") {
            if (sensorPermissionBtn) {
                sensorPermissionBtn.classList.remove('hidden');
                sensorPermissionBtn.onclick = async () => {
                    try {
                        const permission = await DeviceOrientationEvent.requestPermission();
                        if (permission === "granted") {
                            sensorPermissionBtn.classList.add('hidden');
                            start();
                        }
                    } catch (error) {
                        console.error("Error requesting permission:", error);
                        sensorPermissionBtn.innerHTML = "Error requesting permission.<br>Try refreshing the page.";
                    }
                };
            }
        } else {
            if (sensorPermissionBtn) sensorPermissionBtn.classList.add('hidden');
            start();
        }
    }
    
    function start() {
        isSensorEnabled = true;
        if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", handleDeviceOrientation);
            startAnimation();
        }
    }
    
    function handleDeviceOrientation(e) {
        const beta = e.beta || 0;
        const gamma = e.gamma || 0;
        
        const limitedBeta = Math.max(-45, Math.min(45, beta));
        const limitedGamma = Math.max(-45, Math.min(45, gamma));
        
        smoothBeta += (limitedBeta - smoothBeta) * smoothing;
        smoothGamma += (limitedGamma - smoothGamma) * smoothing;
    }
    
    function startAnimation() {
        function animate() {
            const isDragging = window.isDragging || false;
            const isAnimatingMotion = CardManager.isAnimatingMotion();
            const isSensorActive = sensorGerakCheckbox ? sensorGerakCheckbox.checked : true;
            const isCardVisible = CardManager.isCardVisible();
            
            if (isSensorEnabled && !isDragging && !isAnimatingMotion && isSensorActive && isCardVisible) {
                const pos = CardManager.getCardPosition();
                const newX = pos.x + smoothGamma * sensitivity;
                const newY = pos.y + smoothBeta * sensitivity;
                CardManager.setCardPosition(newX, newY);
                CardManager.applyBounds();
                CardManager.updateCardTransform();
            }
            animationFrameId = requestAnimationFrame(animate);
        }
        animate();
    }
    
    function stop() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        isSensorEnabled = false;
    }
    
    return {
        init,
        start,
        stop
    };
})();
