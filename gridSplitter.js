// Grid Image Splitter
// Automatically detects and splits images containing multiple tiles

let gridImageData = null;
let detectedGridTiles = [];

/**
 * Processes a grid image containing multiple tiles
 */
async function processGridImage() {
    const input = document.getElementById('grid-upload-input');
    const file = input.files[0];
    
    if (!file) {
        alert('Please select an image first');
        return;
    }
    
    showLoading('Detecting tiles in image...');
    
    try {
        const imageData = await readFileAsDataURL(file);
        gridImageData = imageData;
        
        // Detect and extract individual tiles
        const tiles = await detectAndExtractTiles(imageData);
        
        hideLoading();
        
        if (tiles.length === 0) {
            alert('No tiles detected. Please ensure the image is clear and tiles are well-separated.');
            return;
        }
        
        detectedGridTiles = tiles;
        displayDetectedTiles(tiles);
        
    } catch (error) {
        hideLoading();
        console.error('Error processing grid image:', error);
        alert('Failed to process image. Please try a clearer photo.');
    }
}

/**
 * Detects and extracts individual tiles from a grid image
 */
async function detectAndExtractTiles(imageDataUrl) {
    const img = await loadImage(imageDataUrl);
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Convert to grayscale and apply threshold for better edge detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const processed = preprocessForTileDetection(imageData);
    
    // Create temporary canvas with processed image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(processed, 0, 0);
    
    // Find connected regions (potential tiles)
    const regions = findConnectedRegions(processed);
    
    // Filter regions by size and aspect ratio (tiles should be roughly square)
    const validTiles = regions.filter(region => {
        const width = region.bounds.maxX - region.bounds.minX;
        const height = region.bounds.maxY - region.bounds.minY;
        const size = region.pixels.length;
        const aspectRatio = width / height;
        
        // Tiles should be reasonably sized and roughly square
        return size > 1000 && 
               size < canvas.width * canvas.height / 3 &&
               aspectRatio > 0.5 && 
               aspectRatio < 2.0;
    });
    
    // Sort tiles by position (top to bottom, left to right)
    validTiles.sort((a, b) => {
        const yDiff = a.centerY - b.centerY;
        if (Math.abs(yDiff) > 50) return yDiff; // Different rows
        return a.centerX - b.centerX; // Same row, sort by x
    });
    
    // Extract tile images
    const extractedTiles = [];
    for (const tile of validTiles) {
        const padding = 20;
        const x = Math.max(0, tile.bounds.minX - padding);
        const y = Math.max(0, tile.bounds.minY - padding);
        const width = Math.min(canvas.width - x, tile.bounds.maxX - tile.bounds.minX + padding * 2);
        const height = Math.min(canvas.height - y, tile.bounds.maxY - tile.bounds.minY + padding * 2);
        
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = width;
        tileCanvas.height = height;
        const tileCtx = tileCanvas.getContext('2d');
        
        tileCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
        
        extractedTiles.push({
            imageData: tileCanvas.toDataURL('image/jpeg', 0.9),
            bounds: tile.bounds,
            position: { x: tile.centerX, y: tile.centerY }
        });
    }
    
    return extractedTiles;
}

/**
 * Preprocesses image for better tile detection
 */
function preprocessForTileDetection(imageData) {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    
    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }
    
    // Apply edge detection (simple Sobel-like operator)
    const edges = new Uint8ClampedArray(data.length);
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            
            const gx = 
                -data[((y-1)*width + (x-1))*4] + data[((y-1)*width + (x+1))*4] +
                -2*data[(y*width + (x-1))*4] + 2*data[(y*width + (x+1))*4] +
                -data[((y+1)*width + (x-1))*4] + data[((y+1)*width + (x+1))*4];
            
            const gy = 
                -data[((y-1)*width + (x-1))*4] - 2*data[((y-1)*width + x)*4] - data[((y-1)*width + (x+1))*4] +
                data[((y+1)*width + (x-1))*4] + 2*data[((y+1)*width + x)*4] + data[((y+1)*width + (x+1))*4];
            
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            const value = magnitude > 50 ? 255 : 0; // Threshold
            
            edges[idx] = value;
            edges[idx + 1] = value;
            edges[idx + 2] = value;
            edges[idx + 3] = 255;
        }
    }
    
    // Invert (we want tiles to be white, background black)
    for (let i = 0; i < edges.length; i += 4) {
        edges[i] = 255 - edges[i];
        edges[i + 1] = 255 - edges[i + 1];
        edges[i + 2] = 255 - edges[i + 2];
    }
    
    return new ImageData(edges, width, height);
}

/**
 * Displays detected tiles for user to label
 */
function displayDetectedTiles(tiles) {
    const preview = document.getElementById('grid-preview');
    const container = document.getElementById('grid-tiles-detected');
    
    container.innerHTML = '';
    
    tiles.forEach((tile, index) => {
        const item = document.createElement('div');
        item.className = 'grid-tile-item';
        item.id = `grid-tile-${index}`;
        
        item.innerHTML = `
            <img src="${tile.imageData}" alt="Tile ${index + 1}">
            <select class="shape-select" data-index="${index}" onchange="updateGridTileLabel(${index})">
                <option value="">Select Shape</option>
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="diamond">Diamond</option>
                <option value="star">Star</option>
                <option value="clover">Clover</option>
                <option value="cross">Cross</option>
            </select>
        `;
        
        container.appendChild(item);
    });
    
    preview.style.display = 'block';
    
    // Scroll to preview
    preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Updates tile label when user selects shape
 */
function updateGridTileLabel(index) {
    const select = document.querySelector(`[data-index="${index}"]`);
    const item = document.getElementById(`grid-tile-${index}`);
    
    if (select.value) {
        item.classList.add('labeled');
        detectedGridTiles[index].shape = select.value;
    } else {
        item.classList.remove('labeled');
        delete detectedGridTiles[index].shape;
    }
    
    // Check if all tiles are labeled
    checkGridComplete();
}

/**
 * Checks if all tiles have been labeled
 */
function checkGridComplete() {
    const colorSelect = document.getElementById('grid-color-select');
    const allLabeled = detectedGridTiles.every(tile => tile.shape);
    const colorSelected = colorSelect.value !== '';
    
    const saveBtn = document.getElementById('save-grid-btn');
    saveBtn.disabled = !(allLabeled && colorSelected);
}

/**
 * Saves all labeled tiles to training data
 */
async function saveGridTiles() {
    const colorSelect = document.getElementById('grid-color-select');
    const color = colorSelect.value;
    
    if (!color) {
        alert('Please select the tile color');
        return;
    }
    
    const unlabeled = detectedGridTiles.filter(tile => !tile.shape);
    if (unlabeled.length > 0) {
        alert('Please label all tiles before saving');
        return;
    }
    
    showLoading('Saving tiles to training data...');
    
    try {
        const newImages = detectedGridTiles.map(tile => ({
            id: Date.now() + Math.random(),
            data: tile.imageData,
            color: color,
            shape: tile.shape,
            label: `${color}-${tile.shape}`,
            timestamp: new Date().toISOString()
        }));
        
        await trainingDataManager.addBatchImages(newImages);
        
        hideLoading();
        
        // Clear the grid interface
        cancelGrid();
        
        // Update display
        updateTrainingDisplay();
        
        alert(`Successfully added ${newImages.length} tiles to training data!`);
        
    } catch (error) {
        hideLoading();
        console.error('Error saving tiles:', error);
        alert('Failed to save tiles');
    }
}

/**
 * Cancels grid processing
 */
function cancelGrid() {
    document.getElementById('grid-preview').style.display = 'none';
    document.getElementById('grid-upload-input').value = '';
    document.getElementById('grid-color-select').value = '';
    gridImageData = null;
    detectedGridTiles = [];
}

// Add event listener for color selection
document.addEventListener('DOMContentLoaded', () => {
    const colorSelect = document.getElementById('grid-color-select');
    if (colorSelect) {
        colorSelect.addEventListener('change', checkGridComplete);
    }
});
