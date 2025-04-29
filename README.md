Compris, sans emoji, direct au but. Voici un **README.md** propre, sérieux et entièrement en français, **sans aucune décoration inutile** :

---

# Flask API - Prédiction de cas de maladies avec IA

Ce projet propose une API Flask permettant de prédire le **nombre total de cas à 14 jours** pour des maladies comme le **Covid** ou **Monkeypox**, à l'aide de modèles **Random Forest** ou **XGBoost**.

Le modèle peut être entraîné soit sur des **données simulées** (mode debug), soit sur les **vraies données** provenant d'une base de données **MySQL**.

---

## Structure du projet

```
flask-api-predictor/
├── app.py                 # API Flask
├── train_model.py         # Script d'entraînement des modèles
├── utils/
│   └── preprocess.py      # Fonctions de pré-traitement des données d'entrée
├── model/
│   ├── model_disease_1.pkl # Modèle entraîné pour Covid (diseaseId=1)
│   └── model_disease_2.pkl # Modèle entraîné pour Monkeypox (diseaseId=2)
├── requirements.txt       # Liste des dépendances Python
└── README.md              # Documentation du projet
```

---

## Installation

1. Cloner le projet :

```bash
git clone <repository-url>
cd flask-api-predictor
```

2. Installer les dépendances nécessaires :

```bash
pip install -r requirements.txt
```

---

## Utilisation

### 1. Entraîner les modèles

Modifier les variables en haut du fichier `train_model.py` :

- `USE_MOCK_DATA = True` pour utiliser des données simulées (mode debug).
- `USE_XGBOOST_MODEL = True` pour entraîner un modèle XGBoost au lieu de Random Forest.

Puis exécuter :

```bash
python train_model.py
```

Cela va entraîner un modèle pour **chaque maladie** (`diseaseId=1` pour Covid, `diseaseId=2` pour Monkeypox) et les sauvegarder dans le dossier `model/`.

---

### 2. Lancer l'API Flask

Une fois les modèles entraînés, démarrer le serveur :

```bash
python app.py
```

L'API sera disponible à l'adresse : `http://localhost:5000/predict`

---

### 3. Utiliser l'API

Envoyer une requête POST à `/predict` avec un JSON contenant :

- `inhabitantsNumber` : nombre d'habitants
- `vaccinationRate` : taux de vaccination (entre 0 et 1)
- `localizationId` : identifiant de localisation
- `day_of_week` : jour de la semaine (0 = lundi, 6 = dimanche)
- `month` : mois de l'année (1 = janvier, 12 = décembre)
- `diseaseId` : 1 pour Covid, 2 pour Monkeypox

Exemple de payload :

```json
{
  "inhabitantsNumber": 120000,
  "vaccinationRate": 0.76,
  "localizationId": 5,
  "day_of_week": 2,
  "month": 5,
  "diseaseId": 1
}
```

L'API chargera automatiquement le modèle correspondant à `diseaseId` et retournera la prédiction du nombre de cas à 14 jours.

---

## Détails techniques

- **Random Forest** ou **XGBoost** peuvent être utilisés selon le paramètre `USE_XGBOOST_MODEL`.
- Les modèles sont **entraînés séparément** pour chaque maladie afin d'améliorer la précision.
- Les **données de debug** sont simulées avec des distributions réalistes (nombre de cas autour de 100, taux de vaccination entre 30% et 95%).

---

## À noter

- Si `xgboost` n'est pas installé et que `USE_XGBOOST_MODEL` est activé, une erreur propre sera renvoyée.
- Tous les modèles doivent être placés dans le dossier `model/` pour que l'API fonctionne correctement.
- Les erreurs de requête (modèle manquant, mauvais payload) sont gérées proprement avec des codes HTTP clairs.