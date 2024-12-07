import pandas as pd
import mysql.connector

# Load datasets
coronavirus_data = pd.read_csv('files/worldometer_coronavirus_daily_data.csv')
countries_continents = pd.read_csv('files/countries_and_continents.csv')
monkeypox_data = pd.read_csv('files/owid-monkeypox-data.csv')

# Create Disease Table
diseases = pd.DataFrame({'id': [1, 2], 'name': ['Coronavirus', 'Monkeypox']})

# Create Localization Table
countries_continents['id'] = range(1, len(countries_continents) + 1)
localization = countries_continents.rename(columns={'country': 'country', 'continent': 'continent'})

# Merge Coronavirus Data with Localization
coronavirus_data = coronavirus_data.merge(countries_continents, how='left', left_on='country', right_on='country')

# Prepare ReportCase Data for Coronavirus
coronavirus_data['diseaseId'] = 1  # Coronavirus ID
coronavirus_report_cases = coronavirus_data.rename(columns={
    'cumulative_total_cases': 'totalconfirmed',
    'cumulative_total_deaths': 'totalDeath',
    'active_cases': 'totalActive',
    'date': 'date',
    'id': 'localizationId'
})[['totalconfirmed', 'totalDeath', 'totalActive', 'localizationId', 'date', 'diseaseId']]

# Prepare ReportCase Data for Monkeypox
monkeypox_data = monkeypox_data.rename(columns={
    'total_cases': 'totalconfirmed',
    'total_deaths': 'totalDeath',
    'location': 'country',
    'date': 'date'
})
monkeypox_data = monkeypox_data.merge(countries_continents, how='left', on='country')
monkeypox_data['diseaseId'] = 2  # Monkeypox ID
monkeypox_report_cases = monkeypox_data.rename(columns={
    'id': 'localizationId'
})[['totalconfirmed', 'totalDeath', 'localizationId', 'date', 'diseaseId']]

# Combine ReportCase Data
report_cases = pd.concat([coronavirus_report_cases, monkeypox_report_cases], ignore_index=True)

# MySQL Database connection parameters
db_config = {
    'host': 'localhost',  # Your MySQL host
    'user': 'mspr_user',  # Your MySQL username
    'password': 'mspr_user',  # Your MySQL password
    'database': 'mspr_database'  # Your MySQL database name
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
    cursor.execute("""
        INSERT INTO ReportCase (totalconfirmed, totalDeath, totalActive, localizationId, date, diseaseId) 
        VALUES (%s, %s, %s, %s, %s, %s)""",
        (row['totalconfirmed'], row['totalDeath'], row['totalActive'], row['localizationId'], row['date'], row['diseaseId']))

# Commit changes
connection.commit()

# Close connection
cursor.close()
connection.close()

print("Data has been successfully inserted into the MySQL database.")
