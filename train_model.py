import pandas as pd
import numpy as np
import mysql.connector
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from sklearn.ensemble import RandomForestRegressor

try:
    import xgboost as xgb
except ImportError:
    xgb = None

USE_MOCK_DATA = True
USE_XGBOOST_MODEL = True

if USE_MOCK_DATA:
    n_samples = 1000
    np.random.seed(42)

    df = pd.DataFrame({
        "date": pd.date_range(start="2024-01-01", periods=n_samples, freq="D"),
        "totalConfirmed": np.random.poisson(lam=100, size=n_samples),
        "inhabitantsNumber": np.random.randint(50000, 500000, size=n_samples),
        "vaccinationRate": np.round(np.random.uniform(0.3, 0.95, size=n_samples), 2),
        "diseaseId": np.random.choice([1, 2], size=n_samples),
        "localizationId": np.random.randint(1, 10, size=n_samples),
    })

    df["totalConfirmed_14d_future"] = df["totalConfirmed"].shift(-14)
    df.dropna(inplace=True)

else:
    conn = mysql.connector.connect(
        host='host.docker.internal',
        port=3306,
        user='mspr_user',
        password='mspr_user',
        database='mspr_database'
    )

    query = """
    SELECT 
        r.date,
        r.totalConfirmed,
        l.inhabitantsNumber,
        l.vaccinationRate,
        r.diseaseId,
        r.localizationId
    FROM 
        ReportCase r
    JOIN 
        LocalizationData l ON r.localizationId = l.id
    """

    df = pd.read_sql(query, con=conn)
    conn.close()

    df["totalConfirmed_14d_future"] = df["totalConfirmed"].shift(-14)
    df.dropna(inplace=True)

# Feature Engineering
df["day_of_week"] = df["date"].dt.dayofweek
df["month"] = df["date"].dt.month

features = ["inhabitantsNumber", "vaccinationRate", "localizationId", "day_of_week", "month"]

# Train a model for each disease
for disease_id in df["diseaseId"].unique():
    print(f"Training model for diseaseId = {disease_id}")

    df_disease = df[df["diseaseId"] == disease_id]

    X = df_disease[features]
    y = df_disease["totalConfirmed_14d_future"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    if USE_XGBOOST_MODEL:
        if xgb is None:
            raise ImportError("XGBoost not installed.")
        model = xgb.XGBRegressor(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1
        )
    else:
        model = RandomForestRegressor(
            n_estimators=300,
            max_depth=15,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"Disease {disease_id}: MAE = {mae}")

    # Save each model separately
    joblib.dump(model, f"model/model_disease_{disease_id}.pkl")
