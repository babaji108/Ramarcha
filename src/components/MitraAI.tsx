import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, Send, User, Loader2, ExternalLink, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

export default function MitraAI() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string, product?: string }[]>([
    { role: 'model', text: 'नमस्ते! मैं मित्र AI हूँ - आपका ऑल-राउंडर सहायक। आप मुझसे कोडिंग, कुकिंग, फिटनेस, धर्म, या किसी भी विषय पर सवाल पूछ सकते हैं!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default Affiliate Tag (In a real app, this would be fetched from Admin Settings in Firestore)
  const affiliateTag = "akhada_affiliate_01";

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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const systemPrompt = `You are 'Mitra AI', an all-rounder, highly intelligent assistant. You can answer questions about ANYTHING (coding, fitness, cooking, religion, tech, etc.).
      
      CRITICAL INSTRUCTION:
      Along with your helpful response, you MUST suggest ONE relevant product that the user might want to buy on Amazon based on their query.
      Format your response EXACTLY like this:
      
      [Your detailed and helpful response here]
      
      PRODUCT_SUGGESTION: [Just the name of the product, e.g., "5kg Dumbbells" or "Bhagavad Gita" or "Mechanical Keyboard"]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...chatHistory,
          { role: 'user', parts: [{ text: userMessage }] }
        ]
      });

      const fullText = response.text || 'क्षमा करें, मैं अभी उत्तर देने में असमर्थ हूँ।';
      
      // Parse the response to extract the product suggestion
      let botResponse = fullText;
      let suggestedProduct = undefined;
      
      if (fullText.includes('PRODUCT_SUGGESTION:')) {
        const parts = fullText.split('PRODUCT_SUGGESTION:');
        botResponse = parts[0].trim();
        suggestedProduct = parts[1].trim();
      }

      setMessages(prev => [...prev, { role: 'model', text: botResponse, product: suggestedProduct }]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'क्षमा करें, कुछ तकनीकी समस्या आ गई है। कृपया बाद में पुनः प्रयास करें।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Bot className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center space-x-2">
                  <span>मित्र AI</span>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </h1>
                <p className="text-indigo-100">आपका ऑल-राउंडर स्मार्ट असिस्टेंट</p>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <ShieldCheck className="w-5 h-5 text-green-300" />
            <span className="font-bold text-sm">100% Free Forever</span>
          </div>
        </div>
      </div>

      {/* Compact Ad Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 mb-8 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
        <span className="text-gray-400 font-medium text-xs uppercase tracking-wider">Sponsored</span>
        <div className="flex-1 text-center font-bold text-gray-700 dark:text-gray-300">
          यहाँ आपका विज्ञापन (AdSense) दिखाई देगा
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[calc(100vh-300px)] min-h-[600px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/50">
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white' : 'bg-gradient-to-br from-white to-gray-100 dark:from-gray-700 dark:to-gray-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-600'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className={`p-4 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 rounded-tl-none'
                  }`}>
                    {msg.role === 'model' ? (
                      <div className="markdown-body text-sm prose dark:prose-invert max-w-none prose-p:leading-relaxed">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>

                  {/* Smart Affiliate Recommendation */}
                  {msg.product && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 border border-orange-200 dark:border-gray-600 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center space-x-2 mb-2 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        <span>Smart Recommendation</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        इस विषय के लिए अनुशंसित उत्पाद: <strong className="text-gray-900 dark:text-white">{msg.product}</strong>
                      </p>
                      <a 
                        href={`https://www.amazon.in/s?k=${encodeURIComponent(msg.product)}&tag=${affiliateTag}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-[#FF9900] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#FF8800] transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Buy on Amazon</span>
                        <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                      </a>
                      <p className="text-[10px] text-gray-400 mt-2">
                        *यह एक एफिलिएट लिंक है। लिंक: amazon.in/s?k=...&tag={affiliateTag}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-indigo-600 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none flex space-x-1">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSend} className="flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="कुछ भी पूछें... (उदा: कोडिंग, कुकिंग, फिटनेस)"
              className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm transition-shadow"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 transform active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
