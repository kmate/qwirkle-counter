// Game State
let gameState = {
    players: [],
    currentPlayerIndex: 0,
    previousPhoto: null,
    currentPhoto: null,
    turnHistory: [],
    cameraStream: null
};

// UI Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Player Setup
function addPlayerInput() {
    const playerInputs = document.getElementById('player-inputs');
    const playerCount = playerInputs.querySelectorAll('.player-input-group').length;
    
    if (playerCount >= 6) {
        alert('Maximum 6 players allowed');
        return;
    }
    
    const newInput = document.createElement('div');
    newInput.className = 'player-input-group';
    newInput.innerHTML = `
        <input type="text" class="player-name-input" placeholder="Player ${playerCount + 1}" data-player="${playerCount}">
    `;
    playerInputs.appendChild(newInput);
}

function startGame() {
    const inputs = document.querySelectorAll('.player-name-input');
    const players = [];
    
    inputs.forEach((input, index) => {
        const name = input.value.trim() || `Player ${index + 1}`;
        players.push({
            name: name,
            score: 0,
            turns: []
        });
    });
    
    if (players.length < 2) {
        alert('At least 2 players required');
        return;
    }
    
    gameState.players = players;
    gameState.currentPlayerIndex = 0;
    gameState.turnHistory = [];
    
    showScreen('game-screen');
    initializeCamera();
    updateGameUI();
}

// Camera Functions
async function initializeCamera() {
    try {
        // Stop any existing camera first
        stopCamera();
        
        const constraints = {
            video: {
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById('camera-preview');
        video.srcObject = stream;
        video.style.display = 'block'; // Make sure camera is visible
        gameState.cameraStream = stream;
        
        document.getElementById('turn-instruction').textContent = 
            'Place your tiles and take a photo of the board';
            
    } catch (error) {
        console.error('Camera access error:', error);
        alert('Camera access is required for this app. Please grant camera permissions.');
    }
}

function capturePhoto() {
    const video = document.getElementById('camera-preview');
    
    // Camera should already be running for photo taking
    if (!gameState.cameraStream) {
        alert('Camera not ready. Please wait a moment.');
        initializeCamera();
        return;
    }
    
    actuallyTakePhoto();
}

function actuallyTakePhoto() {
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('photo-canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
        const photoUrl = URL.createObjectURL(blob);
        processPhoto(photoUrl, canvas);
    }, 'image/jpeg', 0.95);
}

async function processPhoto(photoUrl, canvas) {
    gameState.currentPhoto = {
        url: photoUrl,
        imageData: canvas.toDataURL('image/jpeg', 0.95)
    };
    
    // Stop camera and show captured photo FIRST (basic fallback)
    stopCamera();
    showBasicCapturedPhoto(photoUrl);
    
    // Show retake button, hide take photo button
    document.getElementById('retake-btn').style.display = 'inline-block';
    const takePhotoBtn = document.querySelector('#action-buttons .btn-primary');
    takePhotoBtn.style.display = 'none';
    
    // Show loading
    showLoading('Analyzing tiles...');
    
    try {
        let detectedScore = 0;
        let newTiles = [];
        
        console.log('Starting tile detection...');
        
        // Always try to detect and score tiles (for first player, this will detect all tiles placed)
        const result = await detectAndScoreTilesWithDetails(
            gameState.previousPhoto?.imageData || null,
            gameState.currentPhoto.imageData
        );
        
        console.log('Tile detection completed:', result);
        
        detectedScore = result.score;
        newTiles = result.newTiles;
        
        hideLoading();
        
        // Try to show photo with visual feedback, fallback to basic if it fails
        try {
            showPhotoWithDetectedTiles(photoUrl, newTiles, canvas.width, canvas.height);
        } catch (visualError) {
            console.error('Visual feedback failed, showing basic photo:', visualError);
            showBasicCapturedPhoto(photoUrl);
        }
        
        // Show manual score adjustment with detailed feedback
        document.getElementById('detected-score').textContent = detectedScore;
        document.getElementById('manual-score-input').value = detectedScore;
        document.getElementById('manual-score-section').style.display = 'block';
        document.getElementById('action-buttons').style.display = 'none';
        
        // Show detection details (with error handling)
        try {
            showDetectionDetails(newTiles);
        } catch (detailsError) {
            console.error('Detection details failed:', detailsError);
        }
        
    } catch (error) {
        hideLoading();
        console.error('Error processing photo:', error);
        
        // Ensure UI is shown even if detection fails
        document.getElementById('detected-score').textContent = '0';
        document.getElementById('manual-score-input').value = '0';
        document.getElementById('manual-score-section').style.display = 'block';
        document.getElementById('action-buttons').style.display = 'none';
        
        // Show error message to user
        const detailsDiv = document.createElement('div');
        detailsDiv.id = 'detection-details';
        detailsDiv.style.marginTop = '15px';
        detailsDiv.style.padding = '10px';
        detailsDiv.style.backgroundColor = '#ffe6e6';
        detailsDiv.style.borderRadius = '8px';
        detailsDiv.style.fontSize = '14px';
        detailsDiv.innerHTML = `<strong>❌ Error analyzing photo</strong><br>Photo processing failed: ${error.message}<br>You can still enter the score manually.`;
        
        const manualScoreSection = document.getElementById('manual-score-section');
        manualScoreSection.appendChild(detailsDiv);
    }
}

// Simple fallback photo display
function showBasicCapturedPhoto(photoUrl) {
    const capturedDiv = document.getElementById('captured-photo');
    capturedDiv.innerHTML = `<img src="${photoUrl}" alt="Captured board" style="width: 100%; border-radius: 8px;">`;
    capturedDiv.classList.remove('empty');
    capturedDiv.style.display = 'block';
}

function stopCamera() {
    if (gameState.cameraStream) {
        gameState.cameraStream.getTracks().forEach(track => track.stop());
        gameState.cameraStream = null;
    }
    
    // Hide camera video
    const video = document.getElementById('camera-preview');
    video.style.display = 'none';
}

function showPhotoWithDetectedTiles(photoUrl, newTiles, originalWidth, originalHeight) {
    const capturedDiv = document.getElementById('captured-photo');
    
    // Create container with image and overlay
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.display = 'inline-block';
    container.style.width = '100%';
    
    // Create image
    const img = document.createElement('img');
    img.src = photoUrl;
    img.style.width = '100%';
    img.style.borderRadius = '8px';
    img.alt = 'Captured board with detected tiles';
    
    // Create overlay canvas for drawing detection boxes
    const overlay = document.createElement('canvas');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    
    container.appendChild(img);
    container.appendChild(overlay);
    
    // Draw detection boxes when image loads
    img.onload = () => {
        drawDetectionOverlay(overlay, newTiles, img, originalWidth, originalHeight);
    };
    
    capturedDiv.innerHTML = '';
    capturedDiv.appendChild(container);
    capturedDiv.classList.remove('empty');
    capturedDiv.style.display = 'block';
}

function drawDetectionOverlay(canvas, newTiles, img, originalWidth, originalHeight) {
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match image display size
    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Calculate scaling factors
    const scaleX = canvas.width / originalWidth;
    const scaleY = canvas.height / originalHeight;
    
    ctx.strokeStyle = '#00ff00'; // Green for new tiles
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)'; // Semi-transparent green
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    newTiles.forEach((tile, index) => {
        if (tile.bounds) {
            // Scale bounds to display size
            const x = tile.bounds.minX * scaleX;
            const y = tile.bounds.minY * scaleY;
            const width = (tile.bounds.maxX - tile.bounds.minX) * scaleX;
            const height = (tile.bounds.maxY - tile.bounds.minY) * scaleY;
            
            // Draw detection box
            ctx.strokeRect(x, y, width, height);
            ctx.fillRect(x, y, width, height);
            
            // Draw label
            const labelX = x + width / 2;
            const labelY = y - 10;
            
            // Create label text
            let labelText = '';
            if (tile.color === 'detected' && tile.shape === 'tile') {
                labelText = 'Tile';  // Simplified label when models aren't ready
            } else if (tile.color === 'unknown' && tile.shape === 'unknown') {
                labelText = 'Unknown';
            } else {
                labelText = `${tile.color} ${tile.shape}`;
            }
            
            // Background for text
            const textWidth = ctx.measureText(labelText).width + 16;
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(labelX - textWidth/2, labelY - 18, textWidth, 20);
            
            // Text
            ctx.fillStyle = '#000000';
            ctx.fillText(labelText, labelX, labelY - 4);
            
            // Number
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.fillText((index + 1).toString(), x + 10, y + 20);
            
            // Reset styles
            ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
            ctx.font = '14px Arial';
        }
    });
}

function showDetectionDetails(newTiles) {
    // Create or update detection details section
    let detailsDiv = document.getElementById('detection-details');
    if (!detailsDiv) {
        detailsDiv = document.createElement('div');
        detailsDiv.id = 'detection-details';
        detailsDiv.style.marginTop = '15px';
        detailsDiv.style.padding = '10px';
        detailsDiv.style.backgroundColor = '#f0f0f0';
        detailsDiv.style.borderRadius = '8px';
        detailsDiv.style.fontSize = '14px';
        
        // Insert after manual score section
        const manualScoreSection = document.getElementById('manual-score-section');
        manualScoreSection.appendChild(detailsDiv);
    }
    
    // Check if models are ready
    if (!tileDetector.isModelReady) {
        if (newTiles.length > 0) {
            detailsDiv.innerHTML = `<strong>📷 ${newTiles.length} tile${newTiles.length > 1 ? 's' : ''} detected but not classified</strong><br><span style="color: #ff6600;">⚠️ ML models not loaded - tile color/shape detection unavailable.</span><br>You can still manually adjust the score. <a href="#" onclick="showScreen('training-screen')" style="color: #007bff;">Train models</a> for automatic classification.`;
        } else {
            detailsDiv.innerHTML = '<strong>⚠️ No new tiles detected!</strong><br><span style="color: #ff6600;">ML models not loaded</span> - basic shape detection only.<br>This could mean:<br>• The tiles look very similar to previous photo<br>• Poor lighting or angle<br>• Tiles are too small or blurry';
        }
        return;
    }
    
    if (newTiles.length === 0) {
        detailsDiv.innerHTML = '<strong>⚠️ No new tiles detected!</strong><br>The AI couldn\'t find any new tiles. This could mean:<br>• The tiles look very similar to previous photo<br>• Poor lighting or angle<br>• Tiles are too small or blurry';
        return;
    }
    
    let html = `<strong>🎯 Detected ${newTiles.length} new tile${newTiles.length > 1 ? 's' : ''}:</strong><br>`;
    
    newTiles.forEach((tile, index) => {
        const colorConf = Math.round((tile.colorConfidence || 0) * 100);
        const shapeConf = Math.round((tile.shapeConfidence || 0) * 100);
        
        let confidenceColor = '#ff4444'; // Red for low confidence
        if (colorConf > 70 && shapeConf > 70) confidenceColor = '#44ff44'; // Green for high
        else if (colorConf > 50 && shapeConf > 50) confidenceColor = '#ffaa44'; // Orange for medium
        
        html += `<div style="margin: 5px 0; padding: 5px; background: white; border-radius: 4px;">`;
        html += `<span style="background: #00ff00; color: white; padding: 2px 6px; border-radius: 3px; margin-right: 8px;">${index + 1}</span>`;
        html += `<strong>${tile.color || 'unknown'} ${tile.shape || 'unknown'}</strong>`;
        html += `<br><span style="font-size: 12px; color: ${confidenceColor};">`;
        html += `Confidence: Color ${colorConf}%, Shape ${shapeConf}%</span>`;
        html += `</div>`;
    });
    
    detailsDiv.innerHTML = html;
}

function startNewTurn() {
    // Show previous photo instead of starting camera immediately
    if (gameState.previousPhoto) {
        showCapturedPhoto(gameState.previousPhoto.url);
        document.getElementById('camera-preview').style.display = 'none';
    } else {
        // Only for very first turn, start camera
        initializeCamera();
    }
    
    // Show action buttons for new turn
    document.getElementById('manual-score-section').style.display = 'none';
    document.getElementById('action-buttons').style.display = 'flex';
}

function retakePhoto() {
    // Clear the still image and restart live camera
    document.getElementById('captured-photo').style.display = 'none';
    
    // Start live camera again
    initializeCamera();
    
    // Show take photo button, hide retake button
    const takePhotoBtn = document.querySelector('#action-buttons .btn-primary');
    takePhotoBtn.style.display = 'inline-block';
    document.getElementById('retake-btn').style.display = 'none';
}

function startNewTurn() {
    // Reset UI for new turn
    document.getElementById('manual-score-section').style.display = 'none';
    document.getElementById('action-buttons').style.display = 'flex';
    
    // Clear detection details
    const detailsDiv = document.getElementById('detection-details');
    if (detailsDiv) {
        detailsDiv.remove();
    }
    
    // Show take photo button, hide retake button
    const takePhotoBtn = document.querySelector('#action-buttons .btn-primary');
    takePhotoBtn.style.display = 'inline-block';
    takePhotoBtn.textContent = 'Take Photo';
    document.getElementById('retake-btn').style.display = 'none';
    
    // Always start live camera for new turn
    initializeCamera();
    document.getElementById('captured-photo').style.display = 'none';
}

function adjustScore(delta) {
    const input = document.getElementById('manual-score-input');
    let value = parseInt(input.value) || 0;
    value = Math.max(0, value + delta);
    input.value = value;
}

function confirmScore() {
    const score = parseInt(document.getElementById('manual-score-input').value) || 0;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    currentPlayer.score += score;
    currentPlayer.turns.push({
        turnNumber: gameState.turnHistory.length + 1,
        score: score,
        photo: gameState.currentPhoto.url,
        type: 'play'
    });
    
    gameState.turnHistory.push({
        playerIndex: gameState.currentPlayerIndex,
        score: score,
        photo: gameState.currentPhoto.url
    });
    
    // Update previous photo for next comparison
    gameState.previousPhoto = gameState.currentPhoto;
    gameState.currentPhoto = null;
    
    // Move to next player
    nextTurn();
}

function swapTiles() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    currentPlayer.turns.push({
        turnNumber: gameState.turnHistory.length + 1,
        score: 0,
        type: 'swap'
    });
    
    gameState.turnHistory.push({
        playerIndex: gameState.currentPlayerIndex,
        score: 0,
        type: 'swap'
    });
    
    nextTurn();
}

function nextTurn() {
    // Move to next player
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    updateGameUI();
    startNewTurn();
}

function updateGameUI() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    document.getElementById('current-player-name').textContent = `${currentPlayer.name}'s Turn`;
    
    const instruction = 'Place your tiles, then take a photo of the board';
    document.getElementById('turn-instruction').textContent = instruction;
}

// Scoreboard
function showScoreboard() {
    const scoreboard = document.getElementById('scoreboard');
    const scoreList = document.getElementById('score-list');
    
    scoreList.innerHTML = '';
    
    // Sort players by score
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    
    sortedPlayers.forEach((player, index) => {
        const playerIndex = gameState.players.indexOf(player);
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        if (playerIndex === gameState.currentPlayerIndex) {
            scoreItem.classList.add('current-player');
        }
        
        scoreItem.innerHTML = `
            <span class="player-name">${player.name}</span>
            <span class="player-score">${player.score} pts</span>
        `;
        scoreList.appendChild(scoreItem);
    });
    
    scoreboard.classList.add('active');
}

function hideScoreboard() {
    document.getElementById('scoreboard').classList.remove('active');
}

function endGame() {
    if (!confirm('Are you sure you want to end the game?')) {
        return;
    }
    
    showFinalScores();
    
    // Stop camera
    if (gameState.cameraStream) {
        gameState.cameraStream.getTracks().forEach(track => track.stop());
        gameState.cameraStream = null;
    }
}

function showFinalScores() {
    const finalScoresDiv = document.getElementById('final-scores');
    finalScoresDiv.innerHTML = '';
    
    // Sort players by score
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    
    sortedPlayers.forEach((player, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'final-score-item';
        if (index === 0) {
            scoreItem.classList.add('winner');
        }
        
        const rank = index === 0 ? '🏆' : `${index + 1}.`;
        
        scoreItem.innerHTML = `
            <span>
                <span class="rank">${rank}</span>
                <span class="player-name">${player.name}</span>
            </span>
            <span class="player-score">${player.score} pts</span>
        `;
        finalScoresDiv.appendChild(scoreItem);
    });
    
    showScreen('results-screen');
}

// Loading overlay
function showLoading(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `<div>${message}</div>`;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Check if camera is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera access is not supported on this device/browser.');
    }
});
