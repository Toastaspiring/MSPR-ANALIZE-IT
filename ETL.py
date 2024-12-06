import os
import pyspark
from pyspark.sql import SparkSession
from pyspark.sql.functions import lit, col
import pymysql

# MySQL database connection details
db_config = {
    "host": "host.docker.internal",
    "port": 3306,
    "user": "mspr_user",
    "password": "mspr_user",
    "database": "mspr_database"
}

# Define the file table (list of file paths) and smth
fileTable = [
    {"filePath": "/files/worldometer_coronavirus_daily_data.csv", "disease": "covid"},
    {"filePath": "/files/owid-monkeypox-data.csv", "disease": "monkeypox"},
]

CountryToContinent = "/files/countries_and_continents.csv"

# Define schemas for each table
schemas = {
    "Localization": ["country", "continent"],
    "ReportCase": ["totalConfirmed", "totalDeath", "totalRecoveries", "totalActive", "localizationId", "date", "diseaseId"],
    "Disease": ["name"]
}

# Spark session
spark = SparkSession.builder.appName("DiseaseETL").getOrCreate()

# Function to process a CSV file
def processCSV(filepath, schema):
    df = spark.read.csv(filepath, header=True, inferSchema=True)
    return df.select([col for col in df.columns if col in schema])

# Function to process a JSON file
def processJson(filepath, schema):
    df = spark.read.json(filepath)
    return df.select([col for col in df.columns if col in schema])

# Function to insert data into MySQL table
def insert_into_mysql(df, table_name, schema):
    connection = pymysql.connect(**db_config)
    cursor = connection.cursor()
    try:
        for row in df.collect():
            values = ", ".join(
                [f"'{v}'" if isinstance(v, str) or v is None else str(v) for v in row]
            )
            sql = f"INSERT INTO {table_name} ({', '.join(schema)}) VALUES ({values});"
            cursor.execute(sql)
        connection.commit()
        print(f"Data inserted successfully into {table_name}!")
    except Exception as e:
        print(f"Error inserting data into {table_name}: {e}")
    finally:
        cursor.close()
        connection.close()

# Load and populate the Localization table
def load_localization():
    loc_df = processCSV(CountryToContinent, schemas["Localization"])
    loc_df = loc_df.dropDuplicates()
    insert_into_mysql(loc_df, "Localization", schemas["Localization"])

# Load and populate the Disease table
def load_disease_table():
    disease_names = list(set([file_info["disease"] for file_info in fileTable]))
    disease_df = spark.createDataFrame([(name,) for name in disease_names], schemas["Disease"])
    insert_into_mysql(disease_df, "Disease", schemas["Disease"])

# Fetch the diseaseId for a given disease
def fetch_disease_id(disease_name):
    connection = pymysql.connect(**db_config)
    cursor = connection.cursor()
    try:
        cursor.execute(f"SELECT id FROM Disease WHERE name = '{disease_name}'")
        result = cursor.fetchone()
        return result[0] if result else None
    except Exception as e:
        print(f"Error fetching diseaseId for {disease_name}: {e}")
    finally:
        cursor.close()
        connection.close()

# Main ETL process for ReportCase
def process_files():
    for file_info in fileTable:
        file_path = file_info["filePath"]
        disease = file_info["disease"]
        disease_id = fetch_disease_id(disease)

        if disease_id is None:
            print(f"Skipping file: {file_path} (Disease {disease} not found in database)")
            continue

        # Determine file type and process accordingly
        file_extension = os.path.splitext(file_path)[1].lower()
        if file_extension == ".csv":
            df = processCSV(file_path, schemas["ReportCase"])
        elif file_extension == ".json":
            df = processJson(file_path, schemas["ReportCase"])
        else:
            print(f"Unsupported file format: {file_path}")
            continue

        # Add diseaseId column
        df = df.withColumn("diseaseId", lit(disease_id))

        # Insert data into ReportCase table
        insert_into_mysql(df, "ReportCase", schemas["ReportCase"])

# Main function
def main():
    print("Loading Localization data...")
    load_localization()

    print("Loading Disease data...")
    load_disease_table()

    print("Processing ReportCase files...")
    process_files()

# Run the main function
if __name__ == "__main__":
    main()
