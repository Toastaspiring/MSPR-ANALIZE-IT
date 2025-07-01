import os
import pandas as pd
import numpy as np
import re
import mysql.connector
from datetime import datetime
import time
import logging
import sys
from mysql.connector import Error

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("ETL")

# Nombre maximum de tentatives de connexion à la base de données
MAX_RETRIES = 5
# Délai entre les tentatives (en secondes)
RETRY_DELAY = 10


def to_python_type(value):
    """
    Convertit les types pandas/numpy en types Python natifs.

    Args:
        value: Valeur à convertir

    Returns:
        Valeur convertie en type Python natif
    """
    if pd.isna(value):
        return None
    if isinstance(value, (pd.Timestamp, datetime)):
        return value.date()
    if isinstance(value, (np.generic,)):
        return value.item()
    return value


def connect_to_database(host, port, user, password, database, retries=MAX_RETRIES):
    """
    Établit une connexion à la base de données avec mécanisme de retry.

    Args:
        host: Hôte de la base de données
        port: Port de la base de données
        user: Nom d'utilisateur
        password: Mot de passe
        database: Nom de la base de données
        retries: Nombre de tentatives

    Returns:
        Connexion à la base de données

    Raises:
        Exception: Si la connexion échoue après toutes les tentatives
    """
    for attempt in range(retries):
        try:
            logger.info(f"Tentative de connexion à {database} ({attempt + 1}/{retries})...")
            conn = mysql.connector.connect(
                host=host, port=port,
                user=user, password=password, database=database,
                connect_timeout=30
            )
            logger.info(f"Connexion à {database} établie avec succès")
            return conn
        except Error as e:
            logger.error(f"Erreur de connexion à {database}: {str(e)}")
            if attempt < retries - 1:
                logger.info(f"Nouvelle tentative dans {RETRY_DELAY} secondes...")
                time.sleep(RETRY_DELAY)
            else:
                logger.error(f"Échec de connexion à {database} après {retries} tentatives")
                raise


def rename_country(name):
    """
    Normalise les noms de pays pour assurer la cohérence entre les sources de données.

    Args:
        name: Nom du pays à normaliser

    Returns:
        Nom du pays normalisé
    """
    corrections = {
        'Bosnia and Herzegovina': 'Bosnia And Herzegovina',
        'Vietnam': 'Viet Nam',
        'Czechia': 'Czech Republic',
        'Democratic Republic of Congo': 'Democratic Republic Of The Congo',
        'United Kingdom': 'UK',
        'United States': 'USA'
    }
    return corrections.get(name, name)


def smooth_population(pop_df):
    """
    Interpole les données de population pour obtenir des valeurs quotidiennes.

    Args:
        pop_df: DataFrame contenant les données de population par année

    Returns:
        DataFrame avec les données de population interpolées quotidiennement
    """
    logger.info("Interpolation des données de population...")
    pop_long = pop_df.melt(id_vars="country", var_name="year", value_name="population")
    pop_long["year"] = pop_long["year"].str.extract(r'(\d{4})').astype(int)
    pop_long["population"] = pd.to_numeric(pop_long["population"], errors='coerce')
    pop_long["date"] = pd.to_datetime(pop_long["year"].astype(str) + "-01-01")
    pop_long.drop(columns=["year"], inplace=True)

    max_year = pop_long["date"].dt.year.max()
    full_date_range = pd.date_range(start="2000-01-01", end=f"{max_year}-12-31", freq="D")

    interpolated = []
    for country, group in pop_long.groupby("country"):
        group = group.sort_values("date").set_index("date")
        group = group.reindex(full_date_range)
        group["country"] = country
        group["population"] = group["population"].interpolate(method='linear')
        group = group.reset_index().rename(columns={"index": "date"})
        interpolated.append(group)

    result = pd.concat(interpolated, ignore_index=True)
    logger.info(f"Interpolation terminée: {len(result)} entrées générées")
    return result


def insert_mspr():
    """
    Insère les données transformées dans la base de données principale.
    """
    logger.info("\nInsertion transformée dans la base principale...")

    try:
        # Traitement des localisations
        logger.info("Traitement des localisations...")
        loc_df = pd.read_csv("./files/countries_and_continents.csv")
        loc_df['country'] = loc_df['country'].apply(rename_country)
        loc_df = loc_df.drop_duplicates()

        localization_data = [
            (row['country'], row['continent'])
            for _, row in loc_df.iterrows()
        ]
        cursor_mspr.executemany(
            "INSERT INTO Localization (country, continent) VALUES (%s, %s)",
            localization_data
        )
        mspr_conn.commit()
        logger.info("✅ Localization")

        # Traitement des données de population
        logger.info("Traitement des données de population...")
        pop_df = pd.read_csv("./files/millions_population_country.csv")
        pop_df = pop_df.rename(columns=lambda col: col if col == "country" else f"year_{col}")
        interpolated_pop = smooth_population(pop_df)

        # Traitement des données de vaccination
        logger.info("Traitement des données de vaccination...")
        vacc_df = pd.read_csv("./files/vaccinations.csv")
        vacc_df = vacc_df.rename(columns={'location': 'country'})
        vacc_df['country'] = vacc_df['country'].apply(rename_country)
        vacc_df = vacc_df[['country', 'date', 'people_vaccinated']].dropna()
        vacc_df['date'] = pd.to_datetime(vacc_df['date'], errors='coerce').dt.date

        # Récupération des IDs de localisation
        cursor_mspr.execute("SELECT id, country FROM Localization")
        country_to_id = {row[1]: row[0] for row in cursor_mspr.fetchall()}

        # Insertion des données de localisation
        inserted_count = 0
        skipped_count = 0
        batch_size = 1000
        total_rows = len(vacc_df)

        for i in range(0, total_rows, batch_size):
            batch = vacc_df.iloc[i:min(i + batch_size, total_rows)]
            batch_rows = []
            for _, row in batch.iterrows():
                localizationId = country_to_id.get(row['country'])
                if not localizationId:
                    skipped_count += 1
                    continue

                match = interpolated_pop[
                    (interpolated_pop['country'] == row['country']) &
                    (interpolated_pop['date'] == pd.to_datetime(row['date']))
                ]
                if match.empty:
                    skipped_count += 1
                    continue

                inhabitants = match.iloc[0]['population']
                inhabitants = 0 if pd.isna(inhabitants) else inhabitants
                vaccinationRate = (
                    row['people_vaccinated'] / (inhabitants * 1_000_000)
                ) * 100 if inhabitants else 0

                batch_rows.append(
                    (
                        int(localizationId),
                        to_python_type(inhabitants),
                        to_python_type(vaccinationRate),
                        to_python_type(row['date'])
                    )
                )

            if batch_rows:
                cursor_mspr.executemany(
                    """
                    INSERT INTO LocalizationData (localizationId, inhabitantsNumber, vaccinationRate, date)
                    VALUES (%s, %s, %s, %s)
                    """,
                    batch_rows
                )
                mspr_conn.commit()
                inserted_count += len(batch_rows)

            logger.info(
                f"LocalizationData: {min(i + batch_size, total_rows)}/{total_rows} lignes traitées"
            )

        logger.info(f"✅ LocalizationData - Insérées: {inserted_count}, Ignorées: {skipped_count}")

        # Insertion des maladies
        logger.info("Insertion des maladies...")
        cursor_mspr.execute("INSERT IGNORE INTO Disease (name) VALUES ('Covid-19')")
        cursor_mspr.execute("INSERT IGNORE INTO Disease (name) VALUES ('Monkeypox')")
        mspr_conn.commit()
        logger.info("✅ Disease")

        # Traitement des données Covid
        logger.info("Traitement des données Covid...")
        corona = pd.read_csv("./files/worldometer_coronavirus_daily_data.csv")
        corona['country'] = corona['country'].apply(rename_country)
        corona['date'] = pd.to_datetime(corona['date'], errors='coerce').dt.date
        corona = corona.rename(columns={
            'cumulative_total_cases': 'totalConfirmed',
            'cumulative_total_deaths': 'totalDeath',
            'active_cases': 'totalActive'
        })

        inserted_count = 0
        skipped_count = 0
        total_rows = len(corona)

        for i in range(0, total_rows, batch_size):
            batch = corona.iloc[i:min(i + batch_size, total_rows)]
            batch_rows = []
            for _, row in batch.iterrows():
                localizationId = country_to_id.get(row['country'])
                if not localizationId or pd.isna(row['totalConfirmed']):
                    skipped_count += 1
                    continue

                batch_rows.append(
                    tuple(
                        to_python_type(x)
                        for x in (
                            localizationId,
                            row['totalConfirmed'],
                            row['totalDeath'],
                            row['totalActive'],
                            row['date']
                        )
                    )
                )

            if batch_rows:
                cursor_mspr.executemany(
                    """
                    INSERT INTO ReportCase (localizationId, diseaseId, totalConfirmed, totalDeath, totalActive, date)
                    VALUES (%s, 1, %s, %s, %s, %s)
                    """,
                    batch_rows
                )
                mspr_conn.commit()
                inserted_count += len(batch_rows)

            logger.info(
                f"ReportCase (Covid-19): {min(i + batch_size, total_rows)}/{total_rows} lignes traitées"
            )

        logger.info(f"✅ ReportCase (Covid-19) - Insérées: {inserted_count}, Ignorées: {skipped_count}")

        # Traitement des données Monkeypox
        logger.info("Traitement des données Monkeypox...")
        monkeypox = pd.read_csv("./files/owid_monkeypox_data.csv")

        # Normalize country names
        monkeypox['location'] = monkeypox['location'].apply(rename_country)

        # Rename and convert relevant columns
        monkeypox = monkeypox.rename(columns={
            'location': 'country',
            'total_cases': 'totalConfirmed',
            'total_deaths': 'totalDeath'
        })
        monkeypox['date'] = pd.to_datetime(monkeypox['date'], errors='coerce').dt.date
        monkeypox['totalActive'] = None  # Placeholder; actual active case data not available

        # Insert into ReportCase
        inserted_count = 0
        skipped_count = 0
        total_rows = len(monkeypox)

        for i in range(0, total_rows, batch_size):
            batch = monkeypox.iloc[i:min(i + batch_size, total_rows)]
            batch_rows = []
            for _, row in batch.iterrows():
                localizationId = country_to_id.get(row['country'])
                if not localizationId or pd.isna(row['totalConfirmed']):
                    skipped_count += 1
                    continue

                batch_rows.append(
                    tuple(
                        to_python_type(x)
                        for x in (
                            localizationId,
                            row['totalConfirmed'],
                            row['totalDeath'],
                            row['totalActive'],
                            row['date']
                        )
                    )
                )

            if batch_rows:
                cursor_mspr.executemany(
                    """
                    INSERT INTO ReportCase (localizationId, diseaseId, totalConfirmed, totalDeath, totalActive, date)
                    VALUES (%s, 2, %s, %s, %s, %s)
                    """,
                    batch_rows
                )
                mspr_conn.commit()
                inserted_count += len(batch_rows)

            logger.info(
                f"ReportCase (Monkeypox): {min(i + batch_size, total_rows)}/{total_rows} lignes traitées"
            )

        logger.info(f"✅ ReportCase (Monkeypox) - Insérées: {inserted_count}, Ignorées: {skipped_count}")

    except Exception as e:
        logger.error(f"Erreur lors de l'insertion dans la base principale: {str(e)}")
        raise


if __name__ == "__main__":
    start = time.time()

    try:
        # Tentative de connexion aux bases de données
        logger.info("Connexion aux bases de données...")

        # Utiliser localhost ou host.docker.internal selon l'environnement
        db_host = os.environ.get('DB_HOST', 'host.docker.internal')
        db_port = int(os.environ.get('DB_PORT', 3306))
        db_user = os.environ.get('DB_USER', 'mspr_user')
        db_password = os.environ.get('DB_PASSWORD', 'mspr_user')

        mspr_conn = connect_to_database(
            host=db_host, port=db_port,
            user=db_user, password=db_password,
            database='mspr_database'
        )

        cursor_mspr = mspr_conn.cursor()

        # Exécution du processus ETL
        insert_mspr()

        # Fermeture des connexions
        cursor_mspr.close()
        mspr_conn.close()

        logger.info("🎉 Traitement terminé.")
        logger.info(f"⏱️ Durée totale : {time.time() - start:.2f} secondes")

    except Exception as e:
        logger.error(f"Erreur critique: {str(e)}")
        sys.exit(1)

