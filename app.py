from flask import Flask, request, jsonify
import pandas as pd
import joblib
import os
from utils.preprocess import preprocess_input

app = Flask(__name__)

def load_model(disease_id):
    model_path = f"model/model_disease_{disease_id}.pkl"
    if not os.path.exists(model_path):
        raise ValueError(f"No model found for diseaseId {disease_id}")
    return joblib.load(model_path)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    disease_id = data.get("diseaseId")

    if not disease_id:
        return jsonify({"error": "diseaseId is required in the request body"}), 400

    try:
        model = load_model(disease_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    df = pd.DataFrame([data])
    X = preprocess_input(df)
    prediction = model.predict(X)
    return jsonify({"predicted_totalConfirmed_14d": int(prediction[0])})

if __name__ == "__main__":
    app.run(debug=True)
