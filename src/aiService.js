const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function classifyEmergency(description) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a emergency classification system. Classify emergencies into one of these categories: FIRE, MEDICAL, CRIME, NATURAL_DISASTER, TRAFFIC, OTHER. Respond with only the category name."
        },
        {
          role: "user",
          content: `Classify the following emergency: ${description}`
        }
      ],
      max_tokens: 10
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error classifying emergency:', error);
    return 'OTHER';
  }
}

module.exports = { classifyEmergency };
