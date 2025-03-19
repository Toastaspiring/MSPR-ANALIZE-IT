import os
import time
import pandas as pd
import mysql.connector
import re

start_time = time.time()

# MySQL Database connection parameters
db_config = {
    'host': 'host.docker.internal',
    'port': '3306',
    'user': 'mspr_user',
    'password': 'mspr_user',
    'database': 'mspr_database_archive',
    'collation': "utf8mb4_general_ci"
}

# Establish connection
connection_archive = mysql.connector.connect(**db_config)
cursor_archive = connection_archive.cursor()


def parse_database_schema(sql_file):
    schema = {}
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()

        # Match CREATE TABLE statements more flexibly
        tables = re.findall(r'CREATE TABLE\s+[`]?(\w+)[`]?\s*\((.*?)(\)\s*;)', content, re.DOTALL)

        for match in tables:
            if len(match) < 2:
                continue  # Skip malformed matches

            table = match[0]
            cols = match[1]
            columns = []

            for col in cols.split("\n"):
                col = col.strip()
                if col.upper().startswith(("PRIMARY KEY", "FOREIGN KEY", "CONSTRAINT", "UNIQUE", "CHECK", "KEY")):
                    continue  # Skip constraints
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


def check_table_exists(table_name):
    cursor_archive.execute("SHOW TABLES LIKE %s", (table_name,))
    return cursor_archive.fetchone() is not None


def backup_data(file_path, table_name):
    if not os.path.exists(file_path):
        print(f"Skipping {file_path}: File does not exist.")
        return

    if not check_table_exists(table_name):
        print(f"Warning: Table {table_name} does not exist in the archive database. Skipping.")
        return

    try:
        df = pd.read_csv(file_path).fillna(0)

        if 'country' in df.columns:
            df['country'] = df['country'].apply(rename_country)

        if table_name not in db_schema:
            print(f"Warning: Table {table_name} not found in schema. Skipping.")
            return

        column_mapping = {}
        for col in df.columns:
            if col.isdigit():
                db_col = f"year_{col}"
                if db_col in db_schema[table_name]:
                    column_mapping[col] = db_col
        df.rename(columns=column_mapping, inplace=True)

        valid_columns = [col for col in df.columns if col in db_schema[table_name]]
        if not valid_columns:
            print(f"Skipping {file_path}: No valid columns match database schema.")
            return

        # Convert year and large numerical columns to numeric, replacing errors with NaN
        for col in valid_columns:
            if col.startswith("year_") or "total_vaccinations" in col:
                df[col] = pd.to_numeric(df[col], errors='coerce')  # Convert invalid values to NaN
                df[col].fillna(0, inplace=True)  # Replace NaN with 0

                # Check for out-of-range values
                max_int_value = 2147483647  # Max INT(11) in MySQL
                if df[col].max() > max_int_value:
                    print(
                        f"Warning: Some values in column {col} exceed INT limit. Consider changing column type to BIGINT.")

        df = df[valid_columns]
        columns = ", ".join(valid_columns)
        values = ", ".join(["%s"] * len(valid_columns))

        insert_query = f"INSERT INTO {table_name} ({columns}) VALUES ({values}) ON DUPLICATE KEY UPDATE "
        insert_query += ", ".join([f"{col} = VALUES({col})" for col in valid_columns])

        for index, row in df.iterrows():
            os.system('clear')
            print(f"nb ligne traité : {index}")
            cursor_archive.execute(insert_query, tuple(row))

        connection_archive.commit()
        print(f"Successfully backed up {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")


def main():
    data_dir = "./files/"
    files = [
        "countries_and_continents.csv",
        "millions_population_country.csv",
        "owid_monkeypox_data.csv",
        "vaccinations.csv",
        "worldometer_coronavirus_daily_data.csv"
    ]

    for file_name in files:
        file_path = os.path.join(data_dir, file_name)
        table_name = os.path.splitext(file_name)[0]
        backup_data(file_path, table_name)

    cursor_archive.close()
    connection_archive.close()
    print("Backup process completed.")

    end_time = time.time()
    print(f"Temps d'exécution : {end_time - start_time:.6f} secondes")


if __name__ == "__main__":
    main()