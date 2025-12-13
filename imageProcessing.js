// Image Processing Module
// Handles image comparison and tile detection

/**
 * Compares two images and detects differences (new tiles)
 * @param {string} previousImageData - Base64 data URL of previous photo
 * @param {string} currentImageData - Base64 data URL of current photo
 * @returns {Promise<Object>} Detection results with tile positions and colors
 */
async function detectAndScoreTiles(previousImageData, currentImageData) {
    // Create images from data URLs
    const prevImage = await loadImage(previousImageData);
    const currImage = await loadImage(currentImageData);
    
    // Create canvases for processing
    const canvas1 = document.createElement('canvas');
    const canvas2 = document.createElement('canvas');
    const diffCanvas = document.createElement('canvas');
    
    canvas1.width = canvas2.width = diffCanvas.width = prevImage.width;
    canvas1.height = canvas2.height = diffCanvas.height = prevImage.height;
    
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    const diffCtx = diffCanvas.getContext('2d');
    
    // Draw images
    ctx1.drawImage(prevImage, 0, 0);
    ctx2.drawImage(currImage, 0, 0);
    
    // Get image data
    const prevData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
    const currData = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
    const diffData = diffCtx.createImageData(diffCanvas.width, diffCanvas.height);
    
    // Calculate difference
    let changedPixels = 0;
    const threshold = 30; // Color difference threshold
    
    for (let i = 0; i < prevData.data.length; i += 4) {
        const rDiff = Math.abs(prevData.data[i] - currData.data[i]);
        const gDiff = Math.abs(prevData.data[i + 1] - currData.data[i + 1]);
        const bDiff = Math.abs(prevData.data[i + 2] - currData.data[i + 2]);
        
        const totalDiff = rDiff + gDiff + bDiff;
        
        if (totalDiff > threshold) {
            changedPixels++;
            // Mark difference in white
            diffData.data[i] = 255;
            diffData.data[i + 1] = 255;
            diffData.data[i + 2] = 255;
            diffData.data[i + 3] = 255;
        } else {
            diffData.data[i] = 0;
            diffData.data[i + 1] = 0;
            diffData.data[i + 2] = 0;
            diffData.data[i + 3] = 255;
        }
    }
    
    diffCtx.putImageData(diffData, 0, 0);
    
    // Analyze changed regions to detect tiles
    const tiles = await detectTilesInDifference(diffCanvas, currImage, ctx2);
    
    // If ML model is available, classify detected tiles
    if (tileDetector.isModelReady && tiles.length > 0) {
        for (const tile of tiles) {
            try {
                // Extract tile region as image
                const tileImage = extractTileImage(ctx2.canvas, tile);
                const classification = await tileDetector.classifyTile(tileImage);
                tile.color = classification.color;
                tile.shape = classification.shape;
                tile.colorConfidence = classification.colorConfidence;
                tile.shapeConfidence = classification.shapeConfidence;
            } catch (error) {
                console.error('Error classifying tile:', error);
            }
        }
    }
    
    // Calculate score based on detected tiles
    const score = calculateScoreFromTiles(tiles);
    
    return score;
}

/**
 * Loads an image from a data URL
 */
function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
    });
}

/**
 * Extracts a tile region as a base64 image
 */
function extractTileImage(canvas, tile) {
    const padding = 10;
    const minX = Math.max(0, tile.bounds.minX - padding);
    const minY = Math.max(0, tile.bounds.minY - padding);
    const width = Math.min(canvas.width - minX, tile.bounds.maxX - minX + padding * 2);
    const height = Math.min(canvas.height - minY, tile.bounds.maxY - minY + padding * 2);
    
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = width;
    tileCanvas.height = height;
    const ctx = tileCanvas.getContext('2d');
    
    ctx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);
    
    return tileCanvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Detects individual tiles in the difference image
 */
async function detectTilesInDifference(diffCanvas, currentImage, currentCanvas) {
    const ctx = diffCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, diffCanvas.width, diffCanvas.height);
    
    // Find connected regions (potential tiles)
    const regions = findConnectedRegions(imageData);
    
    // Filter regions by size (tiles should be within certain size range)
    const tiles = regions.filter(region => {
        const size = region.pixels.length;
        // Assuming tiles are at least 100 pixels and at most 10000 pixels
        return size > 100 && size < 50000;
    });
    
    // Analyze colors of detected tiles
    const ctx2 = document.createElement('canvas').getContext('2d');
    ctx2.canvas.width = currentImage.width;
    ctx2.canvas.height = currentImage.height;
    ctx2.drawImage(currentImage, 0, 0);
    const currentData = ctx2.getImageData(0, 0, currentImage.width, currentImage.height);
    
    tiles.forEach(tile => {
        tile.color = detectTileColor(tile, currentData);
    });
    
    return tiles;
}

/**
 * Finds connected regions in the image (blob detection)
 */
function findConnectedRegions(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const visited = new Array(width * height).fill(false);
    const regions = [];
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const pixelIdx = idx * 4;
            
            if (!visited[idx] && imageData.data[pixelIdx] > 128) {
                // Found unvisited white pixel, start flood fill
                const region = floodFill(imageData, x, y, visited);
                if (region.pixels.length > 50) {
                    regions.push(region);
                }
            }
        }
    }
    
    return regions;
}

/**
 * Flood fill algorithm to find connected regions
 */
function floodFill(imageData, startX, startY, visited) {
    const width = imageData.width;
    const height = imageData.height;
    const stack = [[startX, startY]];
    const pixels = [];
    
    let minX = startX, maxX = startX;
    let minY = startY, maxY = startY;
    
    while (stack.length > 0) {
        const [x, y] = stack.pop();
        
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        
        const idx = y * width + x;
        if (visited[idx]) continue;
        
        const pixelIdx = idx * 4;
        if (imageData.data[pixelIdx] < 128) continue;
        
        visited[idx] = true;
        pixels.push([x, y]);
        
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        
        // Add neighbors
        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
    }
    
    return {
        pixels,
        bounds: { minX, maxX, minY, maxY },
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2
    };
}

/**
 * Detects the dominant color of a tile
 */
function detectTileColor(tile, imageData) {
    const colorCounts = {};
    const width = imageData.width;
    
    // Sample pixels in the tile region
    tile.pixels.forEach(([x, y]) => {
        const idx = (y * width + x) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        
        // Classify color
        const colorName = classifyColor(r, g, b);
        colorCounts[colorName] = (colorCounts[colorName] || 0) + 1;
    });
    
    // Return most common color
    let maxCount = 0;
    let dominantColor = 'unknown';
    for (const [color, count] of Object.entries(colorCounts)) {
        if (count > maxCount) {
            maxCount = count;
            dominantColor = color;
        }
    }
    
    return dominantColor;
}

/**
 * Classifies RGB values into custom 3D-printed Qwirkle colors
 * Custom colors: Silver, Purple, Orange, Blue, Pink, Purple-Blue
 */
function classifyColor(r, g, b) {
    // Convert to HSV for better color classification
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const value = max / 255;
    const saturation = max === 0 ? 0 : delta / max;
    
    // Silver - low saturation, high value
    if (saturation < 0.15 && value > 0.5) return 'silver';
    
    // Too dark or no color
    if (delta < 30) return 'unknown';
    
    let hue = 0;
    if (delta !== 0) {
        if (max === r) {
            hue = 60 * (((g - b) / delta) % 6);
        } else if (max === g) {
            hue = 60 * (((b - r) / delta) + 2);
        } else {
            hue = 60 * (((r - g) / delta) + 4);
        }
    }
    
    if (hue < 0) hue += 360;
    
    // Classify based on hue for custom color set
    if (hue >= 15 && hue < 45) return 'orange';       // Orange
    if (hue >= 300 && hue < 360) return 'pink';        // Pink (magenta range)
    if (hue >= 180 && hue < 240) return 'blue';        // Blue
    if (hue >= 240 && hue < 270) return 'purple-blue'; // Purple-Blue
    if (hue >= 270 && hue < 300) return 'purple';      // Purple
    
    return 'unknown';
}

/**
 * Estimates score based on detected tiles
 * This is a simplified version - actual implementation would need more sophisticated analysis
 */
function calculateScoreFromTiles(tiles) {
    if (tiles.length === 0) {
        return 0;
    }
    
    // Sort tiles by position to detect lines
    const sortedByX = [...tiles].sort((a, b) => a.centerX - b.centerX);
    const sortedByY = [...tiles].sort((a, b) => a.centerY - b.centerY);
    
    // Detect if tiles form a line (horizontal or vertical)
    const isHorizontalLine = checkIfLine(sortedByX, 'x');
    const isVerticalLine = checkIfLine(sortedByY, 'y');
    
    if (isHorizontalLine || isVerticalLine) {
        // Tiles form a single line
        const lineLength = tiles.length;
        
        // In Qwirkle, you also score for existing tiles in the line
        // For simplicity, we estimate 2-3 additional tiles per placed tile
        const estimatedLineLength = lineLength + Math.floor(lineLength * 2);
        
        // Check for Qwirkle (6 tiles)
        if (estimatedLineLength >= 6) {
            return estimatedLineLength + 6; // Bonus points
        }
        
        return estimatedLineLength;
    } else {
        // Multiple tiles not in a straight line
        // Estimate score as number of tiles * average line length of 3
        return tiles.length * 3;
    }
}

/**
 * Checks if tiles form a line
 */
function checkIfLine(sortedTiles, axis) {
    if (sortedTiles.length < 2) return true;
    
    const positions = sortedTiles.map(t => axis === 'x' ? t.centerX : t.centerY);
    const otherPositions = sortedTiles.map(t => axis === 'x' ? t.centerY : t.centerX);
    
    // Check if other axis positions are similar (within threshold)
    const avgOther = otherPositions.reduce((a, b) => a + b, 0) / otherPositions.length;
    const threshold = 50; // pixels
    
    const isAligned = otherPositions.every(pos => Math.abs(pos - avgOther) < threshold);
    
    if (!isAligned) return false;
    
    // Check if spacing is relatively consistent
    const gaps = [];
    for (let i = 1; i < positions.length; i++) {
        gaps.push(positions[i] - positions[i - 1]);
    }
    
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const consistentSpacing = gaps.every(gap => Math.abs(gap - avgGap) < avgGap * 0.5);
    
    return consistentSpacing;
}
