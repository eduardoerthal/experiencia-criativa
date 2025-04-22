async function checarADM() {
  const response = await fetch('/session-status')
  const data = await response.json()

  if (data.admlogado === true){
    document.getElementById("admpainel").style.display = "block";
  } else {
    document.getElementById("admpainel").style.display = "none";
  }
}

async function ChecarUsuario() {
  const response = await fetch('/session-status')
  const data = await response.json()

  if (data.logado === true) {
    document.getElementsByClassName("user-menu")[0].style.display = "block";
    document.getElementById("loginmenu").style.display = "none"; 
  } else {
    document.getElementsByClassName("user-menu")[0].style.display = "none";
    document.getElementById("loginmenu").style.display = "block";
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


async function checarLogin(caminhoProtegido) {

  const response = await fetch("/checar-login");
  const data = await response.json();

  if (data.admlogado === true) {
    Swal.fire({
      title: "ADM NÂO PODE FAZER ISSO",
      icon: "warning",
    }).then(() => {
      location.reload();
    });
    return
  }

  if (data["logado"] === true) {
    window.location.href = caminhoProtegido;
  } else {
    document.getElementById("popupLogin").style.display = "block";
  }   
}

async function checarLoginCarrinho(idProduto) {

  const response = await fetch("/checar-login");
  const data = await response.json();

  if (data.admlogado === true) {
    Swal.fire({
      title: "ADM NÂO PODE FAZER ISSO",
      icon: "warning",
    }).then(() => {
      location.reload();
    });
    return
  }

  if (data["logado"] === true) {
    adicionarAoCarrinho(idProduto)
  } else {
    return document.getElementById("popupLogin").style.display = "block";
  }   
}

async function checarLoginValido(event) {
  event.preventDefault();

  const form = document.getElementById("loginFormData");
  const formData = new FormData(form);

  const response = await fetch("/login-usuario", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (data.admlogado === true) {
    Swal.fire({
      title: "LOGADO COMO ADM",
      icon: "warning",
    }).then(() => {
      location.reload();
    });
    return
  }

  if (data["logado"] === false) {
    Swal.fire({
      title: "Login Inválido",
      text: "Credenciais Inválidas",
      icon: "warning",
    });
  } else {
    Swal.fire({
      title: "Logado com Sucesso",
      text: "Login realizado com sucesso",
      icon: "success",
    }).then(() => {
      window.location.href = "/"; 
    });
  }
}

async function adicionarAoCarrinho(id) {
  const input = document.getElementById('qtdproduto-' + id);
  const quantidade = parseInt(input.value);

  if (!quantidade || quantidade <= 0) {
    Swal.fire({
      title: "Quantidade Inválida",
      text: "A quantidade selecionada está inválida",
      icon: "warning",
    });
    return;
  }

  const response = await fetch('/produto-pedido', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, quantidade })
  });

  const data = await response.json();
  if (data.adicionado === true) {
    Swal.fire({
      title: "Produto Adicionado com Sucesso",
      text: "Seu produto foi adicionado ao carrinho de compras!",
      icon: "success",
    }).then(() => {
      location.reload();
    });
  };

}

async function finalizarCompra(){

  const response =  await fetch('/finalizar-compra', {method:'POST'});

  const data = await response.json();

  if (data.finalizado === true) {
    Swal.fire({
      title: "Compra Realizada com Sucesso",
      text: "Sua compra foi finalizada e logo chegará na sua casa",
      icon: "success",
    }).then(() => {
      location.reload();
    });
  }

}

function mostrarAlterarQuantidade(id) {
  document.getElementById(`quantidade-${id}`).style.display = "block";
  document.getElementById(`btnAltQtd-${id}`).style.display = "block";
}

async function alterarQuantidade(event, id_prod_pedido) {
  event.preventDefault();

  const input = document.getElementById(`quantidade-${id_prod_pedido}`);
  const quantidade = input.value.trim();

  if (!quantidade || quantidade <= 0) {
    Swal.fire({
      title: "Quantidade Inválida",
      icon: "warning",
    });
    return
  }

  const response = await fetch("/alterar-quantidade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_prod_pedido: id_prod_pedido,
      nova_quantidade: quantidade
    })
  });

  const data = await response.json()

  if (data.alterado === true) {
    Swal.fire({
      title: "Quantidade atualizada!",
      icon: "success",
    }).then(() => location.reload());
  }
}

async function excluirDoCarrinho(id) {
  const response = await fetch('/excluir-do-carrinho',{
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({id: id})
  });

  const data = await response.json()

  if(data.excluido === true) {
    Swal.fire({
      title: "Produto Excluido!",
      icon: "success",
    }).then(() => location.reload());
  }
  

}

function autenticarUsuario(event) {
  event.preventDefault();
  let nomeCompleto = document.getElementsByName("nomeCompleto")[0].value.trim();
  let dataNascimento = document.getElementsByName("dataNascimento")[0].value;
  let telefone = document.getElementsByName("telefone")[0].value.trim();
  let emailCadastro = document.getElementsByName("emailCadastro")[0].value.trim();
  let senhaCadastro = document.getElementsByName("senhaCadastro")[0].value;
  let confirmarSenha = document.getElementsByName("confirmarSenha")[0].value;

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

  if (!erro) {
    document.getElementById("cadastroUsuarioForm").submit();
  }
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

window.onload = function(){
  checarADM();
  ChecarUsuario()
} 

