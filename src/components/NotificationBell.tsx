import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Notification as NotificationType } from '../types';
import { Bell, BellOff, Check, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NotificationType));
      
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);

      // Trigger browser notification for the newest one if it's unread and just arrived
      const latest = newNotifications[0];
      if (latest && !latest.read && permission === 'granted') {
        // Check if it's actually new (within last 10 seconds)
        const createdAt = new Date(latest.createdAt).getTime();
        const now = new Date().getTime();
        if (now - createdAt < 10000) {
          new Notification(latest.title, {
            body: latest.message,
            icon: '/favicon.ico' // Replace with actual icon if available
          });
        }
      }
    });

    return () => unsubscribe();
  }, [permission]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('यह ब्राउज़र नोटिफिकेशन का समर्थन नहीं करता है');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      toast.success('नोटिफिकेशन सक्रिय कर दिए गए हैं');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
      toast.success('सभी नोटिफिकेशन पढ़े हुए चिह्नित किए गए');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#4A2C2A]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="p-4 bg-[#4A2C2A] text-white flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <h3 className="font-bold">नोटिफिकेशन</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {permission !== 'granted' && (
                    <button 
                      onClick={requestPermission}
                      className="p-1 hover:bg-white/10 rounded-full text-xs flex items-center space-x-1"
                      title="सक्रिय करें"
                    >
                      <BellOff className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={markAllAsRead}
                    className="p-1 hover:bg-white/10 rounded-full"
                    title="सभी पढ़े हुए चिह्नित करें"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>कोई नया नोटिफिकेशन नहीं है</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 transition-colors ${n.read ? 'bg-white' : 'bg-[#FFF5E6]'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          n.type === 'booking' ? 'bg-blue-100 text-blue-700' :
                          n.type === 'event' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {n.type}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.createdAt).toLocaleDateString('hi-IN')}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1">{n.title}</h4>
                      <p className="text-xs text-gray-600 mb-3">{n.message}</p>
                      <div className="flex justify-between items-center">
                        {!n.read && (
                          <button 
                            onClick={() => markAsRead(n.id)}
                            className="text-[10px] text-[#FF9933] font-bold hover:underline"
                          >
                            पढ़ा हुआ चिह्नित करें
                          </button>
                        )}
                        {n.link && (
                          <a 
                            href={n.link}
                            className="text-[10px] text-gray-400 hover:text-[#FF9933] flex items-center space-x-1"
                          >
                            <span>देखें</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-3 bg-gray-50 text-center">
                <button className="text-xs text-gray-500 font-bold hover:text-[#FF9933]">
                  सभी नोटिफिकेशन देखें
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function to send notifications
export const sendNotification = async (userId: string, title: string, message: string, type: NotificationType['type'], link?: string) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      link
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
