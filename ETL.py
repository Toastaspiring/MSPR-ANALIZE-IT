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


# Extract schema from bdd.sql file
def parse_database_schema(sql_file):
    schema = {}
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()

        # Match CREATE TABLE statements, allowing for optional backticks around table names
        tables = re.findall(r'CREATE TABLE\s+[`]?(\w+)[`]?\s*\((.*?)\);', content, re.DOTALL)

        for table, cols in tables:
            columns = []
            for col in cols.split("\n"):
                col_match = re.match(r'\s*[`]?(\w+)[`]?\s+', col)
                if col_match:
                    columns.append(col_match.group(1))  # Extract column name without backticks

            schema[table] = columns

    return schema


db_schema = parse_database_schema("./files/bdd.sql")
print(db_schema)

def rename_country(country_name):
    if 'Bosnia and Herzegovina' in country_name:
        return 'Bosnia And Herzegovina'
    elif 'Vietnam' in country_name:
        return 'Viet Nam'
    elif 'Czechia' in country_name:
        return 'Czech Republic'
    elif 'Democratic Republic of Congo' in country_name:
        return 'Democratic Republic Of The Congo'
    elif 'United Kingdom' in country_name:
        return 'UK'
    elif 'United States' in country_name:
        return 'USA'
    else:
        return country_name  # Otherwise, keep the original values


def backup_and_insert_data(file_path, table_name):
    try:
        df = pd.read_csv(file_path).fillna(0)

        # Normalize country names if applicable
        if 'country' in df.columns:
            df['country'] = df['country'].apply(rename_country)

        if table_name not in db_schema:
            print(f"Warning: Table {table_name} not found in schema. Skipping.")
            return

        # Align CSV columns with the database schema
        valid_columns = [col for col in df.columns if col in db_schema[table_name]]
        df = df[valid_columns]
        columns = ", ".join(valid_columns)
        values = ", ".join(["%s"] * len(valid_columns))

        # Backup data
        backup_table = f"{table_name}"
        backup_query = f"INSERT INTO {backup_table} ({columns}) VALUES ({values})"

        for _, row in df.iterrows():
            cursor_archive.execute(backup_query, tuple(row))
        connection_archive.commit()

        # Insert into main database with conflict resolution
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
    data_dir = "./files/"  # Directory containing CSV files
    files = [
        "countries_and_continents.csv",
        "millions_population_country.csv",
        "owid_monkeypox_data.csv",
        "vaccinations.csv",
        "worldometer_coronavirus_daily_data.csv"
    ]

    for file_name in files:
        file_path = os.path.join(data_dir, file_name)
        table_name = os.path.splitext(file_name)[0]  # Use filename as table name
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
