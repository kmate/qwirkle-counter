# 🎮 Quick Reference Card

## Your Setup At a Glance

### What You Have
- 🎨 6 colors: Silver, Purple, Orange, Blue, Pink, Purple-Blue
- 🔷 6 shapes: Circle, Square, Diamond, Star, Clover, Cross
- 📸 6 photos: One per color, all shapes in each photo
- 🎯 Goal: Train app to recognize your tiles automatically

### Files to Read
1. **START HERE** → `SETUP_YOUR_TILES.md` (your step-by-step guide)
2. Need help? → `TRAINING_GUIDE_3D_PRINTED.md`
3. General info → `README.md`

### Training Process (10 minutes)

```
Open app → Training Screen → Grid Image Splitter

For each color:
  1. Upload photo (e.g., silver.jpg)
  2. Click "Process Grid Image"
  3. Select color (e.g., "Silver")
  4. Label 6 detected shapes
  5. Click "Save All Tiles"
  
Repeat for all 6 colors → Click "Train Model" → Wait 2-5 min → Done!
```

### File Structure
```
qwirkle-counter/
├── 📱 index.html              - Open this in browser
├── 🎨 styles.css              - Mobile design
├── 🧠 Core JavaScript:
│   ├── app.js                 - Main app logic
│   ├── gridSplitter.js        - NEW: Splits your photos
│   ├── trainingData.js        - NEW: Manages training
│   ├── tileDetector.js        - ML classification
│   ├── imageProcessing.js     - Image comparison
│   └── scoring.js             - Qwirkle rules
├── 🚀 serve.py                - Local server
└── 📚 Documentation:
    ├── SETUP_YOUR_TILES.md    - ⭐ START HERE
    ├── TRAINING_GUIDE_3D_PRINTED.md
    ├── UPDATE_SUMMARY.md
    ├── README.md
    ├── QUICKSTART.md
    ├── PROJECT_SUMMARY.md
    └── CHECKLIST.md
```

### Color Mapping
```
Your Tiles        Standard Qwirkle
─────────────     ────────────────
Silver      →     Red
Purple      →     Yellow
Orange      →     Orange
Blue        →     Green
Pink        →     Blue
Purple-Blue →     Purple
```

### Grid Splitter Magic ✨
```
Input:  📸 One photo with 6 tiles
         ↓
Process: Detect edges → Find blobs → Filter & sort
         ↓
Output: 🎴 6 individual tile images (auto-labeled)
```

### During Gameplay
```
1. 📸 Photo of empty board
2. 🎮 Players place tiles
3. 📸 Photo after move
4. 🤖 App detects differences
5. 🧠 ML classifies tiles
6. 📊 Calculate score
7. ✅ Confirm (or adjust)
```

### Keyboard Shortcuts (none yet, but ideas!)
- Could add: Space = Take Photo, +/- = Adjust Score
- Feature request? Open an issue! 😊

### Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Tiles not detected | Increase spacing, better lighting |
| Wrong number detected | Plain background, no shadows |
| Silver looks gray | Diffused lighting, no glare |
| Purple confusion | Consistent lighting, multiple photos |
| Model won't train | Need 10+ images minimum |

### Key Features You Have

✅ **Grid Splitter** - Auto-extract tiles from multi-tile photos
✅ **Custom Colors** - Silver, Pink, Purple-Blue support
✅ **Batch Upload** - Multiple images at once
✅ **Import/Export** - Share training data & models
✅ **ML Classification** - TensorFlow.js CNNs
✅ **Offline** - No internet needed
✅ **Manual Override** - Adjust scores anytime

### Tech Stack
- Frontend: HTML5, CSS3, Vanilla JS
- ML: TensorFlow.js (CNNs)
- Storage: LocalStorage + IndexedDB
- Camera: MediaDevices API
- Size: ~120KB total

### Performance
- Training: 2-5 minutes (36 images)
- Inference: <100ms per tile
- Storage: ~5-10MB for training data
- Models: ~2-5MB saved to IndexedDB

### Browser Support
- ✅ Chrome/Edge on Android
- ✅ Safari on iOS
- ⚠️ Requires camera permission
- ⚠️ Need good lighting

### Naming Conventions

**For batch upload:**
```
silver-circle-01.jpg
silver-square-02.jpg
purple-diamond-01.jpg
...
```

**For grid photos (any name works):**
```
silver.jpg
purple.jpg
orange.jpg
...
```

### Export/Share

After training:
- **Export Data** → JSON file with training images
- **Export Model** → Neural network weights
- **Share** → Others can import and skip training

### Commands

```bash
# Start server
python serve.py

# Or alternative
python -m http.server 8000
npx serve
```

### URLs
- Local: `http://localhost:8000`
- Network: `http://YOUR_IP:8000`
- Camera needs: HTTPS or localhost

### What Gets Saved
- ✅ Training images (LocalStorage)
- ✅ Trained models (IndexedDB)
- ✅ Game state (during play)
- ❌ Game history (cleared on reload)

### Statistics
- Code: 2,958 lines
- Files: 16 total
- Docs: 6 guides
- Size: 120KB

---

## 🎯 Your Action Items

- [ ] Read `SETUP_YOUR_TILES.md`
- [ ] Have 6 tile photos ready
- [ ] Start `serve.py`
- [ ] Open in mobile browser
- [ ] Upload photos via Grid Splitter
- [ ] Train model
- [ ] Play Qwirkle! 🎉

**Time to complete: 10-15 minutes**

---

Need help? All documentation is in the project folder.
Start with: **SETUP_YOUR_TILES.md**

Happy Qwirkling! 🌈🎮
