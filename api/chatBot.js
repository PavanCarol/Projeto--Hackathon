const { OpenAI } = require("openai");
const fetch = require("node-fetch");

const openai = new OpenAI({
  apiKey: "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",
});

class Bot {
  constructor(getAuthToken) {
    this.getAuthToken = getAuthToken; // Adicione getAuthToken ao construtor
    this.steps = [
      "Qual é o seu nome?",
      "Qual é o seu número de telefone?",
      "Qual é o nome do seu pet?",
      "Qual é a raça do seu pet?",
      "Qual é o porte do seu pet?",
      "Seu pet é bravo?",
    ];
    this.responses = [];
    this.currentStep = 0;
    this.informandoCadastro = false;
    console.log("Role do Bot: atendimento");
  }

  async main(message) {
    if (this.isAppointmentRequest(message) || this.informandoCadastro) {
      if (!this.informandoCadastro) {
        this.informandoCadastro = true;
        this.currentStep = 0;
        return (
          "Para marcar um horário, preciso de algumas informações. Vamos começar. " +
          this.steps[this.currentStep++]
        );
      }

      if (this.currentStep > 0) {
        this.responses[this.currentStep - 1] = message;
      }

      if (this.currentStep < this.steps.length) {
        return this.steps[this.currentStep++];
      } else {
        this.responses[this.currentStep - 1] = message;
        const response = await this.enviarParaPowerApps();
        if (response) {
          this.reset();
          return "Cadastro realizado com sucesso! Agora podemos marcar o banho.";
        } else {
          this.reset();
          return "Ocorreu um erro ao realizar o cadastro.";
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
      const token = await this.getAuthToken(); // Use this.getAuthToken()
      const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_clienteses`;

      const data = {
        cra6a_nome_pet: this.responses[0],
        cra6a_numero_donopet: this.responses[1],
        cra6a_nome_donopet: this.responses[2],
        cra6a_raca_pet: this.responses[3],
        cra6a_porte_pet: this.responses[4],
        cra6a_petebravo: this.responses[5].toLowerCase() === "sim",
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
        body: JSON.stringify(data),
      });
      console.log(`Status da Resposta: ${response.status}`); // Adiciona log para status da resposta
      if (response.status == 204) {
        return response.ok;
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
    this.responses = [];
    this.currentStep = 0;
    this.informandoCadastro = false;
  }
}
module.exports = Bot;
// async main(message) {
//   const prompt = this.gerarPrompt(message);
//   console.log("Prompt gerado:", prompt);

//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 150,
//     });
//     console.log("Resposta da API:", response);
//     return response.choices[0].message.content.trim();
//   } catch (error) {
//     console.error("Erro ao chamar a API da OpenAI:", error);
//     throw new Error("Erro ao processar a solicitação");
//   }
// }

// gerarPrompt(message) {
//   const roleDescription =
//     "Você é um atendente muito gentil e vai atender ao cliente com educação.";
//   return `${roleDescription} ${message}`;
// }
