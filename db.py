import mysql.connector

def db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="1201",
        database="expcriativa"
    )