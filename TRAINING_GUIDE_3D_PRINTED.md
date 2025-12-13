# Training Guide for Your 3D-Printed Qwirkle Set

## Your Custom Color Set
- **Silver** (replaces Red)
- **Purple** (replaces Yellow)
- **Orange** (replaces Orange)
- **Blue** (replaces Green)
- **Pink** (replaces Blue)
- **Purple-Blue** (replaces Purple)

## Photo Organization

Since you have photos with all 6 tiles of the same color (one photo per color, 6 shapes per photo), here's the workflow:

### Step 1: Prepare Your Photos

You should have **6 photos total**:
1. `silver-tiles.jpg` - All 6 silver tiles (different shapes)
2. `purple-tiles.jpg` - All 6 purple tiles
3. `orange-tiles.jpg` - All 6 orange tiles
4. `blue-tiles.jpg` - All 6 blue tiles
5. `pink-tiles.jpg` - All 6 pink tiles
6. `purple-blue-tiles.jpg` - All 6 purple-blue tiles

### Step 2: Upload Using Grid Splitter

For each photo:

1. Go to the **Training Screen**
2. Scroll to **"Grid Image Splitter"** section
3. Click **"Choose File"** and select one color photo
4. Click **"Process Grid Image"**
5. The app will automatically detect the 6 tiles
6. Select the **color** for this photo (e.g., "Silver")
7. Label each detected tile with its **shape**:
   - Circle
   - Square
   - Diamond
   - Star
   - Clover
   - Cross
8. Click **"Save All Tiles"**
9. Repeat for all 6 color photos

### Expected Results

After processing all 6 photos:
- **36 individual tile images** saved to training data
- Each labeled with correct color-shape combination
- Ready for model training

### Step 3: Train the Model

1. Once all 36 tiles are loaded, click **"Train Model"**
2. Wait 2-5 minutes for training to complete
3. Models will be saved automatically
4. You're ready to use the app!

## Photo Tips for Best Detection

### Lighting
- Use bright, even lighting
- Avoid harsh shadows
- Natural daylight works best

### Camera Position
- Hold phone directly above tiles
- Keep camera parallel to table
- Capture all 6 tiles in frame
- Leave some space around tiles

### Background
- Use plain, neutral background
- Avoid patterns or textures
- White or light gray works best

### Tile Arrangement
Since shapes are in rows but order varies:
- Ensure tiles are well-separated
- Keep rows roughly straight
- Maintain consistent spacing
- Avoid tiles touching edges

## Example Photo Layout

```
Your photos might look like this:

silver-tiles.jpg:
┌─────┬─────┬─────┐
│  ○  │  ○  │  ○  │  (3 circles in top row)
├─────┼─────┼─────┤
│  □  │  □  │  □  │  (3 squares in bottom row)
└─────┴─────┴─────┘

Or any other arrangement - the app will detect them!
```

## Troubleshooting

### If tiles aren't detected:
- Ensure good separation between tiles
- Check lighting (not too dark/bright)
- Make sure tiles are in focus
- Try slightly different camera angle

### If wrong number of tiles detected:
- Adjust spacing between tiles
- Remove any shadows
- Ensure background is plain
- Retake photo with better lighting

### If you want multiple photos per color:
Take 2-3 photos of each color with slightly different:
- Angles
- Lighting conditions
- Tile arrangements

This will make the model more robust!

## Quick Start Commands

If you want to batch rename your files:

```bash
# Example if you have files to rename:
mv photo1.jpg silver-tiles.jpg
mv photo2.jpg purple-tiles.jpg
mv photo3.jpg orange-tiles.jpg
mv photo4.jpg blue-tiles.jpg
mv photo5.jpg pink-tiles.jpg
mv photo6.jpg purple-blue-tiles.jpg
```

## Using the Trained Model

Once trained, during gameplay:
1. Take photo of empty board
2. Players place tiles
3. Take new photo
4. App detects new tiles automatically
5. Recognizes your custom colors
6. Calculates score

## Export/Share Your Model

After training:
1. Click **"Export Data"** to save training images
2. Click **"Export Model"** to save trained model
3. Share these files with others using the same tile set
4. They can **"Import Data"** to skip manual training

---

**Ready?** Just upload your 6 color photos and let the Grid Splitter do the work!
