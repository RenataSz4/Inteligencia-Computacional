const featureSchema = {
    type: 'object',
    properties: {
        Engine_rpm: { type: 'number' },
        Lub_oil_pressure: { type: 'number' },
        Fuel_pressure: { type: 'number' },
        Coolant_pressure: { type: 'number' },
        lub_oil_temp: { type: 'number' },
        Coolant_temp: { type: 'number' }
    },
    required: ['Engine_rpm', 'Lub_oil_pressure', 'Fuel_pressure', 'Coolant_pressure', 'lub_oil_temp', 'Coolant_temp']
};

const predictionSchema = {
    type: 'object',
    properties: {
        prediction: { type: 'number' },
        probability: { type: 'number' }
    }
};

module.exports = {
    featureSchema,
    predictionSchema
};
