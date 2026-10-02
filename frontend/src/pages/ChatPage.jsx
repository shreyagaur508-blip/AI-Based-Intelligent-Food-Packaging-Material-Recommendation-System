import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  HelpCircle,
  Volume,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import LanguageSelector from '../components/common/LanguageSelector';
import { useTranslation } from '../i18n';
import { sendChatMessage } from '../api/chatApi';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speakText,
  stopSpeaking,
} from '../utils/speechUtils';

export default function ChatPage() {
  const navigate = useNavigate();
  const { t, language, currentLanguageInfo } = useTranslation();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState(null);
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize initial greeting when language changes or on mount
  useEffect(() => {
    const greetingText = t('chat.welcome_greeting');
    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: 'init-greeting',
            role: 'assistant',
            content: greetingText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedFormValues: null,
          },
        ];
      }
      return prev;
    });
  }, [t, language]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, interimTranscript, scrollToBottom]);

  // Clean up speech recognition and synthesis on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      stopSpeaking();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  // Handle Send Message
  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    // Stop listening or speech synthesis if active
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }
    stopSpeaking();
    setCurrentlySpeakingMsgId(null);
    setSpeechError(null);

    const userMessageId = `user-${Date.now()}`;
    const userMsg = {
      id: userMessageId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setInterimTranscript('');
    setIsLoading(true);

    try {
      // Build short message history for context
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendChatMessage({
        message: query,
        language: language || 'hi',
        history: historyPayload,
      });

      const aiMessageId = `ai-${Date.now()}`;
      const aiMsg = {
        id: aiMessageId,
        role: 'assistant',
        content: response.reply,
        suggestedFormValues: response.suggested_form_values || null,
        isFallback: response.is_fallback || false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          language === 'hi'
            ? 'क्षमा करें, संदेश भेजने में कोई समस्या हुई। कृपया पुनः प्रयास करें या सीधे फ़ॉर्म का उपयोग करें।'
            : 'Sorry, I encountered an issue while connecting. Please try again or use the recommendation form.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Toggle Microphone Speech-to-Text
  const handleToggleVoice = () => {
    if (!isSpeechRecognitionSupported()) {
      setSpeechError(t('chat.mic_unsupported'));
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setInterimTranscript('');
      return;
    }

    // Stop TTS if speaking
    stopSpeaking();
    setCurrentlySpeakingMsgId(null);
    setSpeechError(null);
    setInterimTranscript('');

    try {
      const recognition = createSpeechRecognizer(language, {
        onStart: () => {
          setIsListening(true);
          setSpeechError(null);
        },
        onResult: ({ finalText, interimText, isFinal }) => {
          if (interimText) {
            setInterimTranscript(interimText);
          }
          if (finalText) {
            setInputText(finalText);
            setInterimTranscript('');
            // Auto-send after short pause or user confirmation
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              handleSendMessage(finalText);
            }, 1200);
          }
        },
        onError: (errorType) => {
          setIsListening(false);
          setInterimTranscript('');
          if (errorType === 'not-allowed' || errorType === 'permission-denied') {
            setSpeechError(t('chat.mic_permission_denied'));
          } else if (errorType !== 'no-speech') {
            setSpeechError(`Voice input error: ${errorType}`);
          }
        },
        onEnd: () => {
          setIsListening(false);
          setInterimTranscript('');
        },
      });

      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
      }
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setSpeechError(t('chat.mic_permission_denied'));
    }
  };

  // Handle Text-to-Speech (Read Aloud)
  const handleReadAloud = (msg) => {
    if (!isSpeechSynthesisSupported()) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (currentlySpeakingMsgId === msg.id) {
      stopSpeaking();
      setCurrentlySpeakingMsgId(null);
      return;
    }

    setCurrentlySpeakingMsgId(msg.id);
    speakText({
      text: msg.content,
      lang: language || 'hi',
      onStart: () => {
        setCurrentlySpeakingMsgId(msg.id);
      },
      onEnd: () => {
        setCurrentlySpeakingMsgId(null);
      },
      onError: () => {
        setCurrentlySpeakingMsgId(null);
      },
    });
  };

  // Reset conversation
  const handleClearChat = () => {
    stopSpeaking();
    setCurrentlySpeakingMsgId(null);
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: t('chat.welcome_greeting'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFormValues: null,
      },
    ]);
  };

  // Pre-fill /recommend form with detected parameters
  const handleUseInForm = (suggestedValues) => {
    if (!suggestedValues) return;
    navigate('/recommend', {
      state: {
        prefill: suggestedValues,
      },
    });
  };

  // Quick Prompt Chips
  const promptChips = [
    { text: t('chat.prompt_1'), query: language === 'hi' ? 'ताजा टमाटर के लिए 15 दिन की सामान्य भंडारण में कौन सी पैकेजिंग सही है?' : 'What packaging is best for fresh tomatoes in ambient storage for 15 days?' },
    { text: t('chat.prompt_2'), query: language === 'hi' ? 'कुरकुरे आलू चिप्स को सीलन और हवा से बचाने के लिए सबसे अच्छा पाउच कौन सा है?' : 'What is the best high-barrier pouch to prevent potato chips from getting soggy?' },
    { text: t('chat.prompt_3'), query: language === 'hi' ? 'ताजा पनीर को कोल्ड स्टोरेज (0-4°C) में 14 दिन रखने के लिए क्या पैकेजिंग चाहिए?' : 'What vacuum packaging should I use for fresh paneer in chilled storage for 14 days?' },
    { text: t('chat.prompt_4'), query: language === 'hi' ? 'गेहूं और अनाज को बिना कीटनाशक घुन और सीलन से 1 साल सुरक्षित कैसे रखें?' : 'How can I store wheat grains safely for 1 year without insects or moisture?' },
    { text: t('chat.prompt_5'), query: language === 'hi' ? 'ताजे आम के निर्यात और परिवहन के लिए सुरक्षित पैकेजिंग क्या है?' : 'What is the ideal ventilated MAP packaging for fresh mango export?' },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Background ambient glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex-1 flex flex-col">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40">
                <Sparkles className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                    {t('chat.title')}
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                    {t('chat.badge')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  {t('chat.subtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">{t('chat.speaking_in')}:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                {currentLanguageInfo.flag} {currentLanguageInfo.nativeName}
              </span>
            </div>

            <button
              onClick={handleClearChat}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl border border-slate-800/80 transition-colors flex items-center gap-1.5"
              title={t('chat.clear_chat')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('chat.clear_chat')}</span>
            </button>
          </div>
        </div>

        {/* Onboarding Tooltip Banner */}
        {showOnboarding && (
          <div className="mt-3 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-teal-950/30 border border-emerald-500/30 text-xs sm:text-sm text-slate-300 flex items-start justify-between gap-3 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <Mic className="w-4 h-4" />
              </div>
              <p className="leading-relaxed">
                <strong className="text-emerald-300 font-semibold">{t('chat.speaking_in')}: </strong>
                {t('chat.onboarding_tooltip')}
              </p>
            </div>
            <button
              onClick={() => setShowOnboarding(false)}
              className="text-slate-500 hover:text-slate-300 text-xs px-1.5 py-0.5 rounded hover:bg-slate-800"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="mt-2 p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs sm:text-sm text-amber-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{speechError}</span>
            </div>
            <button
              onClick={() => setSpeechError(null)}
              className="text-amber-400 hover:text-amber-200 text-xs px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 sm:pr-2 space-y-4 max-h-[56vh] sm:max-h-[60vh]">
          {messages.map((msg) => {
            const isAI = msg.role === 'assistant';
            const isSpeaking = currentlySpeakingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-150`}
              >
                {/* AI Avatar */}
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-950/50 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 transition-all shadow-md ${
                    isAI
                      ? 'bg-slate-900/90 border border-slate-800 text-slate-200'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-medium shadow-emerald-950/30'
                  }`}
                >
                  {/* Sender Name & Timestamp */}
                  <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400 mb-1.5 pb-1 border-b border-slate-800/50">
                    <span className={isAI ? 'text-emerald-400 font-semibold' : 'text-emerald-200'}>
                      {isAI ? t('chat.ai_assistant') : t('chat.you')}
                    </span>
                    <span className="opacity-70">{msg.timestamp}</span>
                  </div>

                  {/* Message Content */}
                  <div className="text-sm leading-relaxed whitespace-pre-line font-normal space-y-2">
                    {msg.content}
                  </div>

                  {/* AI Message Footer Actions */}
                  {isAI && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => handleReadAloud(msg)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          isSpeaking
                            ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 animate-pulse'
                            : 'bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700/60'
                        }`}
                        title={isSpeaking ? t('chat.stop_reading') : t('chat.read_aloud')}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{t('chat.stop_reading')}</span>
                            <span className="flex gap-0.5 items-end h-3 ml-0.5">
                              <span className="w-0.5 h-2 bg-emerald-400 animate-bounce" />
                              <span className="w-0.5 h-3 bg-emerald-400 animate-bounce delay-100" />
                              <span className="w-0.5 h-1.5 bg-emerald-400 animate-bounce delay-200" />
                            </span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t('chat.read_aloud')}</span>
                          </>
                        )}
                      </button>

                      {msg.isFallback && (
                        <span className="text-[10px] text-slate-500">
                          {t('chat.offline_notice')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Suggested Form Values Card */}
                  {isAI && msg.suggestedFormValues && msg.suggestedFormValues.commodity_name && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 shadow-inner">
                      <div className="flex items-center gap-2 mb-2 text-emerald-400 font-semibold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('chat.detected_info')}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-300 mb-3 bg-slate-900/60 p-2 rounded-lg">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Commodity</span>
                          <span className="font-medium text-white">
                            {msg.suggestedFormValues.commodity_name}
                          </span>
                        </div>
                        {msg.suggestedFormValues.storage_type && (
                          <div>
                            <span className="text-[10px] text-slate-500 block">Storage</span>
                            <span className="font-medium capitalize text-emerald-300">
                              {msg.suggestedFormValues.storage_type}
                            </span>
                          </div>
                        )}
                        {msg.suggestedFormValues.desired_shelf_life_days && (
                          <div>
                            <span className="text-[10px] text-slate-500 block">Shelf Life</span>
                            <span className="font-medium text-amber-300">
                              {msg.suggestedFormValues.desired_shelf_life_days} {t('common.days')}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        icon={ArrowRight}
                        onClick={() => handleUseInForm(msg.suggestedFormValues)}
                      >
                        {t('chat.use_in_form')}
                      </Button>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white shrink-0 mt-1">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 text-slate-400 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-150" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-300" />
                <span className="text-xs ml-1 font-medium text-slate-400">{t('chat.thinking')}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="mb-3 pt-2">
            <p className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {t('chat.try_asking')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {promptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.query)}
                  className="text-xs bg-slate-900 hover:bg-emerald-950/60 hover:border-emerald-500/40 hover:text-emerald-300 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-xl transition-colors duration-150"
                >
                  {chip.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Audio Recognition Feedback Strip */}
        {isListening && (
          <div className="mb-2 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute" />
                <span className="w-3 h-3 rounded-full bg-red-500 relative" />
              </div>
              <span className="text-xs font-semibold text-emerald-300">
                {t('chat.mic_listening')}
              </span>
              {interimTranscript && (
                <span className="text-xs italic text-slate-300 truncate max-w-xs sm:max-w-md">
                  "{interimTranscript}"
                </span>
              )}
            </div>

            <button
              onClick={handleToggleVoice}
              className="text-xs bg-red-600/80 hover:bg-red-600 text-white px-2.5 py-1 rounded-lg transition-colors font-medium"
            >
              {t('chat.mic_stop')}
            </button>
          </div>
        )}

        {/* Message Input Controls Area */}
        <div className="pt-2 border-t border-slate-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            {/* Microphone Voice Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              disabled={isLoading}
              className={`p-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center shadow-lg ${
                isListening
                  ? 'bg-red-600 text-white shadow-red-900/50 scale-105 ring-4 ring-red-500/30 animate-pulse'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-700 text-white hover:scale-105 shadow-emerald-950/50 hover:ring-2 hover:ring-emerald-400/40'
              }`}
              title={isListening ? t('chat.mic_stop') : t('chat.mic_click_to_speak')}
              aria-label="Voice input microphone"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input Field */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? t('chat.mic_listening') : t('chat.input_placeholder')}
                disabled={isLoading}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-3 rounded-2xl font-medium transition-all duration-150 flex items-center justify-center shadow-md ${
                inputText.trim() && !isLoading
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 hover:scale-105 shadow-emerald-950/50 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
              title={t('chat.send')}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
