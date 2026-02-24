import * as ort from 'onnxruntime-node';

async function run() {
    const session = await ort.InferenceSession.create("iris_model.onnx");

    const input = new ort.Tensor(
        "float32",
        Float32Array.from([5.1, 3.5, 1.4, 0.2]),
        [1, 4]
    );

    const feeds = {
        [session.inputNames[0]]: input
    };

    const results = await session.run(feeds);

    console.log(results[session.outputNames[0]].data);
}

run();

