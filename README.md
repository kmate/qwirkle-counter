# Qwirkle Score Counter

A mobile web app that uses camera and machine learning to automatically track scores in the board game Qwirkle by comparing photos of the game board between turns.

## Features

- **Automatic Score Detection**: Takes photos of the board and detects newly placed tiles
- **ML-Powered Tile Recognition**: Train a custom machine learning model using TensorFlow.js with your own tile photos
- **Manual Score Adjustment**: Override automatic detection when needed
- **Multi-Player Support**: Track scores for 2-6 players
- **Turn History**: View complete game history and scoreboard
- **Swap Turn Support**: Record when players swap tiles instead of playing
- **Mobile-First Design**: Optimized for smartphone cameras and touch interfaces
- **Offline Capable**: All processing happens on-device, no server required

## How to Use

### Getting Started

1. Open `index.html` in a mobile browser (Chrome or Safari recommended)
2. Grant camera permissions when prompted

### Training the Tile Detector (First Time Setup)

For best results, train the app to recognize your specific Qwirkle tiles:

1. From the welcome screen, tap "Train Tile Detection"
2. For each tile type (36 total: 6 colors × 6 shapes):
   - Select the color and shape from the dropdowns
   - Take or upload a clear photo of that tile
   - Tap "Add to Training Set"
3. Add at least 10 training images (more is better - aim for 50-100)
4. Tap "Train Model" to create your custom detection model
5. Wait for training to complete (may take a few minutes)

**Training Tips:**
- Take photos in the same lighting conditions you'll use during games
- Capture tiles at the same angle and distance
- Include multiple photos of the same tile from slightly different angles
- Use a plain background for clearest results

### Playing a Game

1. Tap "Start New Game" from the welcome screen
2. Enter player names (2-6 players)
3. Before the first move, take a photo of the empty board
4. After each turn:
   - Player places their tiles
   - Tap "Take Photo" to capture the new board state
   - Review the detected score and adjust if needed
   - Tap "Confirm Score" to record
5. If a player swaps tiles, use "Swap Tiles" button instead
6. View scores anytime by tapping "Scores"
7. End the game to see final rankings

## Technical Details

### Architecture

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **ML Framework**: TensorFlow.js
- **Storage**: LocalStorage for training data, IndexedDB for trained models
- **Camera API**: MediaDevices getUserMedia API

### Files

- `index.html` - Main HTML structure with all screens
- `styles.css` - Mobile-first responsive styles
- `app.js` - Main application logic and UI control
- `scoring.js` - Qwirkle game rules engine and score calculation
- `imageProcessing.js` - Image comparison and tile detection algorithms
- `tileDetector.js` - TensorFlow.js ML model for tile classification
- `trainingData.js` - Training data management and UI

### How It Works

1. **Image Comparison**: Compares consecutive photos pixel-by-pixel to identify changed regions
2. **Blob Detection**: Uses flood-fill algorithm to find connected regions (potential tiles)
3. **Tile Classification**: 
   - If ML model is trained: Uses CNN to classify tile color and shape
   - Fallback: Uses HSV color space analysis for basic color detection
4. **Score Calculation**: Applies official Qwirkle rules:
   - Each tile in a line = 1 point
   - Qwirkle (6 tiles) = 6 bonus points (12 total)
   - Multiple lines from one move = score each line

### ML Models

The app trains two separate Convolutional Neural Network (CNN) models:

- **Color Classifier**: 6-class classifier for tile colors (red, orange, yellow, green, blue, purple)
- **Shape Classifier**: 6-class classifier for tile shapes (circle, square, diamond, star, clover, cross)

Each model uses:
- 3 convolutional layers with max pooling
- Dropout for regularization
- Dense layers for classification
- Adam optimizer with categorical crossentropy loss

## Browser Compatibility

- **Recommended**: Chrome/Edge on Android, Safari on iOS
- **Requirements**: 
  - ES6+ JavaScript support
  - getUserMedia API support
  - IndexedDB support
  - WebGL for TensorFlow.js

## Limitations

- Requires good lighting for accurate detection
- Works best with consistent camera angle and distance
- Training data is device-specific (stored locally)
- Model accuracy depends on quality and quantity of training images
- May struggle with cluttered backgrounds or reflective surfaces

## Tips for Best Results

1. **Consistent Setup**: Always hold the camera at the same height and angle
2. **Good Lighting**: Use bright, even lighting without harsh shadows
3. **Plain Background**: Play on a neutral surface (white/beige table)
4. **Steady Shots**: Hold the phone steady when capturing photos
5. **Full Board in Frame**: Ensure all tiles are visible in each photo
6. **Review Scores**: Always double-check the detected score before confirming

## Privacy

- All data stays on your device
- No images or data are sent to any server
- Training data and models are stored in browser storage
- Clear browser data to remove all stored information

## Development

To run locally:

1. Clone the repository
2. Serve files using any HTTP server:
   ```bash
   python -m http.server 8000
   # or
   npx serve
   ```
3. Access on mobile by navigating to your computer's local IP address
4. Ensure HTTPS or localhost for camera access

## Future Enhancements

- [ ] Export/import trained models
- [ ] Cloud sync for training data
- [ ] Multiplayer with multiple devices
- [ ] Game statistics and history
- [ ] Undo/edit turn functionality
- [ ] Alternative detection using YOLO or similar object detection
- [ ] Progressive Web App (PWA) with offline support
- [ ] Photo gallery of game progression

## License

MIT License - Feel free to use and modify for personal use

## Credits

Built with:
- TensorFlow.js for machine learning
- Modern web APIs for camera access
- Love for the game of Qwirkle!

---

**Note**: This is an unofficial fan project and is not affiliated with MindWare or the creators of Qwirkle.
