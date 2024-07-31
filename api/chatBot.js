const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: "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",
});

const faqs = {
  "Qual é o horário de funcionamento?": "Nosso horário de funcionamento é das 8h às 18:30 de segunda a sábado.",
  "Como faço um pedido?": "Você pode fazer um pedido através do nosso WhatsApp.",
  "Quais são as formas de pagamento aceitas?": "Aceitamos cartões de crédito, débito e pagamentos via Pix."
};
class Bot{


  async main(message) {
    const normalizedMessage = message.toLowerCase().replace(/[?]/g, '');
    if (faqs[normalizedMessage]) {
      return faqs[normalizedMessage];
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        // {
        //   role: "system",
        //   content:
        //     "You are a poetic assistant, skilled in explaining complex programming concepts with creative flair.",
        // },
        {
          role: "user",
          content:message,
        },
      ],
    });

    return completion.choices[0].message.content
  }
}

module.exports = Bot;