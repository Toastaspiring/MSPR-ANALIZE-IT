from flask import Flask, request, jsonify
import pandas as pd
import joblib
import os
from utils.preprocess import preprocess_input

app = Flask(__name__)


def load_model(disease_id):
    model_path = f"model/model_disease_{disease_id}.pkl"
    if not os.path.exists(model_path):
        raise ValueError(f"Pas de modèle pour diseaseId {disease_id}")
    return joblib.load(model_path)


def increment_day(day_of_week):
    return (day_of_week + 1) % 7


def increment_month(day_of_week, month):
    # Ici tu pourrais ajouter une vraie logique de changement de mois
    return month  # On reste simple pour l'instant

@app.route("/", methods=["GET"])
def index():
    return """
    <html>
<head><title>Documentation API - Prédiction Maladies</title></head>
<body>
    <h2>Prédire les 14 prochains jours (Forecasting récursif)</h2>
    <p><strong>POST</strong> /predict14days</p>
    <p>Utilise les mêmes paramètres en entrée que /predict.</p>
    <p>Réponse :</p>
    <pre>
[
  {"day": 1, "predicted_totalConfirmed": 100},
  {"day": 2, "predicted_totalConfirmed": 103},
  ...
  {"day": 14, "predicted_totalConfirmed": 140}
]
    </pre>

    <h2>Modèle utilisé</h2>
    <ul>
        <li>Modèles de type <strong>Random Forest</strong> ou <strong>XGBoost</strong>, selon configuration côté serveur.</li>
        <li>Un modèle est entraîné séparément pour chaque maladie (<code>diseaseId</code>), à partir des données historiques.</li>
        <li>Les modèles prédisent récursivement les 14 prochains jours, en prenant en compte :</li>
        <ul>
            <li><code>inhabitantsNumber</code> : population locale</li>
            <li><code>vaccinationRate</code> : taux de vaccination entre 0 et 1</li>
            <li><code>localizationId</code> : identifiant géographique</li>
            <li><code>day_of_week</code> : jour de la semaine (0 = lundi)</li>
            <li><code>month</code> : mois (1 à 12)</li>
        </ul>
    </ul>

    <h2>Notes</h2>
    <ul>
        <li>Les paramètres <code>day_of_week</code> et <code>month</code> doivent être cohérents avec la date d'entrée.</li>
        <li><code>diseaseId = 1</code> pour Covid, <code>diseaseId = 2</code> pour Monkeypox.</li>
        <li>Si <code>diseaseId</code> est manquant ou incorrect, une erreur est renvoyée.</li>
    </ul>
</body>
</html>
    """


@app.route("/predict14days", methods=["POST"])
def predict_14_days():
    data = request.get_json()
    disease_id = data.get("diseaseId")

    if not disease_id:
        return jsonify({"error": "diseaseId est requis"}), 400

    try:
        model = load_model(disease_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

    results = []
    current_data = pd.DataFrame([data])

    for day in range(1, 15):
        X = preprocess_input(current_data)
        prediction = model.predict(X)[0]

        # Stocker la prédiction
        results.append({
            "day": day,
            "predicted_totalConfirmed": int(prediction)
        })

        # Mettre à jour les données pour la prochaine itération
        current_data["day_of_week"] = increment_day(current_data["day_of_week"].values[0])
        current_data["month"] = increment_month(current_data["day_of_week"].values[0], current_data["month"].values[0])
        current_data[
            "totalConfirmed"] = prediction  # si tu veux utiliser la prédiction comme nouvelle valeur connue (optionnel selon ce que tu veux)

    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True)
