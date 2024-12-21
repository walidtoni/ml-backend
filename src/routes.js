const tfjs = require('@tensorflow/tfjs-node');

function loadModel() {
    const modelUrl = process.env.BUCKET_URL;
    return tfjs.loadLayersModel(modelUrl);
}

function predict(model, imageBuffer) {
    // Decode the image buffer as an RGB image
    const tensor = tfjs.node
        .decodeJpeg(imageBuffer, 3)           // Ensure 3 channels for RGB
        .resizeNearestNeighbor([224, 224])   // Resize to 224x224
        .expandDims()                        // Add batch dimension
        .toFloat();                          // Convert to float for model

    return model.predict(tensor).data();     // Get prediction results
}

module.exports = { loadModel, predict };
