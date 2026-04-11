import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, Send, User, Loader2, ExternalLink, ShieldCheck, Sparkles, ShoppingBag, Code, Eye, Globe as GlobeIcon, ArrowLeft, Layout } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Message {
  role: 'user' | 'model';
  text: string;
  product?: string;
  htmlContent?: string;
  publishedUrl?: string;
}

export default function MitraAI() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'नमस्ते! मैं मित्र AI हूँ - आपका ऑल-राउंडर सहायक। आप मुझसे कोडिंग, कुकिंग, फिटनेस, धर्म, या किसी भी विषय पर सवाल पूछ सकते हैं! मैं आपके लिए वेबसाइट भी बना सकता हूँ।' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default Affiliate Tag (In a real app, this would be fetched from Admin Settings in Firestore)
  const affiliateTag = "akhada_affiliate_01";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePublish = async (index: number, htmlContent: string) => {
    if (!auth.currentUser) {
      toast.error('वेबसाइट पब्लिश करने के लिए लॉगिन करना आवश्यक है।');
      return;
    }
    
    setPublishingId(index);
    try {
      const docRef = await addDoc(collection(db, 'published_sites'), {
        html: htmlContent,
        authorUid: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      const publishedUrl = `${window.location.origin}/site/${docRef.id}`;
      
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[index] = { ...newMsgs[index], publishedUrl };
        return newMsgs;
      });
      
      toast.success('वेबसाइट सफलतापूर्वक पब्लिश हो गई!');
    } catch (error) {
      console.error('Error publishing site:', error);
      toast.error('वेबसाइट पब्लिश करने में त्रुटि हुई।');
    } finally {
      setPublishingId(null);
    }
  };

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
      
      CRITICAL INSTRUCTIONS:
      1. If the user asks to create a website, landing page, or web app, you MUST generate a complete, single-file HTML document with embedded CSS (Tailwind via CDN is recommended) and JS. Wrap the HTML code EXACTLY in \`\`\`html ... \`\`\`.
      2. Along with your helpful response, you MUST suggest ONE relevant product that the user might want to buy on Amazon based on their query.
      
      Format your response EXACTLY like this:
      
      [Your detailed and helpful response here. If generating a website, include the \`\`\`html code block here]
      
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
      let htmlContent = undefined;
      
      if (fullText.includes('PRODUCT_SUGGESTION:')) {
        const parts = fullText.split('PRODUCT_SUGGESTION:');
        botResponse = parts[0].trim();
        suggestedProduct = parts[1].trim();
      }

      // Extract HTML content if present
      const htmlMatch = botResponse.match(/```html\s*([\s\S]*?)\s*```/);
      if (htmlMatch && htmlMatch[1]) {
        htmlContent = htmlMatch[1];
        // Remove the HTML block from the chat text to keep it clean, since it will be shown in the preview pane
        botResponse = botResponse.replace(htmlMatch[0], '\n\n*(वेबसाइट का कोड जनरेट कर दिया गया है। आप इसे दाईं ओर देख सकते हैं।)*');
      }

      setMessages(prev => {
        const newMsgs = [...prev, { role: 'model', text: botResponse, product: suggestedProduct, htmlContent }];
        if (htmlContent) {
          setActivePreviewIndex(newMsgs.length - 1);
        }
        return newMsgs;
      });
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'क्षमा करें, कुछ तकनीकी समस्या आ गई है। कृपया बाद में पुनः प्रयास करें।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPreview = activePreviewIndex !== null && messages[activePreviewIndex]?.htmlContent;

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 flex items-center justify-between shrink-0 shadow-md z-10">
        <div className="flex items-center space-x-4">
          <Link to="/" className="p-2 hover:bg-white/20 rounded-full transition-colors" title="होम पर वापस जाएं">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">मित्र AI</h1>
              <p className="text-xs text-indigo-100">आपका ऑल-राउंडर स्मार्ट असिस्टेंट</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            <ShieldCheck className="w-4 h-4 text-green-300" />
            <span className="font-bold text-xs">100% Free Forever</span>
          </div>
        </div>
      </header>

      {/* Main Content Area (Split Pane) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Pane: Chat Interface */}
        <div className={`flex flex-col h-full bg-white dark:bg-gray-800 transition-all duration-300 ${hasPreview ? 'w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-700 hidden md:flex' : 'w-full max-w-4xl mx-auto'}`}>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 dark:bg-gray-900/50">
            {messages.map((msg, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[95%] ${hasPreview ? 'sm:max-w-[95%]' : 'sm:max-w-[85%]'} ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white' : 'bg-gradient-to-br from-white to-gray-100 dark:from-gray-700 dark:to-gray-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-600'
                  }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex flex-col space-y-3 min-w-0">
                    <div className={`p-4 sm:p-5 rounded-3xl text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 rounded-tl-none'
                    }`}>
                      {msg.role === 'model' ? (
                        <div className="markdown-body text-sm sm:text-base prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:leading-relaxed">
                          <Markdown>{msg.text}</Markdown>
                        </div>
                      ) : (
                        <div className="text-sm sm:text-base leading-relaxed">
                          {msg.text}
                        </div>
                      )}
                    </div>

                    {/* View Website Button (if in split pane mode and this message has a site) */}
                    {msg.htmlContent && activePreviewIndex !== idx && (
                       <button 
                         onClick={() => setActivePreviewIndex(idx)}
                         className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors self-start"
                       >
                         <Layout className="w-4 h-4" />
                         <span>वेबसाइट देखें</span>
                       </button>
                    )}

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
            <form onSubmit={handleSend} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="कुछ भी पूछें... (उदा: वेबसाइट बनाओ)"
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm transition-shadow"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 transform active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Pane: Preview / Code (Only visible if a website is generated) */}
        {hasPreview && (
          <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-6 py-4 text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors ${
                    activeTab === 'preview' 
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-6 py-4 text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors ${
                    activeTab === 'code' 
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  <span>Code</span>
                </button>
              </div>
              
              {/* Publish Button */}
              <div className="flex items-center space-x-3">
                {messages[activePreviewIndex].publishedUrl ? (
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 font-bold text-sm bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800">
                    <GlobeIcon className="w-4 h-4" />
                    <span>Published: </span>
                    <a href={messages[activePreviewIndex].publishedUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-700">
                      View Site
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePublish(activePreviewIndex, messages[activePreviewIndex].htmlContent!)}
                    disabled={publishingId === activePreviewIndex}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {publishingId === activePreviewIndex ? <Loader2 className="w-4 h-4 animate-spin" /> : <GlobeIcon className="w-4 h-4" />}
                    <span>Publish Website</span>
                  </button>
                )}
                <button 
                  onClick={() => setActivePreviewIndex(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Close Preview"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview / Code Content */}
            <div className="flex-1 overflow-hidden relative bg-white dark:bg-gray-900">
              {activeTab === 'preview' ? (
                <iframe 
                  srcDoc={messages[activePreviewIndex].htmlContent} 
                  className="w-full h-full border-none bg-white" 
                  title="Website Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              ) : (
                <div className="w-full h-full overflow-auto p-6 bg-[#1e1e1e]">
                  <pre className="text-sm text-[#d4d4d4] font-mono whitespace-pre-wrap">
                    {messages[activePreviewIndex].htmlContent}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
