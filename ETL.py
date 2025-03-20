import os
import time
import pandas as pd
import mysql.connector
import re

start_time = time.time()

# MySQL Database connection parameters
archive_db_config = {
    'host': 'host.docker.internal',
    'port': '3306',
    'user': 'mspr_user',
    'password': 'mspr_user',
    'database': 'mspr_database_archive',
    'collation': "utf8mb4_general_ci"
}

mspr_db_config = {
    'host': 'host.docker.internal',
    'port': '3306',
    'user': 'mspr_user',
    'password': 'mspr_user',
    'database': 'mspr_database',
    'collation': "utf8mb4_general_ci"
}

# Establish connections
connection_archive = mysql.connector.connect(**archive_db_config)
cursor_archive = connection_archive.cursor()

connection_mspr = mysql.connector.connect(**mspr_db_config)
cursor_mspr = connection_mspr.cursor()


def parse_database_schema(sql_file):
    schema = {}
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()

        tables = re.findall(r'CREATE TABLE\s+[`]?(\w+)[`]?\s*\((.*?)(\)\s*;)', content, re.DOTALL)

        for match in tables:
            if len(match) < 2:
                continue
            table = match[0]
            cols = match[1]
            columns = []

            for col in cols.split("\n"):
                col = col.strip()
                if col.upper().startswith(("PRIMARY KEY", "FOREIGN KEY", "CONSTRAINT", "UNIQUE", "CHECK", "KEY")):
                    continue
                col_match = re.match(r'[`]?(\w+)[`]?\s+', col)
                if col_match:
                    columns.append(col_match.group(1))

            schema[table] = columns
    return schema


db_schema = parse_database_schema("./files/bdd.sql")
print(db_schema)


def rename_country(country_name):
    replacements = {
        'Bosnia and Herzegovina': 'Bosnia And Herzegovina',
        'Vietnam': 'Viet Nam',
        'Czechia': 'Czech Republic',
        'Democratic Republic of Congo': 'Democratic Republic Of The Congo',
        'United Kingdom': 'UK',
        'United States': 'USA'
    }
    return replacements.get(country_name, country_name)


def check_table_exists(cursor, table_name):
    cursor.execute("SHOW TABLES LIKE %s", (table_name,))
    return cursor.fetchone() is not None


def insert_data(cursor, connection, table_name, df):
    if not check_table_exists(cursor, table_name):
        print(f"Warning: Table {table_name} does not exist. Skipping.")
        return

    if table_name not in db_schema:
        print(f"Warning: Table {table_name} not found in schema. Skipping.")
        return

    valid_columns = [col for col in df.columns if col in db_schema[table_name]]
    if not valid_columns:
        print(f"Skipping {table_name}: No valid columns match database schema.")
        return

    df = df[valid_columns]
    columns = ", ".join(valid_columns)
    values = ", ".join(["%s"] * len(valid_columns))

    insert_query = f"INSERT INTO {table_name} ({columns}) VALUES ({values}) ON DUPLICATE KEY UPDATE "
    insert_query += ", ".join([f"{col} = VALUES({col})" for col in valid_columns])

    for _, row in df.iterrows():
        cursor.execute(insert_query, tuple(row))

    connection.commit()
    print(f"Successfully inserted into {table_name}")


def process_file(file_path, table_name):
    if not os.path.exists(file_path):
        print(f"Skipping {file_path}: File does not exist.")
        return

    df = pd.read_csv(file_path).fillna(0)
    if 'country' in df.columns:
        df['country'] = df['country'].apply(rename_country)

    insert_data(cursor_archive, connection_archive, table_name, df)
    insert_data(cursor_mspr, connection_mspr, table_name, df)


def main():
    data_dir = "./files/"
    files = {
        "countries_and_continents.csv": "Localization",
        "millions_population_country.csv": "LocalizationData",
        "owid_monkeypox_data.csv": "ReportCase",
        "vaccinations.csv": "LocalizationData",
        "worldometer_coronavirus_daily_data.csv": "ReportCase"
    }

    for file_name, table_name in files.items():
        file_path = os.path.join(data_dir, file_name)
        process_file(file_path, table_name)

    cursor_archive.close()
    connection_archive.close()

    cursor_mspr.close()
    connection_mspr.close()

    print("Data processing completed.")
    print(f"Execution time: {time.time() - start_time:.6f} seconds")


if __name__ == "__main__":
    main()
