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
    'database': 'mspr_database',
    'collation': "utf8mb4_general_ci"
}

# Establish connection
connection_main = mysql.connector.connect(**db_config)
cursor_main = connection_main.cursor()

connection_archive = mysql.connector.connect(
    host=db_config['host'],
    port=db_config['port'],
    user=db_config['user'],
    password=db_config['password'],
    database="mspr_database_archive",
    collation=db_config['collation']
)
cursor_archive = connection_archive.cursor()


def parse_database_schema(sql_file):
    schema = {}
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()

        # Match CREATE TABLE statements, allowing for optional backticks around table names
        tables = re.findall(r'CREATE TABLE\s+[`]?(\w+)[`]?\s*\((.*?)\);', content, re.DOTALL)

        for _, table, cols in tables:
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


def backup_and_insert_data(file_path, table_name):
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
        df = df[valid_columns]
        columns = ", ".join(valid_columns)
        values = ", ".join(["%s"] * len(valid_columns))

        insert_query = f"INSERT INTO {table_name} ({columns}) VALUES ({values}) ON DUPLICATE KEY UPDATE "
        insert_query += ", ".join([f"{col} = VALUES({col})" for col in valid_columns])

        for index, row in df.iterrows():
            os.system('clear')
            print(f"nb ligne traité : {index}")
            cursor_main.execute(insert_query, tuple(row))

        connection_main.commit()
        print(f"Successfully processed {file_path}")
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
        backup_and_insert_data(file_path, table_name)

    cursor_main.close()
    connection_main.close()
    cursor_archive.close()
    connection_archive.close()
    print("ETL process completed.")

    end_time = time.time()
    print(f"Temps d'exécution : {end_time - start_time:.6f} secondes")


if __name__ == "__main__":
    main()