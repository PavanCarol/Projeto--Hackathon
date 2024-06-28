document
  .getElementById("togglePassword")
  .addEventListener("click", function (e) {
    // Obter o campo de entrada de senha
    var passwordInput = document.getElementById("password");
    // Obter o ícone
    var passwordInput = document.getElementById("password");
    // Obter o ícone
    var icon = document.getElementById("eyeIcon");

    // Alternar o tipo de entrada entre 'password' e 'text'
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.src = "../image/icon/visibility_off.svg"; // Caminho para a imagem de olho fechado
    } else {
      passwordInput.type = "password";
      icon.src = "../image/icon/visibility.svg"; // Caminho para a imagem de olho aberto
    }
  });
