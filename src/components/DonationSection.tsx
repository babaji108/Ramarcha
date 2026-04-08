import React from 'react';
import { motion } from 'motion/react';
import { Heart, Users, Home, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function DonationSection() {
  const { t } = useLanguage();

  const donationTypes = [
    {
      id: 'sant',
      title: t('sant_seva'),
      icon: <Users className="w-8 h-8" />,
      desc: t('sant_desc'),
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'go',
      title: t('go_seva'),
      icon: <Home className="w-8 h-8" />,
      desc: t('go_desc'),
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'hari_guru',
      title: t('hari_guru_seva'),
      icon: <Heart className="w-8 h-8" />,
      desc: t('hari_guru_desc'),
      color: 'bg-red-100 text-red-600'
    }
  ];

  const handleUPIDonate = () => {
    // Simulated UPI link
    const upiUrl = "upi://pay?pa=ashram@upi&pn=AshramSeva&am=101&cu=INR";
    window.location.href = upiUrl;
  };

  return (
    <section className="py-20 bg-[#FFF5E6] dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-[#FF9933]/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="inline-block p-3 bg-red-100 rounded-full text-red-600 mb-4"
          >
            <HeartHandshake className="w-8 h-8" />
          </motion.div>
          <h2 className="text-4xl font-bold text-[#4A2C2A] dark:text-orange-100 mb-4">{t('donation')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('donation_appeal')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {donationTypes.map((type) => (
            <motion.div
              key={type.id}
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center"
            >
              <div className={`w-16 h-16 ${type.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                {type.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white">{type.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">{type.desc}</p>
              <button 
                onClick={handleUPIDonate}
                className="w-full py-3 bg-[#FF9933] text-white rounded-xl font-bold hover:bg-[#FF8811] transition-colors flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>{t('donate_now')}</span>
              </button>
            </motion.div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold dark:text-white">{t('secure_payment')}</p>
              <p className="text-sm text-gray-500">{t('tax_benefit')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-8" />
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase font-bold">UPI ID</p>
              <p className="font-mono font-bold text-[#FF9933]">ashram@upi</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const CreditCard = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
);

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);
