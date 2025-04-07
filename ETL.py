import os
import pandas as pd
import mysql.connector
from datetime import datetime

# Configs de connexion
archive_conn = mysql.connector.connect(
    host='host.docker.internal', port=3306,
    user='mspr_user', password='mspr_user', database='mspr_database_archive')
mspr_conn = mysql.connector.connect(
    host='host.docker.internal', port=3306,
    user='mspr_user', password='mspr_user', database='mspr_database')

cursor_archive = archive_conn.cursor()
cursor_mspr = mspr_conn.cursor()

def rename_country(name):
    corrections = {
        'Bosnia and Herzegovina': 'Bosnia And Herzegovina',
        'Vietnam': 'Viet Nam',
        'Czechia': 'Czech Republic',
        'Democratic Republic of Congo': 'Democratic Republic Of The Congo',
        'United Kingdom': 'UK',
        'United States': 'USA'
    }
    return corrections.get(name, name)

### PARTIE ARCHIVE ###
def insert_archive():
    print("\nInsertion brute dans la base archive...")

    def load_and_insert(file, table):
        df = pd.read_csv(file).fillna(0)
        columns = ", ".join(df.columns)
        values = ", ".join(["%s"] * len(df.columns))
        insert_query = f"INSERT INTO {table} ({columns}) VALUES ({values})"

        for _, row in df.iterrows():
            cursor_archive.execute(insert_query, tuple(row))
        archive_conn.commit()
        print(f"✅ {table}")

    load_and_insert("./files/countries_and_continents.csv", "countries_and_continents")
    load_and_insert("./files/millions_population_country.csv", "millions_population_country")
    load_and_insert("./files/owid_monkeypox_data.csv", "owid_monkeypox_data")
    load_and_insert("./files/vaccinations.csv", "vaccinations")
    load_and_insert("./files/worldometer_coronavirus_daily_data.csv", "worldometer_coronavirus_daily_data")

### PARTIE MSPR ###
def insert_mspr():
    print("\nInsertion transformée dans la base principale...")

    ### 1. Localization
    loc_df = pd.read_csv("./files/countries_and_continents.csv")
    loc_df['country'] = loc_df['country'].apply(rename_country)
    loc_df = loc_df.drop_duplicates()

    for _, row in loc_df.iterrows():
        cursor_mspr.execute(
            "INSERT INTO Localization (country, continent) VALUES (%s, %s)",
            (row['country'], row['continent'])
        )
    mspr_conn.commit()
    print("✅ Localization")

    ### 2. LocalizationData
    pop_df = pd.read_csv("./files/millions_population_country.csv")
    vacc_df = pd.read_csv("./files/vaccinations.csv")
    vacc_df = vacc_df.rename(columns={'location': 'country'})
    vacc_df['country'] = vacc_df['country'].apply(rename_country)

    vacc_df = vacc_df[['country', 'date', 'people_vaccinated']].dropna()
    pop_df = pop_df[['country', '2022']].rename(columns={'2022': 'inhabitantsNumber'})

    merged = vacc_df.merge(pop_df, on='country', how='left')
    merged['vaccinationRate'] = (merged['people_vaccinated'] / (merged['inhabitantsNumber'] * 1_000_000)) * 100
    merged['date'] = pd.to_datetime(merged['date'], errors='coerce').dt.date

    cursor_mspr.execute("SELECT id, country FROM Localization")
    country_to_id = {row[1]: row[0] for row in cursor_mspr.fetchall()}
    merged['localizationId'] = merged['country'].map(country_to_id)

    for _, row in merged.iterrows():
        if pd.isna(row['localizationId']):
            continue
        cursor_mspr.execute(
            """
            INSERT INTO LocalizationData (localizationId, inhabitantsNumber, vaccinationRate, date)
            VALUES (%s, %s, %s, %s)
            """,
            (int(row['localizationId']), row['inhabitantsNumber'], row['vaccinationRate'], row['date'])
        )
    mspr_conn.commit()
    print("✅ LocalizationData")

    ### 3. Disease
    cursor_mspr.execute("INSERT IGNORE INTO Disease (name) VALUES ('Covid-19')")
    cursor_mspr.execute("INSERT IGNORE INTO Disease (name) VALUES ('Monkeypox')")
    mspr_conn.commit()
    print("✅ Disease")

    ### 4. ReportCase - COVID
    corona = pd.read_csv("./files/worldometer_coronavirus_daily_data.csv")
    corona['country'] = corona['country'].apply(rename_country)
    corona['date'] = pd.to_datetime(corona['date'], errors='coerce').dt.date

    corona = corona.rename(columns={
        'cumulative_total_cases': 'totalConfirmed',
        'cumulative_total_deaths': 'totalDeath',
        'active_cases': 'totalActive'
    })

    for _, row in corona.iterrows():
        localizationId = country_to_id.get(row['country'])
        if not localizationId or pd.isna(row['totalConfirmed']):
            continue
        cursor_mspr.execute(
            """
            INSERT INTO ReportCase (localizationId, diseaseId, totalConfirmed, totalDeath, totalActive, date)
            VALUES (%s, 1, %s, %s, %s, %s)
            """,
            (localizationId, row['totalConfirmed'], row['totalDeath'], row['totalActive'], row['date'])
        )
    mspr_conn.commit()
    print("✅ ReportCase (Covid-19)")

    ### 5. ReportCase - Monkeypox
    monkeypox = pd.read_csv("./files/owid_monkeypox_data.csv")
    monkeypox['location'] = monkeypox['location'].apply(rename_country)
    monkeypox['date'] = pd.to_datetime(monkeypox['date'], errors='coerce').dt.date

    monkeypox = monkeypox.rename(columns={
        'location': 'country',
        'total_cases': 'totalConfirmed',
        'total_deaths': 'totalDeath',
        'new_cases': 'totalActive'  # Approximation faute de mieux
    })

    for _, row in monkeypox.iterrows():
        localizationId = country_to_id.get(row['country'])
        if not localizationId or pd.isna(row['totalConfirmed']):
            continue
        cursor_mspr.execute(
            """
            INSERT INTO ReportCase (localizationId, diseaseId, totalConfirmed, totalDeath, totalActive, date)
            VALUES (%s, 2, %s, %s, %s, %s)
            """,
            (localizationId, row['totalConfirmed'], row['totalDeath'], row['totalActive'], row['date'])
        )
    mspr_conn.commit()
    print("✅ ReportCase (Monkeypox)")

if __name__ == "__main__":
    insert_archive()
    insert_mspr()

    cursor_archive.close()
    archive_conn.close()
    cursor_mspr.close()
    mspr_conn.close()
    print("\n🎉 Traitement terminé.")
