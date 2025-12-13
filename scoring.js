// Qwirkle Scoring Engine
// Implements the actual game rules for calculating scores

const QWIRKLE_SHAPES = ['circle', 'square', 'diamond', 'star', 'clover', 'cross'];
const QWIRKLE_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
const MAX_LINE_LENGTH = 6;

/**
 * Represents a Qwirkle tile
 */
class QwirkleTile {
    constructor(shape, color, x, y) {
        this.shape = shape;
        this.color = color;
        this.x = x;
        this.y = y;
    }
    
    equals(other) {
        return this.shape === other.shape && this.color === other.color;
    }
    
    toString() {
        return `${this.color}-${this.shape}`;
    }
}

/**
 * Represents the game board
 */
class QwirkleBoard {
    constructor() {
        this.tiles = new Map(); // key: "x,y", value: QwirkleTile
    }
    
    addTile(tile) {
        const key = `${tile.x},${tile.y}`;
        this.tiles.set(key, tile);
    }
    
    getTile(x, y) {
        return this.tiles.get(`${x},${y}`);
    }
    
    hasTile(x, y) {
        return this.tiles.has(`${x},${y}`);
    }
    
    getAllTiles() {
        return Array.from(this.tiles.values());
    }
    
    clone() {
        const newBoard = new QwirkleBoard();
        this.tiles.forEach((tile, key) => {
            newBoard.tiles.set(key, tile);
        });
        return newBoard;
    }
}

/**
 * Validates if a move is legal according to Qwirkle rules
 */
function validateMove(board, newTiles) {
    if (newTiles.length === 0) return { valid: false, error: 'No tiles placed' };
    
    // Check if tiles form a single line (horizontal or vertical)
    if (!tilesFormLine(newTiles)) {
        return { valid: false, error: 'Tiles must be placed in a single line' };
    }
    
    // Check if all tiles are in empty positions
    for (const tile of newTiles) {
        if (board.hasTile(tile.x, tile.y)) {
            return { valid: false, error: 'Position already occupied' };
        }
    }
    
    // For first move, any valid line is okay
    if (board.getAllTiles().length === 0) {
        if (tilesFormValidLine(newTiles)) {
            return { valid: true };
        } else {
            return { valid: false, error: 'Tiles must form a valid line (same color or same shape)' };
        }
    }
    
    // Check if tiles connect to existing tiles
    const connected = newTiles.some(tile => {
        return board.hasTile(tile.x + 1, tile.y) ||
               board.hasTile(tile.x - 1, tile.y) ||
               board.hasTile(tile.x, tile.y + 1) ||
               board.hasTile(tile.x, tile.y - 1);
    });
    
    if (!connected) {
        return { valid: false, error: 'Tiles must connect to existing tiles' };
    }
    
    // Validate all affected lines
    const testBoard = board.clone();
    newTiles.forEach(tile => testBoard.addTile(tile));
    
    for (const tile of newTiles) {
        const horizontalLine = getLine(testBoard, tile.x, tile.y, 'horizontal');
        const verticalLine = getLine(testBoard, tile.x, tile.y, 'vertical');
        
        if (horizontalLine.length > 1 && !tilesFormValidLine(horizontalLine)) {
            return { valid: false, error: 'Invalid horizontal line' };
        }
        
        if (verticalLine.length > 1 && !tilesFormValidLine(verticalLine)) {
            return { valid: false, error: 'Invalid vertical line' };
        }
        
        if (horizontalLine.length > MAX_LINE_LENGTH || verticalLine.length > MAX_LINE_LENGTH) {
            return { valid: false, error: 'Line exceeds maximum length of 6' };
        }
    }
    
    return { valid: true };
}

/**
 * Checks if tiles form a single straight line
 */
function tilesFormLine(tiles) {
    if (tiles.length === 1) return true;
    
    const xCoords = tiles.map(t => t.x);
    const yCoords = tiles.map(t => t.y);
    
    const allSameX = xCoords.every(x => x === xCoords[0]);
    const allSameY = yCoords.every(y => y === yCoords[0]);
    
    if (!allSameX && !allSameY) return false;
    
    // Check for gaps
    if (allSameX) {
        yCoords.sort((a, b) => a - b);
        for (let i = 1; i < yCoords.length; i++) {
            if (yCoords[i] !== yCoords[i - 1] + 1) {
                // There's a gap - need to check if filled by existing tiles
                return true; // Will be validated later with board context
            }
        }
    } else {
        xCoords.sort((a, b) => a - b);
        for (let i = 1; i < xCoords.length; i++) {
            if (xCoords[i] !== xCoords[i - 1] + 1) {
                return true; // Will be validated later with board context
            }
        }
    }
    
    return true;
}

/**
 * Checks if tiles form a valid Qwirkle line (same color OR same shape, no duplicates)
 */
function tilesFormValidLine(tiles) {
    if (tiles.length === 0) return false;
    if (tiles.length === 1) return true;
    
    const colors = tiles.map(t => t.color);
    const shapes = tiles.map(t => t.shape);
    
    const allSameColor = colors.every(c => c === colors[0]);
    const allSameShape = shapes.every(s => s === shapes[0]);
    
    // Must be all same color OR all same shape (but not both)
    if (!allSameColor && !allSameShape) return false;
    
    // Check for duplicates
    const tileStrings = tiles.map(t => t.toString());
    const uniqueTiles = new Set(tileStrings);
    
    if (uniqueTiles.size !== tiles.length) return false;
    
    return true;
}

/**
 * Gets all tiles in a line (horizontal or vertical) from a position
 */
function getLine(board, x, y, direction) {
    const tiles = [];
    
    if (direction === 'horizontal') {
        // Get all tiles in the row
        let startX = x;
        while (board.hasTile(startX - 1, y)) startX--;
        
        let currentX = startX;
        while (board.hasTile(currentX, y)) {
            tiles.push(board.getTile(currentX, y));
            currentX++;
        }
    } else {
        // Get all tiles in the column
        let startY = y;
        while (board.hasTile(x, startY - 1)) startY--;
        
        let currentY = startY;
        while (board.hasTile(x, currentY)) {
            tiles.push(board.getTile(x, currentY));
            currentY++;
        }
    }
    
    return tiles;
}

/**
 * Calculates the score for a move
 */
function calculateMoveScore(board, newTiles) {
    const validation = validateMove(board, newTiles);
    if (!validation.valid) {
        return { score: 0, error: validation.error };
    }
    
    // Create test board with new tiles
    const testBoard = board.clone();
    newTiles.forEach(tile => testBoard.addTile(tile));
    
    let totalScore = 0;
    const scoredLines = new Set();
    
    // Calculate score for each placed tile
    for (const tile of newTiles) {
        const horizontalLine = getLine(testBoard, tile.x, tile.y, 'horizontal');
        const verticalLine = getLine(testBoard, tile.x, tile.y, 'vertical');
        
        // Score horizontal line if it has multiple tiles
        if (horizontalLine.length > 1) {
            const lineKey = `h-${tile.y}-${horizontalLine[0].x}`;
            if (!scoredLines.has(lineKey)) {
                let lineScore = horizontalLine.length;
                
                // Qwirkle bonus
                if (horizontalLine.length === MAX_LINE_LENGTH) {
                    lineScore += 6;
                }
                
                totalScore += lineScore;
                scoredLines.add(lineKey);
            }
        }
        
        // Score vertical line if it has multiple tiles
        if (verticalLine.length > 1) {
            const lineKey = `v-${tile.x}-${verticalLine[0].y}`;
            if (!scoredLines.has(lineKey)) {
                let lineScore = verticalLine.length;
                
                // Qwirkle bonus
                if (verticalLine.length === MAX_LINE_LENGTH) {
                    lineScore += 6;
                }
                
                totalScore += lineScore;
                scoredLines.add(lineKey);
            }
        }
        
        // If tile is isolated (no line), it scores 1 point
        if (horizontalLine.length === 1 && verticalLine.length === 1) {
            totalScore += 1;
        }
    }
    
    return { score: totalScore, valid: true };
}

/**
 * Helper function to convert detected tiles to board coordinates
 * Assumes tiles are detected with pixel positions
 */
function pixelPositionsToGridCoordinates(tiles, referenceBoard = null) {
    if (tiles.length === 0) return [];
    
    // Sort tiles by position
    const sortedByX = [...tiles].sort((a, b) => a.centerX - b.centerX);
    const sortedByY = [...tiles].sort((a, b) => a.centerY - b.centerY);
    
    // Estimate grid spacing
    const xPositions = tiles.map(t => t.centerX);
    const yPositions = tiles.map(t => t.centerY);
    
    // Calculate average spacing
    let avgXSpacing = 0;
    if (sortedByX.length > 1) {
        const xGaps = [];
        for (let i = 1; i < sortedByX.length; i++) {
            xGaps.push(sortedByX[i].centerX - sortedByX[i - 1].centerX);
        }
        avgXSpacing = xGaps.reduce((a, b) => a + b, 0) / xGaps.length;
    }
    
    let avgYSpacing = 0;
    if (sortedByY.length > 1) {
        const yGaps = [];
        for (let i = 1; i < sortedByY.length; i++) {
            yGaps.push(sortedByY[i].centerY - sortedByY[i - 1].centerY);
        }
        avgYSpacing = yGaps.reduce((a, b) => a + b, 0) / yGaps.length;
    }
    
    // Use default spacing if we can't calculate
    const tileSpacing = Math.max(avgXSpacing, avgYSpacing) || 100;
    
    // Convert to grid coordinates
    const gridTiles = tiles.map(tile => {
        const gridX = Math.round(tile.centerX / tileSpacing);
        const gridY = Math.round(tile.centerY / tileSpacing);
        
        return new QwirkleTile(
            tile.shape || 'unknown',
            tile.color || 'unknown',
            gridX,
            gridY
        );
    });
    
    return gridTiles;
}
