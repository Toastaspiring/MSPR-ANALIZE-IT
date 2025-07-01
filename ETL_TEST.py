import os
import logging
import sys
import mysql.connector
import ETL

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("ETL_TEST")

def run_sql_file(conn, path):
    """Execute SQL statements from a file."""
    logger.info(f"Loading schema from {path}...")
    cursor = conn.cursor()
    with open(path, 'r') as f:
        sql = f.read()
    for _ in cursor.execute(sql, multi=True):
        pass
    conn.commit()
    cursor.close()

def get_row_count(conn, table):
    cur = conn.cursor()
    cur.execute(f"SELECT COUNT(*) FROM {table}")
    count = cur.fetchone()[0]
    cur.close()
    return count

if __name__ == "__main__":
    host = os.environ.get('DB_HOST', '127.0.0.1')
    port = int(os.environ.get('DB_PORT', 3306))
    user = os.environ.get('DB_USER', 'mspr_user')
    password = os.environ.get('DB_PASSWORD', 'mspr_user')

    try:
        conn = mysql.connector.connect(host=host, port=port, user=user, password=password)
    except Exception as e:
        logger.error(f"Unable to connect to MySQL: {e}")
        sys.exit(1)

    run_sql_file(conn, './files/bdd.sql')
    conn.database = 'mspr_database'

    ETL.mspr_conn = conn
    ETL.cursor_mspr = conn.cursor()
    ETL.insert_mspr()

    tables = ['Localization', 'LocalizationData', 'Disease', 'ReportCase']
    counts = {tbl: get_row_count(conn, tbl) for tbl in tables}
    logger.info(f"Row counts after ETL: {counts}")

    ETL.cursor_mspr.close()
    conn.close()
