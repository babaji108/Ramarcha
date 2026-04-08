import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Panchang() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#4A2C2A] dark:text-orange-100 mb-4">{t('daily_panchang')}</h1>
        <div className="w-24 h-1 bg-[#FF9933] mx-auto rounded-full" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-[#FFD700] overflow-hidden">
        <div className="p-4 bg-[#FFF5E6] dark:bg-gray-700 border-b border-[#FFD700] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#4A2C2A] dark:text-orange-100 font-bold">
            <Calendar className="w-5 h-5 text-[#FF9933]" />
            <span>{t('daily_panchang')}</span>
          </div>
          <a 
            href="https://www.drikpanchang.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-[#FF9933] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#FF8811] transition-all"
          >
            <span>{t('detailed_panchang')}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        
        <div className="relative w-full aspect-[4/5] md:aspect-video">
          <iframe 
            src="https://tirthdarsan.blogspot.com/2025/10/2028_37.html?m=1" 
            className="absolute inset-0 w-full h-full border-none"
            title="Daily Panchang"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t('panchang_desc')}
        </p>
      </div>
    </div>
  );
}
