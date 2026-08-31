import sqlite3
from datetime import datetime


DATABASE_NAME = "smartmed.db"


def create_database():
    connection = sqlite3.connect(DATABASE_NAME)

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS print_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL,
            expiry_date TEXT NOT NULL,
            status TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


def save_print_record(
    product_name,
    expiry_date,
    status
):
    connection = sqlite3.connect(
        DATABASE_NAME
    )

    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO print_history
        (
            product_name,
            expiry_date,
            status,
            timestamp
        )
        VALUES (?, ?, ?, ?)
    """, (
        product_name,
        expiry_date,
        status,
        datetime.now().isoformat()
    ))

    connection.commit()
    connection.close()


def get_print_history():

    connection = sqlite3.connect(
        DATABASE_NAME
    )

    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            product_name,
            expiry_date,
            status,
            timestamp
        FROM print_history
        ORDER BY id DESC
        LIMIT 20
    """)

    records = cursor.fetchall()

    connection.close()

    return records