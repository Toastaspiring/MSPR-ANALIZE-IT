import os
import time
import pandas as pd
import mysql.connector

start_time = time.time()

# Load datasets and replace NaN with 0
coronavirus_data = pd.read_csv('files/worldometer_coronavirus_daily_data.csv').fillna(0)
countries_continents = pd.read_csv('files/countries_and_continents.csv').fillna(0)
monkeypox_data = pd.read_csv('files/owid-monkeypox-data.csv').fillna(0)
monkeypox_data = monkeypox_data[~monkeypox_data['iso_code'].str.contains("OWID", na=False)]

# Adjustment function for country names
def rename_country(country_name):
    if 'Bosnia and Herzegovina' in country_name:  return 'Bosnia And Herzegovina'
    elif 'Vietnam' in country_name: return 'Viet Nam'
    elif 'Czechia' in country_name: return 'Czech Republic'
    elif 'Democratic Republic of Congo' in country_name: return 'Democratic Republic Of The Congo'
    elif 'United Kingdom' in country_name: return 'UK'
    elif 'United States' in country_name: return 'USA'
    else:
        return country_name  # Otherwise, keep the original value

monkeypox_data['location'] = monkeypox_data['location'].apply(rename_country)

# Replace NaN in monkeypox_data after renaming
monkeypox_data = monkeypox_data.fillna(0)

# Create Disease Table
diseases = pd.DataFrame({'id': [1, 2], 'name': ['Coronavirus', 'Monkeypox']}).fillna(0)

# Create Localization Table
countries_continents['id'] = range(1, len(countries_continents) + 1)
localization = countries_continents.rename(columns={'country': 'country', 'continent': 'continent'}).fillna(0)

# Merge Coronavirus Data with Localization
coronavirus_data = coronavirus_data.merge(countries_continents, how='left', left_on='country', right_on='country').fillna(0)

# Prepare ReportCase Data for Coronavirus
coronavirus_data['diseaseId'] = 1  # Coronavirus ID
coronavirus_report_cases = coronavirus_data.rename(columns={
    'cumulative_total_cases': 'totalconfirmed',
    'cumulative_total_deaths': 'totalDeath',
    'active_cases': 'totalActive',
    'date': 'date',
    'id': 'localizationId'
})[['totalconfirmed', 'totalDeath', 'totalActive', 'localizationId', 'date', 'diseaseId']].fillna(0)

# Prepare ReportCase Data for Monkeypox
monkeypox_data = monkeypox_data.rename(columns={
    'total_cases': 'totalconfirmed',
    'total_deaths': 'totalDeath',
    'location': 'country',
    'date': 'date'
}).fillna(0)
monkeypox_data = monkeypox_data.merge(countries_continents, how='left', on='country').fillna(0)
monkeypox_data['diseaseId'] = 2  # Monkeypox ID
monkeypox_report_cases = monkeypox_data.rename(columns={
    'id': 'localizationId'
})[['totalconfirmed', 'totalDeath', 'localizationId', 'date', 'diseaseId']].fillna(0)

# Combine ReportCase Data
report_cases = pd.concat([coronavirus_report_cases, monkeypox_report_cases], ignore_index=True).fillna(0)

# MySQL Database connection parameters
db_config = {
    'host': 'host.docker.internal',  # Your MySQL host
    'port': '3306',  # Your MySQL port
    'user': 'mspr_user',  # Your MySQL username
    'password': 'mspr_user',  # Your MySQL password
    'database': 'mspr_database',  # Your MySQL database name
    'collation': "utf8mb4_general_ci"
}

# Establish connection
connection = mysql.connector.connect(**db_config)
cursor = connection.cursor()

# Insert into Disease Table
for index, row in diseases.iterrows():
    cursor.execute("INSERT INTO Disease (id, name) VALUES (%s, %s)", (row['id'], row['name']))

# Insert into Localization Table
for index, row in localization.iterrows():
    cursor.execute("INSERT INTO Localization (id, country, continent) VALUES (%s, %s, %s)",
                   (row['id'], row['country'], row['continent']))

# Insert into ReportCase Table
for index, row in report_cases.iterrows():
    os.system('clear')
    print("nb ligne traité : " + str(index))
    cursor.execute("""
        INSERT INTO ReportCase (totalconfirmed, totalDeath, totalActive, localizationId, date, diseaseId) 
        VALUES (%s, %s, %s, %s, %s, %s)""",
        (row['totalconfirmed'], row['totalDeath'], row['totalActive'], row['localizationId'], row['date'], row['diseaseId']))

# Commit changes
connection.commit()

# Close connection
cursor.close()
connection.close()
end_time = time.time()
print("Data has been successfully inserted into the MySQL database.")
print(f"Temps d'exécution : {end_time - start_time:.6f} secondes")
