import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Membership } from '../types';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Briefcase, Award, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function MembershipForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    occupation: '',
    membershipType: 'annual' as 'annual' | 'life' | 'patron'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('कृपया पहले लॉगिन करें');
      return;
    }

    setLoading(true);
    try {
      const membershipData: Omit<Membership, 'id'> = {
        userId: auth.currentUser.uid,
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'memberships'), membershipData);
      setSubmitted(true);
      toast.success('सदस्यता आवेदन सफलतापूर्वक जमा किया गया!');
    } catch (error) {
      console.error(error);
      toast.error('आवेदन जमा करने में विफल');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 p-12 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-700"
        >
          <div className="bg-green-100 dark:bg-green-900/20 w-24 h-24 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-8">
            <CheckCircle2 className="w-16 h-16" />
          </div>
          <h2 className="text-4xl font-bold text-[#4A2C2A] dark:text-orange-100 mb-4">आवेदन सफल!</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-10">
            आश्रम सेवा समिति सदस्यता के लिए आपका आवेदन प्राप्त हो गया है। एडमिन जल्द ही आपसे संपर्क करेंगे।
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-[#FF9933] text-white px-10 py-4 rounded-full font-bold hover:bg-[#FF8811] transition-all shadow-lg"
          >
            डैशबोर्ड पर जाएँ
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#4A2C2A] dark:text-orange-100 mb-4">{t('seva_samiti')} {t('membership_form')}</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('membership_desc')}
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="bg-[#FF9933] p-8 text-white">
          <div className="flex items-center space-x-4">
            <Award className="w-10 h-10" />
            <div>
              <h2 className="text-2xl font-bold">सदस्यता विवरण</h2>
              <p className="text-white/80">कृपया सभी आवश्यक जानकारी भरें</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <User className="w-4 h-4 text-[#FF9933]" />
                <span>पूरा नाम</span>
              </label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="आपका नाम दर्ज करें"
                className="w-full px-6 py-4 bg-[#FFF5E6] dark:bg-gray-900 border-2 border-transparent focus:border-[#FF9933] rounded-2xl outline-none dark:text-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#FF9933]" />
                <span>ईमेल पता</span>
              </label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="example@mail.com"
                className="w-full px-6 py-4 bg-[#FFF5E6] dark:bg-gray-900 border-2 border-transparent focus:border-[#FF9933] rounded-2xl outline-none dark:text-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#FF9933]" />
                <span>मोबाइल नंबर</span>
              </label>
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+91 00000 00000"
                className="w-full px-6 py-4 bg-[#FFF5E6] dark:bg-gray-900 border-2 border-transparent focus:border-[#FF9933] rounded-2xl outline-none dark:text-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-[#FF9933]" />
                <span>व्यवसाय (Occupation)</span>
              </label>
              <input 
                type="text" 
                required
                value={formData.occupation}
                onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                placeholder="आपका व्यवसाय"
                className="w-full px-6 py-4 bg-[#FFF5E6] dark:bg-gray-900 border-2 border-transparent focus:border-[#FF9933] rounded-2xl outline-none dark:text-white transition-all"
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#FF9933]" />
                <span>पूरा पता</span>
              </label>
              <textarea 
                required
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="आपका स्थायी पता दर्ज करें"
                className="w-full px-6 py-4 bg-[#FFF5E6] dark:bg-gray-900 border-2 border-transparent focus:border-[#FF9933] rounded-2xl outline-none dark:text-white transition-all h-32 resize-none"
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">सदस्यता का प्रकार चुनें</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'annual', label: 'वार्षिक सदस्य', desc: '1 वर्ष के लिए' },
                  { id: 'life', label: 'आजीवन सदस्य', desc: 'हमेशा के लिए' },
                  { id: 'patron', label: 'संरक्षक सदस्य', desc: 'विशेष दानदाता' }
                ].map((type) => (
                  <label 
                    key={type.id}
                    className={`relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.membershipType === type.id 
                        ? 'border-[#FF9933] bg-[#FFF5E6] dark:bg-orange-900/20' 
                        : 'border-gray-100 dark:border-gray-700 hover:border-[#FFD700]'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="membershipType"
                      value={type.id}
                      checked={formData.membershipType === type.id}
                      onChange={(e) => setFormData({...formData, membershipType: e.target.value as any})}
                      className="sr-only"
                    />
                    <span className="font-bold dark:text-white">{type.label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{type.desc}</span>
                    {formData.membershipType === type.id && (
                      <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-[#FF9933]" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF9933] text-white py-5 rounded-2xl font-bold text-xl hover:bg-[#FF8811] transition-all shadow-lg flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              <Send className="w-6 h-6" />
              <span>{loading ? 'प्रक्रिया जारी है...' : 'आवेदन जमा करें'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
