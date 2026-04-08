import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Booking, PanditProfile } from '../types';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Video, CheckCircle, Bell, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { hi } from 'date-fns/locale';

export default function PanditDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [panditProfile, setPanditProfile] = useState<PanditProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchProfile = async () => {
      const docSnap = await getDoc(doc(db, 'pandits', auth.currentUser!.uid));
      if (docSnap.exists()) {
        setPanditProfile(docSnap.data() as PanditProfile);
      }
    };

    fetchProfile();

    const q = query(
      collection(db, 'bookings'),
      where('panditId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#4A2C2A] dark:text-orange-100">पंडित डैशबोर्ड</h1>
          <p className="text-gray-500 dark:text-gray-400">आपकी आगामी पूजा और अनुष्ठान</p>
        </div>
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-2">
          <Bell className="w-5 h-5 text-[#FF9933]" />
          <span className="font-bold dark:text-white">3 नई सूचनाएं</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold dark:text-white">आगामी अनुष्ठान</h3>
          {loading ? (
            <p className="dark:text-gray-400">लोड हो रहा है...</p>
          ) : bookings.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl text-center border border-dashed border-gray-200 dark:border-gray-700">
              <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">अभी कोई अनुष्ठान नियुक्त नहीं किया गया है</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <motion.div 
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-[#FF9933] transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#FFF5E6] dark:bg-orange-900/20 p-2 rounded-lg text-[#FF9933]">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-lg dark:text-white">{format(new Date(booking.date), 'dd MMMM yyyy, hh:mm a', { locale: hi })}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span>{booking.address}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                      <Video className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">वीडियो लिंक: {booking.videoLink || 'उपलब्ध नहीं'}</span>
                    </div>
                    {booking.vehiclePrepayment && (
                      <div className="flex items-center space-x-3 text-sm font-bold text-[#FF9933]">
                        <div className="bg-[#FFF5E6] dark:bg-orange-900/20 p-1 rounded">
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                        </div>
                        <span>वाहन स्थिति: {
                          booking.vehicleStatus === 'confirmed' ? 'कन्फर्म' :
                          booking.vehicleStatus === 'dispatched' ? 'निकल चुका है' :
                          booking.vehicleStatus === 'completed' ? 'पहुंच गया' : 'लंबित'
                        }</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase">पुष्टि की गई</span>
                    <button className="bg-[#4A2C2A] dark:bg-orange-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#2D1B1A] dark:hover:bg-orange-800 transition-colors shadow-md">
                      संपर्क करें
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold mb-6 dark:text-white">प्रोफ़ाइल स्थिति</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">सत्यापन</span>
                <span className="text-green-600 dark:text-green-400 font-bold flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" /> सत्यापित
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">रेटिंग</span>
                <span className="font-bold dark:text-white">4.9/5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">पूर्ण पूजा</span>
                <span className="font-bold dark:text-white">124</span>
              </div>
            </div>
          </div>

          {panditProfile && panditProfile.specialization && panditProfile.specialization.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold mb-4 flex items-center space-x-2 dark:text-white">
                <Shield className="w-5 h-5 text-[#FF9933]" />
                <span>आपकी विशेषज्ञता</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {panditProfile.specialization.map((spec) => (
                  <span key={spec} className="bg-[#FFF5E6] dark:bg-orange-900/20 text-[#FF9933] px-3 py-1 rounded-full text-xs font-bold">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-br from-[#FF9933] to-[#FFD700] p-6 rounded-3xl text-white shadow-lg">
            <h3 className="font-bold mb-2">आज का सुविचार</h3>
            <p className="text-sm italic opacity-90">"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
