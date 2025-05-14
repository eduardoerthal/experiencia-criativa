import mysql.connector

def db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="PUC@1234",
        database="expcriativa"
    )