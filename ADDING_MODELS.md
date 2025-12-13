# Adding Your Pre-trained Models

## Quick Overview

You have trained models and want to include them in the repository so users can use them immediately without training. Here's how!

## Where to Put Models

```
models/
└── pretrained/
    ├── color-model/
    │   ├── model.json              ← TensorFlow.js model architecture
    │   └── group1-shard1of*.bin    ← Model weights
    └── shape-model/
        ├── model.json
        └── group1-shard1of*.bin
```

## Method 1: Using the Helper Script (Recommended)

```bash
cd /home/km/repos/qwirkle-counter

# Run the helper script
python add_models.py

# Follow the prompts:
# 1. It will ask for the path to your exported color model
# 2. It will ask for the path to your exported shape model
# 3. It copies them to the correct location
# 4. Creates metadata file
```

## Method 2: Manual Copy

### Step 1: Export Models from App

1. Open your Qwirkle Counter in browser
2. Train your models (if not already done)
3. Go to Training Screen
4. Click **"Export Model"**
5. Two downloads will start (or check Downloads folder):
   - Color model files
   - Shape model files

### Step 2: Find the Exported Files

Your browser downloads the model files. They might be:
- Directly in Downloads folder as separate files
- Or in a directory structure

Look for:
- `model.json` (model architecture)
- `group1-shard1of1.bin` (or similar - model weights)

You should have these files twice - once for color model, once for shape model.

### Step 3: Copy to Repository

```bash
cd /home/km/repos/qwirkle-counter

# Create directories
mkdir -p models/pretrained/color-model
mkdir -p models/pretrained/shape-model

# Copy color model files
cp ~/Downloads/color-model/model.json models/pretrained/color-model/
cp ~/Downloads/color-model/*.bin models/pretrained/color-model/

# Copy shape model files  
cp ~/Downloads/shape-model/model.json models/pretrained/shape-model/
cp ~/Downloads/shape-model/*.bin models/pretrained/shape-model/
```

### Step 4: Verify

```bash
# Check the structure
ls -lh models/pretrained/color-model/
ls -lh models/pretrained/shape-model/
```

You should see `model.json` and `.bin` files in each directory.

## Method 3: Copy from IndexedDB Export

If you have models in IndexedDB and want to export them programmatically:

### Using Browser Console

1. Open DevTools (F12)
2. Go to Console
3. Run this code:

```javascript
// Export color model
tf.loadLayersModel('indexeddb://qwirkle-color-model').then(model => {
    model.save('downloads://color-model');
});

// Export shape model
tf.loadLayersModel('indexeddb://qwirkle-shape-model').then(model => {
    model.save('downloads://shape-model');
});
```

This downloads the models, then follow Method 2 Step 3.

## Testing the Models

After adding models to the repository:

### Test 1: Check Files Exist
```bash
# Should show model.json and .bin files
ls models/pretrained/color-model/
ls models/pretrained/shape-model/
```

### Test 2: Test in App

1. Open the app in browser
2. Open DevTools Console
3. Look for these messages:
   - `"✅ Pre-trained models loaded from repository"`
   - OR `"✅ Models loaded from IndexedDB (user-trained)"`

4. Go to game screen
5. Try taking a photo and see if detection works

### Test 3: Clear Cache and Re-test

```javascript
// In browser console, clear IndexedDB
indexedDB.deleteDatabase('tensorflowjs');
location.reload();
```

The app should now load from the repository files.

## Committing the Models

Once models are in place:

```bash
# Add to git
git add models/

# Check what's being added
git status

# Commit
git commit -m "Add pre-trained models for custom 3D-printed tile set"

# Push to GitHub
git push
```

## File Size Considerations

Check model sizes:
```bash
du -sh models/pretrained/
```

Typical sizes:
- Each model: 2-5 MB
- Total: 4-10 MB
- ✅ This is fine for GitHub (< 100 MB limit)

If models are larger than 50 MB:
```bash
# Use Git LFS
git lfs install
git lfs track "models/**/*.bin"
git add .gitattributes
git add models/
git commit -m "Add pre-trained models via Git LFS"
git push
```

## Model Metadata (Optional)

Create `models/pretrained/metadata.json`:

```json
{
  "version": "1.0.0",
  "created": "2025-12-13",
  "trainingImages": 36,
  "epochs": 20,
  "accuracy": {
    "color": 0.92,
    "shape": 0.88
  },
  "colors": ["silver", "purple", "orange", "blue", "pink", "purple-blue"],
  "shapes": ["circle", "square", "diamond", "star", "clover", "cross"],
  "notes": "Trained on custom 3D-printed Qwirkle set"
}
```

## After Deployment

Once pushed to GitHub and deployed:

1. Users visit your GitHub Pages URL
2. App automatically loads pre-trained models
3. Users can use the app immediately without training!
4. Users can still train custom models if they want

## Updating Models

To update with better models later:

1. Train new improved models
2. Export them
3. Replace files in `models/pretrained/`
4. Update `metadata.json` (increment version)
5. Commit and push

Users will get the updated models on next visit!

## Troubleshooting

### "Cannot find model files"
- Check paths are correct
- Verify model.json exists
- Check file permissions

### "Model loading failed"
- Verify model.json format is valid
- Check .bin files are present
- Look at browser console for errors

### "Models too large for GitHub"
- Use Git LFS (see above)
- Or host models externally (CDN, cloud storage)
- Update `tileDetector.js` with external URLs

### "App still says training required"
- Clear browser cache and IndexedDB
- Check browser console for loading messages
- Verify model paths in code match actual paths

## Alternative: External Hosting

If you prefer to host models externally:

```javascript
// In tileDetector.js, update loadSavedModels():
this.colorModel = await tf.loadLayersModel('https://your-cdn.com/color-model/model.json');
this.shapeModel = await tf.loadLayersModel('https://your-cdn.com/shape-model/model.json');
```

This allows:
- Unlimited model sizes
- Faster CDN delivery
- Separate model versioning
- No impact on repository size

---

## Summary

**Easiest method:**
```bash
# 1. Run helper script
python add_models.py

# 2. Provide paths to exported models

# 3. Commit
git add models/
git commit -m "Add pre-trained models"
git push
```

**Manual method:**
```bash
# 1. Export from app or IndexedDB
# 2. Copy to models/pretrained/color-model/ and shape-model/
# 3. Commit and push
```

**Result:**
- Users get working app immediately
- No training required for basic use
- Models auto-load on first visit
- Cached in IndexedDB for performance

🎉 Your models are now part of the app!
