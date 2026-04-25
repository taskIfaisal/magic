// ===== GITHUB PICKER MODULE =====
const GithubPicker = (function() {
    let currentFolder = null;
    let selectedImage = null;
    let modalElement = null;
    let activePreview = 1;
    
    async function loadRootFolders() {
        try {
            const response = await fetch(CONFIG.GITHUB_API_URL);
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
            const folderUrl = `${CONFIG.GITHUB_API_URL}/${folderName}`;
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
    
    function showModal(previewNumber) {
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
                    CardManager.updateCardImage(imageUrl);
                }
                
                document.querySelectorAll('.preview-box').forEach(p => p.classList.remove('selected'));
                previewBox.classList.add('selected');
                
                window.autoSave();
                
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
    
    return {
        showModal
    };
})();
