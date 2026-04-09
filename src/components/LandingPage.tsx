import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, Users, CreditCard, Video, MapPin, ArrowRight, Sun, BookOpen, Star, Quote, Mail, CheckCircle, Globe, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import DonationSection from './DonationSection';
import FloatingDonationButton from './FloatingDonationButton';

export default function LandingPage() {
  const { t } = useLanguage();
  const features = [
    { icon: <Users className="w-6 h-6" />, title: 'विद्वान पंडित', desc: 'अनुभवी पंडितों का चयन' },
    { icon: <Calendar className="w-6 h-6" />, title: 'पूजा बुकिंग', desc: 'आसानी से पूजा बुक करें' },
    { icon: <CreditCard className="w-6 h-6" />, title: 'सुरक्षित भुगतान', desc: 'UPI द्वारा आसान भुगतान' },
    { icon: <Video className="w-6 h-6" />, title: 'लाइव दर्शन', desc: 'पूजा का सीधा प्रसारण' },
    { icon: <MapPin className="w-6 h-6" />, title: 'स्थान सेवा', desc: 'गूगल मैप्स द्वारा पता' },
    { icon: <BookOpen className="w-6 h-6" />, title: 'दैनिक पंचांग', desc: 'शुभ मुहूर्त और पंचांग' },
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden rounded-[2rem] mx-4 mt-4">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        >
          <img 
            src="https://picsum.photos/seed/temple_premium/1920/1080" 
            alt="Temple" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </motion.div>
        
        <div className="relative z-10 text-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full border border-white/30 text-sm font-medium"
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>{t('devotees_joined')}</span>
          </motion.div>
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-bold mb-6 tracking-tight"
          >
            {t('welcome')}
          </motion.h1>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-3xl mb-12 max-w-3xl mx-auto font-light opacity-90"
          >
            {t('hero_desc')}
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Link 
              to="/booking" 
              className="bg-[#FF9933] text-white px-12 py-5 rounded-full text-xl font-bold hover:bg-[#FF8811] transition-all transform hover:scale-105 shadow-2xl flex items-center space-x-3"
            >
              <span>{t('book_puja')}</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link 
              to="/gallery" 
              className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-12 py-5 rounded-full text-xl font-bold hover:bg-white/20 transition-all"
            >
              {t('daily_darshan')}
            </Link>
            <Link 
              to="/membership" 
              className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-12 py-5 rounded-full text-xl font-bold hover:bg-white/20 transition-all flex items-center space-x-2"
            >
              <Award className="w-5 h-5" />
              <span>{t('become_member')}</span>
            </Link>
            <a 
              href="https://tirthdarsan.blogspot.com/2025/07/blog-post.html?m=1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-12 py-5 rounded-full text-xl font-bold hover:bg-white/20 transition-all flex items-center space-x-2"
            >
              <Globe className="w-5 h-5" />
              <span>{t('akhada_website')}</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
        {[
          { label: t('stats_puja'), value: '50,000+', icon: <CheckCircle className="w-6 h-6" /> },
          { label: t('stats_pandit'), value: '500+', icon: <Users className="w-6 h-6" /> },
          { label: t('stats_ashram'), value: '12', icon: <MapPin className="w-6 h-6" /> },
          { label: t('devotees_joined'), value: '1M+', icon: <Star className="w-6 h-6" /> },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="text-center p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="text-[#FF9933] mb-3 flex justify-center">{stat.icon}</div>
            <div className="text-3xl font-bold dark:text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </section>

      {/* Features Grid */}
      <section>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#4A2C2A] dark:text-orange-100 mb-4">{t('our_services')}</h2>
          <div className="w-24 h-1 bg-[#FF9933] mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border-b-4 border-[#FF9933] hover:shadow-md transition-all"
            >
              <div className="bg-[#FFF5E6] dark:bg-gray-700 w-12 h-12 rounded-xl flex items-center justify-center text-[#FF9933] mb-6">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-[#FFD700]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center space-x-2 dark:text-white">
            <Calendar className="text-[#FF9933]" />
            <span>आगामी कार्यक्रम</span>
          </h2>
          <Link to="/gallery" className="text-[#FF9933] font-bold hover:underline">सभी देखें</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4 p-4 hover:bg-[#FFF5E6] dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer">
            <div className="bg-[#FF9933] text-white p-3 rounded-lg text-center min-w-[60px]">
              <div className="text-xs">APR</div>
              <div className="text-xl font-bold">15</div>
            </div>
            <div>
              <h3 className="font-bold dark:text-white">हनुमान जयंती महोत्सव</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">सुबह 8:00 बजे से</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 hover:bg-[#FFF5E6] dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer">
            <div className="bg-[#FF9933] text-white p-3 rounded-lg text-center min-w-[60px]">
              <div className="text-xs">APR</div>
              <div className="text-xl font-bold">22</div>
            </div>
            <div>
              <h3 className="font-bold dark:text-white">सामूहिक सुंदरकांड पाठ</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">शाम 6:00 बजे से</p>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <div id="donation-section">
        <DonationSection />
      </div>

      {/* Testimonials */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#4A2C2A] dark:text-orange-100 mb-4">{t('testimonials')}</h2>
          <div className="w-24 h-1 bg-[#FF9933] mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'राजेश शर्मा', text: 'रामर्चा के माध्यम से पूजा बुक करना बहुत ही सरल और सुखद अनुभव रहा। पंडित जी बहुत ही विद्वान थे।', location: 'दिल्ली' },
            { name: 'अनीता पटेल', text: 'लाइव दर्शन की सुविधा ने मुझे घर बैठे मंदिर का अनुभव कराया। बहुत-बहुत धन्यवाद।', location: 'अहमदाबाद' },
            { name: 'संजय गुप्ता', text: 'पंचांग और शुभ मुहूर्त की जानकारी बहुत सटीक होती है। अब मैं अपनी हर शुभ शुरुआत यहीं से करता हूँ।', location: 'मुंबई' },
          ].map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 relative"
            >
              <Quote className="absolute top-6 right-8 w-12 h-12 text-[#FF9933]/10" />
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic mb-6">"{t.text}"</p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#FF9933] rounded-full flex items-center justify-center text-white font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-bold dark:text-white">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#4A2C2A] rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Mail className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('newsletter_title')}</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="आपका ईमेल" 
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:bg-white/20 transition-all"
            />
            <button className="bg-[#FF9933] text-white px-10 py-4 rounded-full font-bold hover:bg-[#FF8811] transition-all">
              {t('subscribe')}
            </button>
          </div>
        </div>
      </section>

      <FloatingDonationButton />
    </div>
  );
}
