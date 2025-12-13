#!/usr/bin/env python3
"""
Helper script to add pre-trained TensorFlow.js models to the repository.

This script helps organize your exported models into the correct directory structure.
"""

import os
import sys
import shutil
import json
from pathlib import Path

def main():
    print("=" * 60)
    print("Qwirkle Counter - Pre-trained Model Setup")
    print("=" * 60)
    print()
    
    # Get current directory
    repo_root = Path(__file__).parent
    models_dir = repo_root / "models" / "pretrained"
    
    # Create directories
    color_dir = models_dir / "color-model"
    shape_dir = models_dir / "shape-model"
    
    color_dir.mkdir(parents=True, exist_ok=True)
    shape_dir.mkdir(parents=True, exist_ok=True)
    
    print("📁 Model directories created:")
    print(f"   - {color_dir}")
    print(f"   - {shape_dir}")
    print()
    
    # Check if models already exist
    color_exists = (color_dir / "model.json").exists()
    shape_exists = (shape_dir / "model.json").exists()
    
    if color_exists and shape_exists:
        print("✅ Models already exist in repository!")
        print()
        print("Current models:")
        print(f"   - Color model: {color_dir}")
        print(f"   - Shape model: {shape_dir}")
        print()
        
        response = input("Do you want to replace them? (y/N): ").lower()
        if response != 'y':
            print("Keeping existing models. Exiting.")
            return
        print()
    
    print("=" * 60)
    print("How to export your models from the app:")
    print("=" * 60)
    print("1. Open the Qwirkle Counter app in your browser")
    print("2. Go to Training Screen")
    print("3. Scroll down and click 'Export Model'")
    print("4. Two downloads will start:")
    print("   - qwirkle-color-model (directory with model.json + .bin files)")
    print("   - qwirkle-shape-model (directory with model.json + .bin files)")
    print()
    print("Note: The export downloads the entire model directory.")
    print()
    
    # Ask for model locations
    print("=" * 60)
    print("Please provide the paths to your exported models:")
    print("=" * 60)
    print()
    
    # Get color model path
    while True:
        color_path = input("Path to color model directory (contains model.json): ").strip()
        if not color_path:
            print("❌ Path cannot be empty")
            continue
        
        color_path = Path(color_path).expanduser()
        if not color_path.exists():
            print(f"❌ Directory not found: {color_path}")
            continue
        
        if not (color_path / "model.json").exists():
            print(f"❌ model.json not found in {color_path}")
            continue
        
        break
    
    # Get shape model path
    while True:
        shape_path = input("Path to shape model directory (contains model.json): ").strip()
        if not shape_path:
            print("❌ Path cannot be empty")
            continue
        
        shape_path = Path(shape_path).expanduser()
        if not shape_path.exists():
            print(f"❌ Directory not found: {shape_path}")
            continue
        
        if not (shape_path / "model.json").exists():
            print(f"❌ model.json not found in {shape_path}")
            continue
        
        break
    
    print()
    print("=" * 60)
    print("Copying models to repository...")
    print("=" * 60)
    
    # Copy color model
    print("Copying color model...")
    for file in color_path.glob("*"):
        if file.is_file():
            dest = color_dir / file.name
            shutil.copy2(file, dest)
            print(f"  ✓ {file.name}")
    
    # Copy shape model
    print("Copying shape model...")
    for file in shape_path.glob("*"):
        if file.is_file():
            dest = shape_dir / file.name
            shutil.copy2(file, dest)
            print(f"  ✓ {file.name}")
    
    print()
    print("=" * 60)
    print("Creating model metadata...")
    print("=" * 60)
    
    # Create metadata file
    metadata = {
        "version": "1.0.0",
        "created": input("Creation date (YYYY-MM-DD) [Enter for today]: ").strip() or "2025-12-13",
        "trainingImages": int(input("Number of training images used: ").strip() or "36"),
        "epochs": int(input("Number of epochs trained: ").strip() or "20"),
        "colors": ["silver", "purple", "orange", "blue", "pink", "purple-blue"],
        "shapes": ["circle", "square", "diamond", "star", "clover", "cross"],
        "notes": input("Any notes about this model (optional): ").strip() or "Custom 3D-printed tile set"
    }
    
    metadata_path = models_dir / "metadata.json"
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"✓ Metadata saved to {metadata_path}")
    print()
    
    # Show summary
    print("=" * 60)
    print("✅ Models successfully added to repository!")
    print("=" * 60)
    print()
    print("Directory structure:")
    print(f"models/pretrained/")
    print(f"├── color-model/")
    for file in sorted(color_dir.glob("*")):
        print(f"│   ├── {file.name}")
    print(f"├── shape-model/")
    for file in sorted(shape_dir.glob("*")):
        print(f"│   ├── {file.name}")
    print(f"└── metadata.json")
    print()
    
    # Calculate sizes
    color_size = sum(f.stat().st_size for f in color_dir.glob("*") if f.is_file())
    shape_size = sum(f.stat().st_size for f in shape_dir.glob("*") if f.is_file())
    total_size = color_size + shape_size
    
    print(f"Model sizes:")
    print(f"  - Color model: {color_size / 1024 / 1024:.2f} MB")
    print(f"  - Shape model: {shape_size / 1024 / 1024:.2f} MB")
    print(f"  - Total: {total_size / 1024 / 1024:.2f} MB")
    print()
    
    if total_size > 100 * 1024 * 1024:  # 100 MB
        print("⚠️  WARNING: Models are larger than 100 MB")
        print("   Consider using Git LFS for large files:")
        print("   git lfs install")
        print('   git lfs track "models/**/*.bin"')
        print()
    
    # Next steps
    print("=" * 60)
    print("Next steps:")
    print("=" * 60)
    print("1. Review the models in models/pretrained/")
    print("2. Test in the app (should auto-load on refresh)")
    print("3. Commit to git:")
    print("   git add models/")
    print('   git commit -m "Add pre-trained models"')
    print("   git push")
    print()
    print("4. Users will automatically get these models when they visit the app!")
    print()
    print("🎉 Done! Your pre-trained models are ready to deploy.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
