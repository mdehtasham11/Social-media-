const axios = require("axios");

class PerspectiveAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl =
      "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze";
  }

  async analyzeText(
    text,
    attributes = [
      "TOXICITY",
      "SEVERE_TOXICITY",
      "IDENTITY_ATTACK",
      "INSULT",
      "PROFANITY",
      "THREAT",
      "SEXUALLY_EXPLICIT",
      "FLIRTATION",
    ]
  ) {
    const requestBody = {
      comment: { text },
      requestedAttributes: attributes.reduce((acc, attr) => {
        acc[attr] = {};
        return acc;
      }, {}),
      languages: ["en"],
    };

    try {
      const response = await axios.post(this.apiUrl, requestBody, {
        params: { key: this.apiKey },
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Error analyzing text: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  async analyzeComment(comment) {
    return this.analyzeText(comment);
  }

  async analyzeCaption(caption) {
    return this.analyzeText(caption);
  }
}

module.exports = PerspectiveAPI;
