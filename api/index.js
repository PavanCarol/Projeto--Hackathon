const express = require("express");
const body = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3300;

app.use(cors());
app.use(body.json());

// Função para obter o token de autenticação
async function getAuthToken() {
  const url =
    "https://login.microsoftonline.com/e35fd86c-d440-44e9-ac11-d6664b6b15b1/oauth2/token";

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const body = new URLSearchParams({
    client_id: "d2611b85-13b9-440c-a029-2f86a24ad48b",
    client_secret: "y.u8Q~Xj3laOa6IHra1gKxZlCvpjozLx1PSIgcuN",
    grant_type: "client_credentials",
    resource: "https://org4d13d757.crm2.dynamics.com/",
  });

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: body,
  });

  if (!response.ok) {
    throw new Error("Failed to get auth token: " + response.statusText);
  }

  const data = await response.json();
  return data.access_token;
}

// Rota para obter o token de autenticação (pode ser usada para testes)
app.post("/api/getToken", async (req, res) => {
  try {
    const token = await getAuthToken();
    res.json({ token });
  } catch (error) {
    console.error("Error getting token:", error);
    res.status(500).json({ error: error.message });
  }
});

// Rota de cadastro que usa o token de autenticação
app.post("/api/cadastro", async (req, res) => {
  try {
    const token = await getAuthToken(); // Obtém o token de autenticação
    const url =
      "https://org4d13d757.crm2.dynamics.com/api/data/v9.2/accounts?$select=emailaddress1,name,cra6a_senha";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Prefer: "odata.include-annotations=*",
        Authorization: `Bearer ${token}`, // Inclui o token de autenticação
      },
    });
    console.log(response);

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();

    res.status(201).json({
      sucesso: true,
      mensagem: "foi!",
      data: data, // Inclui os dados retornados na resposta
    });
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao cadastrar.",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
