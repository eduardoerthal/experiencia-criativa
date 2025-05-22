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
    document.getElementById("nav-foto-perfil").style.display = "none";
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
    document.getElementById("username").textContent = data.username;
    const imgNav = document.getElementById("fotoPerfilNavbar");
    const savedImg = localStorage.getItem("fotoPerfil");
    if (savedImg && imgNav) {
       imgNav.src = savedImg;
}

    document.getElementById("username").style.display = "block";  
    document.getElementById("login-exibir").style.display = "none";
    document.getElementById("logout-exibir").style.display = "block";
    document.getElementById("nav-foto-perfil").style.display = "block";
  } else {
    document.getElementById("username").style.display = "none";
    document.getElementById("login-exibir").style.display = "block";
    document.getElementById("logout-exibir").style.display = "none";
    document.getElementById("nav-foto-perfil").style.display = "none";
  }
}


function mostrarPopupSobre() {
  document.getElementById("popupSobre").style.display = "block";
}

function fecharPopupSobre() {
  document.getElementById("popupSobre").style.display = "none";
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
    window.location.href = "/login";
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
  } else {
    Swal.fire({
      title: "Erro ao finalizar compra",
      icon: "error",
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
  // -------------------------------
  // 1. Checar status da sessão
  // -------------------------------
  checarADM();
  checarUsuario();

  if (window.location.pathname === "/adm") {
    fetch("/adm")
      .then(response => {
        if (!response.ok) return handleResponse(response);
      })
      .catch(error => console.error("Erro:", error));
  }

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('blocked')) {
    Swal.fire({
      title: "Acesso Negado",
      text: "Apenas administradores podem acessar esta página.",
      icon: "error",
      confirmButtonText: "OK"
    }).then(() => {
      window.history.replaceState({}, document.title, "/");
      window.location.href = "/";
    });
  }

  // -------------------------------
  // 2. Exibir dados do usuário
  // -------------------------------
  fetch("/mostrar-usuario", {
    method: "POST",
    credentials: "include"
  })
    .then(response => response.json())
    .then(data => {
      if (data.logado) {
        const usernameEl = document.getElementById("username");
        const telefoneEl = document.getElementById("telefone");
        const emailEl = document.getElementById("email");

        if (usernameEl) usernameEl.textContent = data.username;
        if (telefoneEl) telefoneEl.textContent = data.telefone;
        if (emailEl) emailEl.value = data.email
      }
    })
    .catch(error => console.error("Erro ao buscar dados do usuário:", error));

  // -------------------------------
  // 3. Formulário de atualizar email
  // -------------------------------
  const form = document.getElementById("userForm");
  const emailInput = document.getElementById("email");

  if (form && emailInput) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const novoEmail = emailInput.value;

      const response = await fetch("/atualizar-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ novo_email: novoEmail })
      });

      const data = await response.json();
      if (data.alterado) {
        Swal.fire("Sucesso!", "E-mail atualizado com sucesso!", "success");
      } else {
        Swal.fire("Erro!", data.erro || "Erro ao atualizar o e-mail", "error");
      }
    });
  }

  // -------------------------------
  // 3.1 Formulário de atualizar foto
  // -------------------------------
  

   // -------------------------------
  // 4. deletar usuarios
  // -------------------------------
  const botoesDeletar = document.querySelectorAll(".btn-delete");

  botoesDeletar.forEach(botao => {
    botao.addEventListener("click", async function () {
      const userId = this.getAttribute("data-user-id");

      const confirm = await Swal.fire({
        title: "Tem certeza?",
        text: "Deseja excluir este usuário?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir!",
        cancelButtonText: "Cancelar"
      });

      if (confirm.isConfirmed) {
        const resposta = await fetch("/deletar-usuario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId })
        });

        const resultado = await resposta.json();
        if (resultado.excluido) {
          Swal.fire("Excluído!", "Usuário removido com sucesso!", "success")
            .then(() => location.reload());
        } else {
          Swal.fire("Erro!", "Erro ao excluir usuário.", "error");
        }
      }
    });
  });


  // -------------------------------
  // 5. Validação de senhas
  // -------------------------------
  const newPassword = document.getElementById("newPassword") || document.getElementById("currentPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const passwordError = document.getElementById("passwordError") || document.createElement("div");

  form?.addEventListener("submit", function (event) {
    if (!newPassword || !confirmPassword) return;
    if (newPassword.value !== confirmPassword.value) {
      event.preventDefault();
      passwordError.textContent = "As senhas não coincidem.";
      newPassword.insertAdjacentElement("afterend", passwordError);
    }
  });

  // -------------------------------
  // 6. Upload de foto
  // -------------------------------
  document.getElementById('uploadFoto').addEventListener('change', async function () {
    const file = this.files[0]; 
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);

    const res = await fetch('/upload-foto', {
        method: 'POST',
        body: formData
    });

    const data = await res.json()

    if (data.alterado === true) {
        Swal.fire({
        title: "Sucesso!",
        text: "Sua foto foi atualizada com sucesso",
        icon: "success"
        }).then(() => {
          location.reload();
        });
      } else {
        Swal.fire("Erro!", data.erro || "Erro ao atualizar a foto", "error");
      }
  })

  // -------------------------------
  // 6. Upload de foto
  // -------------------------------


  // -------------------------------
  // 7. Carrossel
  // -------------------------------
  const carrossel = document.querySelector('.carrossel');
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  const dotsContainer = document.querySelector('.carrossel-dots');
  let index = 0;
  let startX, moveX;
  const threshold = 50;

  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.dot');

  function updateCarrossel() {
    carrossel.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  function goToSlide(i) {
    index = i;
    updateCarrossel();
  }

  prevBtn?.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    updateCarrossel();
  });

  nextBtn?.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    updateCarrossel();
  });

  carrossel?.addEventListener('mousedown', startDrag);
  carrossel?.addEventListener('touchstart', startDrag, { passive: true });
  carrossel?.addEventListener('mousemove', drag);
  carrossel?.addEventListener('touchmove', drag, { passive: false });
  carrossel?.addEventListener('mouseup', endDrag);
  carrossel?.addEventListener('touchend', endDrag);

  function startDrag(e) {
    e.preventDefault();
    startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
  }

  function drag(e) {
    if (!startX) return;
    moveX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const diff = startX - moveX;
    if (Math.abs(diff) > threshold) {
      index = diff > 0 ? (index + 1) % slides.length : (index - 1 + slides.length) % slides.length;
      updateCarrossel();
      startX = null;
    }
  }

  function endDrag() {
    startX = null;
  }

  let autoplay = setInterval(() => {
    index = (index + 1) % slides.length;
    updateCarrossel();
  }, 5000);

  carrossel?.addEventListener('mouseenter', () => clearInterval(autoplay));
  carrossel?.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => {
      index = (index + 1) % slides.length;
      updateCarrossel();
    }, 5000);
  });

  // -------------------------------
  // 8. Fechar sidebar ao clicar fora
  // -------------------------------
  document.addEventListener("click", function (event) {
    const sidebar = document.getElementById("sidebar");
    const button = document.querySelector(".open-btn");
    if (sidebar && !sidebar.contains(event.target) && !button.contains(event.target)) {
      fecharMenu();
    }
  });
});