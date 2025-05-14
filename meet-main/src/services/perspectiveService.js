const axios = require('axios');

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;
const PERSPECTIVE_API_URL = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';

const validateApiKey = () => {
  if (!PERSPECTIVE_API_KEY) {
    throw new Error('PERSPECTIVE_API_KEY is not set in environment variables');
  }
  if (PERSPECTIVE_API_KEY === 'your_api_key_here') {
    throw new Error('Please replace the default API key with your actual Perspective API key');
  }
};

const analyzeText = async (text) => {
  try {
    validateApiKey();

    const response = await axios.post(
      `${PERSPECTIVE_API_URL}?key=${PERSPECTIVE_API_KEY}`,
      {
        comment: { text },
        requestedAttributes: {
          TOXICITY: {},
          SEVERE_TOXICITY: {},
          IDENTITY_ATTACK: {},
          INSULT: {},
          PROFANITY: {},
          THREAT: {},
          SEXUALLY_EXPLICIT: {},
          FLIRTATION: {},
          SPAM: {},
          ATTACK_ON_AUTHOR: {},
          ATTACK_ON_COMMENTER: {},
          INCOHERENT: {},
          INFLAMMATORY: {},
          LIKELY_TO_REJECT: {},
          OBSCENE: {},
          SPAM: {},
          UNSUBSTANTIAL: {}
        },
        languages: ['en']
      }
    );

    // Return the raw API response
    return response.data;
  } catch (error) {
    console.error('Error analyzing text with Perspective API:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    throw new Error(`Failed to analyze text: ${error.message}`);
  }
};

const generateSummary = (analysis) => {
  const summaries = [];
  
  if (analysis.categories.length > 0) {
    summaries.push(`This comment contains ${analysis.categories.join(', ').toLowerCase()}`);
  }
  
  if (analysis.toxicity > 0.7) {
    summaries.push('The overall tone is highly toxic');
  } else if (analysis.toxicity > 0.4) {
    summaries.push('The comment shows some concerning elements');
  } else {
    summaries.push('The comment appears to be generally appropriate');
  }

  return summaries.join('. ');
};

module.exports = {
  analyzeText
}; 