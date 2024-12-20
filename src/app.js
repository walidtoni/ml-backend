const Hapi = require('@hapi/hapi');
const { loadModel, predict } = require('./routes');

(async () => {
    // Load and get machine learning model
    const model = await loadModel();
    console.log('Model loaded!');

    // Initializing HTTP server
    const server = Hapi.server({
        host: '0.0.0.0',
        port: 8080
    });

    server.route({
        method: 'POST',
        path: '/predict',
        handler: async (request, h) => {
            // Get the uploaded file from the payload
            const { image } = request.payload;

            if (!image) {
                return h.response({ error: 'Cannot read image' }).code(400);
            }

            // Check file size (max 1MB)
            if (image._data.length > 1000000) {
                return h.response({
                    status: "fail",
                    message: "Payload content length greater than maximum allowed: 1000000"
                }).code(413);
            }

            try {
                // Perform prediction
                const result = await predict(model, image);

                if (result[0] > 0.5) {
                    return {
                        status: "success",
                        message: "Model is predicted successfully",
                        data: {
                            id: "77bd90fc-c126-4ceb-828d-f048dddff746",
                            result: "Cancer",
                            suggestion: "Segera periksa ke dokter!",
                            createdAt: "2023-12-22T08:26:41.834Z"
                        }
                    }
                }

                if (result[0] <= 0.5) {
                    return {
                        status: "success",
                        message: "Model is predicted successfully",
                        data: {
                            id: "77bd90fc-c126-4ceb-828d-f048dddff746",
                            result: "Non-cancer",
                            suggestion: "Penyakit kanker tidak terdeteksi.",
                            createdAt: "2023-12-22T08:26:41.834Z"
                        }
                    }
                }

                throw error
            } catch (error) {
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
                maxBytes: 1000000, // Set max payload size to 1MB
                output: 'file', // Ensure the file is available as a stream
                parse: true,    // Automatically parse the payload
            }
        }
    });

    await server.start();
})();
