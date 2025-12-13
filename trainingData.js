// Training Data Manager
// Handles collection and management of training images for tile detection

class TrainingDataManager {
    constructor() {
        this.trainingImages = [];
        this.loadFromStorage();
    }
    
    /**
     * Adds a training image
     */
    async addImage(imageData, color, shape) {
        const image = {
            id: Date.now() + Math.random(),
            data: imageData,
            color: color,
            shape: shape,
            label: `${color}-${shape}`,
            timestamp: new Date().toISOString()
        };
        
        this.trainingImages.push(image);
        await this.saveToStorage();
        
        return image;
    }
    
    /**
     * Removes a training image
     */
    async removeImage(imageId) {
        this.trainingImages = this.trainingImages.filter(img => img.id !== imageId);
        await this.saveToStorage();
    }
    
    /**
     * Gets all images for a specific tile type
     */
    getImagesByLabel(color, shape) {
        const label = `${color}-${shape}`;
        return this.trainingImages.filter(img => img.label === label);
    }
    
    /**
     * Gets all images grouped by label
     */
    getGroupedImages() {
        const grouped = {};
        
        this.trainingImages.forEach(img => {
            if (!grouped[img.label]) {
                grouped[img.label] = [];
            }
            grouped[img.label].push(img);
        });
        
        return grouped;
    }
    
    /**
     * Gets statistics about training data
     */
    getStats() {
        const grouped = this.getGroupedImages();
        const stats = {
            total: this.trainingImages.length,
            byLabel: {},
            colors: new Set(),
            shapes: new Set()
        };
        
        for (const [label, images] of Object.entries(grouped)) {
            stats.byLabel[label] = images.length;
        }
        
        this.trainingImages.forEach(img => {
            stats.colors.add(img.color);
            stats.shapes.add(img.shape);
        });
        
        stats.colors = Array.from(stats.colors);
        stats.shapes = Array.from(stats.shapes);
        
        return stats;
    }
    
    /**
     * Exports training data as JSON
     */
    exportData() {
        return JSON.stringify(this.trainingImages, null, 2);
    }
    
    /**
     * Imports training data from JSON
     */
    async importData(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            if (Array.isArray(imported)) {
                this.trainingImages = imported;
                await this.saveToStorage();
                return true;
            }
        } catch (error) {
            console.error('Failed to import training data:', error);
        }
        return false;
    }
    
    /**
     * Adds multiple images at once
     */
    async addBatchImages(imagesArray) {
        this.trainingImages.push(...imagesArray);
        await this.saveToStorage();
    }
    
    /**
     * Clears all training data
     */
    async clearAll() {
        this.trainingImages = [];
        await this.saveToStorage();
    }
    
    /**
     * Saves training data to localStorage
     */
    async saveToStorage() {
        try {
            // Split large data into chunks to avoid localStorage limits
            const chunkSize = 500000; // ~500KB per chunk
            const jsonData = JSON.stringify(this.trainingImages);
            const chunks = [];
            
            for (let i = 0; i < jsonData.length; i += chunkSize) {
                chunks.push(jsonData.substring(i, i + chunkSize));
            }
            
            localStorage.setItem('qwirkle_training_chunks', chunks.length.toString());
            chunks.forEach((chunk, index) => {
                localStorage.setItem(`qwirkle_training_${index}`, chunk);
            });
            
            console.log(`Saved ${this.trainingImages.length} training images in ${chunks.length} chunks`);
        } catch (error) {
            console.error('Failed to save training data:', error);
            alert('Storage limit reached. Please export your training data and clear some images.');
        }
    }
    
    /**
     * Loads training data from localStorage
     */
    loadFromStorage() {
        try {
            const numChunks = parseInt(localStorage.getItem('qwirkle_training_chunks') || '0');
            
            if (numChunks === 0) {
                this.trainingImages = [];
                return;
            }
            
            let jsonData = '';
            for (let i = 0; i < numChunks; i++) {
                jsonData += localStorage.getItem(`qwirkle_training_${i}`) || '';
            }
            
            this.trainingImages = JSON.parse(jsonData);
            console.log(`Loaded ${this.trainingImages.length} training images from storage`);
        } catch (error) {
            console.error('Failed to load training data:', error);
            this.trainingImages = [];
        }
    }
}

// Global training data manager
const trainingDataManager = new TrainingDataManager();

// UI Functions for Training Screen
function initializeTrainingScreen() {
    const fileInput = document.getElementById('tile-photo-input');
    const colorSelect = document.getElementById('tile-color-select');
    const shapeSelect = document.getElementById('tile-shape-select');
    const addBtn = document.getElementById('add-training-btn');
    
    // Preview image when selected
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const preview = document.getElementById('tile-preview');
                preview.innerHTML = `<img src="${event.target.result}" alt="Tile preview">`;
                preview.classList.remove('empty');
                
                // Enable add button if color and shape are selected
                checkAddButtonState();
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Enable/disable add button based on selections
    colorSelect.addEventListener('change', checkAddButtonState);
    shapeSelect.addEventListener('change', checkAddButtonState);
    
    // Load existing training images
    updateTrainingDisplay();
}

function checkAddButtonState() {
    const colorSelect = document.getElementById('tile-color-select');
    const shapeSelect = document.getElementById('tile-shape-select');
    const fileInput = document.getElementById('tile-photo-input');
    const addBtn = document.getElementById('add-training-btn');
    
    const hasColor = colorSelect.value !== '';
    const hasShape = shapeSelect.value !== '';
    const hasFile = fileInput.files.length > 0;
    
    addBtn.disabled = !(hasColor && hasShape && hasFile);
}

async function addTrainingImage() {
    const colorSelect = document.getElementById('tile-color-select');
    const shapeSelect = document.getElementById('tile-shape-select');
    const fileInput = document.getElementById('tile-photo-input');
    
    const color = colorSelect.value;
    const shape = shapeSelect.value;
    const file = fileInput.files[0];
    
    if (!color || !shape || !file) {
        alert('Please select color, shape, and upload an image');
        return;
    }
    
    showLoading('Adding training image...');
    
    try {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const imageData = event.target.result;
            
            await trainingDataManager.addImage(imageData, color, shape);
            
            // Reset form
            fileInput.value = '';
            colorSelect.value = '';
            shapeSelect.value = '';
            document.getElementById('tile-preview').innerHTML = '';
            document.getElementById('tile-preview').classList.add('empty');
            document.getElementById('add-training-btn').disabled = true;
            
            updateTrainingDisplay();
            hideLoading();
            
            alert('Training image added successfully!');
        };
        reader.readAsDataURL(file);
    } catch (error) {
        hideLoading();
        console.error('Error adding training image:', error);
        alert('Failed to add training image');
    }
}

function updateTrainingDisplay() {
    const stats = trainingDataManager.getStats();
    document.getElementById('total-training-images').textContent = stats.total;
    
    const grid = document.getElementById('training-images-grid');
    grid.innerHTML = '';
    
    trainingDataManager.trainingImages.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'training-image-item';
        item.innerHTML = `
            <img src="${image.data}" alt="${image.label}">
            <div class="label">${image.label}</div>
            <button class="delete-btn" onclick="deleteTrainingImage('${image.id}')">×</button>
        `;
        grid.appendChild(item);
    });
}

async function deleteTrainingImage(imageId) {
    if (confirm('Delete this training image?')) {
        await trainingDataManager.removeImage(imageId);
        updateTrainingDisplay();
    }
}

function exportTrainingData() {
    const data = trainingDataManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `qwirkle-training-data-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    alert('Training data exported successfully!');
}

function importTrainingData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        showLoading('Importing training data...');
        
        try {
            const text = await file.text();
            const success = await trainingDataManager.importData(text);
            
            hideLoading();
            
            if (success) {
                updateTrainingDisplay();
                alert('Training data imported successfully!');
            } else {
                alert('Failed to import training data. Check file format.');
            }
        } catch (error) {
            hideLoading();
            console.error('Error importing data:', error);
            alert('Failed to import training data');
        }
    };
    
    input.click();
}

async function batchUploadImages() {
    const input = document.getElementById('batch-upload-input');
    const files = input.files;
    
    if (files.length === 0) {
        alert('Please select images to upload');
        return;
    }
    
    const progressDiv = document.getElementById('batch-progress');
    const currentSpan = document.getElementById('batch-current');
    const totalSpan = document.getElementById('batch-total');
    const progressFill = document.getElementById('batch-progress-fill');
    
    progressDiv.style.display = 'block';
    totalSpan.textContent = files.length;
    
    const newImages = [];
    let processed = 0;
    let skipped = 0;
    
    for (const file of files) {
        // Parse filename: color-shape-##.jpg
        const filename = file.name;
        const match = filename.match(/^(silver|purple|orange|blue|pink|purple-blue)-(circle|square|diamond|star|clover|cross)-?\d*\.(jpg|jpeg|png)$/i);
        
        if (match) {
            const color = match[1].toLowerCase();
            const shape = match[2].toLowerCase();
            
            try {
                const imageData = await readFileAsDataURL(file);
                newImages.push({
                    id: Date.now() + Math.random(),
                    data: imageData,
                    color: color,
                    shape: shape,
                    label: `${color}-${shape}`,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error(`Error reading ${filename}:`, error);
                skipped++;
            }
        } else {
            console.warn(`Skipping ${filename} - invalid format`);
            skipped++;
        }
        
        processed++;
        currentSpan.textContent = processed;
        progressFill.style.width = `${(processed / files.length) * 100}%`;
        
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    if (newImages.length > 0) {
        await trainingDataManager.addBatchImages(newImages);
        updateTrainingDisplay();
    }
    
    progressDiv.style.display = 'none';
    input.value = '';
    
    alert(`Batch upload complete!\n${newImages.length} images added\n${skipped} files skipped`);
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function clearAllTrainingData() {
    if (confirm('Are you sure you want to delete ALL training data? This cannot be undone.')) {
        if (confirm('Really delete everything? Export your data first if you want to keep it.')) {
            await trainingDataManager.clearAll();
            updateTrainingDisplay();
            alert('All training data cleared');
        }
    }
}

async function trainModel() {
    const stats = trainingDataManager.getStats();
    
    if (stats.total < 10) {
        alert('Please add at least 10 training images before training the model');
        return;
    }
    
    showLoading('Training model... This may take a few minutes');
    
    try {
        await tileDetector.train(trainingDataManager.trainingImages);
        hideLoading();
        alert('Model trained successfully! You can now use it during games.');
    } catch (error) {
        hideLoading();
        console.error('Training failed:', error);
        alert('Failed to train model: ' + error.message);
    }
}

// Initialize training screen when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeTrainingScreen();
});
