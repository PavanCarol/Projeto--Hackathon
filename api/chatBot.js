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

function mapearTipoServico(tipoServico) {
  switch (tipoServico) {
    case 1:
      return "Banho";
    case 2:
      return "Banho e Tosa na máquina";
    case 3:
      return "Banho e Tosa na tesoura";
    case 4:
      return "Banho e Tosa higiênica";
    case 5:
      return "Banho e Tosa completa";
    default:
      return "Tipo desconhecido";
  }
}

class Bot {
  constructor(getAuthToken, accountId) {
    this.getAuthToken = getAuthToken;
    this.accountId = accountId;
    this.servicoPrecos = {};
    this.stepsCadastro = [
      "Qual é o seu nome?",
      "Qual é o seu número de telefone?",
      "Qual é o nome do seu pet?",
      "Qual é a raça do seu pet?",
      // "Por favor, informe o porte do seu pet (Mini, Pequeno, Médio ou Grande):",
    ];
    this.stepsAgendamento = [
      "Qual é o horário desejado para o banho do seu pet? Por favor responda com a data DD/MM e o horário 00:00.",
      "Podemos colocar acessório no seu pet?",
      "Podemos passar perfume no seu pet?",
      this.getServicoOpcoes(accountId), // Mostrar opções de serviço
    ];
    this.stepsClinica = [
      "Qual é o horário desejado para a consulta?",
      "Escolha um dos veterinários: ",
    ];
    this.responsesCadastro = [];
    this.responsesAgendamento = [];
    this.responsesClinica = [];
    this.currentStep = 0;
    this.informandoCadastro = false;
    this.informandoAgendamento = false;
    this.informandoClinica = false;
    this.verificandoCadastro = true;
    this.telefoneVerificado = false;
    this.escolhendoServico = false;
    this.awaitingConfirmation = false;
    this.veterinarios = [];
    this.agendamentoConcluido = false;  // Novo estado para verificar conclusão de agendamento
    console.log("Role do Bot: atendimento");
    this.loadServicoPrecos(accountId);
  }
  async getServicoOpcoes(accountId) {
    if (Object.keys(this.servicoPrecos).length === 0) {
      await this.loadServicoPrecos(accountId);
    }
  
    let opcoes = "Escolha uma opção para o tipo de serviço:\n";
  
    for (const [key, servico] of Object.entries(this.servicoPrecos)) {
      opcoes += `
  ${servico.tipo} (R$${servico.preco.toFixed(2)}): ${key}`; // Inclui o valor do serviço e o número da opção
    }
  
    return opcoes.trim(); // Retorna a string formatada
  }

  async loadServicoPrecos(accountId) {
    try {
      console.log('Account ID:', accountId); 
      const token = await this.getAuthToken();
      const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_custos?$filter=_cra6a_idconta_value eq ${accountId}`;
  
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
        throw new Error(`Erro ao carregar preços de serviços: ${response.statusText}`);
      }
  
      const data = await response.json();
      this.servicoPrecos = {};
      if (data.value.length === 0) {
        console.log("Nenhum serviço encontrado para este Account ID.");
      } else {
        data.value.forEach((item, index) => {
          let nomeServico = "";
  
          switch (item.cra6a_tipodebanho) {
            case 1:
              nomeServico = "Banho";
              break;
            case 2:
              nomeServico = "Banho e Tosa na máquina";
              break;
            case 3:
              nomeServico = "Banho e Tosa na tesoura";
              break;
            case 4:
              nomeServico = "Banho e Tosa higiênica";
              break;
              case 5:
                nomeServico = "Banho e Tosa completa";
                break;
              default:
                nomeServico = "Tipo desconhecido";
            }
    
            // Armazena o serviço e seu preço no objeto `servicoPrecos`
            this.servicoPrecos[index + 1] = {
              tipo: nomeServico,
              preco: item.cra6a_valor,
            };
          });
        }
      } catch (error) {
        console.error("Erro ao carregar preços de serviços:", error);
      }
    }
  
  async calcularValorBanho(tipoBanho) {
    try {
      console.log("Calculando valor do banho para Account ID:", this.accountId);
      const token = await this.getAuthToken();
  
      // Construa a URL com os parâmetros corretamente codificados
      const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_custos?$filter=cra6a_tipodebanho eq ${encodeURIComponent(tipoBanho)} and _cra6a_idconta_value eq ${encodeURIComponent(this.accountId)}`;
  
      console.log("URL gerada:", url); // Adicione um log para verificar a URL
  
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
          `Erro ao carregar valor do serviço: ${response.statusText}`
        );
      }
  
      const data = await response.json();
      if (data.value.length > 0) {
        return data.value[0].cra6a_valor; // Retornar o valor encontrado
      } else {
        throw new Error(
          "Nenhum valor encontrado para os critérios fornecidos."
        );
      }
    } catch (error) {
      console.error("Erro ao calcular o valor do banho:", error);
      return "Indisponível"; // Retornar uma mensagem de erro caso algo dê errado
    }
  }
  
  async main(message, accountId) {
    const mensagemBaixa = message.toLowerCase();

    // Verifica se o usuário deseja iniciar um novo agendamento e se o agendamento anterior foi concluído
    if (this.agendamentoFeito && (mensagemBaixa.includes("agendar") || mensagemBaixa.includes("banho") || mensagemBaixa.includes("consulta"))) {
      this.reset();  // Reseta o estado do bot apenas se o agendamento anterior foi feito
  }

    // A lógica de reset acima deve garantir que `verificandoCadastro` seja verdadeiro após o reset
    if (this.verificandoCadastro) {
        if (mensagemBaixa === "sim") {
            this.verificandoCadastro = false;
            this.telefoneVerificado = true; 
            this.currentStep = 0;
            return "Por favor, informe o seu número de telefone para verificarmos o cadastro.";
        } else if (mensagemBaixa === "não") {
            this.verificandoCadastro = false;
            this.informandoCadastro = true;
            this.currentStep = 0;
            return "Sem problemas, vamos começar o seu cadastro. " + this.stepsCadastro[this.currentStep++];
        } else {
            return "Olá, para agendar um horário de banho ou uma consulta precisamos verificar seu cadastro antes. Você já possui cadastro? (Responda 'sim' ou 'não')";
        }
    } else if (this.telefoneVerificado) {
        this.telefoneVerificado = false;
        return await this.verificarTelefone(message);
    } else if (this.escolhendoServico) {
        if (mensagemBaixa.includes("banho")) {
            this.escolhendoServico = false;
            this.informandoAgendamento = true;
            this.currentStep = 0;
            return this.stepsAgendamento[this.currentStep++];
        } else if (mensagemBaixa.includes("clinica") || mensagemBaixa.includes("clínica")) {
            this.escolhendoServico = false;
            this.informandoClinica = true;
            this.currentStep = 0;
            return await this.stepsClinica[this.currentStep++];
        } else {
            return "Por favor, escolha entre 'banho' ou 'clínica'.";
        }
    }

    if (this.informandoCadastro || this.informandoAgendamento || this.informandoClinica) {
        if (this.informandoCadastro) {
            this.responsesCadastro[this.currentStep - 1] = message;
            if (this.currentStep < this.stepsCadastro.length) {
                return this.stepsCadastro[this.currentStep++];
            } else {
                const response = await this.enviarParaPowerApps();
                if (response) {
                    this.informandoCadastro = false;
                    this.escolhendoServico = true;
                    this.currentStep = 0;
                    return "Cadastro realizado com sucesso! Você deseja agendar um banho ou marcar uma consulta? (Responda 'banho' ou 'clínica')";
                } else {
                    this.reset();
                    return "Ocorreu um erro ao realizar o cadastro.";
                }
            }
        }
        if (this.awaitingConfirmation) {
            if (mensagemBaixa === "sim") {
                const response = await this.agendarBanho(accountId);
                if (response) {
                    this.agendamentoFeito = true;  // Define a flag como true após agendamento
                    this.reset();  // Reseta o estado após o agendamento
                    return "Banho agendado com sucesso!";
                } else {
                    this.reset();
                    return "Ocorreu um erro ao agendar o banho.";
                }
            } else if (mensagemBaixa === "não") {
                this.reset();
                return "Agendamento cancelado.";
            } else {
                return "Por favor, responda com 'sim' ou 'não'.";
            }
        }
        if (this.informandoAgendamento) {
            this.responsesAgendamento[this.currentStep - 1] = message;
            if (this.currentStep < this.stepsAgendamento.length) {
                return this.stepsAgendamento[this.currentStep++];
            } else {
                const tipoServico = parseInt(this.responsesAgendamento[3]);
                const valor = await this.calcularValorBanho(tipoServico);
                this.responsesAgendamento[this.currentStep - 1] = message;
                const tipoServicoLabel = mapearTipoServico(tipoServico);
                this.awaitingConfirmation = true;
                return `Então seu banho seria o ${tipoServicoLabel} o valor R$${valor}. Deseja confirmar o agendamento? (sim/não)`;
            }
        }

        if (this.informandoClinica) {
            this.responsesClinica[this.currentStep - 1] = message;
            if (this.currentStep < this.stepsClinica.length) {
                if (this.currentStep === 1) {
                    const veterinarios = await this.listarVeterinarios();
                    this.currentStep++;
                    return "Escolha um dos veterinários: " + veterinarios.join(", ");
                }
                return this.stepsClinica[this.currentStep++];
            } else {
                if (this.isVeterinarioValido(message)) {
                    this.responsesClinica[this.currentStep - 1] = message;
                    const response = await this.agendarClinica(accountId);
                    if (response) {
                        this.agendamentoFeito = true;  // Define a flag como true após agendamento
                        this.reset();  // Reseta o estado após a consulta ser agendada
                        return "Consulta agendada com sucesso!";
                    } else {
                        this.reset();
                        return "Ocorreu um erro ao agendar a consulta.";
                    }
                } else {
                    const veterinarios = await this.listarVeterinarios();
                    return "Veterinário inválido. Escolha um dos veterinários: " + veterinarios.join(", ");
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
      this.escolhendoServico = true;
      this.currentStep = 0;
      return "Cadastro encontrado! Você deseja agendar um banho ou marcar uma consulta? (Responda 'banho' ou 'clínica')";
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

  async agendarBanho(accountId) {
    try {
        const token = await this.getAuthToken();
        const horario = parseDateTime(this.responsesAgendamento[0]);
        if (!horario) {
            throw new Error("Não consegui entender a data e o horário.");
        }

        const tipoServico = parseInt(this.responsesAgendamento[3]);
        const servico = this.servicoPrecos[tipoServico];

        // Buscar o ID do custo relacionado ao tipo de serviço
        const urlCusto = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_custos?$filter=cra6a_tipodebanho eq ${encodeURIComponent(tipoServico)}`;
        const responseCusto = await fetch(urlCusto, {
            method: "GET",
            headers: {
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0",
                "Content-Type": "application/json; charset=utf-8",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!responseCusto.ok) {
            throw new Error("Erro ao buscar o custo relacionado: " + responseCusto.statusText);
        }

        const dataCusto = await responseCusto.json();
        if (dataCusto.value.length === 0) {
            throw new Error("Nenhum custo encontrado para o tipo de serviço fornecido.");
        }

        const custoId = dataCusto.value[0].cra6a_custoid; // Supondo que 'cra6a_custoid' é o nome lógico do ID na tabela de custos

        const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_banhotosas`;
        const record = {
            "cra6a_donoPet@odata.bind": `/cra6a_clienteses(${this.entityId})`,
            "cra6a_IdConta@odata.bind": `/accounts(${accountId})`, // Aqui você utiliza o accountId passado como argumento
            cra6a_databanhotosa: horario.toISOString(),
            cra6a_perfume: this.responsesAgendamento[2].toLowerCase() === "sim",
            cra6a_enfeite: this.responsesAgendamento[1].toLowerCase() === "sim",
            cra6a_banhooutosa: tipoServico, // Número do serviço
            "cra6a_custo@odata.bind": `/cra6a_custos(${custoId})`, // Associando o custo correto
            cra6a_valor: servico.preco, // Preço do serviço
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

        if (!response.ok) {
            throw new Error("Erro ao agendar banho: " + response.statusText);
        }

        return response.ok;
    } catch (error) {
        console.error("Erro ao agendar banho:", error);
        return false;
    }
}

  async agendarClinica(accountId) {
    try {
      const token = await this.getAuthToken();
      const horario = parseDateTime(this.responsesClinica[0]);
      if (!horario) {
        throw new Error("Não consegui entender a data e o horário.");
      }
      const veterinario = this.getVeterinarioId(this.responsesClinica[1]);
      if (!veterinario) {
        throw new Error("Veterinário não encontrado.");
      }
      const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_agendamentoclinicas`;
      const record = {
        "cra6a_NomedoPet@odata.bind": `/cra6a_clienteses(${this.entityId})`,
        cra6a_horariodaconsulta: horario.toISOString(),
        "cra6a_IdConta@odata.bind": `/accounts(${accountId})`,
        "cra6a_veterinario@odata.bind": `/cra6a_clinicas(${veterinario})`,

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
        throw new Error("Erro ao agendar consulta: " + responseBody);
      }

      return response.ok;
    } catch (error) {
      console.error("Erro ao agendar consulta:", error);
      return false;
    }
  }

  async listarVeterinarios() {
    const token = await this.getAuthToken();
    const url = `https://org4d13d757.crm2.dynamics.com/api/data/v9.2/cra6a_clinicas?$select=cra6a_nomeveterinario,cra6a_clinicaid`;

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
      throw new Error(`Erro ao listar veterinários: ${response.statusText}`);
    }

    const data = await response.json();
    this.veterinarios = data.value.map((vet) => ({
      nome: vet.cra6a_nomeveterinario,
      id: vet.cra6a_clinicaid,
    }));
    return this.veterinarios.map((vet) => vet.nome); // Retorna apenas os nomes
  }

  getVeterinarioId(nome) {
    const veterinario = this.veterinarios.find(
      (vet) => vet.nome.toLowerCase() === nome.toLowerCase()
    );
    return veterinario ? veterinario.id : null;
  }

  isVeterinarioValido(nome) {
    return this.veterinarios.some(
      (vet) => vet.nome.toLowerCase() === nome.toLowerCase()
    );
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
    this.responsesClinica = [];
    this.currentStep = 0;
    this.informandoCadastro = false;
    this.informandoAgendamento = false;
    this.informandoClinica = false;
    this.verificandoCadastro = true; // Sempre voltar para a verificação de cadastro
    this.telefoneVerificado = false; // Redefine a verificação de telefone
    this.escolhendoServico = false;
    this.awaitingConfirmation = false;
    this.agendamentoFeito = false;
}
}

module.exports = Bot;
