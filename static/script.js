window.onload = function(){
  checarADM();
  checarUsuario()

  if (window.location.pathname === "/adm") {
    fetch("/adm")
        .then(response => {
            if (!response.ok) return handleResponse(response);
            // Se for ADM, a página já carregou normalmente
        })
        .catch(error => console.error("Erro:", error));
      }

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('blocked')){
    Swal.fire({
            title: "Acesso Negado",
            text: "Apenas administradores podem acessar esta página.",
            icon: "error",
            confirmButtonText: "OK"
        }).then (() => {
          window.history.replaceState ({}, document.title, "/");
          window.location.href = "/"; 
        });
  }
} 

async function checarADM() {
  const response = await fetch('/session-status');
  const data = await response.json();
  console.log(data)

  if (data.admlogado === true) {
    document.getElementById("dropdown-adm").textContent = "Administrador";
    document.getElementById("dropdown-adm").style.display = "block";
    document.getElementById("username").style.display = "none";
    document.getElementById("login-exibir").style.display = "none";
    document.getElementById("logout-exibir").style.display = "block";
  } else {
    document.getElementById("dropdown-adm").style.display = "none";
  }
}

async function checarUsuario() {
  console.log("Checando usuário logado...");
  const response = await fetch('/mostrar-usuario', { method: 'POST' });
  const data = await response.json();
  console.log("Resposta do servidor:", data);


  if (data.admlogado === true) return;

  if (data.logado === true) {
    document.getElementById("username").textContent = "Olá, " + data.username;
    document.getElementById("username").style.display = "block";
    document.getElementById("login-exibir").style.display = "none";
    document.getElementById("logout-exibir").style.display = "block";
  } else {
    document.getElementById("username").style.display = "none";
    document.getElementById("login-exibir").style.display = "block";
    document.getElementById("logout-exibir").style.display = "none";
  }
}


function mostrarPopupSobre() {
  document.getElementById("popupSobre").style.display = "block";
}

function fecharPopupSobre() {
  document.getElementById("popupSobre").style.display = "none";
}

/** ANTIGO POPUP DE LOGIN - OBSOLETO
function mostrarPopupLogin() {
  const popupLogin = document.getElementById("popupLogin");
  popupLogin.style.display = "flex";
}

function fecharPopupLogin() {
  const popupLogin = document.getElementById("popupLogin");
  popupLogin.style.display = "none";
}
**/

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
    window.location.href = '/login';
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

  const form = document.getElementById("login-form");
  const formData = new FormData(form);
  
  const response = await fetch("/login-usuario", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  console.log(data)

  if (data.admlogado === true) {
    Swal.fire({
      title: "LOGADO COMO ADM",
      icon: "warning",
    }).then(() => {
      window.location.href = "/";
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

async function autenticarUsuario(event) {
  event.preventDefault();

  let erros = document.getElementsByClassName("error-label");
  for (let i = 0; i < erros.length; i++) {
    erros[i].style.display = "none";
  }

  const response =  await fetch('/puxar-dados')
  const data =  await response.json()

  let nomeCompleto = document.getElementsByName("nomeCompleto")[0].value.trim();
  let dataNascimento = document.getElementsByName("dataNascimento")[0].value;
  let telefone = document.getElementsByName("telefone")[0].value.trim();
  let emailCadastro = document.getElementsByName("emailCadastro")[0].value.trim();
  let senhaCadastro = document.getElementsByName("senhaCadastro")[0].value;
  let confirmarSenha = document.getElementsByName("confirmarSenha")[0].value;
  let cpf = document.getElementsByName("cpf")[0].value.replace(/\D/g, '');
  let erro = false;

  // Validação de campos obrigatórios
  if (!dataNascimento || !telefone || !emailCadastro || !senhaCadastro || !confirmarSenha || !cpf) {
    document.getElementById("campoObrigatorio").style.display = "block";
    erro = true;
  }

  // Validação do nome
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(nomeCompleto)) {
    document.getElementById("nomeInvalido").style.display = "block";
    erro = true;
  }

  // Validação da idade (mínimo 18 anos)
  let dataNascimentoDate = new Date(dataNascimento);
  let hoje = new Date();
  let idade = hoje.getFullYear() - dataNascimentoDate.getFullYear();
  let mesAtual = hoje.getMonth();
  let mesNascimento = dataNascimentoDate.getMonth();
  let diaAtual = hoje.getDate();
  let diaNascimento = dataNascimentoDate.getDate();
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
    idade--;
  }
  if (isNaN(dataNascimentoDate) || idade < 18) {
    document.getElementById("idadeInvalida").style.display = "block";
    erro = true;
  }

  // Validação do telefone
  if (!/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(telefone)) {
    document.getElementById("telefoneInvalido").style.display = "block";
    erro = true;
  }

  // Validação do email
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailCadastro)) {
    document.getElementById("emailInvalido").style.display = "block";
    erro = true;
  }


  if (data.emails.includes(emailCadastro)) {
    document.getElementById("emailEmUso").style.display = "block";
    erro = true;
  }

  // Validação da senha
  if (senhaCadastro.length < 8 || senhaCadastro.length > 16) {
    document.getElementById("senhaInvalida").style.display = "block";
    erro = true;
  }

  if (senhaCadastro !== confirmarSenha) {
    document.getElementById("senhaNaoConfere").style.display = "block";
    erro = true;
  }

  // Validação do CPF
  if (!validarCPF(cpf)) {
    document.getElementById("cpfInvalido").style.display = "block";
    erro = true;
  }

  if (data.cpfs.includes(cpf)) {
    document.getElementById("cpfEmUso").style.display = "block";
    erro = true;
  }

  // Submeter se estiver tudo certo
  if (!erro) {
      const form = document.getElementById("cadastro-form");
      const formData = new FormData(form);

      const response = await fetch("/cadastrar-usuario", {
        method: "POST",
        body: formData
      });
      
      const data2 = await response.json();

      if (data2.cadastrado) {
        Swal.fire({
          title: "Usuário Cadastrado",
          icon: "success",
        }).then(() => {
          window.location.href = '/';
        });
      } else {
        Swal.fire({
          title: "Erro ao cadastrar usuário",
          icon: "error",
        }).then(() => {
          window.location.href = '/';
        });
      }

  }
}

// Função auxiliar para validar CPF
function validarCPF(cpf) {
  if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;
  if (parseInt(cpf.charAt(9)) !== digito1) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;
  return parseInt(cpf.charAt(10)) === digito2;
}

// ===============================
// Carousel
// ===============================
document.addEventListener("DOMContentLoaded", function () {
  const carrossel = document.querySelector('.carrossel');
  const slides = document.querySelectorAll('.slide');
  let index = 0;

  function mostrarProximoSlide() {
    if (!carrossel || slides.length === 0) return;
    index = (index + 1) % slides.length;
    carrossel.style.transform = `translateX(-${index * 100}%)`;
  }

  setInterval(mostrarProximoSlide, 3000);
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

const form = document.getElementById("userForm");
 const newPassword = document.getElementById("newPassword");
 const confirmPassword = document.getElementById("confirmPassword");
 const passwordError = document.getElementById("passwordError");
 
 form.addEventListener("submit", function (event) {
   if (newPassword.value !== confirmPassword.value) {
     event.preventDefault();
     passwordError.textContent = "As senhas não coincidem.";
   } else {
     passwordError.textContent = "";
     alert("Alterações salvas com sucesso!");
   }
 });
 document
   .getElementById("uploadFoto")
   .addEventListener("change", function (event) {
     const file = event.target.files[0];
     if (file) {
       const reader = new FileReader();
       reader.onload = function (e) {
         document.querySelector(".foto-usuario").src = e.target.result;
       };
       reader.readAsDataURL(file);
     }
   });
 function toggleSenha(el) {
   const input = el.previousElementSibling;
   const icon = el.querySelector("i");
 
   if (input.type === "password") {
     input.type = "text";
     icon.classList.remove("fa-eye");
     icon.classList.add("fa-eye-slash");
   } else {
     input.type = "password";
     icon.classList.remove("fa-eye-slash");
     icon.classList.add("fa-eye");
   }
 }

const usuarioLogado = localStorage.getItem('usuarioLogado') === 'true';
const nomeUsuario = localStorage.getItem('nomeUsuario');

if (usuarioLogado && nomeUsuario) {
    document.getElementById('loginmenu').style.display = 'none';
    document.getElementById('logout-li').style.display = 'inline-block';

    const usernameLink = document.getElementById('username');
    usernameLink.textContent = nomeUsuario; // Define o nome do usuário
    usernameLink.href = '/usuario'; // Redireciona para a tela do usuário
    document.getElementById('username-li').style.display = 'inline-block';
}
//*
async function logout() {
  try {
    const response = await fetch('/logout');
    const data = await response.json();

    if (data.logado === false) {
      Swal.fire({
        title: "Sessão Encerrada",
        icon: "warning"
      }).then(() => {
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('nomeUsuario');
        location.reload();
      });
    }
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
} 



// USUARIO.HTML START
document.getElementById("uploadFoto")?.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.querySelector(".foto-usuario").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function toggleSenha(el) {
  const input = el.previousElementSibling;
  const icon = el.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("userForm");
  const confirmPassword = document.getElementById("confirmPassword");
  const passwordError = document.getElementById("passwordError") || document.createElement("div");

  form?.addEventListener("submit", function (event) {
    const newPassword = document.getElementById("currentPassword");
    if (!newPassword || !confirmPassword) return;

    if (newPassword.value !== confirmPassword.value) {
      event.preventDefault();
      passwordError.textContent = "As senhas não coincidem.";
      newPassword.insertAdjacentElement("afterend", passwordError);
    } else {
      passwordError.textContent = "";
      alert("Alterações salvas com sucesso!");
    }
  });
});


document.getElementById("uploadFoto")?.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.querySelector(".foto-usuario").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function toggleSenha(el) {
  const input = el.previousElementSibling;
  const icon = el.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("userForm");
  const newPassword = document.getElementById("newPassword") || document.getElementById("currentPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const passwordError = document.getElementById("passwordError") || document.createElement("div");

  form?.addEventListener("submit", function (event) {
    if (!newPassword || !confirmPassword) return;

    if (newPassword.value !== confirmPassword.value) {
      event.preventDefault();
      passwordError.textContent = "As senhas não coincidem.";
      newPassword.insertAdjacentElement("afterend", passwordError);
    } else {
      passwordError.textContent = "";
      alert("Alterações salvas com sucesso!");
    }
  });
});



