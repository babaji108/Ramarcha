import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function FloatingDonationButton() {
  const { t } = useLanguage();
  const [showLabel, setShowLabel] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowLabel(true), 3000);
    const hideTimer = setTimeout(() => setShowLabel(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleDonate = () => {
    const donationSection = document.getElementById('donation-section');
    if (donationSection) {
      donationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60] flex items-center">
      <AnimatePresence>
        {showLabel && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mr-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-xl border border-[#FF9933]/20 text-[#FF9933] font-bold text-sm whitespace-nowrap"
          >
            {t('sant_seva')} & {t('go_seva')}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleDonate}
        className="bg-gradient-to-r from-[#FF9933] to-[#FF4400] text-white p-4 rounded-full shadow-2xl flex items-center justify-center group relative"
      >
        <Heart className="w-6 h-6 fill-current" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </motion.button>
    </div>
  );
}
