const { OpenAI } = require("openai");
const fetch = require("node-fetch");

const openai = new OpenAI({
  apiKey: "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",
});

function parseDateTime(input) {
  const datePattern = /(\d{2})\/(\d{2})(?:\/(\d{4}))?/;
  const timePattern = /(\d{1,2}):(\d{2})/;

  const dateMatch = input.match(datePattern);
  const timeMatch = input.match(timePattern);

  if (dateMatch && timeMatch) {
    const [_, day, month, year] = dateMatch;
    const [__, hour, minute] = timeMatch;
    const currentYear = new Date().getFullYear();
    const finalYear = year || currentYear;
    const dateStr = `${finalYear}-${month}-${day}T${hour.padStart(
      2,
      "0"
    )}:${minute.padStart(2, "0")}:00`;
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

class Bot {
  constructor(getAuthToken) {
    this.getAuthToken = getAuthToken;
    this.stepsCadastro = [
      "Qual é o seu nome?",
      "Qual é o seu número de telefone?",
      "Qual é o nome do seu pet?",
      "Qual é a raça do seu pet?",
      "Qual é o porte do seu pet?",
    ];
    this.stepsAgendamento = [
      "Qual é o horário desejado para o banho do seu pet?",
      "Podemos colocar acessório o seu pet?",
      "Podemos passar perfume no seu pet?",
      "Escolha uma opção para o tipo de serviço: 1 para Banho, 2 para Tosa, 3 para Banho e Tosa, 4 para Tosa Completa, 5 para Tosa Higienica",
    ];
    this.responsesCadastro = [];
    this.responsesAgendamento = [];
    this.currentStep = 0;
    this.informandoCadastro = false;
    this.informandoAgendamento = false;
    this.verificandoCadastro = true;
    this.telefoneVerificado = false; // Inicializar telefoneVerificado
    console.log("Role do Bot: atendimento");
  }

  async main(message) {
    if (this.verificandoCadastro) {
      if (message.toLowerCase() === "sim") {
        this.verificandoCadastro = false;
        this.telefoneVerificado = true; // Habilitar a verificação de telefone
        this.currentStep = 0;
        return "Por favor, informe o seu número de telefone para verificarmos o cadastro.";
      } else if (message.toLowerCase() === "não") {
        this.verificandoCadastro = false;
        this.informandoCadastro = true;
        this.currentStep = 0;
        return (
          "sem problemas,vamos começar o seu cadastro. " +
          this.stepsCadastro[this.currentStep++]
        );
      } else {
        return "Olá, para agendar um horario de banho ou tosa precisamos verificar seu cadastro antes. Você já possui cadastro? (Responda 'sim' ou 'não')";
      }
    } else if (this.telefoneVerificado) {
      this.telefoneVerificado = false; // Resetar a verificação de telefone após verificar
      return await this.verificarTelefone(message);
    }

    if (this.informandoCadastro || this.informandoAgendamento) {
      if (this.informandoCadastro) {
        this.responsesCadastro[this.currentStep - 1] = message;
        if (this.currentStep < this.stepsCadastro.length) {
          return this.stepsCadastro[this.currentStep++];
        } else {
          this.responsesCadastro[this.currentStep - 1] = message;
          const response = await this.enviarParaPowerApps();
          if (response) {
            this.informandoCadastro = false;
            this.informandoAgendamento = true;
            this.currentStep = 0;
            return (
              "Cadastro realizado com sucesso! Agora vamos agendar o banho. " +
              this.stepsAgendamento[this.currentStep++]
            );
          } else {
            this.reset();
            return "Ocorreu um erro ao realizar o cadastro.";
          }
        }
      }

      if (this.informandoAgendamento) {
        this.responsesAgendamento[this.currentStep - 1] = message;
        if (this.currentStep < this.stepsAgendamento.length) {
          if (this.currentStep === 0) {
            const horario = parseDateTime(this.responsesAgendamento[0]);
            if (!horario) {
              return "Não consegui entender a data e o horário. Por favor, repita a data e horário desejado no formato DD/MM/AAAA às HH:MM.";
            }
            const token = await this.getAuthToken();
            // const disponibilidade = await this.verificarDisponibilidade(
            //   token,
            //   horario.toISOString()
            // );
            // if (!disponibilidade) {
            //   this.reset();
            //   return "Infelizmente já temos um agendamento nesse horário. Por favor, escolha outro horário.";
            // }
          }
          return this.stepsAgendamento[this.currentStep++];
        } else {
          this.responsesAgendamento[this.currentStep - 1] = message;
          const response = await this.agendarBanho();
          if (response) {
            this.reset();
            return "Banho agendado com sucesso!";
          } else {
            this.reset();
            return "Ocorreu um erro ao agendar o banho.";
          }
        }
      }
    } else {
      return await this.handleGeneralMessage(message);
    }
  }

  isAppointmentRequest(message) {
    const keywords = [
      "marcar um horário",
      "banho",
      "tosa",
      "meu cachorro",
      "meu pet",
    ];
    return keywords.some((keyword) => message.toLowerCase().includes(keyword));
  }
  // async verificarDisponibilidade(token, horario) {
  //   const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_banhotosas?$filter=cra6a_databanhotosa eq ${horario}`;

  //   const response = await fetch(url, {
  //     method: "GET",
  //     headers: {
  //       "OData-MaxVersion": "4.0",
  //       "OData-Version": "4.0",
  //       "Content-Type": "application/json; charset=utf-8",
  //       Accept: "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //   });

  //   if (!response.ok) {
  //     throw new Error(
  //       `Erro ao verificar disponibilidade: ${response.statusText}`
  //     );
  //   }

  //   const data = await response.json();
  //   return data.value.length === 0; // Se não houver agendamentos no horário, retorna true
  // }

  async verificarTelefone(message) {
    const token = await this.getAuthToken();
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_clienteses?$filter=cra6a_numero_donopet eq '${message}'`;

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

    const data = await response.json();
    if (data.value.length > 0) {
      this.entityId = data.value[0].cra6a_clientesid;
      this.telefoneVerificado = false; // Resetar verificação de telefone
      this.informandoAgendamento = true;
      this.currentStep = 0;
      return (
        "Cadastro encontrado! Vamos agendar o banho. " +
        this.stepsAgendamento[this.currentStep++]
      );
    } else {
      this.telefoneVerificado = false; // Resetar verificação de telefone
      this.informandoCadastro = true;
      this.currentStep = 0;
      return (
        "Cadastro não encontrado. Vamos começar o seu cadastro. " +
        this.stepsCadastro[this.currentStep++]
      );
    }
  }

  async enviarParaPowerApps() {
    try {
      const token = await this.getAuthToken();
      const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_clienteses`;

      const data = {
        cra6a_nome_donopet: this.responsesCadastro[0],
        cra6a_numero_donopet: this.responsesCadastro[1],
        cra6a_nome_pet: this.responsesCadastro[2],
        cra6a_raca_pet: this.responsesCadastro[3],
        cra6a_porte_pet: this.responsesCadastro[4],
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
        body: JSON.stringify(data),
      });

      if (response.status == 204 || response.ok) {
        const entityIdHeader = response.headers.get("OData-EntityId");
        if (entityIdHeader) {
          const entityId = entityIdHeader.match(/\(([^)]+)\)/)[1];
          this.entityId = entityId;
          return true;
        } else {
          console.error(
            "ID da entidade não encontrado no cabeçalho da resposta."
          );
          return false;
        }
      } else {
        const responseBody = await response.text();
        console.log(`Corpo da Resposta: ${responseBody}`);
        throw new Error("Network response was not ok " + response.statusText);
      }
    } catch (error) {
      console.error("Erro:", error);
      return false;
    }
  }

  async agendarBanho() {
    try {
      const token = await this.getAuthToken();
      const horario = parseDateTime(this.responsesAgendamento[0]);
      if (!horario) {
        throw new Error("Não consegui entender a data e o horário.");
      }
      const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_banhotosas`;
      const record = {
        "cra6a_donoPet@odata.bind": `/cra6a_clienteses(${this.entityId})`,
        cra6a_databanhotosa: horario.toISOString(),
        cra6a_perfume: this.responsesAgendamento[2].toLowerCase() === "sim",
        cra6a_enfeite: this.responsesAgendamento[1].toLowerCase() === "sim",
        cra6a_banhooutosa: parseInt(this.responsesAgendamento[3]),
      };

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
      const responseBody = await response.text();
      console.log(`Corpo da Resposta: ${responseBody}`);

      if (!response.ok) {
        throw new Error("Erro ao agendar banho: " + responseBody);
      }

      return response.ok;
    } catch (error) {
      console.error("Erro ao agendar banho:", error);
      return false;
    }
  }

  async handleGeneralMessage(message) {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
      max_tokens: 150,
    });
    return response.choices[0].message.content.trim();
  }

  reset() {
    this.responsesCadastro = [];
    this.responsesAgendamento = [];
    this.currentStep = 0;
    this.informandoCadastro = false;
    this.informandoAgendamento = false;
    this.verificandoCadastro = false; // Resetar verificação de cadastro
  }
}

module.exports = Bot;
