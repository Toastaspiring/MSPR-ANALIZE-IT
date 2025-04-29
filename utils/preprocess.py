import pandas as pd

def preprocess_input(dataframe: pd.DataFrame):
    features = ["inhabitantsNumber", "vaccinationRate", "diseaseId", "localizationId"]
    return dataframe[features]
