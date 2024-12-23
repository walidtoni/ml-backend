const Hapi = require('@hapi/hapi');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { loadModel, predict } = require('./routes');
const {Firestore} = require('@google-cloud/firestore')
const db = new Firestore()

async function createHistory(data) {
    try {
        const predictions = db.collection('predictions');
        await predictions.doc(data.id).set(data);
    } catch (error) {
        console.error('Error while storing data:', error);
    }
}

async function getHistories(data) {
    try {
        const predictions = db.collection('predictions')
        const allData = await predictions.get();
        return allData.docs.map(doc => {
            const data = doc.data()
            return {
                id: data.id,
                history: {
                    id: data.id,
                    result: data.result,
                    suggestion: data.suggestion,
                    createdAt: data.createdAt
                }
            }
        })
    } catch (error) {
        console.error('Error storing data:', error);
        throw error
    }
}

(async () => {
    const model = await loadModel();
    console.log('Model successfully loaded!');

    const server = Hapi.server({
        host: '0.0.0.0',
        port: 8080,
        routes: {
            cors: {
                origin: ['*'], 
                headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'], 
                exposedHeaders: ['WWW-Authenticate', 'Server-Authorization'], 
                additionalExposedHeaders: ['X-Custom-Header'],
                maxAge: 60,
                credentials: true
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/predict',
        handler: async (request, h) => {
            const { image } = request.payload;

            if (!image) {
                return h.response({ error: 'Image is required' }).code(400);
            }

            try {
                const imgSize = fs.statSync(image.path).size;
                if (imgSize > 1000000) { // Check manually
                    return h.response({
                        status: "fail",
                        message: "Payload content length greater than maximum allowed: 1000000"
                    }).code(413);
                }

                const imageData = fs.readFileSync(image.path);

                const result = await predict(model, imageData);

                if (result[0] > 0.5) {
                    const data = {
                        id: uuidv4(),
                        result: "Cancer",
                        suggestion: "Segera periksa ke dokter!",
                        createdAt: new Date().toISOString()
                    }
                    createHistory(data)
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
                    }
                    createHistory(data)
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
                output: 'file', 
                parse: true,
                maxBytes: 100000000
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/predict/histories',
        handler: async (request, h) => {
            try {
                const histories = await getHistories()
                return h.response({
                    status: "success",
                    data: histories
                }).code(200)
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
