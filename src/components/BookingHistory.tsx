import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Booking } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  ChevronRight, 
  Car, 
  CheckCircle, 
  Filter, 
  Search, 
  ArrowLeft,
  CalendarDays,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { hi } from 'date-fns/locale';

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    let matchesDate = true;
    if (startDate || endDate) {
      const bookingDate = parseISO(booking.date);
      const start = startDate ? startOfDay(parseISO(startDate)) : new Date(0);
      const end = endDate ? endOfDay(parseISO(endDate)) : new Date(8640000000000000);
      matchesDate = isWithinInterval(bookingDate, { start, end });
    }

    return matchesStatus && matchesDate;
  });

  const clearFilters = () => {
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#4A2C2A] dark:text-orange-100">बुकिंग इतिहास</h1>
            <p className="text-gray-500 dark:text-gray-400">आपकी सभी पुरानी और वर्तमान पूजा बुकिंग</p>
          </div>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold border-2 transition-all ${
            showFilters || statusFilter !== 'all' || startDate || endDate
              ? 'border-[#FF9933] text-[#FF9933] bg-[#FFF5E6] dark:bg-orange-900/10'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#FF9933]'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>फिल्टर</span>
          {(statusFilter !== 'all' || startDate || endDate) && (
            <span className="bg-[#FF9933] text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">स्थिति (Status)</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-3 bg-[#FFF5E6] dark:bg-gray-900 rounded-xl outline-none border-2 border-transparent focus:border-[#FF9933] dark:text-white"
                >
                  <option value="all">सभी (All)</option>
                  <option value="pending">लंबित (Pending)</option>
                  <option value="confirmed">पुष्टि की गई (Confirmed)</option>
                  <option value="completed">पूर्ण (Completed)</option>
                  <option value="cancelled">रद्द (Cancelled)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">प्रारंभ तिथि (Start Date)</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 bg-[#FFF5E6] dark:bg-gray-900 rounded-xl outline-none border-2 border-transparent focus:border-[#FF9933] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">अंतिम तिथि (End Date)</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 bg-[#FFF5E6] dark:bg-gray-900 rounded-xl outline-none border-2 border-transparent focus:border-[#FF9933] dark:text-white"
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={clearFilters}
                  className="w-full p-3 text-gray-500 dark:text-gray-400 font-bold hover:text-red-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>साफ़ करें (Clear)</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-gray-500">लोड हो रहा है...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-[#FFF5E6] dark:bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center text-[#FF9933] mx-auto mb-6">
              <CalendarDays className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">कोई बुकिंग नहीं मिली</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">आपके द्वारा चुने गए फिल्टर के अनुसार कोई परिणाम नहीं मिला।</p>
            <button 
              onClick={clearFilters}
              className="text-[#FF9933] font-bold hover:underline"
            >
              सभी फिल्टर हटाएँ
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredBookings.map((booking) => (
              <motion.div 
                key={booking.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start space-x-5">
                    <div className="bg-[#FFF5E6] dark:bg-gray-700 p-4 rounded-2xl text-[#FF9933] flex-shrink-0">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-bold text-xl dark:text-white">पूजा ID: {booking.id.slice(0, 8)}</h4>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{format(new Date(booking.date), 'dd MMM yyyy, hh:mm a', { locale: hi })}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate max-w-[200px]">{booking.address}</span>
                        </div>
                        {booking.paymentStatus === 'paid' && (
                          <div className="flex items-center text-sm text-green-600 dark:text-green-400 font-bold">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span>भुगतान सफल (Paid)</span>
                          </div>
                        )}
                      </div>

                      {booking.vehiclePrepayment && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 inline-flex items-center space-x-3">
                          <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                            वाहन सेवा: {getVehicleStatusText(booking.vehicleStatus || 'pending')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 self-end md:self-center">
                    {booking.videoLink && (
                      <a 
                        href={booking.videoLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 transition-colors font-bold text-sm"
                      >
                        <Video className="w-4 h-4" />
                        <span>लाइव देखें</span>
                      </a>
                    )}
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const BookOpen = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
