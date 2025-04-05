const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function analyzeImage(mediaUrl) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this emergency situation and provide severity (0-3):\n0 - Very low/Fake\n1 - Low priority\n2 - Medium priority\n3 - High priority\nRespond with only the number."
            },
            {
              type: "image_url",
              image_url: {
                url: `http://localhost:3000${mediaUrl}`,
              },
            },
          ],
        },
      ],
      max_tokens: 10,
    });
    
    const severity = parseInt(response.choices[0].message.content);
    return Math.min(Math.max(severity, 0), 3);
  } catch (error) {
    console.error('Image analysis error:', error);
    return 1;
  }
}

async function analyzeAudio(mediaUrl) {
  try {
    const filePath = path.join(__dirname, '..', mediaUrl);
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });

    const analysis = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: `Analyze emergency severity (0-3 scale):
        0 - Very low/Fake emergency
        1 - Low priority
        2 - Medium priority
        3 - High priority
        Respond ONLY with the number. Context: ${transcription.text}`
      }]
    });

    const severity = parseInt(analysis.choices[0].message.content);
    return Math.min(Math.max(severity, 0), 3);
  } catch (error) {
    console.error('Audio analysis error:', error);
    return 1;
  }
}

async function classifyEmergency(description, mediaUrl = null) {
  try {
    let severity = 1; // Default to low priority
    let type = 'OTHER';

    // Text analysis
    const textAnalysis = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: `Classify emergency type and analyze severity (0-3):
        Types: FIRE, MEDICAL, CRIME, NATURAL_DISASTER, TRAFFIC, OTHER
        Severity:
        0 - Very low/Fake
        1 - Low
        2 - Medium
        3 - High
        Respond format: TYPE|SEVERITY
        Description: ${description}`
      }]
    });

    const [textType, textSeverity] = textAnalysis.choices[0].message.content.split('|');
    type = textType;
    severity = Math.min(Math.max(parseInt(textSeverity), 0), 3);

    // Media analysis if present
    if (mediaUrl) {
      let mediaSeverity = 1;

      // Check media type and analyze accordingly
      if (mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
        mediaSeverity = await analyzeImage(mediaUrl);
      } else if (mediaUrl.match(/\.(mp3|wav|ogg|m4a|webm)$/i)) {
        mediaSeverity = await analyzeAudio(mediaUrl);
      }

      // Use the highest severity from all analyses
      severity = Math.max(severity, mediaSeverity);
    }

    return { type, severity };
  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Handle rate limit errors specifically
    if (error.error?.type === 'insufficient_quota' || error.status === 429) {
      console.log('OpenAI API quota exceeded, falling back to basic classification');
      
      // Basic classification based on keywords in description
      const type = description.toLowerCase().includes('fire') ? 'FIRE' :
                  description.toLowerCase().includes('medical') ? 'MEDICAL' :
                  description.toLowerCase().includes('crime') ? 'CRIME' :
                  description.toLowerCase().includes('traffic') ? 'TRAFFIC' :
                  'OTHER';
                  
      return {
        type,
        severity: 1,
        aiUnavailable: true
      };
    }

    // Default fallback for other errors
    return { 
      type: 'OTHER', 
      severity: 1,
      aiUnavailable: true
    };
  }
}

module.exports = { classifyEmergency };
