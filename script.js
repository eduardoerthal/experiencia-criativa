let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")) || null;

function adicionarAoCarrinho(produto, preco) {
  if (usuarioLogado) {
    carrinho.push({ produto, preco });
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
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
function mostrarPopupSobre() {
  document.getElementById("popupSobre").style.display = "block";
}

function fecharPopupSobre() {
  document.getElementById("popupSobre").style.display = "none";
}

function mostrarPopupLogin() {
  const popupLogin = document.getElementById("popupLogin");
  popupLogin.style.display = "flex";
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
  usuarioLogado = { email, senha };
  fecharPopupLogin();
  atualizarMenu();
}

function autenticarUsuario(event) {
  event.preventDefault();

  function cadastrarUsuario() {
    const email = document.getElementById("emailCadastro").value;
    const senha = document.getElementById("senhaCadastro").value;
    localStorage.setItem("usuarioLogado", JSON.stringify({ email, senha }));
    usuarioLogado = { email, senha };
    fecharPopupLogin();
    atualizarMenu();
  }

  let nomeCompleto = document.getElementById("nomeCompleto").value.trim();
  let dataNascimento = document.getElementById("dataNascimento").value;
  let telefone = document.getElementById("telefone").value.trim();
  let emailCadastro = document.getElementById("emailCadastro").value.trim();
  let senhaCadastro = document.getElementById("senhaCadastro").value;
  let confirmarSenha = document.getElementById("confirmarSenha").value;

  document
    .querySelectorAll(".error-label")
    .forEach((msg) => (msg.style.display = "none"));

  let erro = false;

  if (
    !dataNascimento ||
    !telefone ||
    !emailCadastro ||
    !senhaCadastro ||
    !confirmarSenha
  ) {
    document.getElementById("campoObrigatorio").style.display = "block";
    erro = true;
  }

  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(nomeCompleto)) {
    document.getElementById("nomeInvalido").style.display = "block";
    erro = true;
  }

  let dataNascimentoDate = new Date(dataNascimento);
  let hoje = new Date();
  let idade = hoje.getFullYear() - dataNascimentoDate.getFullYear();
  let mesAtual = hoje.getMonth();
  let mesNascimento = dataNascimentoDate.getMonth();
  let diaAtual = hoje.getDate();
  let diaNascimento = dataNascimentoDate.getDate();

  if (
    mesAtual < mesNascimento ||
    (mesAtual === mesNascimento && diaAtual < diaNascimento)
  ) {
    idade--;
  }

  if (isNaN(dataNascimentoDate) || idade < 18) {
    document.getElementById("idadeInvalida").style.display = "block";
    erro = true;
  }

  if (!/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(telefone)) {
    document.getElementById("telefoneInvalido").style.display = "block";
    erro = true;
  }

  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailCadastro)) {
    document.getElementById("emailInvalido").style.display = "block";
    erro = true;
  }

  if (senhaCadastro.length < 8 || senhaCadastro.length > 16) {
    document.getElementById("senhaInvalida").style.display = "block";
    erro = true;
  }

  if (senhaCadastro !== confirmarSenha) {
    document.getElementById("senhaNaoConfere").style.display = "block";
    erro = true;
  }

  if (erro) return;
  cadastrarUsuario();
}

function atualizarMenu() {
  const menuLogin = document.querySelectorAll("nav ul li a");
  if (menuLogin.length >= 7) {
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
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  usuarioLogado = null;
  atualizarMenu();
}

function carregarCarrinho() {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const produtosCarrinho = document.getElementById("produtosCarrinho");
  if (!produtosCarrinho) return;
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

  const totalValor = document.getElementById("totalValor");
  if (totalValor) totalValor.textContent = total.toFixed(2);
}

function removerDoCarrinho(index) {
  const swalButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  swalButtons
    .fire({
      title: "Você tem certeza?",
      text: "Deseja remover o produto?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remover",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        carrinho.splice(index, 1);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        swalButtons.fire("Removido!", "Item removido do carrinho.", "success");
        carregarCarrinho();
      } else {
        swalButtons.fire("Cancelado", "Continue sua compra.", "info");
      }
    });
}

function finalizarCompra() {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const produtosCarrinho = document.getElementById("produtosCarrinho");
  if (carrinho.length === 0) {
    Swal.fire({
      title: "Carrinho vazio",
      text: "Adicione produtos ao carrinho para finalizar a compra",
      icon: "info",
    });
    return;
  }
  localStorage.removeItem("carrinho");
  Swal.fire({
    position: "center",
    icon: "success",
    title: "Compra finalizada com sucesso!",
    showConfirmButton: false,
    timer: 1500,
  });
  if (produtosCarrinho) produtosCarrinho.innerHTML = "";
  carregarCarrinho();
}

// ===============================
// Carousel
// ===============================
let currentSlide = 0;
window.addEventListener("load", () => {
  atualizarMenu();
  carregarCarrinho();

  const slides = document.querySelectorAll(".carrossel .slide");
  const totalSlides = slides.length;

  function showNextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    document.querySelector(".carrossel").style.transform = `translateX(-${
      currentSlide * 100
    }%)`;
  }
  setInterval(showNextSlide, 3000);
});

// ===============================
// Sidebar Menu Mobile
// ===============================
function abrirMenu() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.add("open");
}

function fecharMenu() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("open");
}

function navegarPara(pagina) {
  fecharMenu();
  setTimeout(() => {
    window.location.href = pagina;
  }, 300);
}

document.addEventListener("click", function (event) {
  const sidebar = document.getElementById("sidebar");
  const button = document.querySelector(".open-btn");
  if (
    sidebar &&
    !sidebar.contains(event.target) &&
    !button.contains(event.target)
  ) {
    fecharMenu();
  }
});
function toggleSubMenu() {
  var submenu = document.getElementById("subMenuMobile");
  if (submenu.style.display === "block") {
    submenu.style.display = "none";
  } else {
    submenu.style.display = "block";
  }
}
