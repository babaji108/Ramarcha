import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { motion } from 'motion/react';
import { Phone, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error('कृपया सही मोबाइल नंबर दर्ज करें');
      return;
    }
    setLoading(true);
    // Simulate OTP sending
    setTimeout(() => {
      setStep('otp');
      setLoading(false);
      toast.success('OTP आपके मोबाइल पर भेज दिया गया है (सिमुलेशन: 123456)');
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456') {
      toast.error('गलत OTP');
      return;
    }
    setLoading(true);
    try {
      // In a real app, we'd use Firebase Phone Auth
      // Here we'll simulate a login with a fixed UID for the demo
      // or use Google Login as a real alternative
      toast.info('OTP सत्यापन सफल। कृपया Google से लॉगिन पूरा करें (डेमो के लिए)');
      setLoading(false);
    } catch (error) {
      toast.error('लॉगिन विफल');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      const isSuperAdmin = user.email === 'sriswamiji108@gmail.com';
      const defaultRole = isSuperAdmin ? 'super_admin' : 'bhakt';
      
      if (!docSnap.exists()) {
        // New user
        await setDoc(docRef, {
          uid: user.uid,
          name: user.displayName || 'अनाम भक्त',
          email: user.email,
          role: defaultRole,
          emailVerified: user.emailVerified,
          createdAt: new Date().toISOString()
        });
      } else if (isSuperAdmin && docSnap.data().role !== 'super_admin') {
        // Force update to super_admin if they were already created as something else
        await setDoc(docRef, { role: 'super_admin' }, { merge: true });
      }
      
      toast.success('लॉगिन सफल!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login Error Details:", error);
      toast.error(`लॉगिन विफल: ${error.message || 'अज्ञात त्रुटि'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-[#FFD700] w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="bg-[#FFF5E6] dark:bg-gray-700 w-16 h-16 rounded-2xl flex items-center justify-center text-[#FF9933] mx-auto mb-4">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-[#4A2C2A] dark:text-orange-100">लॉगिन करें</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">अखाड़ा परिवार में आपका स्वागत है</p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">मोबाइल नंबर</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-4 py-4 bg-[#FFF5E6] dark:bg-gray-900 border-2 border-transparent focus:border-[#FF9933] rounded-xl outline-none transition-all dark:text-white"
                  required
                />
              </div>
            </div>
            <button 
              disabled={loading}
              className="w-full bg-[#FF9933] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#FF8811] transition-all flex items-center justify-center space-x-2 shadow-lg"
            >
              {loading ? 'भेज रहा है...' : 'OTP भेजें'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OTP दर्ज करें</label>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-4 bg-[#FFF5E6] dark:bg-gray-900 border-2 border-transparent focus:border-[#FF9933] rounded-xl outline-none transition-all text-center text-2xl tracking-[1em] dark:text-white"
                maxLength={6}
                required
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-[#FF9933] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#FF8811] transition-all shadow-lg"
            >
              सत्यापित करें
            </button>
            <button 
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-[#FF9933] font-medium hover:underline"
            >
              नंबर बदलें
            </button>
          </form>
        )}

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">या फिर</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-8 w-full border-2 border-gray-200 dark:border-gray-700 py-4 rounded-xl font-bold flex items-center justify-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all dark:text-white"
        >
          <Mail className="w-5 h-5" />
          <span>Google के साथ लॉगिन करें</span>
        </button>
      </motion.div>
    </div>
  );
}
