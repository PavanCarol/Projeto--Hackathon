const express = require("express");
const body = require("body-parser");
const cors = require("cors");
const fs = require('fs');
const app = express();
const jwt = require("jsonwebtoken");
const port = 3301;

app.use(cors());
app.use(body.json({ limit: "10mb" }));

const JWT_SECRET = "qOf_N6{4z9,v8g{";
const Bot = require("./chatBot")
const loggerMiddleware = require('./middleware');

app.use(loggerMiddleware);
// Função para carregar configurações do arquivo
function carregarConfiguracao() {
  if (fs.existsSync('configuracaoBot.json')) {
    const data = fs.readFileSync('configuracaoBot.json');
    return JSON.parse(data);
  }
  return {};
}

// Função para salvar configurações no arquivo
function salvarConfiguracao(config) {
  fs.writeFileSync('configuracaoBot.json', JSON.stringify(config, null, 2));
}

// Variável para armazenar configurações do bot
let configuracaoBot = carregarConfiguracao();

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

// Rota para configurar o bot
app.post("/api/configurarBot", (req, res) => {
  configuracaoBot = req.body;
  salvarConfiguracao(configuracaoBot);
  console.log("Configuração do bot recebida:", configuracaoBot);

  res.json({ sucesso: true, mensagem: "Configuração salva com sucesso" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const resposta = await new Bot().main(req.body.question);
    res.json({ erro: false, resposta });
  } catch (error) {
    res.status(500).json({ erro: true, resposta: "Desculpa, mas o bot não funcionlu" });
  }
});

// Rota de cadastro que usa o token de autenticação
app.post("/api/cadastro", async (req, res) => {
  try {
    const { nome, email, senha } = req.body; // Obtém os dados do corpo da solicitação
    const token = await getAuthToken(); // Obtém o token de autenticação

    // URL para criar um novo registro
    const url = "https://org4d13d757.crm2.dynamics.com/api/data/v9.2/accounts";

    // Dados a serem enviados
    const data = {
      name: nome,
      emailaddress1: email,
      cra6a_senha: senha,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // Inclui o token de autenticação
      },
      body: JSON.stringify(data), // Envia os dados no corpo da solicitação
    });

    console.log(`Status da Resposta: ${response.status}`); // Adiciona log para status da resposta

    if (response.status == 204) {
      // Resposta 204 não tem corpo, então apenas confirme o sucesso
      res.status(201).json({
        sucesso: true,
        mensagem: "Cadastro realizado com sucesso!",
      });
    } else {
      // Para outras respostas, tente processar o corpo como JSON
      const responseBody = await response.text(); // Obtém o corpo da resposta como texto
      console.log(`Corpo da Resposta: ${responseBody}`); // Adiciona log para o corpo da resposta

      if (response.ok) {
        // Se a resposta for bem-sucedida, mas não for 204, faz o parse do corpo como JSON
        const responseData = JSON.parse(responseBody); // Faz o parse do corpo da resposta
        res.status(201).json({
          sucesso: true,
          mensagem: "Cadastro realizado com sucesso!",
          data: responseData, // Inclui os dados retornados na resposta
        });
      } else {
        // Se a resposta não for bem-sucedida, lance um erro
        throw new Error("Network response was not ok " + response.statusText);
      }
    }
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao cadastrar.",
      error: error.message,
    });
  }
});

// Rota de login que usa o token de autenticação
// No seu arquivo de login (index.js)
app.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body; // Obtém os dados do corpo da solicitação
    const token = await getAuthToken(); // Obtém o token de autenticação

    // URL para consultar registros de conta
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/accounts?$filter=emailaddress1 eq '${email}' and cra6a_senha eq '${senha}'`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // Inclui o token de autenticação
      },
    });

    console.log(`Status da Resposta: ${response.status}`); // Adiciona log para status da resposta

    if (response.status === 200) {
      const data = await response.json();
      console.log(`Corpo da Resposta: ${JSON.stringify(data)}`); // Adiciona log para o corpo da resposta

      if (data.value.length > 0) {
        // Se há registros encontrados, as credenciais são válidas
        const user = data.value[0];
        const jwtToken = jwt.sign(
          {
            id: user.accountid,
            email: user.emailaddress1,
            name: user.name // Inclua o nome do usuário no payload
          },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        res.status(200).json({
          sucesso: true,
          mensagem: "Login bem-sucedido!",
          token: jwtToken,
        });
      } else {
        // Se não há registros encontrados, as credenciais são inválidas
        res.status(401).json({
          sucesso: false,
          mensagem: "Credenciais inválidas",
        });
      }
    } else {
      throw new Error("Network response was not ok " + response.statusText);
    }
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao fazer login.",
      error: error.message,
    });
  }
});



app.post("/api/clinica", async (req, res) => {
  try {
    const {
      nome,
      tempoAtuacao,
      faculdade,
      posGratuacao,
      imagemBase64: imagem,
      date,
    } = req.body; // Obtém os dados do corpo da solicitação
    const token = await getAuthToken(); // Obtém o token de autenticação

    // URL para criar um novo registro
    const url =
      "https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_clinicas";

    // Dados a serem enviados
    var record = {};
    record.cra6a_nomeveterinario = nome; // Text
    record.cra6a_anoatuacao = tempoAtuacao; // Whole Number
    record.cra6a_datanascimento = date;
    record.cra6a_faculdade = faculdade; // Text
    record.cra6a_imagemveterinario = imagem.split(",")[1];
    record.cra6a_posgraduacao = posGratuacao; // Text

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Prefer: "odata.include-annotations=*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(record),
    });

    console.log(`Status da Resposta: ${response.status}`);

    if (response.status == 204) {
      // Resposta 204 não tem corpo, então apenas confirme o sucesso
      res.status(201).json({
        sucesso: true,
        mensagem: "Cadastro na Clinica com sucesso",
      });
    } else {
      // Para outras respostas, tente processar o corpo como JSON
      const responseBody = await response.text(); // Obtém o corpo da resposta como texto
      console.log(`Corpo da Resposta: ${responseBody}`); // Adiciona log para o corpo da resposta

      if (response.ok) {
        // Se a resposta for bem-sucedida, mas não for 204, faz o parse do corpo como JSON
        const responseData = JSON.parse(responseBody); // Faz o parse do corpo da resposta
        res.status(201).json({
          sucesso: true,
          mensagem: "Cadastro realizado com sucesso!",
          data: responseData, // Inclui os dados retornados na resposta
        });
      } else {
        // Se a resposta não for bem-sucedida, lance um erro
        throw new Error("Network response was not ok " + response.statusText);
      }
    }
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao cadastrar.",
      error: error.message,
    });
  }
});
app.get("/api/getClinica", async (req, res) => {
  try {
    const token = await getAuthToken(); // Obtém o token de autenticação

    // URL para consultar todos os registros de clínica
    const url =
      "https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_clinicas";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // Inclui o token de autenticação
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      res.status(200).json(data);
    } else {
      throw new Error("Network response was not ok " + response.statusText);
    }
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar dados da clínica.",
      error: error.message,
    });
  }
});

// Rota para obter uma clínica específica por ID
app.get("/api/getClinica/:id", async (req, res) => {
  try {
    const token = await getAuthToken(); // Obtém o token de autenticação
    const id = req.params.id;
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_clinicas(${id})`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      res.status(200).json(data);
    } else {
      throw new Error("Network response was not ok " + response.statusText);
    }
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar dados da clínica.",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
