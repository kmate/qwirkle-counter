// Tile Detector using TensorFlow.js
// Detects and classifies Qwirkle tiles using machine learning

class TileDetector {
    constructor() {
        this.model = null;
        this.colorModel = null;
        this.shapeModel = null;
        this.isModelReady = false;
        this.imageSize = 64; // Size to resize images for training/inference
        
        this.colors = ['silver', 'purple', 'orange', 'blue', 'pink', 'purple-blue'];
        this.shapes = ['circle', 'square', 'diamond', 'star', 'clover', 'cross'];
        
        this.loadSavedModels();
    }
    
    /**
     * Creates a simple CNN model for classification
     */
    createModel(numClasses) {
        const model = tf.sequential();
        
        // Convolutional layers
        model.add(tf.layers.conv2d({
            inputShape: [this.imageSize, this.imageSize, 3],
            filters: 32,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same'
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        
        model.add(tf.layers.conv2d({
            filters: 64,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same'
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        
        model.add(tf.layers.conv2d({
            filters: 128,
            kernelSize: 3,
            activation: 'relu',
            padding: 'same'
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
        
        // Dense layers
        model.add(tf.layers.flatten());
        model.add(tf.layers.dropout({ rate: 0.5 }));
        model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
        model.add(tf.layers.dropout({ rate: 0.3 }));
        model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));
        
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        return model;
    }
    
    /**
     * Preprocesses an image for the model
     */
    async preprocessImage(imageData) {
        return tf.tidy(() => {
            // Load image
            const img = new Image();
            img.src = imageData;
            
            return new Promise((resolve) => {
                img.onload = () => {
                    // Convert to tensor
                    let tensor = tf.browser.fromPixels(img);
                    
                    // Resize to model input size
                    tensor = tf.image.resizeBilinear(tensor, [this.imageSize, this.imageSize]);
                    
                    // Normalize to [0, 1]
                    tensor = tensor.div(255.0);
                    
                    resolve(tensor);
                };
            });
        });
    }
    
    /**
     * Trains the models on provided training data
     */
    async train(trainingImages) {
        if (trainingImages.length === 0) {
            throw new Error('No training data available');
        }
        
        console.log('Starting training with', trainingImages.length, 'images');
        
        // Separate training for colors and shapes
        await this.trainColorModel(trainingImages);
        await this.trainShapeModel(trainingImages);
        
        this.isModelReady = true;
        await this.saveModels();
        
        console.log('Training complete!');
    }
    
    /**
     * Trains the color classification model
     */
    async trainColorModel(trainingImages) {
        console.log('Training color model...');
        
        this.colorModel = this.createModel(this.colors.length);
        
        // Prepare training data
        const imageTensors = [];
        const labels = [];
        
        for (const img of trainingImages) {
            const tensor = await this.loadImageAsTensor(img.data);
            imageTensors.push(tensor);
            labels.push(this.colors.indexOf(img.color));
        }
        
        const xs = tf.stack(imageTensors);
        const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), this.colors.length);
        
        // Train
        await this.colorModel.fit(xs, ys, {
            epochs: 20,
            batchSize: 8,
            validationSplit: 0.2,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Color model - Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, acc = ${logs.acc.toFixed(4)}`);
                    updateLoadingProgress((epoch + 1) / 20 * 50);
                }
            }
        });
        
        // Cleanup
        xs.dispose();
        ys.dispose();
        imageTensors.forEach(t => t.dispose());
    }
    
    /**
     * Trains the shape classification model
     */
    async trainShapeModel(trainingImages) {
        console.log('Training shape model...');
        
        this.shapeModel = this.createModel(this.shapes.length);
        
        // Prepare training data
        const imageTensors = [];
        const labels = [];
        
        for (const img of trainingImages) {
            const tensor = await this.loadImageAsTensor(img.data);
            imageTensors.push(tensor);
            labels.push(this.shapes.indexOf(img.shape));
        }
        
        const xs = tf.stack(imageTensors);
        const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), this.shapes.length);
        
        // Train
        await this.shapeModel.fit(xs, ys, {
            epochs: 20,
            batchSize: 8,
            validationSplit: 0.2,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Shape model - Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, acc = ${logs.acc.toFixed(4)}`);
                    updateLoadingProgress(50 + (epoch + 1) / 20 * 50);
                }
            }
        });
        
        // Cleanup
        xs.dispose();
        ys.dispose();
        imageTensors.forEach(t => t.dispose());
    }
    
    /**
     * Loads an image as a tensor
     */
    async loadImageAsTensor(imageData) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const tensor = tf.tidy(() => {
                    let t = tf.browser.fromPixels(img);
                    t = tf.image.resizeBilinear(t, [this.imageSize, this.imageSize]);
                    t = t.div(255.0);
                    return t;
                });
                resolve(tensor);
            };
            img.onerror = reject;
            img.src = imageData;
        });
    }
    
    /**
     * Predicts the color and shape of a tile in an image
     */
    async classifyTile(imageData) {
        if (!this.isModelReady || !this.colorModel || !this.shapeModel) {
            throw new Error('Model not trained yet');
        }
        
        const tensor = await this.loadImageAsTensor(imageData);
        const batchedTensor = tensor.expandDims(0);
        
        // Predict color
        const colorPrediction = this.colorModel.predict(batchedTensor);
        const colorIndex = colorPrediction.argMax(-1).dataSync()[0];
        const colorConfidence = colorPrediction.max().dataSync()[0];
        
        // Predict shape
        const shapePrediction = this.shapeModel.predict(batchedTensor);
        const shapeIndex = shapePrediction.argMax(-1).dataSync()[0];
        const shapeConfidence = shapePrediction.max().dataSync()[0];
        
        // Cleanup
        tensor.dispose();
        batchedTensor.dispose();
        colorPrediction.dispose();
        shapePrediction.dispose();
        
        return {
            color: this.colors[colorIndex],
            colorConfidence: colorConfidence,
            shape: this.shapes[shapeIndex],
            shapeConfidence: shapeConfidence
        };
    }
    
    /**
     * Saves trained models to browser storage
     */
    async saveModels() {
        try {
            if (this.colorModel) {
                await this.colorModel.save('indexeddb://qwirkle-color-model');
            }
            if (this.shapeModel) {
                await this.shapeModel.save('indexeddb://qwirkle-shape-model');
            }
            console.log('Models saved successfully');
        } catch (error) {
            console.error('Failed to save models:', error);
        }
    }
    
    /**
     * Loads saved models from browser storage
     */
    async loadSavedModels() {
        try {
            this.colorModel = await tf.loadLayersModel('indexeddb://qwirkle-color-model');
            this.shapeModel = await tf.loadLayersModel('indexeddb://qwirkle-shape-model');
            this.isModelReady = true;
            console.log('Models loaded successfully');
        } catch (error) {
            console.log('No saved models found, training required');
            this.isModelReady = false;
        }
    }
}

// Global tile detector instance
const tileDetector = new TileDetector();

// Helper function to update loading progress
function updateLoadingProgress(percent) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        let progressBar = overlay.querySelector('.progress-bar');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.innerHTML = '<div class="progress-fill"></div>';
            overlay.appendChild(progressBar);
        }
        const fill = progressBar.querySelector('.progress-fill');
        fill.style.width = `${percent}%`;
    }
}

// Model export/import functions
async function exportModel() {
    if (!tileDetector.isModelReady) {
        alert('No trained model to export. Please train a model first.');
        return;
    }
    
    showLoading('Exporting models...');
    
    try {
        // Export both models to downloads
        await tileDetector.colorModel.save('downloads://qwirkle-color-model');
        await tileDetector.shapeModel.save('downloads://qwirkle-shape-model');
        
        hideLoading();
        alert('Models exported successfully! Check your Downloads folder for model files.');
    } catch (error) {
        hideLoading();
        console.error('Error exporting models:', error);
        alert('Failed to export models: ' + error.message);
    }
}

async function importModel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.multiple = true;
    
    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) {
            alert('Please select model files');
            return;
        }
        
        showLoading('Importing models...');
        
        try {
            // We need both model.json files and their associated weight files
            const colorModelFile = files.find(f => f.name.includes('color'));
            const shapeModelFile = files.find(f => f.name.includes('shape'));
            
            if (!colorModelFile || !shapeModelFile) {
                hideLoading();
                alert('Please select both color and shape model files');
                return;
            }
            
            // Load models from uploaded files
            // Note: This is complex with TensorFlow.js file uploads
            // For now, we'll guide users to use IndexedDB
            hideLoading();
            alert('Model import from files is complex. Instead:\n1. Share your training data JSON\n2. Let others train the model locally\n\nOr use the "Import Data" button to load training images.');
            
        } catch (error) {
            hideLoading();
            console.error('Error importing models:', error);
            alert('Failed to import models');
        }
    };
    
    input.click();
}
