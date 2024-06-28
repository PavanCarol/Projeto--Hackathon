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

var record = {};
// record.pet_name = null; // Text
// record.pet_email = null; // Text
// record.pet_senha = null; // Text
// record.pet_confirmarsenha = null; // Text
if ($("#input_name").val() != "")
  formatted = newDateFormat($("#input_name").val());
record.pet_name =
  $("#input_name").val() != "" && $("#input_name").val() != ""
    ? new Date(`${formatted} ${$("#input_name").val()}:00`).toISOString()
    : null; // Date Time

if ($("#input_email").val() != "")
  formatted = newDateFormat($("#input_email").val());
record.pet_email =
  $("#input_email").val() != "" && $("#input_email").val() != ""
    ? new Date(`${formatted} ${$("#input_email").val()}:00`).toISOString()
    : null; // Date Time

if ($("#input-password").val() != "")
  formatted = newDateFormat($("#input-password").val());
record.pet_senha =
  $("#input-password").val() != "" && $("#input-password").val() != ""
    ? new Date(`${formatted} ${$("#input-password").val()}:00`).toISOString()
    : null; // Date Time

if ($("#input-confirpassword").val() != "")
  formatted = newDateFormat($("#input-confirpassword").val());
record.pet_confirmarsenha =
  $("#input-confirpassword").val() != "" &&
  $("#input-confirpassword").val() != ""
    ? new Date(
        `${formatted} ${$("#input-confirpassword").val()}:00`
      ).toISOString()
    : null; // Date Time

Xrm.WebApi.createRecord("pet_cadastro", record).then(
  function success(result) {
    var newId = result.id;
    console.log(newId);
  },
  function (error) {
    console.log(error.message);
  }
);
