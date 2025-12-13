# Setup Instructions for Your 3D-Printed Qwirkle Set

## What's Different About Your Setup

Your custom 3D-printed Qwirkle set uses these colors:
- **Silver** (metallic/gray)
- **Purple** (standard purple)
- **Orange** (standard orange)
- **Blue** (standard blue)
- **Pink** (magenta/rose)
- **Purple-Blue** (indigo/violet)

The app has been customized to recognize these specific colors!

## Your Photo Setup

You mentioned you have:
- **6 photos total** (one per color)
- **All 6 shapes** of same color in each photo
- Shapes arranged in **rows**
- Row order varies between photos

Perfect! The Grid Splitter feature is designed exactly for this.

## Quick Setup (10 minutes)

### 1. Open the App
```bash
# Start the server
python serve.py

# Open in mobile browser
# Go to: http://YOUR_COMPUTER_IP:8000
```

### 2. Go to Training Screen
- Tap **"Train Tile Detection"** from welcome screen

### 3. Process Each Color Photo

For each of your 6 photos:

1. Scroll to **"Grid Image Splitter"**
2. **Choose File** → Select one color photo (e.g., silver tiles)
3. **Process Grid Image**
4. The app automatically detects the 6 tiles
5. Select the **color** from dropdown (e.g., "Silver")
6. For each detected tile, select its **shape**:
   - Circle
   - Square  
   - Diamond
   - Star
   - Clover
   - Cross
7. **Save All Tiles**

Repeat for all 6 colors: Silver, Purple, Orange, Blue, Pink, Purple-Blue

### 4. Train the Model

Once all 36 tiles are loaded:
1. Click **"Train Model"**
2. Wait 2-5 minutes
3. Done! The model is saved automatically

### 5. Play!

Start a new game and the app will recognize your tiles!

## File Naming (Optional)

If you want to rename your photos for clarity:
```
silver.jpg         (or silver-tiles.jpg)
purple.jpg         (or purple-tiles.jpg)
orange.jpg         (or orange-tiles.jpg)
blue.jpg           (or blue-tiles.jpg)
pink.jpg           (or pink-tiles.jpg)
purple-blue.jpg    (or purple-blue-tiles.jpg)
```

## How the Grid Splitter Works

1. **Converts to grayscale** to find edges
2. **Detects tile boundaries** using blob detection
3. **Filters by size** (ignores small artifacts)
4. **Extracts each tile** as individual image
5. **You label them** with color and shape
6. **Saves to training data** automatically

## Expected Results After Processing

```
Total Training Images: 36

By Color:
- Silver: 6 tiles (circle, square, diamond, star, clover, cross)
- Purple: 6 tiles
- Orange: 6 tiles
- Blue: 6 tiles
- Pink: 6 tiles
- Purple-Blue: 6 tiles

Total unique combinations: 36 (6 colors × 6 shapes)
```

## Tips for Best Detection

### Photo Quality
- ✅ Clear focus
- ✅ Good lighting (bright, even)
- ✅ Plain background
- ✅ Tiles well-separated
- ❌ Avoid shadows
- ❌ Avoid reflections (especially on silver!)
- ❌ Don't let tiles touch

### Tile Arrangement
Your arrangement is fine! Even though rows are in different orders, the app will detect them. Just make sure:
- Tiles don't overlap
- Some space between rows
- All 6 tiles visible in frame

### For Silver Tiles
Since silver is metallic and can be tricky:
- Use diffused lighting (not direct light)
- Avoid glare/reflections
- Slightly matte finish works better than glossy
- May need to adjust exposure slightly

## Troubleshooting

### "No tiles detected"
- Increase separation between tiles
- Try better lighting
- Ensure sharp focus
- Use plain white/gray background

### "Wrong number detected" (more or less than 6)
- Remove background clutter
- Adjust lighting to reduce shadows
- Ensure all tiles are fully visible
- No tiles should touch edges

### "Can't distinguish purple from purple-blue"
- These are similar colors
- The ML model will learn the difference during training
- Take photos in consistent lighting
- Consider adding 2-3 photos of each color for better accuracy

## Advanced: Multiple Photos Per Color

For even better accuracy, take 2-3 photos of each color:
- Different tile arrangements
- Slightly different angles
- Various lighting conditions

This gives you 12-18 training images per color (72-108 total), making the model more robust!

## Export Your Work

After training:
- **Export Data**: Saves all 36 tile images as JSON
- **Export Model**: Saves the trained neural network
- **Share**: Others with same tile set can import and skip training

## What Happens During Gameplay

1. Take photo of board
2. App detects tiles using your trained model
3. Recognizes: Silver, Purple, Orange, Blue, Pink, Purple-Blue
4. Identifies shapes: Circle, Square, Diamond, Star, Clover, Cross
5. Calculates score according to Qwirkle rules
6. You can adjust if detection is wrong

## Your Training Workflow Summary

```
Step 1: Have 6 photos ready (one per color, 6 shapes each)
   ↓
Step 2: Open app → Training Screen → Grid Image Splitter
   ↓
Step 3: Upload silver.jpg → Select color "Silver" → Label 6 shapes → Save
   ↓
Step 4: Upload purple.jpg → Select color "Purple" → Label 6 shapes → Save
   ↓
Step 5: Repeat for: orange, blue, pink, purple-blue
   ↓
Step 6: Train Model (36 tiles total)
   ↓
Step 7: Play Qwirkle with automatic score tracking! 🎉
```

---

**Ready to upload your photos?** Open `index.html` and let's train your custom model!
