let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")) || null;

function adicionarAoCarrinho(produto, preco) {
  // usuario logado
  if (usuarioLogado) {
    carrinho.push({ produto, preco });
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    console.log("Produto adicionado:", JSON.stringify(carrinho));
    console.log("Carrinho:", carrinho);
    Swal.fire({
      title: "Produto adicionado ao carrinho!",
      showDenyButton: true,
      confirmButtonText: "Continuar comprando",
      denyButtonText: `Ir para o carrinho`,
    }).then((result) => {
      if (result.isDenied) {
        window.location.href = "carrinho.html";
      }
    });
  } else {
    mostrarPopupLogin();
  }
}

function mostrarPopupLogin() {
  const popupLogin = document.getElementById("popupLogin");
  popupLogin.style.display = "block";
}

function fecharPopupLogin() {
  const popupLogin = document.getElementById("popupLogin");
  popupLogin.style.display = "none";
}

function mostrarCadastro() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("cadastroForm").style.display = "block";
}

function mostrarLogin() {
  document.getElementById("cadastroForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
}

function logarUsuario(event) {
  event.preventDefault();
  const email = document.getElementById("emailLogin").value;
  const senha = document.getElementById("senhaLogin").value;

  localStorage.setItem("usuarioLogado", JSON.stringify({ email, senha }));
  console.log(localStorage.getItem("usuarioLogado"));
  usuarioLogado = { email, senha };
  fecharPopupLogin();
  atualizarMenu();
}

function cadastrarUsuario(event) {
  event.preventDefault();
  const email = document.getElementById("emailCadastro").value;
  const senha = document.getElementById("senhaCadastro").value;

  localStorage.setItem("usuarioLogado", JSON.stringify({ email, senha }));
  usuarioLogado = { email, senha };
  fecharPopupLogin();
  atualizarMenu();
}

function atualizarMenu() {
  const menuLogin = document.querySelectorAll("nav ul li a");
  const loginLink = menuLogin[5];
  const sairLink = menuLogin[6];

  if (usuarioLogado) {
    loginLink.style.display = "none";
    sairLink.style.display = "inline";
  } else {
    loginLink.style.display = "inline";
    sairLink.style.display = "none";
  }
}
window.onload = function () {
  atualizarMenu();
  carregarCarrinho();
};

function logout() {
  localStorage.removeItem("usuarioLogado");
  usuarioLogado = null;
  atualizarMenu();
}

function carregarCarrinho() {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  const produtosCarrinho = document.getElementById("produtosCarrinho");
  produtosCarrinho.innerHTML = "";

  let total = 0;

  carrinho.forEach((item, index) => {
    const divProduto = document.createElement("div");
    divProduto.classList.add("produtoCarrinho");
    divProduto.innerHTML = `
    <h4>${item.produto}</h4>
    <p>R$ ${item.preco.toFixed(2)}</p>
    <button onclick="removerDoCarrinho(${index})">Remover</button>
    `;
    produtosCarrinho.appendChild(divProduto);

    total += item.preco;
  });

  document.getElementById("totalValor").textContent = total.toFixed(2);
}

function removerDoCarrinho(index) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.splice(index, 1);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  Swal.fire({
    title: "Você tem certeza?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3e77b6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sim, remover",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Removido!",
        text: "Seu arquivo foi removido.",
        icon: "Sucesso!",
      });
    }
  });

  carregarCarrinho();
}

function finalizarCompra() {

  localStorage.removeItem("carrinho");
  console.log("Carrinho:", carrinho);
  carregarCarrinho();

 Swal.fire({
    position:"middle-center",
    icon: "sucess",
    title: "Compra finalizada com sucesso!",
    showConfirmButton: false,
    timer: 1500

  });
}

window.onload = function () {
  carregarCarrinho();
};

let currentSlide = 0;
const slides = document.querySelectorAll(".carrossel .slide");
const totalSlides = slides.length;

function showNextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarouselPosition();
}

function updateCarouselPosition() {
  console.log("Updating carousel position");
  const carrossel = document.querySelector(".carrossel");
  carrossel.style.transform = `translateX(-${currentSlide * 100}%)`;
}

setInterval(showNextSlide, 3000);

function mostrarPopupSobre() {
  document.getElementById("popupSobre").style.display = "block";
}

function fecharPopupSobre() {
  document.getElementById("popupSobre").style.display = "none";
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("open");
}
function abrirMenu() {
  document.getElementById("sidebar").style.width = "250px";
}

function fecharMenu() {
  document.getElementById("sidebar").style.width = "0";
}


function validarIdade() {
  const dataNascimento = document.getElementById("dataNascimento").value;
  const idade = calcularIdade(new Date(dataNascimento));
  if (idade < 18) {
    Swal.fire({
    title: "Parece que você é muito novo",
    text: "Você precisa ter no mínimo 18 anos para criar uma conta",
    icon: "error"
  });
    document
      .getElementById("dataNascimento")
      .setCustomValidity("Idade mínima não atendida");

  } else {
    document.getElementById("dataNascimento").setCustomValidity("");
  }
}

function calcularIdade(dataNascimento) {
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const mes = hoje.getMonth() - dataNascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
    idade--;
  }

  return idade;
}

document.querySelector("form").addEventListener("submit", function (event) {
  const senha = document.getElementById("senhaCadastro").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;

  if (senha !== confirmarSenha) {
    event.preventDefault();
    alert("As senhas não são iguais. Tente novamente.");
  }
});

function toggleMenu() {
  const nav = document.querySelector(".menu-container nav ul");
  nav.classList.toggle("show");
}

// Fecha o menu ao clicar fora
document.addEventListener("click", function (event) {
  const nav = document.querySelector(".menu-container nav ul");
  const button = document.querySelector(".open-btn");

  if (!nav.contains(event.target) && !button.contains(event.target)) {
    nav.classList.remove("show");
  }
});
