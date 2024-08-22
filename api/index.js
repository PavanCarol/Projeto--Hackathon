const express = require("express");
const body = require("body-parser");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const Bot = require("./chatBot");
const loggerMiddleware = require("./middleware");

const port = 3301;
const JWT_SECRET = "qOf_N6{4z9,v8g{";

app.use(cors());
app.use(body.json({ limit: "10mb" }));
app.use(loggerMiddleware);

// Criar um mapa para armazenar o estado do bot para cada usuário
const botInstances = new Map();

function verifyToken(req, res, next) {
  const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null;
  const refreshToken = req.headers['x-refresh-token'] || null;
  
  console.log('Token:', token);
  console.log('Refresh Token:', refreshToken);
  
  if (!token) {
    return res.status(403).json({ mensagem: "Token não fornecido." });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        if (refreshToken) {
          jwt.verify(refreshToken, JWT_SECRET, (err, decodedRefresh) => {
            if (err) {
              return res.status(401).json({ mensagem: "Sessão expirada. Faça login novamente." });
            } else {
              const newToken = jwt.sign(
                { id: decodedRefresh.id, email: decodedRefresh.email, name: decodedRefresh.name },
                JWT_SECRET,
                { expiresIn: "1h" }
              );

              // Adiciona o novo token ao cabeçalho
              res.setHeader('x-new-token', newToken);
              req.user = decodedRefresh;
              next();
            }
          });
        } else {
          return res.status(401).json({ mensagem: "Token expirado. Faça login novamente." });
        }
      } else {
        return res.status(401).json({ mensagem: "Falha na autenticação." });
      }
    } else {
      req.user = decoded;
      next();
    }
  });
}


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
// Rota para interação com o bot
app.post("/api/chat", async (req, res) => {
  try {
    const { question, userId, accountId } = req.body;
    let bot = botInstances.get(userId);
    if (!bot) {
      bot = new Bot(getAuthToken, accountId); // Passe a função getAuthToken ao construtor do Bot
      botInstances.set(userId, bot);  
    }
    const resposta = await bot.main(question, accountId);
    res.json({ erro: false, resposta });
  } catch (error) {
    console.error("Erro ao processar a solicitação do bot:", error);
    res
      .status(500)
      .json({ erro: true, resposta: "Desculpa, mas o bot não funcionou" });
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

// Função para mapear os valores de texto para os valores numéricos esperados pelo Dataverse
function mapToChoiceValue(field, value) {
  const mappings = {
    cra6a_tipodebanho: {
      Banho: 1,
      "Banho e Tosa na máquina": 2,
      "Banho e Tosa na tesoura": 3,
      "Banho e Tosa higiênica": 4,
      "Banho e Tosa completa": 5,
    },
    cra6a_porte: {
      Mini: 1,
      Pegueno: 2,
      Médio: 3,
      Grande: 4,
    },
    cra6a_pelagem: {
      Médio: 1,
      Curto: 2,
      Longo: 3,
    },
  };

  return mappings[field] ? mappings[field][value] : null;
}
// Rota para tratar a categoriaBanho
app.post("/api/categoriaBanho", verifyToken, async (req, res) =>{
  try {
    const { tipoBanho, valor } = req.body; // Captura os dados do corpo da requisição
    const userId = req.user.id;
    const token = await getAuthToken(); // Obtém o token de autenticação

    // URL para o endpoint da API do Dataverse ou outro serviço
    const url =
      "https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_custos";

    // Mapear os valores de texto para os valores numéricos de Choice
    const record = {
      cra6a_tipodebanho: mapToChoiceValue("cra6a_tipodebanho", tipoBanho),
      // cra6a_porte: mapToChoiceValue("cra6a_porte", porte),
      // cra6a_pelagem: mapToChoiceValue("cra6a_pelagem", pelagem),
      cra6a_valor: Number(parseFloat(valor).toFixed(4)), // Formata o valor como Currency
      "cra6a_IdConta@odata.bind" : `/accounts(${userId})`
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(record),
    });

    console.log(`Status da Resposta: ${response.status}`);
    if (response.ok) {
      res
        .status(204)
        .json({ sucesso: true, mensagem: "Registro criado com sucesso!" });
    } else {
      const errorResponse = await response.text();
      res
        .status(response.status)
        .json({ sucesso: false, mensagem: errorResponse });
    }
  } catch (error) {
    console.error("Erro ao criar registro:", error.message);
    res
      .status(500)
      .json({ sucesso: false, mensagem: "Erro ao criar registro." });
  }
});
app.get("/api/getcategoriaBanho", verifyToken, async (req, res) => {
  try {
    const token = await getAuthToken(); // Obtém o token de autenticação
    const userId = req.user.id;

    // URL para o endpoint da API do Dataverse ou outro serviço
    const url =
      `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_custos?$filter=_cra6a_idconta_value eq ${userId}`;

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

    if (response.ok) {
      const data = await response.json();
      res.status(200).json(data.value); // Presume que os dados estão em `value`
    } else {
      const errorResponse = await response.text();
      res
        .status(response.status)
        .json({ sucesso: false, mensagem: errorResponse });
    }
  } catch (error) {
    console.error("Erro ao buscar registros:", error.message);
    res
      .status(500)
      .json({ sucesso: false, mensagem: "Erro ao buscar registros." });
  }
});
app.delete("/api/categoriaBanho/:id", async (req, res) => {
  try {
    const token = await getAuthToken(); // Obtém o token de autenticação
    const id = req.params.id; // Obtém o ID da categoria a ser deletada

    // URL para deletar a categoria específica com base no ID fornecido
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_custos(${id})`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      res
        .status(204)
        .json({ sucesso: true, mensagem: "Categoria deletada com sucesso!" });
    } else {
      const errorResponse = await response.text();
      res
        .status(response.status)
        .json({ sucesso: false, mensagem: errorResponse });
    }
  } catch (error) {
    console.error("Erro ao deletar a categoria:", error.message);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao deletar a categoria.",
    });
  }
});

app.patch("/api/categoriaBanho/:id", async (req, res) => {
  try {
    const token = await getAuthToken(); // Obtém o token de autenticação
    const id = req.params.id; // Obtém o ID da categoria a ser atualizada
    const data = req.body; // Dados da categoria a serem atualizados

    // Mapear os valores de texto para os respectivos números
    const updatedData = {
      cra6a_tipodebanho: mapToChoiceValue(
        "cra6a_tipodebanho",
        data.cra6a_tipodebanho
      ),
      // cra6a_porte: mapToChoiceValue("cra6a_porte", data.cra6a_porte),
      // cra6a_pelagem: mapToChoiceValue("cra6a_pelagem", data.cra6a_pelagem),
      cra6a_valor: data.cra6a_valor, // Este não precisa de mapeamento, pois é numérico
    };

    // URL para atualizar a categoria específica com base no ID fornecido
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_custos(${id})`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      res
        .status(204)
        .json({ sucesso: true, mensagem: "Categoria atualizada com sucesso!" });
    } else {
      const errorResponse = await response.text();
      res
        .status(response.status)
        .json({ sucesso: false, mensagem: errorResponse });
    }
  } catch (error) {
    console.error("Erro ao atualizar a categoria:", error.message);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar a categoria.",
    });
  }
});

// Rota de login que usa o token de autenticação
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

    console.log(`Status da Resposta: ${response.status}`);

    if (response.status === 200) {
      const data = await response.json();
      console.log(`Corpo da Resposta: ${JSON.stringify(data)}`);

      if (data.value.length > 0) {
        const user = data.value[0];

        const jwtToken = jwt.sign(
          {
            id: user.accountid,
            email: user.emailaddress1,
            name: user.name,
          },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        
        const refreshToken = jwt.sign(
          {
            id: user.accountid,
            email: user.emailaddress1,
            name: user.name,
          },
          JWT_SECRET,
          { expiresIn: "7d" }  // Expiração do refresh token mais longa
        );
        
        res.status(200).json({
          sucesso: true,
          mensagem: "Login bem-sucedido!",
          token: jwtToken,
          refreshToken: refreshToken, // Inclua o refreshToken na resposta
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


// Função para obter detalhes do dono do pet
async function getDonoPetDetails(token, donoPetId) {
  const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_clienteses(${donoPetId})`;
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

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar detalhes do dono do pet: ${response.statusText}`
    );
  }

  return await response.json();
}

// Rota para obter os agendamentos
app.get("/api/getBanhoTosa", verifyToken, async (req, res) => {
  try {
    const token = await getAuthToken();
    const userId = req.user.id;
    const url =
      `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_banhotosas?$filter=_cra6a_idconta_value eq ${userId}`;

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

    if (!response.ok) {
      throw new Error(`Erro ao buscar agendamentos: ${response.statusText}`);
    }

    const agendamentos = await response.json();
    const agendamentosComDetalhes = await Promise.all(
      agendamentos.value.map(async (agendamento) => {
        const donoPetDetails = await getDonoPetDetails(
          token,
          agendamento["_cra6a_donopet_value"]
        );
        agendamento.donoPetNome = donoPetDetails.cra6a_nome_pet; // Ajuste conforme o nome do campo
        return agendamento;
      })
    );

    res.status(200).json({ value: agendamentosComDetalhes });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ error: error.message });
  }
});
// Rota para obter um agendamento específico por ID
app.get("/api/getBanhoTosa/:id",  verifyToken, async (req, res) => {
  try {
    const token = await getAuthToken();
    const id = req.params.id;
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_banhotosas(${id})?$expand=cra6a_custo`;

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
    console.error("Erro ao buscar agendamento:", error);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar agendamento.",
      error: error.message,
    });
  }
});

// Rota para obter um cliente específico por ID
app.get("/api/getCliente/:id", async (req, res) => {
  try {
    const token = await getAuthToken();
    const id = req.params.id;
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_clienteses(${id})`;

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
    console.error("Erro ao buscar cliente:", error);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar cliente.",
      error: error.message,
    });
  }
});
// Rota para obter o perfil do usuário
app.get("/api/getProfile/:id", async (req, res) => {
  try {
    const token = await getAuthToken(); // Obtém o token de autenticação
    const id = req.params.id;

    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/accounts(${id})`;

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
      mensagem: "Erro ao obter perfil.",
      error: error.message,
    });
  }
});

// Rota para atualizar o perfil do usuário
app.put("/api/updateProfile", async (req, res) => {
  try {
    const { id, name, email, password } = req.body;
    const token = await getAuthToken(); // Obtém o token de autenticação

    // URL para atualizar um registro existente
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/accounts(${id})`;

    // Dados a serem enviados
    const data = {
      name: name,
      emailaddress1: email,
    };
    if (password) {
      data.cra6a_senha = password;
    }

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // Inclui o token de autenticação
      },
      body: JSON.stringify(data),
    });

    if (response.status === 204) {
      // Após uma atualização bem-sucedida, obtenha os dados atualizados
      const updatedResponse = await fetch(url, {
        method: "GET",
        headers: {
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        res.status(200).json(updatedData);
      } else {
        throw new Error("Failed to retrieve updated profile");
      }
    } else {
      const responseBody = await response.text();
      if (response.ok) {
        const responseData = JSON.parse(responseBody);
        res.status(200).json(responseData);
      } else {
        throw new Error("Network response was not ok " + response.statusText);
      }
    }
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar perfil.",
      error: error.message,
    });
  }
});

app.post("/api/clinica", verifyToken, async (req, res) => {
  try {
    const {
      nome,
      tempoAtuacao,
      faculdade,
      posGratuacao,
      imagemBase64: imagem,
      date,
    } = req.body;

    // Obtenha o ID do usuário a partir do req.user
    const userId = req.user.id;  // Certifique-se de que `req.user` contém o ID do usuário

    // Obtenha o token de autenticação para fazer a requisição à API do Dynamics
    const authToken = await getAuthToken();

    // URL para criar um novo registro
    const url = "https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_clinicas";

    // Dados a serem enviados, incluindo o ID da conta
    var record = {
      cra6a_nomeveterinario: nome,
      cra6a_anoatuacao: tempoAtuacao,
      cra6a_datanascimento: date,
      cra6a_faculdade: faculdade,
      cra6a_imagemveterinario: imagem.split(",")[1],
      cra6a_posgraduacao: posGratuacao,
      "cra6a_IdConta@odata.bind" : `/accounts(${userId})`, // Lookup
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Prefer: "odata.include-annotations=*",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(record),
    });

    console.log(`Status da Resposta: ${response.status}`);

    if (response.status == 204) {
      res.status(201).json({
        sucesso: true,
        mensagem: "Cadastro na Clinica com sucesso",
      });
    } else {
      const responseBody = await response.text();
      console.log(`Corpo da Resposta: ${responseBody}`);
      if (response.ok) {
        const responseData = JSON.parse(responseBody);
        res.status(201).json({
          sucesso: true,
          mensagem: "Cadastro realizado com sucesso!",
          data: responseData,
        });
      } else {
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


app.get("/api/getClinica", verifyToken, async (req, res) => {
  try {
    const token = await getAuthToken(); // Obtém o token de autenticação
    const userId = req.user.id;  // Obtém o ID do usuário logado

    // URL para consultar todos os registros de clínica, filtrando pelo ID da conta
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_clinicas?$filter=_cra6a_idconta_value eq ${userId}`;

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
app.get("/api/getClinica/:id", verifyToken, async (req, res) =>  {
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
app.get(
  "/api/getAgendamentosByVeterinario/:veterinarioId",
  verifyToken, async (req, res) =>  {
    try {
      const token = await getAuthToken();
      const veterinarioId = req.params.veterinarioId;
      const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_agendamentoclinicas?$filter=_cra6a_veterinario_value eq ${veterinarioId}`;

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

      if (!response.ok) {
        throw new Error(`Erro ao buscar agendamentos: ${response.statusText}`);
      }

      const agendamentos = await response.json();
      const agendamentosComDetalhes = await Promise.all(
        agendamentos.value.map(async (agendamento) => {
          const donoPetDetails = await getNomePetDetails(
            token,
            agendamento["_cra6a_nomedopet_value"]
          );
          agendamento.nomePet = donoPetDetails.cra6a_nome_pet;
          return agendamento;
        })
      );

      res.status(200).json({ value: agendamentosComDetalhes });
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Rota para obter agendamentos da clínica
app.get("/api/getAgendamentosClinica", verifyToken, async (req, res) =>  {
  try {
    const token = await getAuthToken();
    const userId = req.user.id;
    const url =
      `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_agendamentoclinicas?$filter=_cra6a_idconta_value eq ${userId}`;

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
      
      if (!response.ok) {
        console.error(`Erro HTTP: ${response.statusText}`);
        throw new Error(
          `Erro ao buscar agendamentos da clínica: ${response.statusText}`
        );
      }
      
      const agendamentos = await response.json();
      console.log("Agendamentos:", agendamentos); // Log dos agendamentos
    const agendamentosComDetalhes = await Promise.all(
      agendamentos.value.map(async (agendamento) => {
        const petDetails = await getNomePetDetails(
          token,
          agendamento["_cra6a_nomedopet_value"]
        );
        const veterinarioDetails = await getVeterinarioDetails(
          token,
          agendamento["_cra6a_veterinario_value"]
        );

        agendamento.nomePet = petDetails.cra6a_nome_pet;
        agendamento.nomeVeterinario = veterinarioDetails.cra6a_nomeveterinario;
        return agendamento;
      })
    );

    res.status(200).json({ value: agendamentosComDetalhes });
  } catch (error) {
    console.error("Erro ao buscar agendamentos da clínica:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/atualizarStatusAgendamento", verifyToken, async (req, res) =>  {
  try {
    const { cra6a_agendamentoclinicaid, cra6a_status } = req.body; // Obtém os dados do corpo da solicitação
    const token = await getAuthToken(); // Obtém o token de autenticação

    // URL para atualizar um registro existente
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_agendamentoclinicas(${cra6a_agendamentoclinicaid})`;

    // Dados a serem enviados
    const data = {
      cra6a_status: cra6a_status,
    };

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const responseBody = await response.text();
    console.log(`Status da Resposta: ${response.status}`);
    console.log(`Corpo da Resposta: ${responseBody}`);

    if (!response.ok) {
      throw new Error(
        `Erro ao atualizar status do agendamento: ${response.statusText}`
      );
    }

    // Se o status for 204, apenas retorne uma resposta de sucesso sem tentar fazer parse do corpo
    if (response.status === 204) {
      return res.status(200).json({ message: "Status atualizado com sucesso" });
    }

    // Caso contrário, faça o parse do corpo da resposta
    res.status(200).json(JSON.parse(responseBody));
  } catch (error) {
    console.error("Erro ao atualizar status do agendamento:", error);
    res.status(500).json({ error: error.message });
  }
});

// Função para obter detalhes do nome do pet
async function getNomePetDetails(token, petId) {
  const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_clienteses(${petId})`;
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

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar detalhes do nome do pet: ${response.statusText}`
    );
  }

  return await response.json();
}

// Função para obter detalhes do veterinário
async function getVeterinarioDetails(token, veterinarioId) {
  const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_clinicas(${veterinarioId})`;

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

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar detalhes do veterinário: ${response.statusText}`
    );
  }

  return await response.json();
}
app.put("/api/atualizarStatusAgendamento", async (req, res) => {
  try {
    const { cra6a_agendamentoid, cra6a_status } = req.body; // Obtém os dados do corpo da solicitação

    // Adicione logs para depuração
    console.log("Corpo da solicitação:", req.body);
    console.log("cra6a_agendamentoid:", cra6a_agendamentoid);
    console.log("cra6a_status:", cra6a_status);

    const token = await getAuthToken(); // Obtém o token de autenticação

    // URL para atualizar um registro existente
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_agendamentoclinicas(${cra6a_agendamentoid})`;

    // Dados a serem enviados
    const data = {
      cra6a_status: cra6a_status,
    };

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // Inclui o token de autenticação
      },
      body: JSON.stringify(data),
    });

    if (response.status === 204) {
      res
        .status(200)
        .json({ sucesso: true, mensagem: "Status atualizado com sucesso" });
    } else {
      const responseBody = await response.text();
      throw new Error("Network response was not ok " + response.statusText);
    }
  } catch (error) {
    console.error("Erro ao atualizar status do agendamento:", error);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar status do agendamento",
      error: error.message,
    });
  }
});

app.get("/api/getAllAgendamentos", async (req, res) => {
  try {
    const token = await getAuthToken();

    // Fetch BanhoTosa Agendamentos
    const urlBanhoTosa =
      "https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_banhotosas";
    const responseBanhoTosa = await fetch(urlBanhoTosa, {
      method: "GET",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!responseBanhoTosa.ok) {
      throw new Error(
        `Erro ao buscar agendamentos de banho/tosa: ${responseBanhoTosa.statusText}`
      );
    }

    const agendamentosBanhoTosa = await responseBanhoTosa.json();
    const agendamentosBanhoTosaComDetalhes = await Promise.all(
      agendamentosBanhoTosa.value.map(async (agendamento) => {
        const donoPetDetails = await getDonoPetDetails(
          token,
          agendamento["_cra6a_donopet_value"]
        );
        agendamento.donoPetNome = donoPetDetails.cra6a_nome_pet;
        return agendamento;
      })
    );

    // Fetch Clinica Agendamentos
    const urlClinica =
      "https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_agendamentoclinicas";
    const responseClinica = await fetch(urlClinica, {
      method: "GET",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!responseClinica.ok) {
      throw new Error(
        `Erro ao buscar agendamentos da clínica: ${responseClinica.statusText}`
      );
    }

    const agendamentosClinica = await responseClinica.json();
    const agendamentosClinicaComDetalhes = await Promise.all(
      agendamentosClinica.value.map(async (agendamento) => {
        const petDetails = await getNomePetDetails(
          token,
          agendamento["_cra6a_nomedopet_value"]
        );
        const veterinarioDetails = await getVeterinarioDetails(
          token,
          agendamento["_cra6a_veterinario_value"]
        );

        agendamento.nomePet = petDetails.cra6a_nome_pet;
        agendamento.nomeVeterinario = veterinarioDetails.cra6a_nomeveterinario;
        return agendamento;
      })
    );

    // Combine both agendamentos
    const allAgendamentos = agendamentosBanhoTosaComDetalhes.concat(
      agendamentosClinicaComDetalhes
    );
    res.status(200).json({ value: allAgendamentos });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para verificar o email
app.post("/api/verifyEmail", async (req, res) => {
  try {
    const { email } = req.body;
    const token = await getAuthToken();

    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/accounts?$filter=emailaddress1 eq '${email}'`;

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

    if (response.ok) {
      const data = await response.json();
      if (data.value.length > 0) {
        const user = data.value[0];
        res.json({
          sucesso: true,
          userId: user.accountid,
        });
      } else {
        res.json({
          sucesso: false,
          mensagem: "Email não encontrado",
        });
      }
    } else {
      throw new Error("Network response was not ok " + response.statusText);
    }
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    res.status(500).json({
      sucesso: false,
      mensagem: error.message,
    });
  }
});

// Rota para resetar a senha
app.put("/api/resetPassword", async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const token = await getAuthToken();

    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/accounts(${userId})`;

    const data = {
      cra6a_senha: newPassword,
    };

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      res.json({
        sucesso: true,
        mensagem: "Senha alterada com sucesso",
      });
    } else {
      throw new Error("Network response was not ok " + response.statusText);
    }
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res.status(500).json({
      sucesso: false,
      mensagem: error.message,
    });
  }
});


app.post('/api/estoque',  verifyToken, async (req, res) => {
  try {
    const token = await getAuthToken();
    const userId = req.user.id;
    const { nomeItem, categoria, valor, quantidade, imagemBase64: imagem } = req.body; // Captura os dados do corpo da solicitação
    const categoriaMap = {
      'Remédios': 0,
      'Brinquedos': 1,
      'Ração': 2,
      'Ossinhos e Petiscos': 3,
      'Higiene e Cosméticos': 4,
      'Roupas e Acessórios': 5,
      'Caminhas e Outros': 6,
      'Coleira Guias e Peitorais': 7
    };

    // Converte a categoria de texto para o número correspondente
    const categoriaNumerica = categoriaMap[categoria];
    const url = "https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_estoques";

    // Dados a serem enviados
    const data = {
      cra6a_nomeitem: nomeItem,
      cra6a_categoria: categoriaNumerica,
      cra6a_valor: Number(parseFloat(valor).toFixed(4)),
      cra6a_quantidade:quantidade,
      cra6a_imagem:imagem.split(",")[1],
      "cra6a_IdConta@odata.bind": `/accounts(${userId})`,
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


    console.log('Dados recebidos:', { nomeItem, categoria: categoriaNumerica, valor, quantidade });

    // Simula um salvamento bem-sucedido
    res.status(204).json({
      sucesso: true,
      mensagem: 'Estoque cadastrado com sucesso!',
      data: { nomeItem, categoria: categoriaNumerica, valor, quantidade }
    });
  } catch (error) {
    console.error('Erro ao cadastrar estoque:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao cadastrar estoque.',
      error: error.message
    });
  }
});

app.get('/api/getestoque', verifyToken, async (req, res) => {
  try {
    const token = await getAuthToken(); // Obtém o token de autenticação
    const userId = req.user.id;
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_estoques?$filter=_cra6a_idconta_value eq ${userId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      res.status(200).json(data.value); // Presumindo que os itens estão em `value`
    } else {
      const errorResponse = await response.text();
      res.status(response.status).json({ sucesso: false, mensagem: errorResponse });
    }
  } catch (error) {
    console.error('Erro ao buscar os itens de estoque:', error.message);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar os itens de estoque.',
      error: error.message,
    });
  }
});
app.patch('/api/estoque/:id', verifyToken, async (req, res) => {
  try {
    const token = await getAuthToken();
    const estoqueId = req.params.id; // ID do item a ser atualizado
    const { cra6a_quantidade } = req.body; // Captura a nova quantidade do corpo da solicitação

    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_estoques(${estoqueId})`;

    // Dados a serem enviadoss
    const data = {
      cra6a_quantidade: cra6a_quantidade,
    };

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // Inclui o token de autenticação
      },
      body: JSON.stringify(data), // Envia os dados no corpo da solicitação
    });

    console.log(`Status da Resposta: ${response.status}`); // Log do status da resposta

    if (response.ok) {
      res.status(204).json({
        sucesso: true,
        mensagem: 'Quantidade atualizada com sucesso!',
      });
    } else {
      const errorResponse = await response.text();
      res.status(response.status).json({
        sucesso: false,
        mensagem: errorResponse,
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar a quantidade do estoque:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar a quantidade do estoque.',
      error: error.message
    });
  }
});
app.patch('/api/salvarlteracaoestoque/:id', verifyToken, async (req, res) => {
  try {
    const token = await getAuthToken();
    const estoqueId = req.params.id;
    const { cra6a_quantidade, cra6a_nomeitem,cra6a_valor,cra6a_imagem } = req.body;

    const data = {
      cra6a_quantidade: cra6a_quantidade,
      cra6a_nomeitem:cra6a_nomeitem,
      cra6a_valor:cra6a_valor,
      cra6a_imagem:cra6a_imagem
    };

    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_estoques(${estoqueId})`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data), // Envia todos os campos no corpo da solicitação
    });

    console.log(`Status da Resposta: ${response.status}`);

    if (response.ok) {
      res.status(204).json({
        sucesso: true,
        mensagem: 'Item atualizado com sucesso!',
      });
    } else {
      const errorResponse = await response.text();
      res.status(response.status).json({
        sucesso: false,
        mensagem: errorResponse,
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar o item no estoque:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar o item no estoque.',
      error: error.message
    });
  }
});

app.delete('/api/estoque/:id', verifyToken, async (req, res) => {
  try {
    const token = await getAuthToken();
    const { id } = req.params;

    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_estoques(${id})`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      res.status(204).json({
        sucesso: true,
        mensagem: 'Item excluído com sucesso!',
      });
    } else {
      const errorResponse = await response.text();
      res.status(response.status).json({
        sucesso: false,
        mensagem: 'Erro ao excluir item.',
        error: errorResponse
      });
    }
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao excluir item.',
      error: error.message
    });
  }
});

app.get('/api/getTotalAgendamentosDia', verifyToken, async (req, res) => {
  try {
    const token = await getAuthToken();
    const today = new Date().toISOString().split('T')[0]; // Obtém a data de hoje no formato YYYY-MM-DD
    const userId = req.user.id;
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_agendamentoclinicas?$filter=createdon ge ${today}T00:00:00Z and createdon le ${today}T23:59:59Z and _cra6a_idconta_value eq ${userId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const totalAgendamentos = data.value.length; // Conta o número de agendamentos retornados
      res.status(200).json({ totalAgendamentos });
    } else {
      const errorResponse = await response.text();
      res.status(response.status).json({
        sucesso: false,
        mensagem: errorResponse,
      });
    }
  } catch (error) {
    console.error('Erro ao buscar total de agendamentos do dia:', error.message);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar total de agendamentos do dia.',
      error: error.message,
    });
  }
});

app.get('/api/gettotalBanhosDia', verifyToken, async (req, res) => {
  try {
    const token = await getAuthToken();
    const dataAtual = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD
    const userId = req.user.id;
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_banhotosas?$filter=createdon ge ${dataAtual}T00:00:00Z and createdon le ${dataAtual}T23:59:59Z and _cra6a_idconta_value eq ${userId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const totalBanhos = data.value.length; // Conta o número de registros
      res.status(200).json({ totalBanhos });
    } else {
      const errorResponse = await response.text();
      res.status(response.status).json({ sucesso: false, mensagem: errorResponse });
    }
  } catch (error) {
    console.error('Erro ao buscar total de banhos por dia:', error.message);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar total de banhos por dia.',
      error: error.message
    });
  }
});

app.get('/api/getTotalFaturamentoMes', verifyToken, async (req, res) => {
  try {
    const token = await getAuthToken();
    const userId = req.user.id;
    const inicioDoMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const fimDoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();

    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_banhotosas?$filter=createdon ge ${inicioDoMes} and createdon le ${fimDoMes} and _cra6a_idconta_value eq ${userId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const totalFaturamento = data.value.reduce((acc, item) => acc + item.cra6a_valor, 0); // Soma os valores
      res.status(200).json({ totalFaturamento });
    } else {
      const errorResponse = await response.text();
      res.status(response.status).json({ sucesso: false, mensagem: errorResponse });
    }
  } catch (error) {
    console.error('Erro ao buscar total de faturamento do mês:', error.message);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar total de faturamento do mês.',
      error: error.message,
    });
  }
});

app.get('/api/getFaturamentoMensal', verifyToken, async (req, res) => {
  try {
    const token = await getAuthToken();
    const currentYear = new Date().getFullYear();
    const userId = req.user.id;
    // Inicializa um array para armazenar o faturamento de cada mês
    let faturamentoMensal = Array(12).fill(0);

    // Itera por cada mês do ano
    for (let month = 0; month < 12; month++) {
      // Define o primeiro e o último dia do mês
      const inicioDoMes = new Date(currentYear, month, 1).toISOString();
      const fimDoMes = new Date(currentYear, month + 1, 0).toISOString();

      // Define a URL da requisição com os filtros de data
      const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_banhotosas?$filter=createdon ge ${inicioDoMes} and createdon le ${fimDoMes} and _cra6a_idconta_value eq ${userId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const totalFaturamento = data.value.reduce((acc, item) => acc + (item.cra6a_valor || 0), 0);
        faturamentoMensal[month] = totalFaturamento;
      } else {
        const errorResponse = await response.text();
        console.error(`Erro ao buscar faturamento para o mês ${month + 1}:`, errorResponse);
      }
    }

    // Retorna o faturamento mensal
    res.status(200).json({ faturamentoMensal });
  } catch (error) {
    console.error('Erro ao buscar faturamento mensal:', error.message);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar faturamento mensal.',
      error: error.message,
    });
  }
});

app.get('/api/getAgendamentosBanhoClinicaMes', verifyToken, async (req, res) => {
  try {
    const token = await getAuthToken();
    const inicioDoAno = `${new Date().getFullYear()}-01-01T00:00:00Z`;
    const fimDoAno = `${new Date().getFullYear()}-12-31T23:59:59Z`;
    const userId = req.user.id;
    // Agendamentos de Banho
    const urlBanho = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_banhotosas?$filter=createdon ge ${inicioDoAno} and createdon le ${fimDoAno} and _cra6a_idconta_value eq ${userId}`;
    const responseBanho = await fetch(urlBanho, {
      method: 'GET',
      headers: {
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const dataBanho = await responseBanho.json();
    const agendamentosBanho = new Array(12).fill(0);

    dataBanho.value.forEach(item => {
      const mes = new Date(item.createdon).getMonth();
      agendamentosBanho[mes]++;
    });

    // Agendamentos de Clínica
    const urlClinica = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_agendamentoclinicas?$filter=createdon ge ${inicioDoAno} and createdon le ${fimDoAno} and _cra6a_idconta_value eq ${userId}`;
    const responseClinica = await fetch(urlClinica, {
      method: 'GET',
      headers: {
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const dataClinica = await responseClinica.json();
    const agendamentosClinica = new Array(12).fill(0);

    dataClinica.value.forEach(item => {
      const mes = new Date(item.createdon).getMonth();
      agendamentosClinica[mes]++;
    });

    res.status(200).json({ agendamentosBanho, agendamentosClinica });
  } catch (error) {
    console.error('Erro ao buscar agendamentos de banho e clínica do mês:', error.message);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar agendamentos de banho e clínica do mês.',
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
