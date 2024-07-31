const { OpenAI } = require("openai");
const fs = require('fs');
const openai = new OpenAI({
  apiKey: "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",
});

class Bot{
  constructor(config) {
    this.config = config;
  }

  async main(message) {
    if (this.config && this.config.perguntasFrequentes) {
      const perguntaFrequente = this.config.perguntasFrequentes.find(p => message.toLowerCase().includes(p.titulo.toLowerCase()));
      if (perguntaFrequente) {
        return perguntaFrequente.pergunta;
      }
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
          content:
            message,
        },
      ],
    });

    return completion.choices[0].message.content
  }
}

module.exports = Bot;