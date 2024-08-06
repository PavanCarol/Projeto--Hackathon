const { OpenAI } = require("openai");
const fetch = require("node-fetch");

const openai = new OpenAI({
  apiKey: "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",
});

function parseDateTime(input) {
  const datePattern = /(\d{2})\/(\d{2})(?:\/(\d{4}))?/;
  const timePattern = /(\d{2}):(\d{2})/;

  const dateMatch = input.match(datePattern);
  const timeMatch = input.match(timePattern);

  if (dateMatch && timeMatch) {
    const [_, day, month, year] = dateMatch;
    const [__, hour, minute] = timeMatch;
    const currentYear = new Date().getFullYear();
    const finalYear = year || currentYear;
    return new Date(`${finalYear}-${month}-${day}T${hour}:${minute}:00`);
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
      "Seu pet é bravo?",
    ];
    this.stepsAgendamento = [
      "Qual é o horário desejado para o banho do seu pet?",
      "Podemos enfeitar o seu pet?",
      "Podemos passar perfume no seu pet?",
    ];
    this.responsesCadastro = [];
    this.responsesAgendamento = [];
    this.currentStep = 0;
    this.informandoCadastro = false;
    this.informandoAgendamento = false;
    console.log("Role do Bot: atendimento");
  }

  async main(message) {
    if (
      this.isAppointmentRequest(message) ||
      this.informandoCadastro ||
      this.informandoAgendamento
    ) {
      if (!this.informandoCadastro && !this.informandoAgendamento) {
        this.informandoCadastro = true;
        this.currentStep = 0;
        return (
          "Para marcar um horário, preciso de algumas informações. Vamos começar. " +
          this.stepsCadastro[this.currentStep++]
        );
      }

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
            const disponibilidade = await this.verificarDisponibilidade(
              token,
              horario.toISOString()
            );
            if (!disponibilidade) {
              this.reset();
              return "Infelizmente já temos um agendamento nesse horário. Por favor, escolha outro horário.";
            }
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

  async enviarParaPowerApps() {
    try {
      const token = await this.getAuthToken();
      const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_clienteses`;

      const data = {
        cra6a_nome_pet: this.responsesCadastro[0],
        cra6a_numero_donopet: this.responsesCadastro[1],
        cra6a_nome_donopet: this.responsesCadastro[2],
        cra6a_raca_pet: this.responsesCadastro[3],
        cra6a_porte_pet: this.responsesCadastro[4],
        cra6a_petebravo: this.responsesCadastro[5].toLowerCase() === "sim",
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
      // const data = {
      //   cra6a_databanhotosa: horario.toISOString(),
      //   "cra6a_donopet@odata.bind": `/cra6a_clienteses(${this.entityId})`,
      //   cra6a_enfeite: this.responsesAgendamento[1].toLowerCase() === "sim",
      //   cra6a_perfume: this.responsesAgendamento[2].toLowerCase() === "sim",
      // };
      var record = {};
      record[
        "cra6a_donoPet@odata.bind"
      ] = `/cra6a_clienteses(${this.entityId})`; // Lookup
      record.cra6a_databanhotosa = horario.toISOString(); // Date Time
      record.cra6a_perfume =
        this.responsesAgendamento[2].toLowerCase() === "sim";
      record.cra6a_enfeite =
        this.responsesAgendamento[1].toLowerCase() === "sim";
      // console.log("Data payload:", JSON.stringify(data));

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
  }
}

module.exports = Bot;
