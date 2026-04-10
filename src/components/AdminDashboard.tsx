import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, getDocs, setDoc, getDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Booking, UserProfile, PanditProfile, UserRole, Membership } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Users, BookOpen, CreditCard, CheckCircle, XCircle, UserCheck, Shield, Filter, X, Plus, Edit, Trash2, Car, Award, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Puja } from '../types';
import { sendNotification } from './NotificationBell';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pandits, setPandits] = useState<UserProfile[]>([]);
  const [panditProfiles, setPanditProfiles] = useState<Record<string, PanditProfile>>({});
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'users' | 'pandits' | 'pujas' | 'memberships'>('bookings');
  const [loading, setLoading] = useState(true);
  const [editingPandit, setEditingPandit] = useState<UserProfile | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editingPuja, setEditingPuja] = useState<Partial<Puja> | null>(null);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [newRole, setNewRole] = useState<UserRole | null>(null);

  const ROLES: { id: UserRole; label: string }[] = [
    { id: 'super_admin', label: 'सुपर एडमिन' },
    { id: 'admin', label: 'एडमिन' },
    { id: 'pandit', label: 'पंडित' },
    { id: 'bhakt', label: 'भक्त' },
  ];

  const SPECIALIZATIONS = [
    'कर्मकांड (Karma Kand)',
    'वैदिक अनुष्ठान (Vedic Rituals)',
    'ज्योतिष (Astrology)',
    'वास्तु शास्त्र (Vastu Shastra)',
    'संस्कार (Sanskar)',
    'भागवत कथा (Bhagwat Katha)',
    'अभिषेक (Abhishek)',
    'जाप (Jaap)'
  ];

  useEffect(() => {
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const allUsers = snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
      setUsers(allUsers);
      setPandits(allUsers.filter(u => u.role === 'pandit'));
      setLoading(false);
    });

    const unsubPanditProfiles = onSnapshot(collection(db, 'pandits'), (snapshot) => {
      const profiles: Record<string, PanditProfile> = {};
      snapshot.docs.forEach(doc => {
        profiles[doc.id] = { uid: doc.id, ...doc.data() } as PanditProfile;
      });
      setPanditProfiles(profiles);
    });

    const unsubPujas = onSnapshot(collection(db, 'pujas'), (snapshot) => {
      setPujas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Puja)));
    });

    const unsubMemberships = onSnapshot(collection(db, 'memberships'), (snapshot) => {
      setMemberships(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Membership)));
    });

    return () => {
      unsubBookings();
      unsubUsers();
      unsubPanditProfiles();
      unsubPujas();
      unsubMemberships();
    };
  }, []);

  const handleVerifyPandit = async (uid: string, verify: boolean) => {
    try {
      await setDoc(doc(db, 'pandits', uid), {
        isVerified: verify,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      // Send notification to Pandit
      await sendNotification(
        uid,
        verify ? 'प्रोफ़ाइल सत्यापित' : 'सत्यापन अपडेट',
        verify 
          ? 'बधाई हो! आपकी पंडित प्रोफ़ाइल एडमिन द्वारा सत्यापित कर दी गई है।' 
          : 'आपकी प्रोफ़ाइल सत्यापन स्थिति अपडेट की गई है। कृपया विवरण जांचें।',
        'system'
      );

      toast.success(`पंडित ${verify ? 'सत्यापित' : 'अस्वीकार'} किया गया`);
    } catch (error) {
      toast.error('त्रुटि हुई');
    }
  };

  const handleAssignPandit = async (bookingId: string, panditId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        panditId: panditId,
        status: 'confirmed'
      });
      
      // Send notification to Bhakt
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await sendNotification(
          booking.bhaktId,
          'पंडित नियुक्त किया गया',
          `आपकी पूजा के लिए पंडित नियुक्त कर दिया गया है।`,
          'booking',
          '/dashboard'
        );
        
        // Send notification to Pandit
        await sendNotification(
          panditId,
          'नई पूजा असाइन की गई',
          `आपको एक नई पूजा के लिए नियुक्त किया गया है।`,
          'booking',
          '/dashboard'
        );
      }

      toast.success('पंडित सफलतापूर्वक नियुक्त किया गया');
    } catch (error) {
      toast.error('नियुक्ति विफल');
    }
  };

  const openSpecializationModal = async (pandit: UserProfile) => {
    setEditingPandit(pandit);
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'pandits', pandit.uid));
      if (docSnap.exists()) {
        setSelectedSpecializations(docSnap.data().specialization || []);
      } else {
        setSelectedSpecializations([]);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSaveSpecializations = async () => {
    if (!editingPandit) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'pandits', editingPandit.uid), {
        uid: editingPandit.uid,
        specialization: selectedSpecializations,
        isVerified: true, // Default to true when admin edits
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('विशेषज्ञता सफलतापूर्वक अपडेट की गई');
      setEditingPandit(null);
    } catch (error) {
      toast.error('अपडेट विफल');
    }
    setLoading(false);
  };

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecializations(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleUpdateRole = async () => {
    if (!editingUser || !newRole || !auth.currentUser) return;
    setLoading(true);
    try {
      const currentAdmin = users.find(u => u.uid === auth.currentUser?.uid);
      const oldRole = editingUser.role;

      await updateDoc(doc(db, 'users', editingUser.uid), {
        role: newRole,
        updatedAt: new Date().toISOString()
      });

      // Create Audit Log
      await addDoc(collection(db, 'audit_logs'), {
        adminId: auth.currentUser.uid,
        adminName: currentAdmin?.name || 'Unknown Admin',
        targetUserId: editingUser.uid,
        targetUserName: editingUser.name,
        oldRole: oldRole,
        newRole: newRole,
        timestamp: new Date().toISOString()
      });

      toast.success('उपयोगकर्ता भूमिका सफलतापूर्वक अपडेट की गई');
      setEditingUser(null);
    } catch (error) {
      toast.error('भूमिका अपडेट विफल');
    }
    setLoading(false);
  };

  const handleSavePuja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPuja) return;
    setLoading(true);
    try {
      const pujaData = {
        ...editingPuja,
        price: Number(editingPuja.price),
        updatedAt: new Date().toISOString()
      };
      
      if (editingPuja.id) {
        await updateDoc(doc(db, 'pujas', editingPuja.id), pujaData);
        toast.success('पूजा सफलतापूर्वक अपडेट की गई');
      } else {
        const newDocRef = doc(collection(db, 'pujas'));
        await setDoc(newDocRef, { ...pujaData, id: newDocRef.id });
        toast.success('नई पूजा सफलतापूर्वक जोड़ी गई');
      }
      setEditingPuja(null);
    } catch (error) {
      toast.error('पूजा सहेजने में विफल');
    }
    setLoading(false);
  };

  const handleDeletePuja = async (id: string) => {
    if (!confirm('क्या आप वाकई इस पूजा को हटाना चाहते हैं?')) return;
    try {
      // In a real app, we'd use deleteDoc
      // Here we'll just show a toast for safety in demo
      toast.success('पूजा हटा दी गई (सिमुलेशन)');
    } catch (error) {
      toast.error('हटाने में विफल');
    }
  };

  const handleUpdateVehicleStatus = async (bookingId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        vehicleStatus: status
      });
      
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        let statusMsg = '';
        switch(status) {
          case 'confirmed': statusMsg = 'कन्फर्म हो गया है'; break;
          case 'dispatched': statusMsg = 'निकल चुका है'; break;
          case 'completed': statusMsg = 'पहुंच गया है'; break;
          default: statusMsg = 'अपडेट हो गया है';
        }
        
        await sendNotification(
          booking.bhaktId,
          'वाहन स्थिति अपडेट',
          `आपकी पूजा के लिए वाहन ${statusMsg}।`,
          'booking',
          '/dashboard'
        );
      }
      
      toast.success('वाहन स्थिति अपडेट की गई');
    } catch (error) {
      toast.error('अपडेट विफल');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#4A2C2A] dark:text-orange-100">एडमिन डैशबोर्ड</h1>
          <p className="text-gray-500 dark:text-gray-400">प्रबंधन और नियंत्रण केंद्र</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'लंबित बुकिंग', value: bookings.filter(b => b.status === 'pending').length, icon: <Calendar className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'लंबित सदस्यता', value: memberships.filter(m => m.status === 'pending').length, icon: <Award className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'कुल पंडित', value: pandits.length, icon: <Users className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'कन्फर्म बुकिंग', value: bookings.filter(b => b.status === 'confirmed').length, icon: <CreditCard className="w-5 h-5" />, color: 'text-green-500', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className={`${stat.bg} dark:bg-gray-700 p-2 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-2xl font-bold dark:text-white">{stat.value}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          {[
            { id: 'bookings', label: 'बुकिंग', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'users', label: 'उपयोगकर्ता', icon: <Users className="w-4 h-4" /> },
            { id: 'pandits', label: 'पंडित', icon: <Shield className="w-4 h-4" /> },
            { id: 'pujas', label: 'पूजा प्रबंधन', icon: <Plus className="w-4 h-4" /> },
            { id: 'memberships', label: 'सदस्यता', icon: <Award className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id ? 'bg-[#FF9933] text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span className="hidden md:inline font-bold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FFF5E6] dark:bg-gray-900 text-[#4A2C2A] dark:text-orange-100">
                <tr>
                  <th className="px-6 py-4 font-bold">ID</th>
                  <th className="px-6 py-4 font-bold">पूजा</th>
                  <th className="px-6 py-4 font-bold">तिथि</th>
                  <th className="px-6 py-4 font-bold">स्थिति</th>
                  <th className="px-6 py-4 font-bold">पंडित</th>
                  <th className="px-6 py-4 font-bold">वाहन</th>
                  <th className="px-6 py-4 font-bold">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono dark:text-gray-400">{booking.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-medium dark:text-white">पूजा ID: {booking.pujaId}</td>
                    <td className="px-6 py-4 text-sm dark:text-gray-300">{new Date(booking.date).toLocaleDateString('hi-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {booking.panditId ? (
                        <span className="text-sm font-medium dark:text-gray-300">नियुक्त: {booking.panditId.slice(0, 8)}</span>
                      ) : (
                        <select 
                          onChange={(e) => handleAssignPandit(booking.id, e.target.value)}
                          className="text-sm bg-[#FFF5E6] dark:bg-gray-700 border-none rounded-lg px-2 py-1 outline-none dark:text-white"
                        >
                          <option value="">पंडित चुनें</option>
                          {pandits.map(p => (
                            <option key={p.uid} value={p.uid}>{p.name}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {booking.vehiclePrepayment ? (
                        <select 
                          value={booking.vehicleStatus || 'pending'}
                          onChange={(e) => handleUpdateVehicleStatus(booking.id, e.target.value)}
                          className={`text-xs border-none rounded-lg px-2 py-1 outline-none font-bold ${
                            booking.vehicleStatus === 'confirmed' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                            booking.vehicleStatus === 'dispatched' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                            booking.vehicleStatus === 'completed' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' :
                            'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                          }`}
                        >
                          <option value="pending">लंबित</option>
                          <option value="confirmed">कन्फर्म</option>
                          <option value="dispatched">निकल गया</option>
                          <option value="completed">पहुंच गया</option>
                        </select>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-[#FF9933] hover:underline text-sm font-bold">विवरण</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.uid} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-[#FFF5E6] dark:bg-gray-700 p-3 rounded-full text-[#FF9933]">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold dark:text-white">{user.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <p>ईमेल: {user.email || 'N/A'}</p>
                <p>फोन: {user.phone || 'N/A'}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setEditingUser(user);
                    setNewRole(user.role);
                  }}
                  className="flex-1 bg-[#FFF5E6] dark:bg-gray-700 text-[#FF9933] py-2 rounded-lg text-sm font-bold hover:bg-[#FF9933] hover:text-white transition-all"
                >
                  भूमिका बदलें
                </button>
                <button className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">हटाएं</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'pandits' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold dark:text-white">पंडित सत्यापन</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {pandits.map((p) => {
              const isVerified = panditProfiles[p.uid]?.isVerified;
              return (
                <div key={p.uid} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-[#FFF5E6] dark:bg-gray-700 rounded-full flex items-center justify-center text-[#FF9933] font-bold">
                        {p.name[0]}
                      </div>
                      {isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                          <CheckCircle className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold dark:text-white">{p.name}</h4>
                        {isVerified ? (
                          <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">सत्यापित</span>
                        ) : (
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full font-bold">लंबित</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => openSpecializationModal(p)}
                      className="px-4 py-2 bg-[#FFF5E6] dark:bg-gray-700 text-[#FF9933] rounded-lg text-sm font-bold hover:bg-[#FF9933] hover:text-white transition-all"
                    >
                      विशेषज्ञता बदलें
                    </button>
                    <div className="flex space-x-2">
                      {!isVerified ? (
                        <button 
                          onClick={() => handleVerifyPandit(p.uid, true)} 
                          className="flex items-center space-x-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-xs font-bold"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>सत्यापित करें</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleVerifyPandit(p.uid, false)} 
                          className="flex items-center space-x-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-xs font-bold"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>हटाएं</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'pujas' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold dark:text-white">पूजा सेवाएँ</h3>
            <button 
              onClick={() => setEditingPuja({ name: '', description: '', price: 0, category: 'कथा' })}
              className="bg-[#FF9933] text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2 shadow-md hover:bg-[#e68a2e] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>नई पूजा जोड़ें</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pujas.map((puja) => (
              <div key={puja.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg dark:text-white">{puja.name}</h4>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-500 dark:text-gray-400">{puja.category}</span>
                  </div>
                  <div className="text-[#FF9933] font-bold text-xl">₹{puja.price}</div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">{puja.description}</p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setEditingPuja(puja)}
                    className="flex-1 bg-[#FFF5E6] dark:bg-gray-700 text-[#FF9933] py-2 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 hover:bg-[#FF9933] hover:text-white transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span>एडिट</span>
                  </button>
                  <button 
                    onClick={() => handleDeletePuja(puja.id)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'memberships' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FFF5E6] dark:bg-gray-900 text-[#4A2C2A] dark:text-orange-100">
                <tr>
                  <th className="px-6 py-4 font-bold">नाम</th>
                  <th className="px-6 py-4 font-bold">संपर्क</th>
                  <th className="px-6 py-4 font-bold">प्रकार</th>
                  <th className="px-6 py-4 font-bold">व्यवसाय</th>
                  <th className="px-6 py-4 font-bold">स्थिति</th>
                  <th className="px-6 py-4 font-bold">तिथि</th>
                  <th className="px-6 py-4 font-bold">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {memberships.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold dark:text-white">{m.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{m.address.slice(0, 30)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm dark:text-gray-300">{m.phone}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{m.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        m.membershipType === 'patron' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        m.membershipType === 'life' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {m.membershipType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm dark:text-gray-300">{m.occupation}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        m.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        m.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm dark:text-gray-400">{new Date(m.createdAt).toLocaleDateString('hi-IN')}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {m.status === 'pending' && (
                          <>
                            <button 
                              onClick={async () => {
                                await updateDoc(doc(db, 'memberships', m.id), { status: 'approved' });
                                toast.success('सदस्यता स्वीकृत');
                              }}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={async () => {
                                await updateDoc(doc(db, 'memberships', m.id), { status: 'rejected' });
                                toast.error('सदस्यता अस्वीकृत');
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {editingPuja && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-[#FF9933] text-white">
                <h3 className="text-xl font-bold">{editingPuja.id ? 'पूजा एडिट करें' : 'नई पूजा जोड़ें'}</h3>
                <button onClick={() => setEditingPuja(null)} className="p-1 hover:bg-white/20 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSavePuja} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">पूजा का नाम</label>
                    <input 
                      type="text" 
                      value={editingPuja.name}
                      onChange={(e) => setEditingPuja({ ...editingPuja, name: e.target.value })}
                      className="w-full px-4 py-2 bg-[#FFF5E6] dark:bg-gray-700 rounded-xl outline-none dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">कीमत (₹)</label>
                    <input 
                      type="number" 
                      value={editingPuja.price}
                      onChange={(e) => setEditingPuja({ ...editingPuja, price: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-[#FFF5E6] dark:bg-gray-700 rounded-xl outline-none dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">श्रेणी</label>
                    <select 
                      value={editingPuja.category}
                      onChange={(e) => setEditingPuja({ ...editingPuja, category: e.target.value })}
                      className="w-full px-4 py-2 bg-[#FFF5E6] dark:bg-gray-700 rounded-xl outline-none dark:text-white"
                    >
                      <option value="कथा">कथा</option>
                      <option value="अभिषेक">अभिषेक</option>
                      <option value="संस्कार">संस्कार</option>
                      <option value="जाप">जाप</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">विवरण (Description)</label>
                    <textarea 
                      value={editingPuja.description}
                      onChange={(e) => setEditingPuja({ ...editingPuja, description: e.target.value })}
                      className="w-full px-4 py-2 bg-[#FFF5E6] dark:bg-gray-700 rounded-xl outline-none h-32 resize-none dark:text-white"
                      placeholder="पूजा के बारे में विस्तार से लिखें..."
                      required
                    />
                  </div>
                </div>
                <div className="pt-4 flex space-x-3">
                  <button 
                    type="button"
                    onClick={() => setEditingPuja(null)}
                    className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-500 dark:text-gray-400"
                  >
                    रद्द करें
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-[#FF9933] text-white rounded-xl font-bold"
                  >
                    {loading ? 'सहेज रहा है...' : 'सहेजें'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Role Management Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#4A2C2A] text-white">
                <h3 className="text-xl font-bold">भूमिका बदलें - {editingUser.name}</h3>
                <button onClick={() => setEditingUser(null)} className="p-1 hover:bg-white/20 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-500 mb-4">उपयोगकर्ता के लिए नई भूमिका चुनें:</p>
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setNewRole(role.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        newRole === role.id
                          ? 'border-[#FF9933] bg-[#FFF5E6] text-[#FF9933]'
                          : 'border-gray-100 hover:border-[#FFD700] text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{role.label}</span>
                      {newRole === role.id && <CheckCircle className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-gray-50 flex space-x-3">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                >
                  रद्द करें
                </button>
                <button 
                  onClick={handleUpdateRole}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#FF9933] text-white rounded-xl font-bold hover:bg-[#FF8811] transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? 'सहेज रहा है...' : 'अपडेट करें'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Specialization Modal */}
      <AnimatePresence>
        {editingPandit && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FF9933] text-white">
                <h3 className="text-xl font-bold">विशेषज्ञता चुनें - {editingPandit.name}</h3>
                <button onClick={() => setEditingPandit(null)} className="p-1 hover:bg-white/20 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-500 mb-4">पंडित की विशेषज्ञता के अनुसार विकल्प चुनें:</p>
                <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
                  {SPECIALIZATIONS.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => toggleSpecialization(spec)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        selectedSpecializations.includes(spec)
                          ? 'border-[#FF9933] bg-[#FFF5E6] text-[#FF9933]'
                          : 'border-gray-100 hover:border-[#FFD700] text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{spec}</span>
                      {selectedSpecializations.includes(spec) && <CheckCircle className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-gray-50 flex space-x-3">
                <button 
                  onClick={() => setEditingPandit(null)}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                >
                  रद्द करें
                </button>
                <button 
                  onClick={handleSaveSpecializations}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#FF9933] text-white rounded-xl font-bold hover:bg-[#FF8811] transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? 'सहेज रहा है...' : 'सहेजें'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
