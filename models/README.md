# Pre-trained Models

This directory contains pre-trained TensorFlow.js models for the custom 3D-printed Qwirkle tile set.

## Directory Structure

```
models/
├── pretrained/
│   ├── color-model/
│   │   ├── model.json          ← Color classifier model architecture
│   │   ├── group1-shard1of1.bin ← Model weights
│   │   └── ...
│   └── shape-model/
│       ├── model.json          ← Shape classifier model architecture
│       ├── group1-shard1of1.bin ← Model weights
│       └── ...
└── README.md                   ← This file
```

## Using Pre-trained Models

The app will automatically attempt to load these models when the page loads.

### How It Works

1. On app load, `tileDetector.js` checks for models in this location
2. If found, loads them automatically
3. If not found, user must train their own models
4. Users can still train custom models to override pre-trained ones

### Adding Your Trained Models

If you've trained models locally using the app, you can export them:

#### Option 1: Export from Browser (Recommended for Small Models)

1. Train your model in the app
2. Click "Export Model" (downloads model files)
3. Copy the downloaded files to this directory structure:
   ```
   models/pretrained/color-model/model.json
   models/pretrained/color-model/group1-shard1of*.bin
   models/pretrained/shape-model/model.json
   models/pretrained/shape-model/group1-shard1of*.bin
   ```

#### Option 2: Extract from IndexedDB (Advanced)

Your trained models are stored in IndexedDB. To extract them:

1. Open browser DevTools → Application → IndexedDB
2. Find `tensorflowjs` database
3. Export model data
4. Save to this directory structure

#### Option 3: Use Python Script to Convert (For Large Datasets)

```bash
# Install TensorFlow.js converter
pip install tensorflowjs

# Convert saved model
tensorflowjs_converter \
    --input_format=keras \
    path/to/saved_model.h5 \
    models/pretrained/color-model/
```

## Model Files

### Color Model
- **Input**: 64x64 RGB image of a tile
- **Output**: Probabilities for 6 colors [Silver, Purple, Orange, Blue, Pink, Purple-Blue]
- **Architecture**: CNN with 3 conv layers + dense layers
- **Size**: ~2-5 MB

### Shape Model  
- **Input**: 64x64 RGB image of a tile
- **Output**: Probabilities for 6 shapes [Circle, Square, Diamond, Star, Clover, Cross]
- **Architecture**: CNN with 3 conv layers + dense layers
- **Size**: ~2-5 MB

## Training Data Info

Models trained on:
- **Total images**: 36+ (6 colors × 6 shapes)
- **Epochs**: 20 per model
- **Accuracy**: ~85-95% (depends on photo quality)
- **Custom colors**: Silver, Purple, Orange, Blue, Pink, Purple-Blue

## Model Performance

Expected accuracy with good lighting and camera positioning:
- Color detection: 90-95%
- Shape detection: 85-95%
- Combined: 75-90%

Manual score adjustment is available if detection is incorrect.

## Updating Models

To update with better-trained models:

1. Train new models with more/better data
2. Export the new models
3. Replace files in this directory
4. Commit and push to repository
5. Users will automatically get updated models

## File Size Considerations

GitHub has file size limits:
- Individual files: 100 MB max (soft limit), 100 MB hard limit
- Repository: 1 GB recommended max
- TensorFlow.js models are typically 2-10 MB per model

If your models are too large:
- Use Git LFS (Large File Storage)
- Host models separately (CDN, cloud storage)
- Update model URL in `tileDetector.js`

## Using Git LFS (if models are large)

```bash
# Install Git LFS
git lfs install

# Track model files
git lfs track "models/**/*.bin"
git lfs track "models/**/*.json"

# Add .gitattributes
git add .gitattributes

# Add and commit models
git add models/
git commit -m "Add pre-trained models via Git LFS"
git push
```

## Alternative: Host Models Externally

If models are very large or you want faster loading:

1. Upload to CDN or cloud storage (S3, Firebase, etc.)
2. Get public URLs for model.json files
3. Update `tileDetector.js` to load from those URLs
4. Models will be downloaded on first use

## Testing Pre-trained Models

After adding models to this directory:

1. Clear browser's IndexedDB (DevTools → Application → IndexedDB → Delete)
2. Reload the app
3. It should automatically load pre-trained models
4. Test detection with sample tiles
5. Compare accuracy with training screen stats

## Versioning Models

Consider adding version info:

```
models/
├── pretrained/
│   ├── v1/          ← First version
│   ├── v2/          ← Improved version
│   └── latest/      ← Symlink to latest version
```

Update loader to use specific version or always latest.

## Sharing Models

Once models are in this repo and pushed to GitHub:
- They're automatically deployed with GitHub Pages
- Users get them immediately when visiting the app
- No training needed for basic functionality
- Users can still train custom models for their specific tiles/lighting

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
  "shapes": ["circle", "square", "diamond", "star", "clover", "cross"]
}
```

App can display this info to users!

---

## Quick Start

To add your trained models:

```bash
# 1. Export models from the app (Export Model button)

# 2. Copy to this directory
cp ~/Downloads/model.json models/pretrained/color-model/
cp ~/Downloads/*.bin models/pretrained/color-model/

# 3. Repeat for shape model
cp ~/Downloads/model.json models/pretrained/shape-model/
cp ~/Downloads/*.bin models/pretrained/shape-model/

# 4. Commit and push
git add models/
git commit -m "Add pre-trained models for custom tile set"
git push
```

Users will now automatically have pre-trained models! 🎉
