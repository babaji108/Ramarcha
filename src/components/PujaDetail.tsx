import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Puja } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, Tag, Info, IndianRupee } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const DEFAULT_PUJAS: Puja[] = [
  { id: '1', name: 'सत्यनारायण कथा', description: 'सुख, शांति और समृद्धि के लिए। यह कथा भगवान विष्णु के सत्य स्वरूप की महिमा का वर्णन करती है। इसे किसी भी शुभ अवसर पर या मनोकामना पूर्ति के लिए कराया जा सकता है।', price: 2100, category: 'कथा' },
  { id: '2', name: 'रुद्राभिषेक', description: 'भगवान शिव की विशेष पूजा। इसमें शिवलिंग पर विभिन्न द्रव्यों जैसे दूध, दही, शहद, और गंगाजल से अभिषेक किया जाता है। यह ग्रहों के दोष निवारण और मानसिक शांति के लिए अत्यंत फलदायी है।', price: 3100, category: 'अभिषेक' },
  { id: '3', name: 'गृह प्रवेश', description: 'नए घर में प्रवेश हेतु पूजा। वास्तु दोष निवारण और घर में सकारात्मक ऊर्जा के संचार के लिए यह पूजा अनिवार्य मानी जाती है। इसमें गणेश पूजन, वास्तु शांति और नवग्रह शांति की जाती है।', price: 5100, category: 'संस्कार' },
  { id: '4', name: 'महामृत्युंजय जाप', description: 'स्वास्थ्य और दीर्घायु के लिए। यह मंत्र भगवान शिव को समर्पित है और अकाल मृत्यु के भय को दूर करता है। गंभीर बीमारियों और संकटों से मुक्ति के लिए यह जाप कराया जाता है।', price: 11000, category: 'जाप' },
];

export default function PujaDetail() {
  const { id } = useParams<{ id: string }>();
  const [puja, setPuja] = useState<Puja | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchPuja = async () => {
      setLoading(true);
      try {
        if (!id) return;
        
        // Try to find in default pujas first
        const defaultPuja = DEFAULT_PUJAS.find(p => p.id === id);
        if (defaultPuja) {
          setPuja(defaultPuja);
          setLoading(false);
          return;
        }

        // If not found, try Firestore
        const docRef = doc(db, 'pujas', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPuja({ id: docSnap.id, ...docSnap.data() } as Puja);
        }
      } catch (error) {
        console.error("Error fetching puja details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPuja();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!puja) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">पूजा का विवरण नहीं मिला</h2>
        <button 
          onClick={() => navigate('/booking')}
          className="mt-6 text-[#FF9933] font-bold hover:underline flex items-center justify-center mx-auto space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>वापस बुकिंग पर जाएँ</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-[#FF9933] transition-colors font-bold"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>पीछे</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        <div className="bg-gradient-to-r from-[#FF9933] to-[#FFD700] p-12 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Info className="w-64 h-64" />
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10"
          >
            <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold mb-4 border border-white/30">
              {puja.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{puja.name}</h1>
            <div className="flex items-center justify-center space-x-2 text-2xl font-bold">
              <IndianRupee className="w-6 h-6" />
              <span>{puja.price}</span>
            </div>
          </motion.div>
        </div>

        <div className="p-12 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-[#4A2C2A] dark:text-orange-100 mb-6 flex items-center space-x-3">
              <Info className="w-6 h-6 text-[#FF9933]" />
              <span>पूजा का विवरण</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {puja.description}
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#FFF5E6] dark:bg-gray-700/50 p-8 rounded-3xl border border-[#FFD700]/30">
              <h3 className="font-bold text-[#4A2C2A] dark:text-orange-100 mb-4 flex items-center space-x-2">
                <Tag className="w-5 h-5 text-[#FF9933]" />
                <span>श्रेणी</span>
              </h3>
              <p className="text-xl font-bold dark:text-white">{puja.category}</p>
            </div>
            <div className="bg-[#FFF5E6] dark:bg-gray-700/50 p-8 rounded-3xl border border-[#FFD700]/30">
              <h3 className="font-bold text-[#4A2C2A] dark:text-orange-100 mb-4 flex items-center space-x-2">
                <IndianRupee className="w-5 h-5 text-[#FF9933]" />
                <span>दक्षिणा</span>
              </h3>
              <p className="text-xl font-bold dark:text-white">₹{puja.price}</p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/booking', { state: { selectedPujaId: puja.id } })}
              className="flex-1 bg-[#FF9933] text-white py-5 rounded-2xl font-bold text-xl hover:bg-[#FF8811] transition-all shadow-lg flex items-center justify-center space-x-3"
            >
              <CreditCard className="w-6 h-6" />
              <span>{t('book_puja')}</span>
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-5 rounded-2xl font-bold text-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              वापस जाएँ
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
