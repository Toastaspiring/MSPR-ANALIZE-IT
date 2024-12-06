import os
import pyspark
from pyspark.sql import SparkSession
from pyspark.sql.functions import lit, col
import pymysql

# MySQL database connection details
db_config = {
    "host": "localhost",
    "user": "mspr_user",
    "password": "mspr_user",
    "database": "mspr_database"
}

# Define the file table (list of file paths)
fileTable = [
    {"filePath": "path/to/file1.csv", "type": "Localization"},
    {"filePath": "path/to/file2.json", "type": "Case"},
    # Add all 12 files here
]

# Define schemas for each table
schemas = {
    "Localization": ["country", "continent"],
    "Case": ["totalConfirmed", "totalDeath", "totalRecoveries", "totalActive", "localizationId", "date"]
}

# Spark session
spark = SparkSession.builder.appName("MultiFileProcessing").getOrCreate()

# Function to process a CSV file
def processCSV(filepath, schema):
    df = spark.read.csv(filepath, header=True, inferSchema=True)
    # Select only columns that match the schema
    filtered_df = df.select([col for col in df.columns if col in schema])
    return filtered_df

# Function to process a JSON file
def processJson(filepath, schema):
    df = spark.read.json(filepath)
    # Select only columns that match the schema
    filtered_df = df.select([col for col in df.columns if col in schema])
    return filtered_df

# Insert DataFrame rows into MySQL table
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

# Main function to iterate over the fileTable and process files
def main():
    for file_info in fileTable:
        file_path = file_info["filePath"]
        table_type = file_info["type"]
        schema = schemas[table_type]

        # Determine file type and process accordingly
        file_extension = os.path.splitext(file_path)[1].lower()
        if file_extension == ".csv":
            df = processCSV(file_path, schema)
        elif file_extension == ".json":
            df = processJson(file_path, schema)
        else:
            print(f"Unsupported file format: {file_path}")
            continue

        print(f"Processing file: {file_path} for table: {table_type}")
        df.show()

        # Insert processed data into MySQL
        insert_into_mysql(df, table_type, schema)

# Run the main function
if __name__ == "__main__":
    main()
