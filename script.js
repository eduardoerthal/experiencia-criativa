let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || null;

// Função para adicionar o produto ao carrinho
function adicionarAoCarrinho(produto, preco) {
  // Verificar se o usuário está logado
  if (usuarioLogado) {
    // Se o usuário estiver logado, adiciona o produto ao carrinho
    carrinho.push({ produto, preco });
    localStorage.setItem('carrinho', JSON.stringify(carrinho)); // Salva no localStorage
    alert('Produto adicionado ao carrinho!');
  } else {
    // Se o usuário não estiver logado, exibe o popup de login
    mostrarPopupLogin();
  }
}

// Função para mostrar o popup de login
function mostrarPopupLogin() {
  const popupLogin = document.getElementById('popupLogin');
  popupLogin.style.display = 'block';
}

// Fechar o popup de login
function fecharPopupLogin() {
  const popupLogin = document.getElementById('popupLogin');
  popupLogin.style.display = 'none';
}

// Função para mostrar o formulário de cadastro
function mostrarCadastro() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('cadastroForm').style.display = 'block';
}

// Função para mostrar o formulário de login
function mostrarLogin() {
  document.getElementById('cadastroForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

// Função para realizar o login
function logarUsuario(event) {
  event.preventDefault();
  const email = document.getElementById('emailLogin').value;
  const senha = document.getElementById('senhaLogin').value;

  // Salva as credenciais do usuário logado no localStorage
  localStorage.setItem('usuarioLogado', JSON.stringify({ email, senha }));
  usuarioLogado = { email, senha }; // Atualiza a variável global com os dados do usuário logado
  fecharPopupLogin();
  atualizarMenu(); // Atualiza o menu após o login
}

// Função para cadastrar o usuário
function cadastrarUsuario(event) {
  event.preventDefault();
  const email = document.getElementById('emailCadastro').value;
  const senha = document.getElementById('senhaCadastro').value;

  // Salva o usuário cadastrado no localStorage
  localStorage.setItem('usuarioLogado', JSON.stringify({ email, senha }));
  usuarioLogado = { email, senha }; // Atualiza a variável global
  fecharPopupLogin();
  atualizarMenu(); // Atualiza o menu após o cadastro
}

// Função para atualizar o menu com base no status do login
function atualizarMenu() {
  const menuLogin = document.querySelectorAll('nav ul li a');
  const loginLink = menuLogin[4]; // Botão de login
  const sairLink = menuLogin[5];  // Botão de sair

  if (usuarioLogado) {
    loginLink.style.display = 'none'; // Oculta o link de login
    sairLink.style.display = 'inline'; // Exibe o link de sair
  } else {
    loginLink.style.display = 'inline'; // Exibe o link de login
    sairLink.style.display = 'none';  // Oculta o link de sair
  }
}

// Função para fazer logout
function logout() {
  localStorage.removeItem('usuarioLogado');
  usuarioLogado = null;
  atualizarMenu(); // Atualiza o menu após o logout
}

// Função para carregar o carrinho ao abrir a página
function carregarCarrinho() {
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

  // Elemento que irá conter os produtos
  const produtosCarrinho = document.getElementById('produtosCarrinho');
  produtosCarrinho.innerHTML = ''; 

  // Variável para calcular o total
  let total = 0;

  // Adicionar os produtos ao carrinho
  carrinho.forEach((item, index) => {
    const divProduto = document.createElement('div');
    divProduto.classList.add('produtoCarrinho');
    divProduto.innerHTML = `
      <h4>${item.produto}</h4>
      <p>R$ ${item.preco.toFixed(2)}</p>
      <button onclick="removerDoCarrinho(${index})">Remover</button>
    `;
    produtosCarrinho.appendChild(divProduto);

    // Somar o total
    total += item.preco;
  });

  // Atualizar o total
  document.getElementById('totalValor').textContent = total.toFixed(2);
}

// Função para remover um produto do carrinho
function removerDoCarrinho(index) {
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  carrinho.splice(index, 1); 
  localStorage.setItem('carrinho', JSON.stringify(carrinho));

  carregarCarrinho();
}

function finalizarCompra() {
  alert('Compra finalizada com sucesso!');


  localStorage.removeItem('carrinho');
  carregarCarrinho(); 
}

window.onload = carregarCarrinho;
