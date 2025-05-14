import mysql.connector

def db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="pucPR@123",
        database="expcriativa"
    )