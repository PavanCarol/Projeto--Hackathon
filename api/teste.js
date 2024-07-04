const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: "sk-proj-YNMzG6LN2LBe8aPFMEEqT3BlbkFJ6Mcl45uKcE0MZWYKaKab",
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a poetic assistant, skilled in explaining complex programming concepts with creative flair.",
      },
      {
        role: "user",
        content:
          "Compose a poem that explains the concept of recursion in programming.",
      },
    ],
  });

  console.log(completion.choices[0]);
}

main();
