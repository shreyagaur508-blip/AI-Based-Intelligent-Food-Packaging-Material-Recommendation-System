/**
 * PackWise AI - Web Speech API Utilities (Speech-to-Text & Text-to-Speech)
 * Supports multilingual Indian regional languages (Hindi, English, Kannada, Marathi, Bhojpuri).
 */

// BCP-47 Language Tag Mapping for Speech Recognition (STT)
export const STT_LANGUAGE_MAP = {
  hi: 'hi-IN',
  en: 'en-IN',
  kn: 'kn-IN',
  mr: 'mr-IN',
  bho: 'hi-IN', // Bhojpuri speech-to-text operates seamlessly via Devanagari acoustic models
};

// Language Tag Mapping for Speech Synthesis (TTS)
export const TTS_LANGUAGE_MAP = {
  hi: 'hi-IN',
  en: 'en-IN',
  kn: 'kn-IN',
  mr: 'mr-IN',
  bho: 'hi-IN',
};

/**
 * Checks if browser supports Web Speech Recognition.
 * @returns {boolean}
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Checks if browser supports SpeechSynthesis.
 * @returns {boolean}
 */
export function isSpeechSynthesisSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);
}

/**
 * Creates and configures a SpeechRecognition instance for the chosen language.
 * @param {string} langCode - Application language code ('hi', 'en', etc.)
 * @param {Object} callbacks - Event callbacks { onResult, onError, onEnd, onStart }
 * @returns {SpeechRecognition|null}
 */
export function createSpeechRecognizer(langCode = 'hi', callbacks = {}) {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = STT_LANGUAGE_MAP[langCode] || 'hi-IN';
  recognition.maxAlternatives = 1;

  if (callbacks.onStart) {
    recognition.onstart = callbacks.onStart;
  }

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (callbacks.onResult) {
      callbacks.onResult({
        finalText: finalTranscript.trim(),
        interimText: interimTranscript.trim(),
        isFinal: Boolean(finalTranscript.trim()),
      });
    }
  };

  recognition.onerror = (event) => {
    console.warn('SpeechRecognition error:', event.error);
    if (callbacks.onError) {
      callbacks.onError(event.error);
    }
  };

  recognition.onend = () => {
    if (callbacks.onEnd) {
      callbacks.onEnd();
    }
  };

  return recognition;
}

/**
 * Strips markdown symbols (bold asterisks, hashtags, bullets) so speech sounds natural.
 * @param {string} text
 * @returns {string}
 */
export function cleanTextForSpeech(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove **bold**
    .replace(/\*(.*?)\*/g, '$1') // remove *italic*
    .replace(/#{1,6}\s+/g, '') // remove headings
    .replace(/[`_~]/g, '') // remove backticks, tildes
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove markdown links [label](url)
    .replace(/💡|🍅|🌾|🥛|🥭|🍟|✨|🤖|📦/g, '') // remove emojis
    .replace(/\n+/g, '. ')
    .trim();
}

/**
 * Speaks text using the browser Web SpeechSynthesis API in the requested language.
 * @param {Object} params
 * @param {string} params.text - Text to speak
 * @param {string} params.lang - Language code ('hi', 'en', 'kn', 'mr', 'bho')
 * @param {Function} [params.onStart] - Callback when speech begins
 * @param {Function} [params.onEnd] - Callback when speech completes
 * @param {Function} [params.onError] - Callback on speech error
 * @returns {SpeechSynthesisUtterance|null}
 */
export function speakText({ text, lang = 'hi', onStart, onEnd, onError }) {
  if (!isSpeechSynthesisSupported()) {
    if (onError) onError('Speech synthesis not supported in this browser.');
    return null;
  }

  // Cancel any ongoing speech first
  stopSpeaking();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return null;

  const utterance = new SpeechSynthesisUtterance(cleaned);
  const targetTag = TTS_LANGUAGE_MAP[lang] || 'hi-IN';
  utterance.lang = targetTag;
  utterance.rate = 0.95; // Slightly relaxed pace for clarity
  utterance.pitch = 1.0;

  // Try to find native voice for target language
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    const matchedVoice = voices.find((v) => v.lang === targetTag) ||
      voices.find((v) => v.lang.startsWith(lang)) ||
      voices.find((v) => v.lang.startsWith('en'));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
}

/**
 * Stops any current speech synthesis output.
 */
export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
