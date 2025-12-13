#!/usr/bin/env node

/**
 * Helper script to add pre-trained TensorFlow.js models to the repository.
 * Node.js version
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    let copiedCount = 0;
    
    for (const file of files) {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        
        if (fs.statSync(srcPath).isFile()) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`  ✓ ${file}`);
            copiedCount++;
        }
    }
    
    return copiedCount;
}

function getDirectorySize(dir) {
    let totalSize = 0;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isFile()) {
            totalSize += fs.statSync(filePath).size;
        }
    }
    
    return totalSize;
}

async function main() {
    console.log('='.repeat(60));
    console.log('Qwirkle Counter - Pre-trained Model Setup');
    console.log('='.repeat(60));
    console.log();
    
    // Get current directory
    const repoRoot = __dirname;
    const modelsDir = path.join(repoRoot, 'models', 'pretrained');
    
    // Create directories
    const colorDir = path.join(modelsDir, 'color-model');
    const shapeDir = path.join(modelsDir, 'shape-model');
    
    fs.mkdirSync(colorDir, { recursive: true });
    fs.mkdirSync(shapeDir, { recursive: true });
    
    console.log('📁 Model directories created:');
    console.log(`   - ${colorDir}`);
    console.log(`   - ${shapeDir}`);
    console.log();
    
    // Check if models already exist
    const colorExists = fs.existsSync(path.join(colorDir, 'model.json'));
    const shapeExists = fs.existsSync(path.join(shapeDir, 'model.json'));
    
    if (colorExists && shapeExists) {
        console.log('✅ Models already exist in repository!');
        console.log();
        console.log('Current models:');
        console.log(`   - Color model: ${colorDir}`);
        console.log(`   - Shape model: ${shapeDir}`);
        console.log();
        
        const response = await question('Do you want to replace them? (y/N): ');
        if (response.toLowerCase() !== 'y') {
            console.log('Keeping existing models. Exiting.');
            rl.close();
            return;
        }
        console.log();
    }
    
    console.log('='.repeat(60));
    console.log('How to export your models from the app:');
    console.log('='.repeat(60));
    console.log('1. Open the Qwirkle Counter app in your browser');
    console.log('2. Go to Training Screen');
    console.log('3. Scroll down and click "Export Model"');
    console.log('4. Two downloads will start (directories with model files)');
    console.log();
    console.log('Note: Check your Downloads folder for the exported model directories.');
    console.log();
    
    // Ask for model locations
    console.log('='.repeat(60));
    console.log('Please provide the paths to your exported models:');
    console.log('='.repeat(60));
    console.log();
    
    // Get color model path
    let colorPath;
    while (true) {
        const input = await question('Path to color model directory (contains model.json): ');
        colorPath = input.trim();
        
        if (!colorPath) {
            console.log('❌ Path cannot be empty');
            continue;
        }
        
        // Expand ~ to home directory
        if (colorPath.startsWith('~')) {
            colorPath = path.join(process.env.HOME, colorPath.slice(1));
        }
        
        if (!fs.existsSync(colorPath)) {
            console.log(`❌ Directory not found: ${colorPath}`);
            continue;
        }
        
        if (!fs.existsSync(path.join(colorPath, 'model.json'))) {
            console.log(`❌ model.json not found in ${colorPath}`);
            continue;
        }
        
        break;
    }
    
    // Get shape model path
    let shapePath;
    while (true) {
        const input = await question('Path to shape model directory (contains model.json): ');
        shapePath = input.trim();
        
        if (!shapePath) {
            console.log('❌ Path cannot be empty');
            continue;
        }
        
        // Expand ~ to home directory
        if (shapePath.startsWith('~')) {
            shapePath = path.join(process.env.HOME, shapePath.slice(1));
        }
        
        if (!fs.existsSync(shapePath)) {
            console.log(`❌ Directory not found: ${shapePath}`);
            continue;
        }
        
        if (!fs.existsSync(path.join(shapePath, 'model.json'))) {
            console.log(`❌ model.json not found in ${shapePath}`);
            continue;
        }
        
        break;
    }
    
    console.log();
    console.log('='.repeat(60));
    console.log('Copying models to repository...');
    console.log('='.repeat(60));
    
    // Copy color model
    console.log('Copying color model...');
    copyDirectory(colorPath, colorDir);
    
    // Copy shape model
    console.log('Copying shape model...');
    copyDirectory(shapePath, shapeDir);
    
    console.log();
    console.log('='.repeat(60));
    console.log('Creating model metadata...');
    console.log('='.repeat(60));
    
    // Create metadata file
    const createdDate = await question('Creation date (YYYY-MM-DD) [Enter for today]: ');
    const trainingImages = await question('Number of training images used [36]: ');
    const epochs = await question('Number of epochs trained [20]: ');
    const notes = await question('Any notes about this model (optional): ');
    
    const metadata = {
        version: '1.0.0',
        created: createdDate.trim() || new Date().toISOString().split('T')[0],
        trainingImages: parseInt(trainingImages.trim() || '36'),
        epochs: parseInt(epochs.trim() || '20'),
        colors: ['silver', 'purple', 'orange', 'blue', 'pink', 'purple-blue'],
        shapes: ['circle', 'square', 'diamond', 'star', 'clover', 'cross'],
        notes: notes.trim() || 'Custom 3D-printed tile set'
    };
    
    const metadataPath = path.join(modelsDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    console.log(`✓ Metadata saved to ${metadataPath}`);
    console.log();
    
    // Show summary
    console.log('='.repeat(60));
    console.log('✅ Models successfully added to repository!');
    console.log('='.repeat(60));
    console.log();
    console.log('Directory structure:');
    console.log('models/pretrained/');
    console.log('├── color-model/');
    
    const colorFiles = fs.readdirSync(colorDir).sort();
    colorFiles.forEach(file => {
        console.log(`│   ├── ${file}`);
    });
    
    console.log('├── shape-model/');
    const shapeFiles = fs.readdirSync(shapeDir).sort();
    shapeFiles.forEach(file => {
        console.log(`│   ├── ${file}`);
    });
    
    console.log('└── metadata.json');
    console.log();
    
    // Calculate sizes
    const colorSize = getDirectorySize(colorDir);
    const shapeSize = getDirectorySize(shapeDir);
    const totalSize = colorSize + shapeSize;
    
    console.log('Model sizes:');
    console.log(`  - Color model: ${(colorSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Shape model: ${(shapeSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log();
    
    if (totalSize > 100 * 1024 * 1024) {  // 100 MB
        console.log('⚠️  WARNING: Models are larger than 100 MB');
        console.log('   Consider using Git LFS for large files:');
        console.log('   git lfs install');
        console.log('   git lfs track "models/**/*.bin"');
        console.log();
    }
    
    // Next steps
    console.log('='.repeat(60));
    console.log('Next steps:');
    console.log('='.repeat(60));
    console.log('1. Review the models in models/pretrained/');
    console.log('2. Test in the app (should auto-load on refresh)');
    console.log('3. Commit to git:');
    console.log('   git add models/');
    console.log('   git commit -m "Add pre-trained models"');
    console.log('   git push');
    console.log();
    console.log('4. Users will automatically get these models when they visit the app!');
    console.log();
    console.log('🎉 Done! Your pre-trained models are ready to deploy.');
    
    rl.close();
}

main().catch(err => {
    console.error('\n❌ Error:', err.message);
    rl.close();
    process.exit(1);
});
