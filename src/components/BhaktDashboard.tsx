import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Booking, Puja } from '../types';
import { motion } from 'motion/react';
import { Calendar, Clock, CreditCard, Video, MapPin, Plus, ChevronRight, Car, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { hi } from 'date-fns/locale';

export default function BhaktDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'bookings'),
      where('bhaktId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(data);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'पुष्टि की गई';
      case 'pending': return 'लंबित';
      case 'completed': return 'पूर्ण';
      case 'cancelled': return 'रद्द';
      default: return status;
    }
  };

  const getVehicleStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'वाहन कन्फर्म';
      case 'pending': return 'प्रक्रिया में';
      case 'dispatched': return 'निकल चुका है';
      case 'completed': return 'पहुंच गया';
      default: return 'लंबित';
    }
  };

  const activeVehicleBookings = bookings.filter(b => b.vehiclePrepayment && b.vehicleStatus !== 'completed').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#4A2C2A] dark:text-orange-100">मेरा डैशबोर्ड</h1>
          <p className="text-gray-500 dark:text-gray-400">आपकी सभी पूजा बुकिंग और विवरण यहाँ हैं</p>
        </div>
        <Link 
          to="/booking" 
          className="bg-[#FF9933] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-[#FF8811] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>नई पूजा बुक करें</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-[#FFD700]">
            <h3 className="text-lg font-bold mb-4 dark:text-white">प्रोफ़ाइल सारांश</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-[#FFF5E6] dark:bg-gray-700 p-2 rounded-lg text-[#FF9933]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">कुल बुकिंग</div>
                  <div className="font-bold dark:text-white">{bookings.length}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-[#FFF5E6] dark:bg-gray-700 p-2 rounded-lg text-[#FF9933]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">भुगतान स्थिति</div>
                  <div className="font-bold dark:text-white">सक्रिय</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#4A2C2A] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">वृंदावन से वाहन</h3>
              <p className="text-sm opacity-80 mb-4">
                {activeVehicleBookings > 0 
                  ? `आपके ${activeVehicleBookings} वाहन बुकिंग सक्रिय हैं।` 
                  : 'पंडित जी के आगमन के लिए वाहन की अग्रिम बुकिंग करें।'}
              </p>
              {activeVehicleBookings === 0 && (
                <Link to="/booking" className="inline-block bg-[#FF9933] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#FF8811] transition-colors">
                  अभी बुक करें
                </Link>
              )}
            </div>
            <MapPin className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
          </div>
        </div>

        {/* Bookings List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">हालिया बुकिंग</h3>
              <Link to="/history" className="text-[#FF9933] text-sm font-bold hover:underline">सभी देखें</Link>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-gray-500">लोड हो रहा है...</div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-[#FFF5E6] dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center text-[#FF9933] mx-auto mb-4">
                  <Calendar className="w-8 h-8" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-6">अभी तक कोई बुकिंग नहीं मिली है</p>
                <Link to="/booking" className="text-[#FF9933] font-bold hover:underline">अपनी पहली पूजा बुक करें</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {bookings.map((booking) => (
                  <motion.div 
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-[#FFF5E6] dark:bg-gray-700 p-3 rounded-xl text-[#FF9933]">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg dark:text-white">पूजा ID: {booking.id.slice(0, 8)}</h4>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 space-x-4">
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {format(new Date(booking.date), 'dd MMM yyyy', { locale: hi })}</span>
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {booking.address.slice(0, 20)}...</span>
                          </div>
                          {booking.vehiclePrepayment && (
                            <div className="mt-3 flex items-center space-x-2 text-xs font-bold">
                              <span className="flex items-center text-[#FF9933] bg-[#FFF5E6] dark:bg-gray-700 px-2 py-1 rounded-md">
                                <Car className="w-3 h-3 mr-1" />
                                वाहन सेवा: {getVehicleStatusText(booking.vehicleStatus || 'pending')}
                              </span>
                              {booking.vehicleStatus === 'confirmed' && (
                                <span className="text-green-600 flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  कन्फर्म
                                </span>
                              )}
                              {booking.vehicleStatus === 'dispatched' && (
                                <span className="text-blue-600 flex items-center">
                                  <Car className="w-3 h-3 mr-1 animate-pulse" />
                                  रास्ते में
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                        {booking.videoLink && (
                          <a href={booking.videoLink} target="_blank" rel="noreferrer" className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                            <Video className="w-5 h-5" />
                          </a>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const BookOpen = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
