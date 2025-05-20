'''from db import db_connection

conn = db_connection()
cursor = conn.cursor()

# Inserir 4 banners
for i in range(4):
    with open(f'./static/images/carrosel/foto{i+1}.png', 'rb') as f:
        imagem = f.read()
    cursor.execute("INSERT INTO BANNER (IMAGEM) VALUES (%s)", (imagem,))

conn.commit()'''