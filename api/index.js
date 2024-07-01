const express = require("express");
const body = require("body-parser");

const cors = require("cors");

const app = express();
const port = 3300;
app.use(cors());

app.use(body.json());

app.post("/api/getToken", async (req, res) => {
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

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      throw new Error(" ta funcionando: " + response.statusText);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("deu rui:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cadastro", async (req, res) => {
  try {
    res.status(201).json({
      sucesso: true,
      mensagem: "foi!",
    });
  } catch (error) {
    console.error(err);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao cadastrar.",
    });
  }
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
