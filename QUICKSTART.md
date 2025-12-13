# Quick Start Guide

## Setup in 3 Steps

### 1. Open the App
- Open `index.html` in your mobile browser
- Grant camera permissions when prompted
- Chrome on Android or Safari on iOS work best

### 2. Train the Detector (One-Time Setup)
From the welcome screen:
1. Tap **"Train Tile Detection"**
2. Take photos of your tiles:
   ```
   For each of the 36 tile combinations:
   - Select Color: Red, Orange, Yellow, Green, Blue, or Purple
   - Select Shape: Circle, Square, Diamond, Star, Clover, or Cross
   - Take/Upload a clear photo of that specific tile
   - Tap "Add to Training Set"
   ```
3. Minimum 10 photos, recommended 50-100 for accuracy
4. Tap **"Train Model"** when done (takes 2-5 minutes)

### 3. Play!
1. Tap **"Start New Game"**
2. Enter player names
3. Take photo of empty board
4. After each turn, take new photo
5. Confirm or adjust the detected score

## Tips for Good Detection

### Photography
- **Lighting**: Bright, even light without glare
- **Angle**: Straight down, perpendicular to board
- **Distance**: Full board visible, tiles clearly distinguishable
- **Background**: Plain table surface
- **Consistency**: Same setup for training and gameplay

### Training Photos
- Take 2-3 photos of each tile type
- Use same lighting as you'll play in
- Vary angle slightly for robustness
- Include some with shadows/different backgrounds
- Keep tiles in focus

## Example Training Session

A good training dataset might include:

```
Red Circle    - 3 photos
Red Square    - 3 photos
Red Diamond   - 3 photos
... (continue for all 36 combinations)

Total: 108 photos (3 per tile type)
```

## During Gameplay

**If detection is wrong:**
1. Use the +/- buttons to adjust score
2. Or type the correct score directly
3. Tap "Confirm Score"

**If a player swaps tiles:**
- Tap "Swap Tiles (0 pts)" instead of taking photo

## Troubleshooting

### Camera not working
- Check browser permissions
- Use HTTPS or localhost
- Try different browser

### Poor detection accuracy
- Add more training images
- Ensure consistent lighting
- Re-train the model
- Check that tiles are in focus

### Model not saving
- Check browser storage isn't full
- Clear old data and re-train
- Try different browser

### App is slow
- Close other tabs
- Restart browser
- Reduce training image resolution

## What Gets Saved?

**Stored locally on your device:**
- Training images (LocalStorage)
- Trained ML models (IndexedDB)
- Current game state

**Not saved:**
- Game history after page reload
- Photos from games (only used for comparison)

**To clear everything:**
Clear browser data for the app's domain

## Recommended Setup for Best Experience

1. **Use a phone stand** or stable surface for consistent photos
2. **Mark camera position** on table with tape
3. **Play in well-lit area** (natural daylight is ideal)
4. **Use plain white/beige tablecloth** as background
5. **Keep phone charged** - camera and ML use battery

## Export/Import Training Data

**Export:**
1. Go to Training screen
2. Tap "Export Data"
3. Save JSON file to your device

**Import (future feature):**
Share your training data file with other devices

---

## Example Workflow

### First Time Setup (15-30 minutes)
```
1. Open app
2. Train Tile Detection
3. Photograph all 36 tile types (2-3 each)
4. Train Model (wait 2-5 min)
5. Model ready!
```

### Each Game (2-3 minutes setup + tracking during play)
```
1. Start New Game
2. Enter names: Alice, Bob, Carol
3. Photo of empty board
4. Alice plays → Take photo → Confirm score
5. Bob plays → Take photo → Confirm score
6. Carol plays → Take photo → Confirm score
7. Repeat until game ends
8. View final scores
```

---

Ready to play? Open `index.html` and start training! 🎮
