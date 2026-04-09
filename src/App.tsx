import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from './types';
import { 
  Home, 
  Calendar, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  BookOpen, 
  Users, 
  CreditCard, 
  Image as ImageIcon,
  MapPin,
  Video,
  Sun,
  Moon,
  Globe,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';

// Components
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import BhaktDashboard from './components/BhaktDashboard';
import PanditDashboard from './components/PanditDashboard';
import AdminDashboard from './components/AdminDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import PujaBooking from './components/PujaBooking';
import PujaDetail from './components/PujaDetail';
import MembershipForm from './components/MembershipForm';
import EventGallery from './components/EventGallery';
import Panchang from './components/Panchang';
import ProfilePage from './components/ProfilePage';
import NotificationBell from './components/NotificationBell';
import BookingHistory from './components/BookingHistory';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function AppContent() {
  const { t, language, setLanguage } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('सफलतापूर्वक लॉगआउट किया गया');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5E6] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#FF9933] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#FFF5E6] text-[#4A2C2A]'} font-sans`}>
        <Toaster position="top-center" richColors />
        
        {/* Navigation */}
        <nav className="bg-[#FF9933] text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-white p-1 rounded-full">
                  <Sun className="w-8 h-8 text-[#FF9933]" />
                </div>
                <span className="text-2xl font-bold tracking-tight">रामर्चा</span>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="hover:text-[#FFD700] transition-colors">{t('home')}</Link>
                <Link to="/panchang" className="hover:text-[#FFD700] transition-colors">{t('panchang')}</Link>
                <Link to="/membership" className="hover:text-[#FFD700] transition-colors">{t('membership')}</Link>
                <Link to="/gallery" className="hover:text-[#FFD700] transition-colors">{t('gallery')}</Link>
                <a 
                  href="https://tirthdarsan.blogspot.com/2025/07/blog-post.html?m=1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-[#FFD700] transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>{t('akhada_website')}</span>
                </a>
                
                {/* Language Switcher */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 hover:text-[#FFD700] transition-colors">
                    <span className="uppercase font-bold">{language}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform translate-y-2 group-hover:translate-y-0 overflow-hidden border border-gray-100 dark:border-gray-700">
                    <button onClick={() => setLanguage('hi')} className="w-full px-4 py-2 text-left text-sm hover:bg-[#FFF5E6] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">हिन्दी</button>
                    <button onClick={() => setLanguage('en')} className="w-full px-4 py-2 text-left text-sm hover:bg-[#FFF5E6] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">English</button>
                    <button onClick={() => setLanguage('sa')} className="w-full px-4 py-2 text-left text-sm hover:bg-[#FFF5E6] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">संस्कृतम्</button>
                    <button onClick={() => setLanguage('gu')} className="w-full px-4 py-2 text-left text-sm hover:bg-[#FFF5E6] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">ગુજરાતી</button>
                  </div>
                </div>

                {profile && <NotificationBell />}
                
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  title={isDarkMode ? 'लाइट मोड' : 'डार्क मोड'}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {profile ? (
                  <>
                    <div className="flex items-center space-x-4">
                      <Link to="/dashboard" className="flex flex-col items-end">
                        <span className="hover:text-[#FFD700] transition-colors font-bold">{t('dashboard')}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                          profile.role === 'super_admin' ? 'bg-red-500 text-white' :
                          profile.role === 'admin' ? 'bg-purple-500 text-white' :
                          profile.role === 'pandit' ? 'bg-orange-800 text-white' :
                          'bg-blue-600 text-white'
                        }`}>
                          {profile.role.replace('_', ' ')}
                        </span>
                      </Link>
                      <Link to="/profile" className="hover:text-[#FFD700] transition-colors flex items-center space-x-1">
                        <UserIcon className="w-4 h-4" />
                        <span>{t('profile')}</span>
                      </Link>
                      <button onClick={handleLogout} className="flex items-center space-x-1 bg-[#4A2C2A] px-4 py-2 rounded-lg hover:bg-[#2D1B1A] transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <Link to="/login" className="bg-white text-[#FF9933] px-6 py-2 rounded-lg font-bold hover:bg-[#FFD700] transition-colors">{t('login')}</Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-[#FF8811] border-t border-[#FF9933]"
              >
                <div className="px-4 pt-2 pb-6 space-y-2">
                  <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:bg-[#FF9933] rounded px-2">{t('home')}</Link>
                  <Link to="/panchang" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:bg-[#FF9933] rounded px-2">{t('panchang')}</Link>
                  <Link to="/membership" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:bg-[#FF9933] rounded px-2">{t('membership')}</Link>
                  <Link to="/gallery" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:bg-[#FF9933] rounded px-2">{t('gallery')}</Link>
                  <a 
                    href="https://tirthdarsan.blogspot.com/2025/07/blog-post.html?m=1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 hover:bg-[#FF9933] rounded px-2"
                  >
                    {t('akhada_website')}
                  </a>
                  
                  {/* Mobile Language Switcher */}
                  <div className="py-2 border-t border-white/20 mt-2">
                    <p className="text-xs font-bold text-white/60 px-2 mb-2 uppercase">{t('select_language')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { setLanguage('hi'); setIsMenuOpen(false); }} className={`py-2 rounded text-sm font-bold ${language === 'hi' ? 'bg-white text-[#FF9933]' : 'bg-white/10 text-white'}`}>हिन्दी</button>
                      <button onClick={() => { setLanguage('en'); setIsMenuOpen(false); }} className={`py-2 rounded text-sm font-bold ${language === 'en' ? 'bg-white text-[#FF9933]' : 'bg-white/10 text-white'}`}>English</button>
                      <button onClick={() => { setLanguage('sa'); setIsMenuOpen(false); }} className={`py-2 rounded text-sm font-bold ${language === 'sa' ? 'bg-white text-[#FF9933]' : 'bg-white/10 text-white'}`}>संस्कृतम्</button>
                      <button onClick={() => { setLanguage('gu'); setIsMenuOpen(false); }} className={`py-2 rounded text-sm font-bold ${language === 'gu' ? 'bg-white text-[#FF9933]' : 'bg-white/10 text-white'}`}>ગુજરાતી</button>
                    </div>
                  </div>

                  {profile ? (
                    <>
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:bg-[#FF9933] rounded px-2">{t('dashboard')}</Link>
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:bg-[#FF9933] rounded px-2">{t('profile')}</Link>
                      <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left py-2 hover:bg-[#FF9933] rounded px-2 flex items-center space-x-2">
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout')}</span>
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block py-2 bg-white text-[#FF9933] text-center font-bold rounded">{t('login')}</Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={profile ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/panchang" element={<Panchang />} />
            <Route path="/membership" element={profile ? <MembershipForm /> : <Navigate to="/login" />} />
            <Route path="/gallery" element={<EventGallery />} />
            <Route path="/booking" element={profile ? <PujaBooking /> : <Navigate to="/login" />} />
            <Route path="/puja/:id" element={<PujaDetail />} />
            <Route path="/history" element={profile ? <BookingHistory /> : <Navigate to="/login" />} />
            <Route path="/profile" element={profile ? <ProfilePage /> : <Navigate to="/login" />} />
            
            <Route path="/dashboard" element={
              !profile ? <Navigate to="/login" /> :
              profile.role === 'super_admin' ? <SuperAdminDashboard /> :
              profile.role === 'admin' ? <AdminDashboard /> :
              profile.role === 'pandit' ? <PanditDashboard /> :
              <BhaktDashboard />
            } />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-[#4A2C2A] text-[#FFD700] py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <Sun className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold mb-4">रामर्चा</h2>
            <p className="text-[#FFF5E6] opacity-80 mb-8 max-w-md mx-auto">
              अखाड़ा परिषद द्वारा संचालित धार्मिक सेवाओं का डिजिटल मंच।
            </p>
            <div className="flex justify-center space-x-6 mb-8">
              <Link to="/about" className="hover:underline">हमारे बारे में</Link>
              <Link to="/contact" className="hover:underline">संपर्क करें</Link>
              <a href="https://wa.me/917909641191" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{t('whatsapp_us')}</span>
              </a>
            </div>
            <p className="text-sm opacity-60">© 2026 रामर्चा - अखाड़ा परिषद। सर्वाधिकार सुरक्षित।</p>
          </div>
        </footer>

        {/* Floating WhatsApp Button */}
        <motion.a
          href="https://wa.me/917909641191"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-24 right-8 z-[60] bg-[#25D366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
        </motion.a>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
