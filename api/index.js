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
    const { question, userId } = req.body;
    let bot = botInstances.get(userId);
    if (!bot) {
      bot = new Bot(getAuthToken); // Passe a função getAuthToken ao construtor do Bot
      botInstances.set(userId, bot);
    }
    const resposta = await bot.main(question);
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
app.post("/api/categoriaBanho", async (req, res) => {
  try {
    const { tipoBanho, porte, pelagem, valor } = req.body; // Captura os dados do corpo da requisição
    const token = await getAuthToken(); // Obtém o token de autenticação

    // URL para o endpoint da API do Dataverse ou outro serviço
    const url =
      "https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_custos";

    // Mapear os valores de texto para os valores numéricos de Choice
    const record = {
      cra6a_tipodebanho: mapToChoiceValue("cra6a_tipodebanho", tipoBanho),
      cra6a_porte: mapToChoiceValue("cra6a_porte", porte),
      cra6a_pelagem: mapToChoiceValue("cra6a_pelagem", pelagem),
      cra6a_valor: Number(parseFloat(valor).toFixed(4)), // Formata o valor como Currency
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
        .status(201)
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
app.get("/api/getcategoriaBanho", async (req, res) => {
  try {
    const token = await getAuthToken(); // Obtém o token de autenticação

    // URL para o endpoint da API do Dataverse ou outro serviço
    const url =
      "https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_custos";

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
      cra6a_porte: mapToChoiceValue("cra6a_porte", data.cra6a_porte),
      cra6a_pelagem: mapToChoiceValue("cra6a_pelagem", data.cra6a_pelagem),
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
app.get("/api/getBanhoTosa", async (req, res) => {
  try {
    const token = await getAuthToken();
    const url =
      "https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_banhotosas";

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
app.get("/api/getBanhoTosa/:id", async (req, res) => {
  try {
    const token = await getAuthToken();
    const id = req.params.id;
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_banhotosas(${id})`;

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
app.get(
  "/api/getAgendamentosByVeterinario/:veterinarioId",
  async (req, res) => {
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
app.get("/api/getAgendamentosClinica", async (req, res) => {
  try {
    const token = await getAuthToken();
    const url =
      "https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_agendamentoclinicas";

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
        `Erro ao buscar agendamentos da clínica: ${response.statusText}`
      );
    }

    const agendamentos = await response.json();
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

app.put("/api/atualizarStatusAgendamento", async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
