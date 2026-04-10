import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'नमस्ते! मैं रामर्चा का एआई सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?' }
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: "You are a helpful AI assistant for a Hindu temple and ashram named 'Ramarcha' in Vrindavan. You help devotees with booking pujas, answering questions about rituals, panchang, and ashram services. Reply in Hindi or English based on the user's language. Be polite, spiritual, and concise." }]
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
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-[#FF9933] text-white p-4 rounded-full shadow-2xl hover:bg-[#FF8811] transition-transform transform hover:scale-110 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#4A2C2A] text-white p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-[#FF9933]" />
                <span className="font-bold">रामर्चा एआई सहायक</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-[#FF9933] text-white' : 'bg-[#4A2C2A] text-[#FF9933]'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-[#FF9933] text-white rounded-br-none' 
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
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-[#4A2C2A] text-[#FF9933] flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-none">
                      <Loader2 className="w-5 h-5 animate-spin text-[#FF9933]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
              <form onSubmit={handleSend} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="अपना प्रश्न पूछें..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full outline-none focus:ring-2 focus:ring-[#FF9933] dark:text-white text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-[#FF9933] text-white rounded-full hover:bg-[#FF8811] transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
