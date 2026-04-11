import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

const SUGGESTED_PROMPTS = [
  "पूजा कैसे बुक करें?",
  "आज का पंचांग क्या है?",
  "अखाड़ा परिषद के बारे में बताएं",
  "दान (संत सेवा) कैसे करें?"
];

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'जय श्री राम! 🙏 मैं अखाड़ा का एआई सहायक हूँ। मैं पूजा बुकिंग, पंचांग, या अखाड़ा की सेवाओं के बारे में आपकी कैसे मदद कर सकता हूँ?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, text?: string) => {
    if (e) e.preventDefault();
    const userMessage = text || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Initialize Gemini API
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Create chat history for context
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const systemPrompt = `You are a highly helpful, respectful, and spiritual AI assistant for a Hindu temple and ashram platform named 'Akhada (अखाड़ा)'. 
      The platform is sponsored by 'अखिल भारतीय श्री पंच दिगम्बर अनी अखाड़ा व अखिल भारतीय श्री अखाड़ा परिषद' with headquarters in Vrindavan, Mathura and office in Vidisha, MP.
      You help devotees with:
      1. Booking pujas (Satyanarayan Katha, Rudrabhishek, Griha Pravesh, Mahamrityunjay Jaap).
      2. Answering questions about Hindu rituals, daily Panchang, and auspicious timings.
      3. Providing information about Ashram services like Sant Seva, Go Seva, and Hari Guru Seva (Donations).
      4. Guiding users on how to use the website.
      
      Always start with a polite Hindu greeting like 'जय श्री राम' or 'राधे राधे' if it's the beginning of a conversation.
      Reply in Hindi or English based on the user's language. Be polite, spiritual, concise, and highly engaging.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          ...chatHistory,
          {
            role: 'user',
            parts: [{ text: userMessage }]
          }
        ]
      });

      const botResponse = response.text || 'क्षमा करें, मैं अभी उत्तर देने में असमर्थ हूँ।';
      setMessages(prev => [...prev, { role: 'model', text: botResponse }]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'क्षमा करें, कुछ तकनीकी समस्या आ गई है। कृपया बाद में पुनः प्रयास करें।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 z-50 bg-gradient-to-r from-[#FF9933] to-[#FF7700] text-white px-5 py-4 rounded-full shadow-2xl hover:shadow-[#FF9933]/50 transition-all flex items-center space-x-2 ${isOpen ? 'hidden' : 'block'}`}
      >
        <div className="relative">
          <Bot className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></span>
        </div>
        <span className="font-bold hidden sm:inline">एआई सहायक</span>
        <Sparkles className="w-4 h-4 ml-1 opacity-80" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-50 w-80 sm:w-96 h-[550px] max-h-[85vh] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#4A2C2A] to-[#6A3C3A] text-white p-4 flex justify-between items-center shadow-md z-10">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot className="w-6 h-6 text-[#FFD700]" />
                </div>
                <div>
                  <span className="font-bold block text-lg">अखाड़ा एआई</span>
                  <span className="text-xs text-green-300 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                    ऑनलाइन
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                      msg.role === 'user' ? 'bg-gradient-to-br from-[#FF9933] to-[#FF7700] text-white' : 'bg-gradient-to-br from-[#4A2C2A] to-[#6A3C3A] text-[#FFD700]'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-[#FF9933] to-[#FF7700] text-white rounded-br-none' 
                        : 'bg-white dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-none'
                    }`}>
                      {msg.role === 'model' ? (
                        <div className="markdown-body text-sm prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800">
                          <Markdown>{msg.text}</Markdown>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Suggested Prompts (Only show if few messages) */}
              {messages.length <= 2 && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-2 mt-4 justify-start pl-10"
                >
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(undefined, prompt)}
                      className="text-xs bg-white dark:bg-gray-800 border border-[#FF9933] text-[#FF9933] px-3 py-1.5 rounded-full hover:bg-[#FF9933] hover:text-white transition-colors shadow-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </motion.div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A2C2A] to-[#6A3C3A] text-[#FFD700] flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-none flex space-x-1">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-[#FF9933] rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-[#FF9933] rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-[#FF9933] rounded-full" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <form onSubmit={(e) => handleSend(e)} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="अपना प्रश्न पूछें..."
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full outline-none focus:ring-2 focus:ring-[#FF9933] dark:text-white text-sm transition-shadow"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-gradient-to-r from-[#FF9933] to-[#FF7700] text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 transform active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
