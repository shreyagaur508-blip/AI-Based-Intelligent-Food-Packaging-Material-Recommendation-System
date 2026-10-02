/**
 * PackWise AI - Chat API Client Module.
 * Connects the voice & text chat UI to the FastAPI POST /api/chat endpoint.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Sends a user message to the PackWise AI conversational assistant.
 * @param {Object} params
 * @param {string} params.message - User query / voice transcript
 * @param {string} params.language - Language code ('hi', 'en', 'kn', 'mr', 'bho')
 * @param {Array} [params.history] - Array of previous messages { role: 'user'|'assistant', content: '...' }
 * @param {Object} [params.context] - Optional commodity context
 * @returns {Promise<{reply: string, language: string, suggested_form_values?: Object, is_fallback?: boolean}>}
 */
export async function sendChatMessage({ message, language = 'hi', history = [], context = null }) {
  try {
    const cleanBase = API_BASE_URL.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
    const endpoint = `${cleanBase}/api/chat`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message,
        language,
        history,
        context,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat API response error:', response.status, errorText);
      throw new Error(`Chat API error (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to communicate with PackWise Chat API:', error);
    throw error;
  }
}
