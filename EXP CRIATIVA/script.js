let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || null;

function adicionarAoCarrinho(produto, preco) {
  // Verificar se o usuário está logado
  if (usuarioLogado) {
    // Se o usuário estiver logado, adiciona o produto ao carrinho
    carrinho.push({ produto, preco });
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    window.location.href = "carrinho.html"; // Redireciona para o carrinho
  } else {
    // Se o usuário não estiver logado, exibe o popup de login
    mostrarPopupLogin();
  }
}

function mostrarPopupLogin() {
  const popupLogin = document.getElementById('popupLogin');
  popupLogin.style.display = 'block';
}

function fecharPopupLogin() {
  const popupLogin = document.getElementById('popupLogin');
  popupLogin.style.display = 'none';
}

function mostrarCadastro() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('cadastroForm').style.display = 'block';
}

function mostrarLogin() {
  document.getElementById('cadastroForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

// Função para realizar o login
function logarUsuario(event) {
  event.preventDefault(); // Impede o envio padrão do formulário

  const email = document.getElementById('emailLogin').value;
  const senha = document.getElementById('senhaLogin').value;

  // Aqui você pode adicionar validação do usuário (consultar um banco de dados, por exemplo)
  // No caso, vamos usar um exemplo simples onde qualquer e-mail e senha são válidos.

  // Simulando um login bem-sucedido
  localStorage.setItem('usuarioLogado', JSON.stringify({ email, senha }));
  fecharPopupLogin();
}

// Função para cadastrar o usuário
function cadastrarUsuario(event) {
  event.preventDefault(); // Impede o envio padrão do formulário

  const email = document.getElementById('emailCadastro').value;
  const senha = document.getElementById('senhaCadastro').value;

  // Aqui você pode adicionar a lógica para salvar o novo usuário (em um banco de dados, por exemplo)
  // Neste caso, vamos simular o cadastro armazenando diretamente no LocalStorage.

  localStorage.setItem('usuarioLogado', JSON.stringify({ email, senha }));
  fecharPopupLogin();
}

// Função para controlar o carrossel de imagens
let currentSlide = 0;
const slides = document.querySelectorAll('.carrossel .slide');
const totalSlides = slides.length;

function showNextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;  // Vai para o próximo slide ou volta ao primeiro
  updateCarouselPosition();
}

function updateCarouselPosition() {
  const carrossel = document.querySelector('.carrossel');
  carrossel.style.transform = `translateX(-${currentSlide * 100}%)`;  // Move a posição do carrossel
}

// Iniciar o carrossel automaticamente
setInterval(showNextSlide, 3000);  // Troca a imagem a cada 3 segundos

// Função para mostrar o popup com a história da loja
function mostrarPopupSobre() {
  const popup = document.getElementById('popupSobre');
  popup.style.display = 'block';
}

function fecharPopupSobre() {
  const popup = document.getElementById('popupSobre');
  popup.style.display = 'none';
}
// Função para carregar o carrinho
function carregarCarrinho() {
  // Recuperar os itens do carrinho do localStorage
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

  // Elemento que irá conter os produtos
  const produtosCarrinho = document.getElementById('produtosCarrinho');
  produtosCarrinho.innerHTML = ''; // Limpa a lista de produtos

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
  carrinho.splice(index, 1); // Remove o produto do carrinho

  // Atualiza o carrinho no localStorage
  localStorage.setItem('carrinho', JSON.stringify(carrinho));

  // Recarrega a página do carrinho
  carregarCarrinho();
}

// Função para finalizar a compra
function finalizarCompra() {
  alert('Compra finalizada com sucesso!');

  // Limpar o carrinho após a finalização
  localStorage.removeItem('carrinho');
  carregarCarrinho(); // Recarregar carrinho vazio
}

// Carregar o carrinho ao abrir a página
window.onload = carregarCarrinho;

function toggleMenu() {
  const menu = document.getElementById("menu");
  menu.classList.toggle("hidden");
}

// Função para alternar a exibição do formulário de login
function toggleLogin() {
  const loginForm = document.querySelector(".login-container");
  loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
}
