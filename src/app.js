const Hapi = require('@hapi/hapi');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { loadModel, predict } = require('./routes');
const {Firestore} = require('@google-cloud/firestore')
const db = new Firestore()

async function storeData(data) {
    try {
        const predictions = db.collection('predictions');
        await predictions.doc(data.id).set(data);
    } catch (error) {
        console.error('Error storing data:', error);
    }
}


(async () => {
    // Load and get machine learning model
    const model = await loadModel();
    console.log('Model loaded!');

    // Initializing HTTP server
    const server = Hapi.server({
        host: '0.0.0.0',
        port: 8080,
        // routes: {
        //     cors: {
        //         origin: ['*'], // Allow all origins (you can specify specific domains here)
        //         headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'], // Allowed headers
        //         exposedHeaders: ['WWW-Authenticate', 'Server-Authorization'], // Exposed headers
        //         additionalExposedHeaders: ['X-Custom-Header'], // Additional exposed headers
        //         maxAge: 60, // Max age for preflight request caching
        //         credentials: true // Allow credentials (set to false if not needed)
        //     }
        // }
    });

    server.route({
        method: 'POST',
        path: '/predict',
        handler: async (request, h) => {
            const { image } = request.payload;

            if (!image) {
                return h.response({ error: 'Cannot read image' }).code(400);
            }

            try {
                // Check file size (max 1MB)
                const fileSize = fs.statSync(image.path).size;
                if (fileSize > 1000000) { // Check manually
                    return h.response({
                        status: "fail",
                        message: "Payload content length greater than maximum allowed: 1000000"
                    }).code(413);
                }

                // Read file into buffer
                const imageBuffer = fs.readFileSync(image.path);

                // Perform prediction
                const result = await predict(model, imageBuffer);

                if (result[0] > 0.5) {
                    const data = {
                        id: uuidv4(),
                        result: "Cancer",
                        suggestion: "Segera periksa ke dokter!",
                        createdAt: new Date().toISOString()
                        // createdAt: "2023-12-22T08:26:41.834Z"
                    }
                    storeData(data)
                    return h.response({
                        status: "success",
                        message: "Model is predicted successfully",
                        data
                    }).code(201);
                }

                if (result[0] <= 0.5) {
                    const data = {
                        id: uuidv4(),
                        result: "Non-cancer",
                        suggestion: "Penyakit kanker tidak terdeteksi.",
                        createdAt: new Date().toISOString()
                        // createdAt: "2023-12-22T08:26:41.834Z"
                    }
                    return h.response({
                        status: "success",
                        message: "Model is predicted successfully",
                        data
                    }).code(201)
                }

                throw new Error()
            } catch (error) {
                console.error(error);
                return h.response({
                    status: "fail",
                    message: "Terjadi kesalahan dalam melakukan prediksi"
                }).code(400);
            }
        },
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'file', // Ensure the file is saved as a temporary file
                parse: true,    // Automatically parse the payload
                maxBytes: 100000000
            }
        }
    });


    await server.start();
})();
