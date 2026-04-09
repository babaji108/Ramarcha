import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Image as ImageIcon, Bell, ShieldAlert, Database, X, Send, Plus, Trash2, Edit2, ExternalLink, ToggleLeft, ToggleRight, Globe, Users, ChevronRight } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { sendNotification } from './NotificationBell';
import { toast } from 'sonner';
import { Banner, AuditLog } from '../types';
import { format } from 'date-fns';
import { hi } from 'date-fns/locale';

export default function SuperAdminDashboard() {
  const [showConfig, setShowConfig] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    active: true
  });

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)));
    });

    const auditQuery = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'));
    const unsubAudit = onSnapshot(auditQuery, (snapshot) => {
      setAuditLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog)));
    });

    return () => {
      unsubscribe();
      unsubAudit();
    };
  }, []);

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await updateDoc(doc(db, 'banners', editingBanner.id), {
          ...bannerForm,
          updatedAt: new Date().toISOString()
        });
        toast.success('बैनर अपडेट किया गया');
      } else {
        await addDoc(collection(db, 'banners'), {
          ...bannerForm,
          createdAt: new Date().toISOString()
        });
        toast.success('नया बैनर जोड़ा गया');
      }
      setShowBannerModal(false);
      setEditingBanner(null);
      setBannerForm({ title: '', imageUrl: '', linkUrl: '', active: true });
    } catch (error) {
      toast.error('बैनर सहेजने में विफल');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('क्या आप वाकई इस बैनर को हटाना चाहते हैं?')) return;
    try {
      await deleteDoc(doc(db, 'banners', id));
      toast.success('बैनर हटाया गया');
    } catch (error) {
      toast.error('हटाने में विफल');
    }
  };

  const handleToggleBanner = async (banner: Banner) => {
    try {
      await updateDoc(doc(db, 'banners', banner.id), {
        active: !banner.active
      });
    } catch (error) {
      toast.error('स्थिति बदलने में विफल');
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const promises = usersSnap.docs.map(userDoc => 
        sendNotification(
          userDoc.id,
          broadcastTitle,
          broadcastMessage,
          'system'
        )
      );
      await Promise.all(promises);
      toast.success(`${usersSnap.size} उपयोगकर्ताओं को नोटिफिकेशन भेजा गया`);
      setShowBroadcast(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (error) {
      toast.error('ब्रॉडकास्ट विफल रहा');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'सर्वर स्थिति', value: 'सक्रिय', color: 'text-green-500', icon: <Globe className="w-5 h-5" /> },
          { label: 'डेटाबेस लोड', value: 'कम', color: 'text-blue-500', icon: <Database className="w-5 h-5" /> },
          { label: 'सक्रिय उपयोगकर्ता', value: '1,240', color: 'text-purple-500', icon: <Users className="w-5 h-5" /> },
          { label: 'सुरक्षा स्थिति', value: 'सुरक्षित', color: 'text-green-600', icon: <ShieldAlert className="w-5 h-5" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">{stat.label}</span>
              <div className={stat.color}>{stat.icon}</div>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="text-red-500" />
          <div>
            <p className="font-bold text-red-800 dark:text-red-400">सुपर एडमिन एक्सेस</p>
            <p className="text-xs text-red-600 dark:text-red-500">आपके पास पूर्ण नियंत्रण है। कृपया सावधानी बरतें।</p>
          </div>
        </div>
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors flex items-center space-x-2"
        >
          <Settings className="w-4 h-4" />
          <span>सिस्टम सेटिंग्स</span>
        </button>
      </div>

      {showConfig && (
        <div className="space-y-6">
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold mb-4 flex items-center space-x-2 dark:text-white">
                <ImageIcon className="w-5 h-5 text-[#FF9933]" />
                <span>बैनर प्रबंधन</span>
              </h3>
              <button 
                onClick={() => {
                  setEditingBanner(null);
                  setBannerForm({ title: '', imageUrl: '', linkUrl: '', active: true });
                  setShowBannerModal(true);
                }}
                className="w-full bg-[#FFF5E6] dark:bg-gray-700 text-[#FF9933] py-2 rounded-lg font-bold text-sm flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>नया बैनर जोड़ें</span>
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold mb-4 flex items-center space-x-2 dark:text-white">
                <Bell className="w-5 h-5 text-[#FF9933]" />
                <span>नोटिफिकेशन (SMS/WhatsApp)</span>
              </h3>
              <button 
                onClick={() => setShowBroadcast(true)}
                className="w-full bg-[#FFF5E6] dark:bg-gray-700 text-[#FF9933] py-2 rounded-lg font-bold text-sm"
              >
                ब्रॉडकास्ट संदेश भेजें
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold mb-4 flex items-center space-x-2 dark:text-white">
                <Database className="w-5 h-5 text-[#FF9933]" />
                <span>सिस्टम ऑडिट लॉग</span>
              </h3>
              <button 
                onClick={() => setShowAuditLogs(!showAuditLogs)}
                className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                  showAuditLogs 
                    ? 'bg-[#FF9933] text-white' 
                    : 'bg-[#FFF5E6] dark:bg-gray-700 text-[#FF9933]'
                }`}
              >
                {showAuditLogs ? 'लॉग छिपाएं' : 'ऑडिट लॉग देखें'}
              </button>
            </div>
          </motion.div>

          {/* Audit Logs Section */}
          <AnimatePresence>
            {showAuditLogs && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                  <h3 className="font-bold dark:text-white">भूमिका परिवर्तन ऑडिट लॉग</h3>
                  <span className="text-xs text-gray-500">{auditLogs.length} रिकॉर्ड्स</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase text-gray-500 font-bold">
                      <tr>
                        <th className="px-6 py-3">समय</th>
                        <th className="px-6 py-3">एडमिन</th>
                        <th className="px-6 py-3">उपयोगकर्ता</th>
                        <th className="px-6 py-3">परिवर्तन</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 dark:text-gray-300">
                            {format(new Date(log.timestamp), 'dd MMM, HH:mm', { locale: hi })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold dark:text-white">{log.adminName}</div>
                            <div className="text-[10px] text-gray-400">{log.adminId.slice(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold dark:text-white">{log.targetUserName}</div>
                            <div className="text-[10px] text-gray-400">{log.targetUserId.slice(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] uppercase">{log.oldRole}</span>
                              <ChevronRight className="w-3 h-3 text-gray-400" />
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-[10px] uppercase font-bold">{log.newRole}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-gray-500">कोई ऑडिट लॉग उपलब्ध नहीं है</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Banner List */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h3 className="font-bold mb-6 dark:text-white">सक्रिय बैनर</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <div key={banner.id} className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title} 
                    className="w-full h-40 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                    <button 
                      onClick={() => {
                        setEditingBanner(banner);
                        setBannerForm({
                          title: banner.title,
                          imageUrl: banner.imageUrl,
                          linkUrl: banner.linkUrl || '',
                          active: banner.active
                        });
                        setShowBannerModal(true);
                      }}
                      className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm dark:text-white">{banner.title}</p>
                      {banner.linkUrl && (
                        <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-[#FF9933] flex items-center space-x-1">
                          <ExternalLink className="w-3 h-3" />
                          <span>लिंक</span>
                        </a>
                      )}
                    </div>
                    <button onClick={() => handleToggleBanner(banner)}>
                      {banner.active ? (
                        <ToggleRight className="w-6 h-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 pt-12">
        <AdminDashboard />
      </div>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {showBroadcast && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-[#4A2C2A] text-white">
                <h3 className="text-xl font-bold">ब्रॉडकास्ट नोटिफिकेशन</h3>
                <button onClick={() => setShowBroadcast(false)} className="p-1 hover:bg-white/20 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleBroadcast} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">शीर्षक (Title)</label>
                  <input 
                    type="text" 
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-[#FFF5E6] dark:bg-gray-700 rounded-xl outline-none dark:text-white"
                    placeholder="जैसे: महाशिवरात्रि की शुभकामनाएं"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">संदेश (Message)</label>
                  <textarea 
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full px-4 py-2 bg-[#FFF5E6] dark:bg-gray-700 rounded-xl outline-none h-32 resize-none dark:text-white"
                    placeholder="अपना संदेश यहाँ लिखें..."
                    required
                  />
                </div>
                <div className="pt-4 flex space-x-3">
                  <button 
                    type="button"
                    onClick={() => setShowBroadcast(false)}
                    className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-500 dark:text-gray-400"
                  >
                    रद्द करें
                  </button>
                  <button 
                    type="submit"
                    disabled={sending}
                    className="flex-1 py-3 bg-[#FF9933] text-white rounded-xl font-bold flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? 'भेज रहा है...' : 'अभी भेजें'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Banner Modal */}
      <AnimatePresence>
        {showBannerModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-[#FF9933] text-white">
                <h3 className="text-xl font-bold">{editingBanner ? 'बैनर संपादित करें' : 'नया बैनर जोड़ें'}</h3>
                <button onClick={() => setShowBannerModal(false)} className="p-1 hover:bg-white/20 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSaveBanner} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">बैनर शीर्षक</label>
                  <input 
                    type="text" 
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-[#FFF5E6] dark:bg-gray-700 rounded-xl outline-none dark:text-white"
                    placeholder="जैसे: राम नवमी उत्सव"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">इमेज URL</label>
                  <input 
                    type="url" 
                    value={bannerForm.imageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-[#FFF5E6] dark:bg-gray-700 rounded-xl outline-none dark:text-white"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">लिंक URL (वैकल्पिक)</label>
                  <input 
                    type="url" 
                    value={bannerForm.linkUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-[#FFF5E6] dark:bg-gray-700 rounded-xl outline-none dark:text-white"
                    placeholder="https://example.com/page"
                  />
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="banner-active"
                    checked={bannerForm.active}
                    onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
                    className="w-5 h-5 accent-[#FF9933]"
                  />
                  <label htmlFor="banner-active" className="text-sm font-medium dark:text-gray-300">सक्रिय (Active)</label>
                </div>
                <div className="pt-4 flex space-x-3">
                  <button 
                    type="button"
                    onClick={() => setShowBannerModal(false)}
                    className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-500 dark:text-gray-400"
                  >
                    रद्द करें
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-[#FF9933] text-white rounded-xl font-bold"
                  >
                    {editingBanner ? 'अपडेट करें' : 'सहेजें'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
