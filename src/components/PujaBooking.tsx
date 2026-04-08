import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Puja, Booking } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, CreditCard, Car, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { sendNotification } from './NotificationBell';

const DEFAULT_PUJAS: Puja[] = [
  { id: '1', name: 'सत्यनारायण कथा', description: 'सुख, शांति और समृद्धि के लिए', price: 2100, category: 'कथा' },
  { id: '2', name: 'रुद्राभिषेक', description: 'भगवान शिव की विशेष पूजा', price: 3100, category: 'अभिषेक' },
  { id: '3', name: 'गृह प्रवेश', description: 'नए घर में प्रवेश हेतु पूजा', price: 5100, category: 'संस्कार' },
  { id: '4', name: 'महामृत्युंजय जाप', description: 'स्वास्थ्य और दीर्घायु के लिए', price: 11000, category: 'जाप' },
];

export default function PujaBooking() {
  const [step, setStep] = useState(1);
  const [availablePujas, setAvailablePujas] = useState<Puja[]>([]);
  const [selectedPuja, setSelectedPuja] = useState<Puja | null>(null);
  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [vehiclePrepayment, setVehiclePrepayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPujas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'pujas'));
        const pujasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Puja));
        if (pujasData.length > 0) {
          setAvailablePujas(pujasData);
        } else {
          setAvailablePujas(DEFAULT_PUJAS);
        }
      } catch (error) {
        console.error(error);
        setAvailablePujas(DEFAULT_PUJAS);
      }
    };
    fetchPujas();
  }, []);

  const handleBooking = async () => {
    if (!auth.currentUser || !selectedPuja) return;
    
    setLoading(true);
    try {
      const bookingData: Omit<Booking, 'id'> = {
        bhaktId: auth.currentUser.uid,
        pujaId: selectedPuja.id,
        date: date,
        status: 'pending',
        paymentStatus: 'unpaid',
        address: address,
        vehiclePrepayment: vehiclePrepayment,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      
      await sendNotification(
        auth.currentUser.uid,
        'बुकिंग प्राप्त हुई',
        `आपकी ${selectedPuja.name} की बुकिंग प्राप्त हो गई है। हम जल्द ही पंडित नियुक्त करेंगे।`,
        'booking',
        '/dashboard'
      );

      toast.success('पूजा सफलतापूर्वक बुक की गई!');
      setStep(4); // Success step
    } catch (error) {
      console.error(error);
      toast.error('बुकिंग विफल रही');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between mb-2">
          {['पूजा चुनें', 'विवरण भरें', 'भुगतान', 'सफल'].map((s, i) => (
            <span key={i} className={`text-sm font-bold ${step > i ? 'text-[#FF9933]' : 'text-gray-400 dark:text-gray-500'}`}>
              {s}
            </span>
          ))}
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(step / 4) * 100}%` }}
            className="h-full bg-[#FF9933]"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-[#4A2C2A] dark:text-orange-100 mb-8">पूजा का चयन करें</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availablePujas.map((puja) => (
                <div 
                  key={puja.id}
                  onClick={() => setSelectedPuja(puja)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPuja?.id === puja.id 
                      ? 'border-[#FF9933] bg-[#FFF5E6] dark:bg-orange-900/20' 
                      : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#FFD700]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold dark:text-white">{puja.name}</h3>
                    <span className="text-[#FF9933] font-bold">₹{puja.price}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{puja.description}</p>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-500 dark:text-gray-400">{puja.category}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-10">
              <button 
                disabled={!selectedPuja}
                onClick={() => setStep(2)}
                className="bg-[#FF9933] text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-2 disabled:opacity-50 shadow-lg"
              >
                <span>अगला कदम</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="space-y-8 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h2 className="text-3xl font-bold text-[#4A2C2A] dark:text-orange-100">विवरण भरें</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">पूजा की तिथि और समय</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="datetime-local" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#FFF5E6] dark:bg-gray-900 border-2 border-transparent focus:border-[#FF9933] rounded-xl outline-none dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">पूजा का स्थान (पता)</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <textarea 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="पूरा पता दर्ज करें..."
                    className="w-full pl-12 pr-4 py-4 bg-[#FFF5E6] dark:bg-gray-900 border-2 border-transparent focus:border-[#FF9933] rounded-xl outline-none h-32 resize-none dark:text-white"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">गूगल मैप्स लिंक भी दे सकते हैं</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#FFF5E6] dark:bg-orange-900/10 rounded-xl border-2 border-dashed border-[#FF9933]">
                <div className="flex items-center space-x-3">
                  <Car className="text-[#FF9933]" />
                  <div>
                    <div className="font-bold dark:text-white">वृंदावन से वाहन सेवा</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">पंडित जी के लिए वाहन की अग्रिम बुकिंग</div>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={vehiclePrepayment}
                  onChange={(e) => setVehiclePrepayment(e.target.checked)}
                  className="w-6 h-6 accent-[#FF9933]"
                />
              </div>
            </div>

            <div className="flex justify-between mt-10">
              <button onClick={() => setStep(1)} className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 font-bold hover:text-[#FF9933] transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>पीछे</span>
              </button>
              <button 
                disabled={!date || !address}
                onClick={() => setStep(3)}
                className="bg-[#FF9933] text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-2 disabled:opacity-50 shadow-lg"
              >
                <span>भुगतान पर जाएँ</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="text-center space-y-8"
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-6 dark:text-white">UPI भुगतान</h2>
              <div className="bg-[#FFF5E6] dark:bg-gray-900 p-6 rounded-2xl mb-6">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">कुल राशि</div>
                <div className="text-4xl font-bold text-[#FF9933]">₹{selectedPuja?.price}</div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-4">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-8" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">नीचे दिए गए बटन पर क्लिक करके भुगतान पूरा करें</p>
              </div>

              <button 
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-[#4A2C2A] dark:bg-orange-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2D1B1A] dark:hover:bg-orange-800 transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <CreditCard className="w-5 h-5" />
                <span>{loading ? 'प्रक्रिया जारी है...' : 'अभी भुगतान करें'}</span>
              </button>
            </div>
            <button onClick={() => setStep(2)} className="text-gray-500 dark:text-gray-400 font-bold hover:text-[#FF9933] transition-colors">पीछे जाएँ</button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-6 py-12"
          >
            <div className="bg-green-100 dark:bg-green-900/20 w-24 h-24 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-6">
              <CheckCircle2 className="w-16 h-16" />
            </div>
            <h2 className="text-4xl font-bold text-[#4A2C2A] dark:text-orange-100">बुकिंग सफल!</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              आपकी पूजा सफलतापूर्वक बुक कर ली गई है। जल्द ही आपको पंडित जी का विवरण भेज दिया जाएगा।
            </p>
            <div className="pt-8">
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-[#FF9933] text-white px-10 py-4 rounded-full font-bold hover:bg-[#FF8811] transition-all shadow-lg"
              >
                डैशबोर्ड पर जाएँ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
