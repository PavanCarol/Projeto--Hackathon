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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
