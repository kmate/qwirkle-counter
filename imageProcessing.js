// Image Processing Module
// Handles image comparison and tile detection

/**
 * Compares two images and detects differences (new tiles)
 * @param {string} previousImageData - Base64 data URL of previous photo
 * @param {string} currentImageData - Base64 data URL of current photo
 * @returns {Promise<Object>} Detection results with tile positions and colors
 */
async function detectAndScoreTiles(previousImageData, currentImageData) {
    console.log('Starting tile detection and scoring...');
    
    // Step 1: Detect all tiles in current image
    const currentTiles = await detectAllTilesInImage(currentImageData);
    
    // Step 2: Detect all tiles in previous image (if exists)
    let previousTiles = [];
    if (previousImageData) {
        previousTiles = await detectAllTilesInImage(previousImageData);
    }
    
    // Step 3: Compare tile sets to find new tiles
    const newTiles = findNewTiles(previousTiles, currentTiles);
    
    console.log(`Found ${currentTiles.length} tiles in current image, ${previousTiles.length} in previous, ${newTiles.length} new tiles`);
    
    // Step 4: Calculate score based on new tiles
    const score = calculateQwirkleScore(newTiles, currentTiles);
    
    return score;
}

/**
 * Detects all tiles in an image and their positions using relative positioning
 * Designed for handheld phone photography with significant variation
 * @param {string} imageData - Base64 data URL of the image
 * @returns {Promise<Array>} Array of detected tiles with relative positioning
 */
async function detectAllTilesInImage(imageData) {
    console.log('Detecting tiles in image (handheld mode)...');
    
    // Load the image
    const img = await loadImage(imageData);
    
    // Create canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Step 1: Extract individual tiles with more lenient detection
    const extractedTiles = await detectAndExtractTilesRobust(imageData);
    
    // Step 2: Classify each tile using the ML model
    const classifiedTiles = [];
    
    if (tileDetector.isModelReady && extractedTiles.length > 0) {
        for (let i = 0; i < extractedTiles.length; i++) {
            const tile = extractedTiles[i];
            try {
                const classification = await tileDetector.classifyTile(tile.imageData);
                
                // Create relative position descriptor instead of grid coordinates
                const positionDescriptor = createRelativePositionDescriptor(
                    tile.position, 
                    extractedTiles, 
                    img.width, 
                    img.height
                );
                
                classifiedTiles.push({
                    id: `tile_${i}`,
                    color: classification.color,
                    shape: classification.shape,
                    colorConfidence: classification.colorConfidence,
                    shapeConfidence: classification.shapeConfidence,
                    pixelPosition: tile.position,
                    positionDescriptor: positionDescriptor,
                    bounds: tile.bounds,
                    imageData: tile.imageData,
                    size: (tile.bounds.maxX - tile.bounds.minX) * (tile.bounds.maxY - tile.bounds.minY)
                });
                
            } catch (error) {
                console.error('Error classifying tile:', error);
                // Add unclassified tile for position tracking
                const positionDescriptor = createRelativePositionDescriptor(
                    tile.position, 
                    extractedTiles, 
                    img.width, 
                    img.height
                );
                classifiedTiles.push({
                    id: `tile_${i}`,
                    color: 'unknown',
                    shape: 'unknown',
                    colorConfidence: 0,
                    shapeConfidence: 0,
                    pixelPosition: tile.position,
                    positionDescriptor: positionDescriptor,
                    bounds: tile.bounds,
                    imageData: tile.imageData,
                    size: (tile.bounds.maxX - tile.bounds.minX) * (tile.bounds.maxY - tile.bounds.minY)
                });
            }
        }
    }
    
    console.log(`Detected and classified ${classifiedTiles.length} tiles`);
    return classifiedTiles;
}

/**
 * Fast tile detection optimized for performance
 * Uses a single, efficient strategy instead of multiple slow ones
 */
async function detectAndExtractTilesRobust(imageDataUrl) {
    console.log('Starting fast tile detection...');
    const img = await loadImage(imageDataUrl);
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Use simplified edge detection only - much faster than multiple strategies
    const extractedTiles = await detectTilesByFastEdges(canvas, img);
    
    console.log(`Fast detection found ${extractedTiles.length} tiles`);
    return extractedTiles;
}

/**
 * Fast edge-based tile detection - optimized for speed
 */
async function detectTilesByFastEdges(canvas, img) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simplified preprocessing - much faster
    const processed = fastPreprocessing(imageData);
    
    // Fast connected regions - smaller processing area
    const regions = fastConnectedRegions(processed);
    
    // Quick filtering for tiles
    const validTiles = regions.filter(region => {
        const width = region.bounds.maxX - region.bounds.minX;
        const height = region.bounds.maxY - region.bounds.minY;
        const size = region.pixels.length;
        
        // Simplified filtering for speed
        const minSize = 500; // Fixed minimum instead of calculated
        const maxSize = canvas.width * canvas.height * 0.2; // Max 20% of image
        
        return size > minSize && 
               size < maxSize &&
               width > 30 && height > 30 &&
               width < canvas.width * 0.8 && height < canvas.height * 0.8;
    });
    
    return extractTileImagesFast(validTiles, canvas);
}

/**
 * Fast preprocessing - simplified version
 */
function fastPreprocessing(imageData) {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    
    // Simple threshold instead of adaptive - much faster
    const threshold = 128;
    
    for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        
        // Simple threshold
        const value = gray > threshold ? 255 : 0;
        
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
    }
    
    return new ImageData(data, width, height);
}

/**
 * Fast connected regions - processes smaller samples
 */
function fastConnectedRegions(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const visited = new Array(width * height).fill(false);
    const regions = [];
    
    // Sample every 4th pixel for speed
    const step = 4;
    
    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const idx = y * width + x;
            const pixelIdx = idx * 4;
            
            if (!visited[idx] && imageData.data[pixelIdx] > 128) {
                const region = fastFloodFill(imageData, x, y, visited, step);
                if (region.pixels.length > 20) {
                    regions.push(region);
                }
            }
        }
    }
    
    return regions;
}

/**
 * Fast flood fill - limits depth to prevent slowdown
 */
function fastFloodFill(imageData, startX, startY, visited, step) {
    const width = imageData.width;
    const height = imageData.height;
    const stack = [[startX, startY]];
    const pixels = [];
    const maxPixels = 10000; // Limit region size to prevent slowdown
    
    let minX = startX, maxX = startX;
    let minY = startY, maxY = startY;
    
    while (stack.length > 0 && pixels.length < maxPixels) {
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
        
        // Add neighbors with step for speed
        stack.push([x + step, y]);
        stack.push([x - step, y]);
        stack.push([x, y + step]);
        stack.push([x, y - step]);
    }
    
    return {
        pixels,
        bounds: { minX, maxX, minY, maxY },
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2
    };
}

/**
 * Fast tile image extraction
 */
function extractTileImagesFast(regions, canvas) {
    const extractedTiles = [];
    
    for (const region of regions) {
        const padding = 5; // Smaller padding for speed
        const x = Math.max(0, region.bounds.minX - padding);
        const y = Math.max(0, region.bounds.minY - padding);
        const width = Math.min(canvas.width - x, region.bounds.maxX - region.bounds.minX + padding * 2);
        const height = Math.min(canvas.height - y, region.bounds.maxY - region.bounds.minY + padding * 2);
        
        if (width > 20 && height > 20) {
            const tileCanvas = document.createElement('canvas');
            tileCanvas.width = width;
            tileCanvas.height = height;
            const tileCtx = tileCanvas.getContext('2d');
            
            tileCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
            
            extractedTiles.push({
                imageData: tileCanvas.toDataURL('image/jpeg', 0.8), // Lower quality for speed
                bounds: region.bounds,
                position: { x: region.centerX, y: region.centerY }
            });
        }
    }
    
    return extractedTiles;
}

/**
 * Improved preprocessing that better handles touching tiles
 */
function preprocessForTileDetectionImproved(imageData) {
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
    
    // Apply adaptive thresholding instead of edge detection
    // This works better for tiles that may have similar colors touching
    const processed = new Uint8ClampedArray(data.length);
    const windowSize = 15;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            // Calculate local mean in window
            let sum = 0;
            let count = 0;
            
            for (let dy = -windowSize; dy <= windowSize; dy++) {
                for (let dx = -windowSize; dx <= windowSize; dx++) {
                    const ny = y + dy;
                    const nx = x + dx;
                    
                    if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                        const nidx = (ny * width + nx) * 4;
                        sum += data[nidx];
                        count++;
}

/**
 * Finds connected regions in the image (blob detection)
 * Used by the improved tile detection system
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
                }
            }
            
            const localMean = sum / count;
            const threshold = localMean - 10; // Adaptive threshold
            
            const value = data[idx] > threshold ? 255 : 0;
            
            processed[idx] = value;
            processed[idx + 1] = value;
            processed[idx + 2] = value;
            processed[idx + 3] = 255;
        }
    }
    
    return new ImageData(processed, width, height);
}

/**
 * Grid-based splitting for when tiles touch completely
 */
function attemptGridBasedSplitting(canvas, img) {
    console.log('Attempting grid-based splitting for touching tiles...');
    
    // Try to detect a regular grid pattern
    // Estimate tile size based on image dimensions and assume a reasonable grid
    const estimatedTileSize = Math.min(canvas.width, canvas.height) / 8; // Assume max 8x8 grid
    const minTileSize = 50; // Minimum reasonable tile size
    const maxTileSize = Math.min(canvas.width, canvas.height) / 3; // Maximum reasonable tile size
    
    const tileSize = Math.max(minTileSize, Math.min(maxTileSize, estimatedTileSize));
    
    const cols = Math.floor(canvas.width / tileSize);
    const rows = Math.floor(canvas.height / tileSize);
    
    const extractedTiles = [];
    
    // Extract grid-based tiles
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * tileSize;
            const y = row * tileSize;
            const width = Math.min(tileSize, canvas.width - x);
            const height = Math.min(tileSize, canvas.height - y);
            
            // Check if this tile area contains enough content
            const ctx = canvas.getContext('2d');
            const tileData = ctx.getImageData(x, y, width, height);
            
            if (tileContainsContent(tileData)) {
                const tileCanvas = document.createElement('canvas');
                tileCanvas.width = width;
                tileCanvas.height = height;
                const tileCtx = tileCanvas.getContext('2d');
                
                tileCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
                
                extractedTiles.push({
                    imageData: tileCanvas.toDataURL('image/jpeg', 0.9),
                    bounds: { minX: x, maxX: x + width, minY: y, maxY: y + height },
                    position: { x: x + width / 2, y: y + height / 2 }
                });
            }
        }
    }
    
    console.log(`Grid-based splitting found ${extractedTiles.length} potential tiles`);
    return extractedTiles;
}

/**
 * Check if a tile area contains actual content (not just background)
 */
function tileContainsContent(imageData) {
    const data = imageData.data;
    let colorVariance = 0;
    let meanR = 0, meanG = 0, meanB = 0;
    let count = 0;
    
    // Calculate mean color
    for (let i = 0; i < data.length; i += 4) {
        meanR += data[i];
        meanG += data[i + 1];
        meanB += data[i + 2];
        count++;
    }
    
    meanR /= count;
    meanG /= count;
    meanB /= count;
    
    // Calculate variance
    for (let i = 0; i < data.length; i += 4) {
        const rDiff = data[i] - meanR;
        const gDiff = data[i + 1] - meanG;
        const bDiff = data[i + 2] - meanB;
        colorVariance += rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;
    }
    
    colorVariance /= count;
    
    // If variance is too low, it's probably background
    return colorVariance > 1000; // Threshold for content detection
}

/**
 * Creates a relative position descriptor instead of precise grid coordinates
 * This accounts for handheld photography variations
 */
function createRelativePositionDescriptor(pixelPos, allTiles, imageWidth, imageHeight) {
    if (allTiles.length === 0) {
        return { 
            relativeX: pixelPos.x / imageWidth, 
            relativeY: pixelPos.y / imageHeight,
            nearbyTiles: []
        };
    }
    
    // Calculate relative position as percentage of image
    const relativeX = pixelPos.x / imageWidth;
    const relativeY = pixelPos.y / imageHeight;
    
    // Find nearby tiles (helps with matching across photos)
    const nearbyTiles = allTiles
        .filter(tile => tile.position.x !== pixelPos.x || tile.position.y !== pixelPos.y)
        .map(tile => ({
            distance: Math.sqrt(
                Math.pow(tile.position.x - pixelPos.x, 2) + 
                Math.pow(tile.position.y - pixelPos.y, 2)
            ),
            relativeAngle: Math.atan2(
                tile.position.y - pixelPos.y, 
                tile.position.x - pixelPos.x
            ),
            tile: tile
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4); // Keep 4 closest neighbors
    
    return {
        relativeX,
        relativeY,
        nearbyTiles: nearbyTiles.map(nt => ({
            distance: nt.distance / Math.max(imageWidth, imageHeight), // Normalize distance
            angle: nt.relativeAngle,
            color: nt.tile.color || 'unknown',
            shape: nt.tile.shape || 'unknown'
        }))
    };
}

/**
 * Find new tiles by comparing current and previous tile sets
 * Robust matching for handheld photography - uses visual similarity, not precise positioning
 */
function findNewTiles(previousTiles, currentTiles) {
    console.log(`Comparing ${currentTiles.length} current tiles with ${previousTiles.length} previous tiles (handheld mode)`);
    
    if (previousTiles.length === 0) {
        console.log('No previous tiles, all current tiles are considered new');
        return currentTiles;
    }
    
    const newTiles = [];
    
    for (const currentTile of currentTiles) {
        // Find the best matching tile from previous image
        const bestMatch = findBestMatchingTile(currentTile, previousTiles);
        
        if (!bestMatch || bestMatch.confidence < 0.6) {
            console.log(`Found new tile: ${currentTile.color} ${currentTile.shape} (confidence: ${bestMatch?.confidence || 0})`);
            newTiles.push(currentTile);
        } else {
            console.log(`Matched existing tile: ${currentTile.color} ${currentTile.shape} with confidence ${bestMatch.confidence}`);
        }
    }
    
    console.log(`Identified ${newTiles.length} new tiles`);
    return newTiles;
}

/**
 * Find the best matching tile based on multiple criteria
 * Uses visual similarity, size, and relative position
 */
function findBestMatchingTile(targetTile, candidateTiles) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const candidate of candidateTiles) {
        const score = calculateTileMatchScore(targetTile, candidate);
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = {
                tile: candidate,
                confidence: score
            };
        }
    }
    
    return bestMatch;
}

/**
 * Calculate how well two tiles match across different photos
 * Considers color, shape, relative position, and size
 */
function calculateTileMatchScore(tile1, tile2) {
    let score = 0;
    let totalWeight = 0;
    
    // 1. Color and Shape matching (most important)
    const colorWeight = 40;
    const shapeWeight = 40;
    
    if (tile1.color === tile2.color && tile1.color !== 'unknown') {
        score += colorWeight;
    }
    totalWeight += colorWeight;
    
    if (tile1.shape === tile2.shape && tile1.shape !== 'unknown') {
        score += shapeWeight;
    }
    totalWeight += shapeWeight;
    
    // 2. Relative position similarity (important for handheld photos)
    const positionWeight = 15;
    const positionSimilarity = calculatePositionSimilarity(
        tile1.positionDescriptor, 
        tile2.positionDescriptor
    );
    score += positionSimilarity * positionWeight;
    totalWeight += positionWeight;
    
    // 3. Size similarity (camera distance can change)
    const sizeWeight = 5;
    const sizeSimilarity = calculateSizeSimilarity(tile1.size, tile2.size);
    score += sizeSimilarity * sizeWeight;
    totalWeight += sizeWeight;
    
    // Return normalized score (0-1)
    return totalWeight > 0 ? score / totalWeight : 0;
}

/**
 * Calculate how similar the relative positions are between two tiles
 * Accounts for camera movement and angle changes
 */
function calculatePositionSimilarity(pos1, pos2) {
    // Basic relative position similarity
    const xDiff = Math.abs(pos1.relativeX - pos2.relativeX);
    const yDiff = Math.abs(pos1.relativeY - pos2.relativeY);
    const positionDiff = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    
    // Allow for significant position variation due to handheld photography
    const positionTolerance = 0.3; // 30% of image can shift
    const positionSimilarity = Math.max(0, 1 - (positionDiff / positionTolerance));
    
    // Nearby tiles pattern matching (helps with consistency)
    let nearbyTileScore = 0;
    let nearbyTileWeight = 0;
    
    // Check if nearby tiles pattern is similar
    const maxNearbyTiles = Math.min(pos1.nearbyTiles.length, pos2.nearbyTiles.length);
    
    for (let i = 0; i < maxNearbyTiles; i++) {
        const nearby1 = pos1.nearbyTiles[i];
        const nearby2 = pos2.nearbyTiles[i];
        
        // Check if colors/shapes of nearby tiles match
        if (nearby1.color === nearby2.color && nearby1.color !== 'unknown') {
            nearbyTileScore += 1;
        }
        if (nearby1.shape === nearby2.shape && nearby1.shape !== 'unknown') {
            nearbyTileScore += 1;
        }
        nearbyTileWeight += 2; // Max 2 points per nearby tile
    }
    
    const nearbyTileSimilarity = nearbyTileWeight > 0 ? nearbyTileScore / nearbyTileWeight : 0;
    
    // Combine position and nearby tiles similarity
    return (positionSimilarity * 0.7) + (nearbyTileSimilarity * 0.3);
}

/**
 * Calculate size similarity between two tiles
 * Accounts for camera distance changes
 */
function calculateSizeSimilarity(size1, size2) {
    if (size1 === 0 || size2 === 0) return 0;
    
    const sizeRatio = Math.min(size1, size2) / Math.max(size1, size2);
    
    // Allow for significant size variation due to camera distance changes
    // If size ratio is above 0.5, we consider it similar enough
    return Math.max(0, (sizeRatio - 0.3) / 0.7); // Linear scale from 0.3-1.0 to 0-1
}

/**
 * Calculate Qwirkle score based on new tiles and board state
 * Adapted for flexible positioning from handheld photography
 */
function calculateQwirkleScore(newTiles, allCurrentTiles) {
    if (newTiles.length === 0) {
        return 0;
    }
    
    console.log(`Calculating score for ${newTiles.length} new tiles (handheld mode)`);
    
    // For handheld photography, we use a simpler but more robust scoring approach
    // Instead of trying to determine exact lines, we estimate based on tile placement patterns
    
    let totalScore = 0;
    
    // Basic scoring: each new tile gets points based on likely line formations
    for (const newTile of newTiles) {
        let tileScore = 1; // Minimum score for placing a tile
        
        // Find tiles that are likely connected to this new tile
        const connectedTiles = findLikelyConnectedTiles(newTile, allCurrentTiles);
        
        if (connectedTiles.length > 0) {
            // Score based on estimated line length
            const estimatedLineLength = connectedTiles.length + 1; // +1 for the new tile
            tileScore = estimatedLineLength;
            
            // Qwirkle bonus for long lines
            if (estimatedLineLength >= 6) {
                tileScore += 6; // Qwirkle bonus
                console.log(`Possible Qwirkle detected: ${estimatedLineLength} tiles with bonus`);
            }
            
            console.log(`New tile connects to ${connectedTiles.length} tiles, line score: ${tileScore}`);
        } else {
            console.log(`Isolated new tile: ${tileScore} point`);
        }
        
        totalScore += tileScore;
    }
    
    // If multiple tiles were placed together, they might form intersecting lines
    // Add a small bonus for multiple tile placement
    if (newTiles.length > 1) {
        const multiTileBonus = Math.floor(newTiles.length / 2);
        totalScore += multiTileBonus;
        console.log(`Multi-tile placement bonus: +${multiTileBonus}`);
    }
    
    console.log(`Total calculated score: ${totalScore}`);
    return totalScore;
}

/**
 * Find tiles that are likely connected to the given tile
 * Uses relaxed spatial and color/shape analysis for handheld photos
 */
function findLikelyConnectedTiles(centerTile, allTiles) {
    const connectedTiles = [];
    const maxConnectionDistance = 0.15; // 15% of image size for connection
    
    // Group tiles by proximity to center tile
    const nearbyTiles = allTiles
        .filter(tile => tile.id !== centerTile.id)
        .map(tile => ({
            tile: tile,
            distance: Math.sqrt(
                Math.pow(tile.positionDescriptor.relativeX - centerTile.positionDescriptor.relativeX, 2) +
                Math.pow(tile.positionDescriptor.relativeY - centerTile.positionDescriptor.relativeY, 2)
            )
        }))
        .filter(item => item.distance <= maxConnectionDistance)
        .sort((a, b) => a.distance - b.distance);
    
    // Look for potential lines in different directions
    const directions = [
        { name: 'horizontal', angle: 0, tolerance: Math.PI / 6 },      // ±30 degrees
        { name: 'vertical', angle: Math.PI / 2, tolerance: Math.PI / 6 } // ±30 degrees
    ];
    
    for (const direction of directions) {
        const tilesInDirection = findTilesInDirection(
            centerTile, 
            nearbyTiles, 
            direction.angle, 
            direction.tolerance
        );
        
        // Check if these tiles could form a valid Qwirkle line
        if (tilesInDirection.length > 0) {
            const candidateLine = [centerTile, ...tilesInDirection.map(item => item.tile)];
            if (couldBeValidQwirkleLine(candidateLine)) {
                connectedTiles.push(...tilesInDirection.map(item => item.tile));
                console.log(`Found ${tilesInDirection.length} tiles in ${direction.name} direction`);
            }
        }
    }
    
    // Remove duplicates
    return [...new Set(connectedTiles)];
}

/**
 * Find tiles that lie roughly in a given direction from the center tile
 */
function findTilesInDirection(centerTile, nearbyTiles, targetAngle, tolerance) {
    const tilesInDirection = [];
    
    for (const item of nearbyTiles) {
        const tile = item.tile;
        
        // Calculate angle from center to this tile
        const deltaX = tile.positionDescriptor.relativeX - centerTile.positionDescriptor.relativeX;
        const deltaY = tile.positionDescriptor.relativeY - centerTile.positionDescriptor.relativeY;
        const angle = Math.atan2(deltaY, deltaX);
        
        // Normalize angle difference
        let angleDiff = Math.abs(angle - targetAngle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        
        // Also check the opposite direction (for full line)
        let oppositeAngleDiff = Math.abs(angle - (targetAngle + Math.PI));
        if (oppositeAngleDiff > Math.PI) oppositeAngleDiff = 2 * Math.PI - oppositeAngleDiff;
        
        const minAngleDiff = Math.min(angleDiff, oppositeAngleDiff);
        
        if (minAngleDiff <= tolerance) {
            tilesInDirection.push(item);
        }
    }
    
    return tilesInDirection;
}

/**
 * Check if tiles could form a valid Qwirkle line (relaxed check for handheld photos)
 * Allows for some uncertainty in classification
 */
function couldBeValidQwirkleLine(tiles) {
    if (tiles.length <= 1) return true;
    
    // Get tiles with confident classifications
    const confidentTiles = tiles.filter(t => 
        t.color !== 'unknown' && 
        t.shape !== 'unknown' && 
        (t.colorConfidence || 1) > 0.5 && 
        (t.shapeConfidence || 1) > 0.5
    );
    
    if (confidentTiles.length < 2) {
        // Not enough confident classifications, assume it's valid
        return true;
    }
    
    const colors = confidentTiles.map(t => t.color);
    const shapes = confidentTiles.map(t => t.shape);
    
    const uniqueColors = [...new Set(colors)];
    const uniqueShapes = [...new Set(shapes)];
    
    // Relaxed validation: allow some flexibility for handheld photo inaccuracies
    const allSameColorVariation = uniqueColors.length <= Math.max(1, Math.ceil(colors.length * 0.2)); // Allow 20% variation
    const allSameShapeVariation = uniqueShapes.length <= Math.max(1, Math.ceil(shapes.length * 0.2)); // Allow 20% variation
    
    const differentColorsGood = uniqueColors.length >= Math.max(2, colors.length * 0.8); // At least 80% different
    const differentShapesGood = uniqueShapes.length >= Math.max(2, shapes.length * 0.8); // At least 80% different
    
    // Valid line: mostly same color with mostly different shapes, OR mostly same shape with mostly different colors
    const likelySameColor = allSameColorVariation && differentShapesGood;
    const likelySameShape = allSameShapeVariation && differentColorsGood;
    
    return likelySameColor || likelySameShape;
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
