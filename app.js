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
    
    // Stop camera and show captured photo
    stopCamera();
    showCapturedPhoto(photoUrl);
    
    // Show retake button, hide take photo button
    document.getElementById('retake-btn').style.display = 'inline-block';
    const takePhotoBtn = document.querySelector('#action-buttons .btn-primary');
    takePhotoBtn.style.display = 'none';
    
    // Show loading
    showLoading('Analyzing tiles...');
    
    try {
        let detectedScore = 0;
        
        // Always try to detect and score tiles (for first player, this will detect all tiles placed)
        detectedScore = await detectAndScoreTiles(
            gameState.previousPhoto?.imageData || null,
            gameState.currentPhoto.imageData
        );
        
        hideLoading();
        
        // Show manual score adjustment
        document.getElementById('detected-score').textContent = detectedScore;
        document.getElementById('manual-score-input').value = detectedScore;
        document.getElementById('manual-score-section').style.display = 'block';
        document.getElementById('action-buttons').style.display = 'none';
        
    } catch (error) {
        hideLoading();
        console.error('Error processing photo:', error);
        alert('Error analyzing photo. Please try again or enter score manually.');
        document.getElementById('detected-score').textContent = '0';
        document.getElementById('manual-score-input').value = '0';
        document.getElementById('manual-score-section').style.display = 'block';
        document.getElementById('action-buttons').style.display = 'none';
    }
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

function showCapturedPhoto(photoUrl) {
    const capturedDiv = document.getElementById('captured-photo');
    capturedDiv.innerHTML = `<img src="${photoUrl}" alt="Captured board" style="width: 100%; border-radius: 8px;">`;
    capturedDiv.classList.remove('empty');
    capturedDiv.style.display = 'block';
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
