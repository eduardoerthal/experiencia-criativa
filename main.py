from datetime import date
import time
from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, Response, UploadFile
import base64
from fastapi.exception_handlers import http_exception_handler
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from starlette.middleware.sessions import SessionMiddleware
from db import db_connection
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

############ Configurações Gerais ############

app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key="experienciacriativa", 
    session_cookie="experienciacriativacookie",          
    max_age= 60*60*60      
    )

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")    

# Adicione esta função para capturar erros 404
@app.exception_handler(StarletteHTTPException)
async def custom_404_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 404:
        return templates.TemplateResponse(
            "404.html",
            {"request": request},
            status_code=404
        )
    # Mantém o tratamento padrão para outros códigos de erro
    return await http_exception_handler(request, exc)

#################### GETs ##################
@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return JSONResponse(content={"logado": False})

@app.get("/checar-login")
async def checar_login(request: Request):
    user_id = request.session.get("user_id")
    if user_id == 1:
        return JSONResponse(content={'admlogado': True})
    if not user_id:
        return JSONResponse(content={"logado": False})
    
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM USUARIO WHERE ID_CLIENTE = %s", (user_id,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if result:
        return JSONResponse(content={"logado": True})
    else:
        request.session.clear()
        return JSONResponse(content={"logado": False})
    
@app.get("/checar-login-valido")
async def checar_login_valido(request: Request):
    logado = "user_id" in request.session
    if logado:
        return JSONResponse(content={"logado": logado})
    else:
        return JSONResponse(content={"logado": False})

    
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    conn = db_connection()
    cursor = conn.cursor(dictionary=True)

    # Produtos
    cursor.execute("SELECT ID_PRODUTO, NOME, VALOR, IMAGEM FROM PRODUTO")
    produtos = cursor.fetchall()

    for produto in produtos:
        imagem_bytes = produto["IMAGEM"]
        if imagem_bytes:
            produto["imagem_base64"] = base64.b64encode(imagem_bytes).decode("utf-8")
        else:
            produto["imagem_base64"] = None

    # Banners
    cursor.execute("SELECT IMAGEM FROM BANNER")
    banners = cursor.fetchall()

    for banner in banners:
        banner_imagem_bytes = banner["IMAGEM"]
        if banner_imagem_bytes:
            banner["imagem_base64"] = base64.b64encode(banner_imagem_bytes).decode("utf-8")
        else:
            banner["imagem_base64"] = None
            
    cursor.close()
    conn.close()
    
    return templates.TemplateResponse("index.html", {
        "request": request,
        "produtos": produtos,
        "banners": banners
    })
@app.get("/adm/usuarioscadastrados")
async def usuarios(request: Request):
    conn = db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT ID_CLIENTE, nome, email, telefone FROM USUARIO")
    usuarios = cursor.fetchall()
    conn.close()
    return templates.TemplateResponse("usuarioscadastrados.html", {"request": request, "usuarios": usuarios})

class UsuarioUpdate(BaseModel):
    id: str
    nome: str
    email: str
    telefone: str

@app.post("/deletar-usuario")
async def deletar_usuario(request: Request):
    dados = await request.json()
    conn = db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM USUARIO WHERE ID_CLIENTE = %s", (dados["id"],))
        conn.commit()
        return {"excluido": True}
    except Exception as e:
        print("Erro ao deletar:", e)
        return {"excluido": False}
    finally:
        cursor.close()
        conn.close()

@app.post("/editar-usuario")
async def editar_usuario(request: Request):
    dados = await request.json()
    conn = db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE USUARIO 
            SET NOME = %s, EMAIL = %s, TELEFONE = %s 
            WHERE ID_CLIENTE = %s
        """, (dados["nome"], dados["email"], dados["telefone"], dados["id"]))
        conn.commit()
        return {"editado": True}
    except Exception as e:
        print("Erro ao editar:", e)
        return {"editado": False}
    finally:
        cursor.close()
        conn.close()


@app.get("/adm", response_class=HTMLResponse)
async def adm(request: Request):
    # Verifica se o usuário é admin (ID 1)
    user_id = request.session.get("user_id")
    if user_id != 1:
        return RedirectResponse(url="/?blocked=true")

    # Conecta ao banco e busca os dados
    conn = db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT COUNT(*) FROM USUARIO")
        total_usuarios = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM PRODUTO")
        total_produtos = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM PEDIDO")
        total_pedidos = cursor.fetchone()[0]

        return templates.TemplateResponse("adm.html", {
            "request": request,
            "total_usuarios": total_usuarios,
            "total_produtos": total_produtos,
            "total_pedidos": total_pedidos,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.get("/login", response_class=HTMLResponse)
def adm(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/index", response_class=HTMLResponse)
def adm(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/cadastro", response_class=HTMLResponse)
def adm(request: Request):
    return templates.TemplateResponse("cadastro.html", {"request": request})

@app.get("/carrinho", response_class=HTMLResponse)
def carrinho(request: Request):
    try:
        user_id = request.session["user_id"]

        conn = db_connection()
        cursor = conn.cursor(dictionary=True)
        
        sql = "SELECT PRODUTO.IMAGEM, PRODUTO.NOME, PRODUTO.VALOR, PROD_PEDIDO.QUANTIDADE, PROD_PEDIDO.ID_PROD_PEDIDO FROM PRODUTO INNER JOIN PROD_PEDIDO ON PRODUTO.ID_PRODUTO = PROD_PEDIDO.FK_ID_PRODUTO WHERE PROD_PEDIDO.FK_ID_CLIENTE = %s"
        cursor.execute(sql, (user_id,))
        carrinho = cursor.fetchall()
        
        for produto in carrinho:
            imagem_bytes = produto["IMAGEM"]
            if imagem_bytes:
                produto["imagem_base64"] = base64.b64encode(imagem_bytes).decode("utf-8")
            else:
                produto["imagem_base64"] = None

        
        total = sum(i["VALOR"] * i["QUANTIDADE"] for i in carrinho)

            
        
        conn.close()
        cursor.close()
        
        return templates.TemplateResponse("carrinho.html", {
            "request": request,
            "carrinho": carrinho,
            "total": total})
    except:
        return RedirectResponse(url="/login")


@app.get("/gloss", response_class=HTMLResponse)
def gloss(request: Request):
    
    conn = db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT NOME, VALOR, IMAGEM FROM PRODUTO WHERE FK_CATEGORIA = 1")
    produtos = cursor.fetchall()
    
    for produto in produtos:
        imagem_bytes = produto["IMAGEM"]
        if imagem_bytes:
            produto["imagem_base64"] = base64.b64encode(imagem_bytes).decode("utf-8")
        else:
            produto["imagem_base64"] = None
    
    cursor.close()
    conn.close()
    
    return templates.TemplateResponse("gloss.html", {
        "request": request,
        "produtos": produtos
        })

@app.get("/body", response_class=HTMLResponse)
def bodysplash(request: Request):
    conn = db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT NOME, VALOR, IMAGEM FROM PRODUTO WHERE FK_CATEGORIA = 2")
    produtos = cursor.fetchall()
    
    for produto in produtos:
        imagem_bytes = produto["IMAGEM"]
        if imagem_bytes:
            produto["imagem_base64"] = base64.b64encode(imagem_bytes).decode("utf-8")
        else:
            produto["imagem_base64"] = None
    
    cursor.close()
    conn.close()
    
    return templates.TemplateResponse("body.html", {
        "request": request,
        "produtos": produtos
        })

@app.get("/hidratante", response_class=HTMLResponse)
def hidratante(request: Request):
    conn = db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT NOME, VALOR, IMAGEM FROM PRODUTO WHERE FK_CATEGORIA = 3")
    produtos = cursor.fetchall()
    
    for produto in produtos:
        imagem_bytes = produto["IMAGEM"]
        if imagem_bytes:
            produto["imagem_base64"] = base64.b64encode(imagem_bytes).decode("utf-8")
        else:
            produto["imagem_base64"] = None
    
    cursor.close()
    conn.close()
    
    return templates.TemplateResponse("hidratante.html", {
        "request": request,
        "produtos": produtos
        })

@app.get("/maquiagem", response_class=HTMLResponse)
def maquiagem(request: Request):
    conn = db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT NOME, VALOR, IMAGEM FROM PRODUTO WHERE FK_CATEGORIA = 4")
    produtos = cursor.fetchall()
    
    for produto in produtos:
        imagem_bytes = produto["IMAGEM"]
        if imagem_bytes:
            produto["imagem_base64"] = base64.b64encode(imagem_bytes).decode("utf-8")
        else:
            produto["imagem_base64"] = None
    
    cursor.close()
    conn.close()
    
    return templates.TemplateResponse("maquiagem.html", {
        "request": request,
        "produtos": produtos
        })

@app.get("/perfume", response_class=HTMLResponse)
def perfume(request: Request):
    conn = db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT NOME, VALOR, IMAGEM FROM PRODUTO WHERE FK_CATEGORIA = 5")
    produtos = cursor.fetchall()
    
    for produto in produtos:
        imagem_bytes = produto["IMAGEM"]
        if imagem_bytes:
            produto["imagem_base64"] = base64.b64encode(imagem_bytes).decode("utf-8")
        else:
            produto["imagem_base64"] = None
    
    cursor.close()
    conn.close()
    
    return templates.TemplateResponse("perfume.html", {
        "request": request,
        "produtos": produtos
        })

@app.get("/skincare", response_class=HTMLResponse)
def skincare(request: Request):
    conn = db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT NOME, VALOR, IMAGEM FROM PRODUTO WHERE FK_CATEGORIA = 6")
    produtos = cursor.fetchall()
    
    for produto in produtos:
        imagem_bytes = produto["IMAGEM"]
        if imagem_bytes:
            produto["imagem_base64"] = base64.b64encode(imagem_bytes).decode("utf-8")
        else:
            produto["imagem_base64"] = None
    
    cursor.close()
    conn.close()
    
    return templates.TemplateResponse("skincare.html", {
        "request": request,
        "produtos": produtos
        })

@app.get("/promoção", response_class=HTMLResponse)
def promocao(request: Request):
    return templates.TemplateResponse("promoção.html", {"request": request})

    

#################### POSTs ##################

# Cadastro de Produto
@app.post("/cadastrar-produto", response_class=HTMLResponse)
async def cadastrar_produto(
    request: Request,
    nomeproduto: str = Form(...),
    valorproduto: int = Form(...),
    catproduto: int = Form(...),
    imgproduto: UploadFile = File(...)
):
    conn = db_connection()
    cursor = conn.cursor()

    imagem_bytes = await imgproduto.read()

    sql = "INSERT INTO PRODUTO (NOME, VALOR, FK_CATEGORIA, IMAGEM) VALUES (%s, %s, %s, %s)"
    cursor.execute(sql, (nomeproduto, valorproduto, catproduto, imagem_bytes))

    conn.commit()
    cursor.close()
    conn.close()
    return RedirectResponse(url="/adm", status_code=303)

# Excluir Produto
@app.post("/excluir-produto", response_class=HTMLResponse)
async def excluir_produto(
    request: Request,
    idproduto: int = Form(...),
):
    conn = db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM PRODUTO WHERE ID_PRODUTO = %s", (idproduto, ))

    conn.commit()
    cursor.close()
    conn.close()
    return RedirectResponse(url="/adm", status_code=303)

# Inserção de Banner
@app.post("/inserir-banner", response_class=HTMLResponse)
async def inserir_banner(
    request: Request,
    imgbanner: UploadFile = File(...)
):
    conn = db_connection()
    cursor = conn.cursor()

    imagem_bytes = await imgbanner.read()

    sql = "INSERT INTO BANNER (IMAGEM) VALUES (%s)"
    cursor.execute(sql, (imagem_bytes,))

    conn.commit()
    cursor.close()
    conn.close()
    return RedirectResponse(url="/adm", status_code=303)



# Cadastro de Usuário
@app.post("/cadastrar-usuario", response_class=HTMLResponse)
def cadastrarusuario(
    request: Request,
    nomeCompleto: str = Form(...),
    cpf: str = Form(...),
    dataNascimento: str = Form(...),
    telefone: str = Form(...),
    emailCadastro: str = Form(...),
    senhaCadastro: str = Form(...)
):
    
    conn = db_connection()
    cursor = conn.cursor()
    
    sql = "INSERT INTO USUARIO (NOME, CPF, DT_NASCIMENTO, TELEFONE, EMAIL, SENHA) VALUES (%s, %s, %s, %s, %s, MD5(%s))"
    
    cursor.execute(sql, (nomeCompleto, cpf, dataNascimento, telefone, emailCadastro ,senhaCadastro))
    
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return JSONResponse(content={"cadastrado": True})


# Login do Usuário
@app.post("/login-usuario")
def loginusuario(request: Request,
    emailLogin: str = Form(...),
    senhaLogin: str = Form(...)
):  
    conn = db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT ID_CLIENTE, EMAIL, SENHA FROM USUARIO WHERE EMAIL = %s AND SENHA = MD5(%s)", (emailLogin, senhaLogin))
    user = cursor.fetchone()
    
    if not user:
        return JSONResponse(content={"logado": False})
    
    elif user['EMAIL'] == "adm@adm" and user['SENHA'] == '202cb962ac59075b964b07152d234b70':
        request.session['user_id'] = 1
        return JSONResponse(content={'admlogado': True})
    else:
        request.session['user_id'] = user['ID_CLIENTE']
        return JSONResponse(content={"logado": True})
    
    
@app.get("/session-status")
async def session_status(request: Request):
    user_id = request.session.get("user_id")
    if user_id == 1:
        return JSONResponse(content={"admlogado": True})
    elif user_id:
        return JSONResponse(content={'logado': True})
    else:
        return JSONResponse(content={'logado': False})
    
@app.post("/produto-pedido")
async def produto_pedido(request: Request):
    dados = await request.json()
    id_produto = dados.get("id")
    quantidade = dados.get("quantidade")
    id_cliente = request.session["user_id"]
    
    
    conn = db_connection()
    cursor = conn.cursor()

    sql = "INSERT INTO PROD_PEDIDO (FK_ID_PRODUTO, FK_ID_CLIENTE, QUANTIDADE) VALUES (%s, %s, %s)"
    cursor.execute(sql, (id_produto, id_cliente ,quantidade))
    conn.commit()

    cursor.close()
    conn.close()

    return JSONResponse(content={"adicionado": True})

# Finalizar Compra
@app.post("/finalizar-compra")
async def finalizar_compra(request: Request):

    user_id = request.session["user_id"]
    
    conn = db_connection()
    cursor = conn.cursor()

    
    sql = "INSERT INTO PEDIDO (DATA_PEDIDO, FK_ID_CLIENTE) VALUES (%s, %s)"
    cursor.execute(sql,(date.today(), user_id))

    id_pedido = cursor.lastrowid

    sql = "SELECT FK_ID_PRODUTO, QUANTIDADE FROM PROD_PEDIDO WHERE FK_ID_CLIENTE = %s"
    cursor.execute(sql, (user_id,))
    produtos = cursor.fetchall()

    for produto in produtos:
        id_produto = produto[0]
        quantidade = produto[1]
        sql = "INSERT INTO ITEM_PEDIDO (FK_ID_PEDIDO, FK_ID_PRODUTO, QUANTIDADE) VALUES (%s, %s, %s)"
        cursor.execute(sql,(id_pedido, id_produto, quantidade))
    
    sql = "DELETE FROM PROD_PEDIDO WHERE FK_ID_CLIENTE = %s"
    cursor.execute(sql, (user_id,))
    
    conn.commit()
    
    return JSONResponse(content={'finalizado': True})

@app.post('/alterar-quantidade')
async def alterar_quantidade(request: Request):
    dados = await request.json()
    
    conn = db_connection()
    cursor = conn.cursor()
    
    sql = "UPDATE PROD_PEDIDO SET QUANTIDADE = %s WHERE ID_PROD_PEDIDO = %s"
    cursor.execute(sql,(dados["nova_quantidade"], dados["id_prod_pedido"]))
    conn.commit()
    
    return JSONResponse(content={"alterado": True})


@app.post('/atualizar-email')
async def atualizar_email(request: Request):
    dados = await request.json()
    user_id = request.session.get("user_id")  # pega ID da sessão atual

    if not user_id:
        return JSONResponse(content={"alterado": False, "erro": "Não autenticado"}, status_code=401)

    conn = db_connection()
    cursor = conn.cursor()

    sql = "UPDATE USUARIO SET EMAIL = %s WHERE ID_CLIENTE = %s;"
    cursor.execute(sql, (dados["novo_email"], user_id))  # CORRIGIDO AQUI
    conn.commit()

    cursor.close()
    conn.close()

    return JSONResponse(content={"alterado": True})


@app.post('/excluir-do-carrinho')
async def excluir_do_carrinho(request: Request):
    dados = await request.json()
    conn = db_connection()
    cursor = conn.cursor()
    
    sql = "DELETE FROM PROD_PEDIDO WHERE ID_PROD_PEDIDO = %s"
    cursor.execute(sql, (dados["id"],))
    conn.commit()
    
    return JSONResponse(content={'excluido': True})


@app.post('/mostrar-usuario')
async def mostrar_usuario(request: Request):
    user_id = request.session.get("user_id")
    
    if not user_id:
        return JSONResponse(content={"logado": False})

    conn = db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT NOME, TELEFONE, EMAIL 
        FROM USUARIO 
        WHERE ID_CLIENTE = %s
    """, (user_id,))
    result = cursor.fetchone()
    
    conn.close()
    cursor.close()

    if result:
        nome, telefone, email = result
        return JSONResponse(content={
            "logado": True,
            "username": nome,
            "telefone": telefone,
            "email": email
        })
    else:
        return JSONResponse(content={"logado": False})
    

@app.get('/puxar-dados')
async def puxar_dados(request: Request):
    conn = db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT CPF FROM USUARIO")
    cpfs = cursor.fetchall()
    cursor.execute("SELECT EMAIL FROM USUARIO")
    emails = cursor.fetchall()
    return JSONResponse(content={
    "cpfs": [cpf[0] for cpf in cpfs],
    "emails": [email[0] for email in emails]
})
    

@app.get("/usuario", response_class=HTMLResponse)
async def usuario(request: Request):
    return templates.TemplateResponse("usuario.html", {"request": request})