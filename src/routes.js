const tfjs = require('@tensorflow/tfjs-node');

async function loadModel() {
    const modelPath = process.env.BUCKET_URL;
    if (!modelPath) {
        throw new Error('Model URL not provided');
    }

    try {
        return await tfjs.loadGraphModel(modelPath);
    } catch (error) {
        console.error('Model loading error:', error);
        throw error;
    }
}

async function predict(model, imageBuffer) {
    try {
        const tensor = tfjs.node
            .decodeJpeg(imageBuffer, 3)   
            .resizeNearestNeighbor([224, 224])
            .expandDims()              
            .toFloat();
        const shape = tfjs.node.decodeJpeg(imageBuffer).shape;
        const rgbValue = shape[2]
        if (rgbValue !== 3) {
            throw new Error()
        }
        const predictions = await model.predict(tensor).data();
        tensor.dispose();
        return predictions;
    } catch (error) {
        console.error('Prediction error:', error);
        throw error;
    }
}

module.exports = { loadModel, predict };
