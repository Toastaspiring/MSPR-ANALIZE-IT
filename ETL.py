import os
import pandas as pd
import numpy as np
import re
import mysql.connector
from datetime import datetime

def to_python_type(value):
    if pd.isna(value):
        return None
    if isinstance(value, (pd.Timestamp, datetime)):
        return value.date()
    if isinstance(value, (np.generic,)):
        return value.item()
    return value

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

def smooth_population(pop_df):
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

    return pd.concat(interpolated, ignore_index=True)

def insert_archive():
    print("\nInsertion brute dans la base archive...")

    def load_and_insert(file, table):
        df = pd.read_csv(file, dtype=str)
        df = df.applymap(lambda x: 0 if isinstance(x, str) and x.strip().lower() in ['no data', 'n/a'] else x)
        df.fillna(0, inplace=True)
        df.replace(to_replace=r"(?i)^\s*(no[\s_-]?data|n/?a)\s*$", value=0, regex=True, inplace=True)
        df.fillna(0, inplace=True)

        if table == "millions_population_country":
            def is_integer_str(val):
                try:
                    return float(val).is_integer()
                except:
                    return False
            df.columns = [f"year_{int(float(col))}" if is_integer_str(col) else col for col in df.columns]

        columns = ", ".join(df.columns)
        values = ", ".join(["%s"] * len(df.columns))
        insert_query = f"INSERT INTO {table} ({columns}) VALUES ({values})"

        for _, row in df.iterrows():
            cursor_archive.execute(insert_query, tuple(map(to_python_type, row)))
        archive_conn.commit()
        print(f"✅ {table}")

    load_and_insert("./files/countries_and_continents.csv", "countries_and_continents")
    load_and_insert("./files/millions_population_country.csv", "millions_population_country")
    load_and_insert("./files/owid_monkeypox_data.csv", "owid_monkeypox_data")
    load_and_insert("./files/vaccinations.csv", "vaccinations")
    load_and_insert("./files/worldometer_coronavirus_daily_data.csv", "worldometer_coronavirus_daily_data")

def insert_mspr():
    print("\nInsertion transformée dans la base principale...")

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

    pop_df = pd.read_csv("./files/millions_population_country.csv")
    pop_df = pop_df.rename(columns=lambda col: col if col == "country" else f"year_{col}")
    interpolated_pop = smooth_population(pop_df)

    vacc_df = pd.read_csv("./files/vaccinations.csv")
    vacc_df = vacc_df.rename(columns={'location': 'country'})
    vacc_df['country'] = vacc_df['country'].apply(rename_country)
    vacc_df = vacc_df[['country', 'date', 'people_vaccinated']].dropna()
    vacc_df['date'] = pd.to_datetime(vacc_df['date'], errors='coerce').dt.date

    cursor_mspr.execute("SELECT id, country FROM Localization")
    country_to_id = {row[1]: row[0] for row in cursor_mspr.fetchall()}

    for _, row in vacc_df.iterrows():
        localizationId = country_to_id.get(row['country'])
        if not localizationId:
            continue

        match = interpolated_pop[
            (interpolated_pop['country'] == row['country']) &
            (interpolated_pop['date'] == pd.to_datetime(row['date']))
        ]
        if match.empty:
            continue

        inhabitants = match.iloc[0]['population']
        inhabitants = 0 if pd.isna(inhabitants) else inhabitants
        vaccinationRate = (row['people_vaccinated'] / (inhabitants * 1_000_000)) * 100 if inhabitants else 0

        cursor_mspr.execute(
            """
            INSERT INTO LocalizationData (localizationId, inhabitantsNumber, vaccinationRate, date)
            VALUES (%s, %s, %s, %s)
            """,
            (
                int(localizationId),
                to_python_type(inhabitants),
                to_python_type(vaccinationRate),
                to_python_type(row['date'])
            )
        )
    mspr_conn.commit()
    print("✅ LocalizationData")

    cursor_mspr.execute("INSERT IGNORE INTO Disease (name) VALUES ('Covid-19')")
    cursor_mspr.execute("INSERT IGNORE INTO Disease (name) VALUES ('Monkeypox')")
    mspr_conn.commit()
    print("✅ Disease")

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
        if not localizationId:
            continue
        totalConfirmed = 0 if pd.isna(row['totalConfirmed']) else row['totalConfirmed']
        totalDeath = 0 if pd.isna(row['totalDeath']) else row['totalDeath']
        totalActive = 0 if pd.isna(row['totalActive']) else row['totalActive']
        cursor_mspr.execute(
            """
            INSERT INTO ReportCase (localizationId, diseaseId, totalConfirmed, totalDeath, totalActive, date)
            VALUES (%s, 1, %s, %s, %s, %s)
            """,
            tuple(to_python_type(x) for x in (
                localizationId, totalConfirmed, totalDeath, totalActive, row['date']
            ))
        )
    mspr_conn.commit()
    print("✅ ReportCase (Covid-19)")

    monkeypox = pd.read_csv("./files/owid_monkeypox_data.csv")
    monkeypox['location'] = monkeypox['location'].apply(rename_country)
    monkeypox['date'] = pd.to_datetime(monkeypox['date'], errors='coerce').dt.date
    monkeypox = monkeypox.rename(columns={
        'location': 'country',
        'total_cases': 'totalConfirmed',
        'total_deaths': 'totalDeath',
        'new_cases': 'totalActive'
    })

    for _, row in monkeypox.iterrows():
        localizationId = country_to_id.get(row['country'])
        if not localizationId:
            continue
        totalConfirmed = 0 if pd.isna(row['totalConfirmed']) else row['totalConfirmed']
        totalDeath = 0 if pd.isna(row['totalDeath']) else row['totalDeath']
        totalActive = 0 if pd.isna(row['totalActive']) else row['totalActive']
        cursor_mspr.execute(
            """
            INSERT INTO ReportCase (localizationId, diseaseId, totalConfirmed, totalDeath, totalActive, date)
            VALUES (%s, 2, %s, %s, %s, %s)
            """,
            tuple(to_python_type(x) for x in (
                localizationId, totalConfirmed, totalDeath, totalActive, row['date']
            ))
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