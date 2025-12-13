# 🎯 Adding Your Pre-trained Models - Quick Guide

## Where Are Your Models?

Your trained models are currently in one of these places:

### Option A: In Your Browser (IndexedDB)
If you trained models in the app, they're stored in your browser's IndexedDB.

**To export them:**
1. Open the Qwirkle Counter app
2. Go to Training Screen
3. Click **"Export Model"** button
4. Files download to your Downloads folder

### Option B: Already Exported
If you already exported them, check your Downloads folder for:
- `model.json` files
- `.bin` files (weights)

## Quick Setup (3 Steps)

### Step 1: Run the Helper Script

```bash
cd /home/km/repos/qwirkle-counter
python add_models.py
```

The script will:
- Ask where your exported models are
- Copy them to the right location
- Create metadata
- Show you a summary

### Step 2: Commit to Git

```bash
git add models/
git commit -m "Add pre-trained models"
git push
```

### Step 3: Done!

Your models are now in the repository and will be automatically:
- Loaded by users when they visit the app
- Cached to their browser for faster loading
- Used for automatic tile detection

## Where Models Go

```
models/
└── pretrained/
    ├── color-model/
    │   ├── model.json
    │   └── group1-shard1of*.bin
    ├── shape-model/
    │   ├── model.json
    │   └── group1-shard1of*.bin
    └── metadata.json (optional)
```

## How It Works

When users visit your deployed app:

```
1. App loads
   ↓
2. Checks IndexedDB for user-trained models
   ↓ (not found)
3. Loads models from models/pretrained/ in repository
   ↓
4. Caches to IndexedDB for next time
   ↓
5. Models ready! ✅
```

## Manual Method (If Script Fails)

```bash
# Create directories
mkdir -p models/pretrained/color-model
mkdir -p models/pretrained/shape-model

# Find your exported models (check Downloads)
# Then copy:
cp /path/to/color-model/* models/pretrained/color-model/
cp /path/to/shape-model/* models/pretrained/shape-model/

# Commit
git add models/
git commit -m "Add pre-trained models"
git push
```

## Verifying Models Are Added

```bash
# Check files exist
ls models/pretrained/color-model/
ls models/pretrained/shape-model/

# Should show:
# - model.json
# - group1-shard1of1.bin (or similar)
```

## Testing

After committing and pushing:

1. Go to your GitHub repository
2. Navigate to `models/pretrained/`
3. Verify files are there

Then test locally:
```bash
python serve.py
# Open http://localhost:8000
# Check browser console for: "✅ Pre-trained models loaded from repository"
```

## File Sizes

Typical model sizes:
- Color model: 2-5 MB
- Shape model: 2-5 MB
- **Total: 4-10 MB** ✅ (fine for GitHub)

If larger than 50 MB, see `ADDING_MODELS.md` for Git LFS setup.

## What Users Get

With your pre-trained models included:
- ✅ App works immediately (no training needed!)
- ✅ Automatic tile detection on first use
- ✅ Faster loading (models cached locally)
- ✅ Users can still train custom models if they want

## Updating Models Later

To update with better models:

1. Train improved models
2. Export them
3. Replace files in `models/pretrained/`
4. Commit and push

Users automatically get updates!

## Need Help?

See detailed guides:
- `ADDING_MODELS.md` - Complete documentation
- `models/README.md` - Model directory info
- Run: `python add_models.py` - Interactive setup

---

## TL;DR

```bash
# Export models from app (Training Screen → Export Model)
# Then:
python add_models.py
# Follow prompts
git add models/
git commit -m "Add pre-trained models"
git push
# Done! 🎉
```

Your users will now get pre-trained models automatically!
