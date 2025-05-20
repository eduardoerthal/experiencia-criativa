-- Apaga e recria o banco
DROP DATABASE IF EXISTS expcriativa;
CREATE DATABASE expcriativa;
USE expcriativa;

-- Usuários
CREATE TABLE USUARIO (
    ID_CLIENTE INT AUTO_INCREMENT PRIMARY KEY,
    NOME VARCHAR(50),
    CPF VARCHAR(16),
    DT_NASCIMENTO DATE,
    TELEFONE VARCHAR(20),
    EMAIL VARCHAR(50),
    SENHA VARCHAR(255)
);

-- Banners
CREATE TABLE BANNER (
    ID_BANNER INT AUTO_INCREMENT PRIMARY KEY,
    IMAGEM LONGBLOB
);

-- Categorias de produtos
CREATE TABLE CATEGORIA (
    ID_CATEGORIA INT AUTO_INCREMENT PRIMARY KEY,
    NOME VARCHAR(50)
);

-- Produtos
CREATE TABLE PRODUTO (
    ID_PRODUTO INT AUTO_INCREMENT PRIMARY KEY,
    NOME VARCHAR(50),
    VALOR INT,
    FK_CATEGORIA INT,
    IMAGEM LONGBLOB,
    FOREIGN KEY (FK_CATEGORIA) REFERENCES CATEGORIA(ID_CATEGORIA) ON DELETE CASCADE
);

-- Pedidos finalizados
CREATE TABLE PEDIDO (
    ID_PEDIDO INT AUTO_INCREMENT PRIMARY KEY,
    DATA_PEDIDO DATE,
    FK_ID_CLIENTE INT,
    FOREIGN KEY (FK_ID_CLIENTE) REFERENCES USUARIO(ID_CLIENTE) ON DELETE CASCADE
);

-- Carrinho de compras (temporário)
CREATE TABLE PROD_PEDIDO (
    ID_PROD_PEDIDO INT AUTO_INCREMENT PRIMARY KEY,
    FK_ID_PRODUTO INT,
    FK_ID_CLIENTE INT,
    QUANTIDADE INT,
    FOREIGN KEY (FK_ID_PRODUTO) REFERENCES PRODUTO(ID_PRODUTO) ON DELETE CASCADE,
    FOREIGN KEY (FK_ID_CLIENTE) REFERENCES USUARIO(ID_CLIENTE) ON DELETE CASCADE
);

-- Itens congelados no momento da finalização do pedido
CREATE TABLE ITEM_PEDIDO (
    ID_ITEM INT AUTO_INCREMENT PRIMARY KEY,
    FK_ID_PEDIDO INT,
    FK_ID_PRODUTO INT,
    QUANTIDADE INT,
    FOREIGN KEY (FK_ID_PEDIDO) REFERENCES PEDIDO(ID_PEDIDO) ON DELETE CASCADE,
    FOREIGN KEY (FK_ID_PRODUTO) REFERENCES PRODUTO(ID_PRODUTO) ON DELETE CASCADE
);

-- Inserção de categorias padrão
INSERT INTO CATEGORIA (NOME)
VALUES 
    ("Gloss"),
    ("Body Splash"),
    ("Hidratante"),
    ("Maquiagem"),
    ("Perfume"),
    ("Skincare");
START TRANSACTION;

-- Usando variáveis para armazenar temporariamente os BLOBs
SET @foto1 = NULL, @foto2 = NULL, @foto3 = NULL, @foto4 = NULL;

SET @foto1 = LOAD_FILE('/experiencia-criativa/static/images/carrosel/foto1.png');
SET @foto2 = LOAD_FILE('/experiencia-criativa/static/images/carrosel/foto2.png');
SET @foto3 = LOAD_FILE('/experiencia-criativa/static/images/carrosel/foto3.png');
SET @foto4 = LOAD_FILE('/experiencia-criativa/static/images/carrosel/foto4.png');

    INSERT INTO BANNER (IMAGEM) VALUES 
    (@foto1),
    (@foto2),
    (@foto3),
    (@foto4);
 
COMMIT;

INSERT INTO USUARIO (NOME, CPF, DT_NASCIMENTO, TELEFONE, EMAIL, SENHA) VALUES ('adm', '1', '2005-01-12', '1', 'adm@adm', MD5('123') );


