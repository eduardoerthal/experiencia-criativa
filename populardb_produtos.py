from db import db_connection
import os

def inserir_imagens_produtos():
    conn = db_connection()
    cursor = conn.cursor()
    
    # Mapeamento de categorias para nomes de arquivo
    mapeamento_categorias = {
        1: "gloss",
        2: "bodysplash",
        3: "hidratante",
        4: "maquiagem",
        5: "perfume",
        6: "skincare"
    }
    
    try:
        # Para cada categoria
        for categoria_id, nome_categoria in mapeamento_categorias.items():
            cursor.execute("SELECT ID_PRODUTO FROM PRODUTO WHERE FK_CATEGORIA = %s ORDER BY ID_PRODUTO", (categoria_id,))
            produtos = cursor.fetchall()
            
            for i, (produto_id,) in enumerate(produtos[:4], start=1):
                nome_arquivo = f"./static/images/produtos/{nome_categoria}{i}.png"
                
                if os.path.exists(nome_arquivo):
                    with open(nome_arquivo, 'rb') as f:
                        imagem = f.read()
                    
                    # Atualizar o produto com a imagem
                    cursor.execute("""
                        UPDATE PRODUTO 
                        SET IMAGEM = %s 
                        WHERE ID_PRODUTO = %s
                    """, (imagem, produto_id))
                    print(f"Imagem {nome_arquivo} inserida no produto ID {produto_id}")
                else:
                    print(f"Arquivo não encontrado: {nome_arquivo}")
        
        conn.commit()
        print("Todas as imagens foram inseridas com sucesso!")
    
    except Exception as e:
        conn.rollback()
        print(f"Erro ao inserir imagens: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    inserir_imagens_produtos()