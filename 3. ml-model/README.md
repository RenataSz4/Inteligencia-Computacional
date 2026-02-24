# Predictive Maintenance — Engine Health

This repository contains a small predictive maintenance demo for engine health. A trained model is exported to ONNX and served by a lightweight Node.js API. A static web UI lets you enter vehicle sensor readings and shows the model prediction and confidence.

## Project structure

- `api/` — Node.js API that loads `model/engine_condition.onnx` and exposes `POST /prediction`.
- `model/` — ONNX model (`engine_condition.onnx`) and notebooks used for training (`model.ipynb`).
- `web/` — Static frontend (HTML/CSS/JS) that calls the API and displays results.

## Requirements

- Node.js and npm
- Python 3 (optional, for testing the ONNX model and running notebooks)
- `onnxruntime` (if you want to run ONNX locally in Python)

## Run locally

1. Start the API

```powershell
cd "C:\InteligenciaComputacional\3. ml-model\api"
npm install
node server.js
```

The API listens on port `3002` by default.

2. Serve the frontend (in another terminal)

```powershell
cd "C:\InteligenciaComputacional\3. ml-model\web"
python -m http.server 8080
# or using http-server
npx http-server . -p 8080
```

Open `http://localhost:8080` in your browser.

## API usage

Endpoint: `POST http://localhost:3002/prediction`

Only send the six numeric features in the request body. Example payload:

```json
{
  "Engine_rpm": 2500,
  "Lub_oil_pressure": 3.2,
  "Fuel_pressure": 2.8,
  "Coolant_pressure": 1.5,
  "lub_oil_temp": 85.0,
  "Coolant_temp": 90.0
}
```

Example curl (Windows / CMD):

```cmd
curl -X POST "http://localhost:3002/prediction" -H "Content-Type: application/json" -d "{\"Engine_rpm\":2500,\"Lub_oil_pressure\":3.2,\"Fuel_pressure\":2.8,\"Coolant_pressure\":1.5,\"lub_oil_temp\":85.0,\"Coolant_temp\":90.0}"
```

Typical response (example):

```json
{
  "prediction": 0,
  "probability": 0.9784905910491943
}
```

The API may also return a `probabilities` array with per-class probabilities.

## Test the ONNX model in Python

```python
import onnxruntime as ort
import numpy as np

session = ort.InferenceSession('model/engine_condition.onnx')
inp = {
  'Engine_rpm': np.array([[2500]], dtype=np.float32),
  'Lub_oil_pressure': np.array([[3.2]], dtype=np.float32),
  'Fuel_pressure': np.array([[2.8]], dtype=np.float32),
  'Coolant_pressure': np.array([[1.5]], dtype=np.float32),
  'lub_oil_temp': np.array([[85.0]], dtype=np.float32),
  'Coolant_temp': np.array([[90.0]], dtype=np.float32)
}
out = session.run(None, inp)
print(out)
```

## Validation

- The frontend performs basic client-side validation: required fields and sensible numeric ranges.
- The API validates input shape using the JSON schema in `api/schemas.js`.

## Notes and next steps

- If the model returns the same class for most inputs, inspect `model/model.ipynb` for class balance and evaluation metrics (use `classification_report` and `confusion_matrix`). Consider retraining with `class_weight='balanced'` or resampling the training data.
- You can customize the UI text and behavior in `web/index.html` and `web/app.js`.

---

If you want, I can also add a `package.json` with `start` scripts and a `requirements.txt` for the Python dependencies. Would you like that?
