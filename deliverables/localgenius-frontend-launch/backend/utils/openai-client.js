/**
 * OpenAI API Client for LocalGenius
 * Handles LLM fallback when FAQ cache misses
 */

export class OpenAIClient {
  constructor(apiKey, model = 'gpt-3.5-turbo') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
    this.timeout = 2000; // 2 second hard timeout
  }

  /**
   * Generate response to customer question
   * @param {string} question - Customer question
   * @param {Array} faqs - Business FAQs for context
   * @param {Object} businessInfo - Business metadata
   * @returns {Promise<string>} Generated answer
   */
  async generateResponse(question, faqs, businessInfo) {
    const systemPrompt = this.buildSystemPrompt(faqs, businessInfo);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question }
          ],
          temperature: 0.7,
          max_tokens: 150
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || null;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        console.error('OpenAI request timeout');
        return null;
      }

      console.error('OpenAI API error:', error);
      return null;
    }
  }

  /**
   * Build system prompt with business context and FAQs
   */
  buildSystemPrompt(faqs, businessInfo) {
    const faqContext = faqs
      .map(faq => `Q: ${faq.question}\nA: ${faq.answer}`)
      .join('\n\n');

    return `You are a helpful customer service assistant for ${businessInfo.name}, a ${businessInfo.type}.

Your job is to answer customer questions based on the following FAQs. If you don't know the answer, direct them to contact the business at ${businessInfo.email || 'the contact information on our website'}.

Be friendly, concise, and helpful. Keep responses under 100 words.

${faqContext ? `FAQs:\n${faqContext}` : ''}`;
  }
}
