const express = require('express');
const bodyParser = require('body-parser');
const { featureSchema } = require('./schemas');
const Ajv = require('ajv');
const ort = require('onnxruntime-node');
const path = require('path');

const ajv = new Ajv();
const validate = ajv.compile(featureSchema);

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

const modelPath = path.join(__dirname, '../model/engine_condition.onnx');
let session;

ort.InferenceSession.create(modelPath).then(s => {
    session = s;
});

async function predict(features) {
    const input = {
        Engine_rpm: new ort.Tensor('float32', [features.Engine_rpm], [1, 1]),
        Lub_oil_pressure: new ort.Tensor('float32', [features.Lub_oil_pressure], [1, 1]),
        Fuel_pressure: new ort.Tensor('float32', [features.Fuel_pressure], [1, 1]),
        Coolant_pressure: new ort.Tensor('float32', [features.Coolant_pressure], [1, 1]),
        lub_oil_temp: new ort.Tensor('float32', [features.lub_oil_temp], [1, 1]),
        Coolant_temp: new ort.Tensor('float32', [features.Coolant_temp], [1, 1])
    };
    const results = await session.run(input);
    if (
        results.label && results.label.data &&
        results.probabilities && results.probabilities.data
    ) {
        return {
            prediction: Number(results.label.data[0]),
            probability: results.probabilities.data[0]
        };
    }
    throw new Error('No tensor output found');
}

app.post('/prediction', async (req, res) => {
    const valid = validate(req.body);
    if (!valid) {
        return res.status(400).json({ error: 'Invalid input', details: validate.errors });
    }
    if (!session) {
        return res.status(503).json({ error: 'Model not loaded yet' });
    }
    try {
        const result = await predict(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Prediction error', details: err.message });
    }
});

module.exports = app;