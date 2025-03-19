# Prédiction avec Forêts de Décision

## 1. Introduction

Les forêts de décision (Random Forest) sont une méthode d'apprentissage automatique qui combine plusieurs arbres de décision pour améliorer la précision des prédictions. Ce document explique comment utiliser un modèle de **forêt de décision** pour prédire le nombre de cas actifs d'une maladie en fonction des données disponibles dans la base de données `mspr_database`.

### Principe mathématique des forêts de décision

Les forêts de décision sont une extension des **arbres de décision** classiques. Un arbre de décision fonctionne en divisant un espace de décision en plusieurs sous-espaces en fonction des valeurs des variables explicatives. Chaque division (appelée **split**) est choisie de manière à maximiser la séparation entre les classes (dans un problème de classification) ou à minimiser l'erreur (dans un problème de régression). Cette séparation est souvent mesurée à l'aide de l'**indice de Gini** ou de l'**entropie** pour la classification, et de la **somme des erreurs quadratiques** pour la régression.

Les forêts de décision améliorent cette approche en combinant plusieurs arbres de décision indépendants, chacun étant construit sur un échantillon aléatoire des données et utilisant une sélection aléatoire de variables. La prédiction finale est obtenue en **moyennant les prédictions des différents arbres** dans le cas d'une régression, ou par un vote majoritaire dans le cas d'une classification.

La formule générale de prédiction dans une forêt de décision pour la régression est donnée par :

$$ \hat{y} = \frac{1}{N} \sum_{i=1}^{N} h_i(x) $$

où :
-   ŷ est la valeur prédite,
-   N est le nombre total d'arbres dans la forêt,
-   hᵢ(x) est la prédiction de l'arbre i pour une entrée x.

## 2. Étapes du processus

### a) Connexion à la base de données

Nous nous connectons à MySQL pour extraire les données nécessaires. Le script utilise la bibliothèque `mysql.connector` pour établir une connexion avec les informations d'authentification fournies.

```python
import mysql.connector
import pandas as pd

db_config = {
    'host': 'host.docker.internal',
    'port': '3306',
    'user': 'mspr_user',
    'password': 'mspr_user',
    'database': 'mspr_database',
    'collation': "utf8mb4_general_ci"
}

connexion = mysql.connector.connect(**db_config)
cursor = connexion.cursor()
```

### b) Extraction des données

Nous récupérons les informations suivantes de la table `ReportCase` :

```python
requete = """
SELECT totalconfirmed, totalDeath, totalActive, localizationId, diseaseId 
FROM ReportCase;
"""

df = pd.read_sql(requete, connexion)
cursor.close()
connexion.close()
```

### c) Préparation des données

- **Remplacement des valeurs nulles** : Toutes les valeurs manquantes sont remplacées par `0` pour éviter les erreurs.
- **Encodage des variables catégoriques** : Les colonnes `localizationId` et `diseaseId` sont converties en valeurs numériques grâce à `LabelEncoder`.

```python
from sklearn.preprocessing import LabelEncoder

df = df.fillna(0)
encodeur = LabelEncoder()
df['localizationId'] = encodeur.fit_transform(df['localizationId'])
df['diseaseId'] = encodeur.fit_transform(df['diseaseId'])
```

### d) Séparation des données

Nous divisons notre jeu de données en :
- **Données d'entraînement** (80%) : Utilisées pour entraîner le modèle.
- **Données de test** (20%) : Utilisées pour évaluer les performances du modèle.

```python
from sklearn.model_selection import train_test_split

X = df[['totalconfirmed', 'totalDeath', 'localizationId', 'diseaseId']]
y = df['totalActive']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
```

### e) Entraînement du modèle

Nous utilisons `RandomForestRegressor` de `sklearn.ensemble` pour entraîner un modèle avec **100 arbres de décision**.

```python
from sklearn.ensemble import RandomForestRegressor

modele = RandomForestRegressor(n_estimators=100, random_state=42)
modele.fit(X_train, y_train)
```

### f) Évaluation du modèle

Nous utilisons l'**erreur absolue moyenne (MAE)** pour mesurer la précision du modèle.

```python
from sklearn.metrics import mean_absolute_error

y_pred = modele.predict(X_test)
erreur_mae = mean_absolute_error(y_test, y_pred)
print(f"Erreur absolue moyenne : {erreur_mae:.2f}")
```

### g) Prédiction sur de nouvelles données

Une fois le modèle entraîné, nous l'utilisons pour prédire le nombre de cas actifs sur des données nouvelles.

```python
nouvelles_donnees = pd.DataFrame({
    'totalconfirmed': [10000],
    'totalDeath': [500],
    'localizationId': [encodeur.transform(['France'])[0]],
    'diseaseId': [encodeur.transform(['Coronavirus'])[0]]
})

prediction = modele.predict(nouvelles_donnees)
print(f"Prédiction du nombre de cas actifs : {int(prediction[0])}")
```

Citations:
[1] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/57872049/39191479-514f-48ad-b532-2fdacad9fbc5/countries_and_continents.csv
[2] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/57872049/085ae9ab-59a8-48b6-9f42-303d65c22b31/millions_population_country.csv
[3] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/57872049/577673be-bf47-476a-9616-cc0fefe7449f/owid-monkeypox-data.csv
[4] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/57872049/7a651de6-e744-4599-ad97-4b4083b2bfd0/worldometer_coronavirus_daily_data.csv
[5] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/57872049/4a06a83a-0809-46c4-a1aa-023eb5a77c58/vaccinations.csv
[6] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/57872049/e4cec91b-8879-4e68-ac7f-c03b368f0e91/bdd.sql

---
Answer from Perplexity: pplx.ai/share
