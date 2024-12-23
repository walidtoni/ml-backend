const tfjs = require('@tensorflow/tfjs-node');

async function loadModel() {
    const modelUrl = process.env.BUCKET_URL;
    if (!modelUrl) {
        throw new Error('Model URL is not set in the BUCKET_URL environment variable.');
    }

    try {
        return await tfjs.loadGraphModel(modelUrl);
    } catch (error) {
        console.error('Error loading model:', error);
        throw error;
    }
}

async function predict(model, imageBuffer) {
    try {
        // Decode the image buffer as an RGB image
        const tensor = tfjs.node
            .decodeJpeg(imageBuffer, 3)           // Ensure 3 channels for RGB
            .resizeNearestNeighbor([224, 224])   // Resize to 224x224
            .expandDims()                        // Add batch dimension
            .toFloat();                          // Convert to float for model

        const shape = tfjs.node.decodeJpeg(imageBuffer).shape; // [height, width, channels]

        // Check the number of channels
        if (shape[2] !== 3) {
            throw new Error()
        }
        const predictions = await model.predict(tensor).data();
        tensor.dispose(); // Dispose of tensor to free memory
        return predictions;
    } catch (error) {
        console.error('Error during prediction:', error);
        throw error;
    }
}

module.exports = { loadModel, predict };
