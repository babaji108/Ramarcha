import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

export default function ContactUs() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'new'
      });
      toast.success('आपका संदेश सफलतापूर्वक भेज दिया गया है। हम जल्द ही आपसे संपर्क करेंगे।');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('संदेश भेजने में विफल। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#4A2C2A] dark:text-orange-100 mb-4">संपर्क करें</h1>
        <div className="w-24 h-1 bg-[#FF9933] mx-auto rounded-full mb-6" />
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          आपके किसी भी प्रश्न या सुझाव के लिए हम हमेशा उपलब्ध हैं। कृपया नीचे दिए गए फॉर्म के माध्यम से हमसे संपर्क करें।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 dark:text-white">संपर्क विवरण</h3>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-[#FFF5E6] dark:bg-gray-700 p-3 rounded-xl text-[#FF9933] shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold dark:text-white mb-1">पता</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    मुख्यालय - वृन्दावन धाम मथुरा<br />
                    कार्यालय - रसूलपुर विदिशा मध्य प्रदेश भारत
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-[#FFF5E6] dark:bg-gray-700 p-3 rounded-xl text-[#FF9933] shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold dark:text-white mb-1">फ़ोन</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">+91 7909641191</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-[#FFF5E6] dark:bg-gray-700 p-3 rounded-xl text-[#FF9933] shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold dark:text-white mb-1">ईमेल</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">info@akhada.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#FF9933] to-[#FFD700] p-8 rounded-[2rem] text-white shadow-lg">
            <h3 className="text-xl font-bold mb-2">सहायता चाहिए?</h3>
            <p className="opacity-90 text-sm mb-6">
              हमारी सहायता टीम 24/7 आपकी सेवा में उपलब्ध है। आप हमें व्हाट्सएप पर भी संदेश भेज सकते हैं।
            </p>
            <a 
              href="https://wa.me/917909641191" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center space-x-2 bg-white text-[#FF9933] px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>व्हाट्सएप पर चैट करें</span>
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-8 dark:text-white">हमें संदेश भेजें</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">आपका नाम</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-[#FFF5E6] dark:bg-gray-700 border-2 border-transparent focus:border-[#FF9933] rounded-xl outline-none transition-all dark:text-white"
                    placeholder="शुभ नाम"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ईमेल पता</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-[#FFF5E6] dark:bg-gray-700 border-2 border-transparent focus:border-[#FF9933] rounded-xl outline-none transition-all dark:text-white"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">आपका संदेश</label>
                <textarea 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 bg-[#FFF5E6] dark:bg-gray-700 border-2 border-transparent focus:border-[#FF9933] rounded-xl outline-none transition-all h-40 resize-none dark:text-white"
                  placeholder="आप कैसे सहायता चाहते हैं? यहाँ लिखें..."
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-[#FF9933] text-white px-10 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-[#FF8811] transition-all shadow-lg disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'भेज रहा है...' : 'संदेश भेजें'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
