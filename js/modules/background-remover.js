// ===== BACKGROUND REMOVER MODULE =====
const BackgroundRemover = (function() {
    let processedImageBlob = null;
    const removeBgBtn = document.getElementById('remove-bg-btn');
    const downloadBtn = document.getElementById('download-result-btn');
    const removeBgStatus = document.getElementById('remove-bg-status');
    const mainCardPreview = document.getElementById('main-card-preview');
    
    function updateDownloadButtonState() {
        if (!downloadBtn) return;
        const hasImage = mainCardPreview && mainCardPreview.src && 
                        mainCardPreview.src !== '' && 
                        !mainCardPreview.src.includes('undefined');
        downloadBtn.disabled = !hasImage;
    }
    
    function showStatus(message, isError = false) {
        if (!removeBgStatus) return;
        removeBgStatus.style.display = 'block';
        removeBgStatus.textContent = message;
        removeBgStatus.className = 'remove-bg-status ' + (isError ? 'error' : 'success');
    }
    
    function hideStatus() {
        if (removeBgStatus) removeBgStatus.style.display = 'none';
    }
    
    function setLoading(isLoading) {
        if (!removeBgBtn) return;
        
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
            if (loadingOverlay) loadingOverlay.remove();
        }
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
                
                resolve(cropCanvas.toDataURL('image/png'));
            };
            
            img.onerror = () => reject(new Error('Gagal memuat gambar untuk auto-crop'));
            img.src = imageSrc;
        });
    }
    
    async function removeBackground() {
        const currentImageSrc = mainCardPreview ? mainCardPreview.src : null;
        
        if (!currentImageSrc || currentImageSrc === '') {
            showStatus('Tidak ada gambar yang diproses', true);
            setTimeout(hideStatus, 3000);
            return;
        }
        
        try {
            setLoading(true);
            hideStatus();
            processedImageBlob = null;
            
            let imageBlob;
            
            if (currentImageSrc.startsWith('data:')) {
                const response = await fetch(currentImageSrc);
                imageBlob = await response.blob();
            } else {
                const headResponse = await fetch(currentImageSrc, { method: 'HEAD' });
                const contentLength = headResponse.headers.get('content-length');
                
                if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
                    throw new Error('Ukuran file terlalu besar (maks 5MB)');
                }
                
                const response = await fetch(currentImageSrc);
                imageBlob = await response.blob();
            }
            
            if (imageBlob.size > 5 * 1024 * 1024) {
                throw new Error('Ukuran file maksimal 5MB');
            }
            
            const formData = new FormData();
            formData.append('image_file', imageBlob, 'image.png');
            formData.append('size', 'auto');
            
            const response = await fetch(CONFIG.REMOVE_BG_API_URL, {
                method: 'POST',
                headers: { 'X-Api-Key': CONFIG.REMOVE_BG_API_KEY },
                body: formData
            });
            
            if (!response.ok) {
                let errorText = '';
                try { errorText = await response.text(); } catch(e) { errorText = response.statusText; }
                
                if (response.status === 402) throw new Error('API key tidak memiliki cukup kredit');
                if (response.status === 400) throw new Error('Gambar tidak valid atau format tidak didukung');
                throw new Error(`Error ${response.status}: ${errorText.substring(0, 100)}`);
            }
            
            const resultBlob = await response.blob();
            processedImageBlob = resultBlob;
            
            const reader = new FileReader();
            reader.onload = async function(event) {
                try {
                    showStatus('⏳ Merapikan pinggiran gambar...', false);
                    const croppedImageUrl = await autoCropImage(event.target.result);
                    CardManager.updateCardImage(croppedImageUrl);
                    const croppedResponse = await fetch(croppedImageUrl);
                    processedImageBlob = await croppedResponse.blob();
                    setLoading(false);
                    showStatus('✅ Background terhapus & pinggiran dirapikan!');
                    setTimeout(hideStatus, 3000);
                } catch (cropError) {
                    CardManager.updateCardImage(event.target.result);
                    setLoading(false);
                    showStatus('✅ Background terhapus (tanpa crop)', false);
                    setTimeout(hideStatus, 3000);
                }
            };
            reader.readAsDataURL(resultBlob);
            
        } catch (error) {
            setLoading(false);
            let errorMessage = error.message;
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = 'Error CORS atau jaringan. Gunakan extension CORS Unblock atau coba gambar lain.';
            }
            showStatus(`❌ Gagal: ${errorMessage}`, true);
            setTimeout(hideStatus, 5000);
        }
    }
    
    function downloadResult() {
        if (processedImageBlob) {
            const url = URL.createObjectURL(processedImageBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'removed-background-cropped.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showStatus('✅ Gambar hasil diunduh!');
            setTimeout(hideStatus, 2000);
        } else if (mainCardPreview && mainCardPreview.src && mainCardPreview.src !== '') {
            const a = document.createElement('a');
            a.href = mainCardPreview.src;
            a.download = 'gambar-asli.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showStatus('✅ Gambar asli diunduh!');
            setTimeout(hideStatus, 2000);
        } else {
            showStatus('Tidak ada gambar untuk diunduh', true);
            setTimeout(hideStatus, 2000);
        }
    }
    
    function init() {
        if (removeBgBtn) removeBgBtn.addEventListener('click', removeBackground);
        if (downloadBtn) downloadBtn.addEventListener('click', downloadResult);
        updateDownloadButtonState();
    }
    
    return { init, updateDownloadButtonState };
})();
