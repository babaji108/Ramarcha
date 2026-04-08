import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Sunrise, Sunset, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Panchang() {
  const { t, language } = useLanguage();

  const panchangData = {
    date: language === 'hi' ? '8 अप्रैल 2026' : '8 April 2026',
    tithi: language === 'hi' ? 'एकादशी (शुक्ल पक्ष)' : 'Ekadashi (Shukla Paksha)',
    nakshatra: language === 'hi' ? 'रोहिणी' : 'Rohini',
    yoga: language === 'hi' ? 'सौभाग्य' : 'Saubhagya',
    karana: language === 'hi' ? 'वणिज' : 'Vanija',
    sunrise: '06:12 AM',
    sunset: '06:45 PM',
    moonrise: '02:30 PM',
    moonset: '03:15 AM',
    rahukaal: '03:00 PM - 04:30 PM',
    shubhMahurat: '11:45 AM - 12:35 PM'
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#4A2C2A] dark:text-orange-100 mb-4">{t('daily_panchang')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('panchang_desc')}</p>
        <div className="w-24 h-1 bg-[#FF9933] mx-auto mt-4 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Card */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-[#FFD700] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sun className="w-48 h-48 dark:text-white" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-10">
              <div className="bg-[#FFF5E6] dark:bg-gray-700 p-4 rounded-2xl text-[#FF9933]">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold dark:text-white">{panchangData.date}</h2>
                <p className="text-[#FF9933] font-bold">{language === 'hi' ? 'विक्रम संवत 2082' : 'Vikram Samvat 2082'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: t('tithi'), value: panchangData.tithi },
                { label: t('nakshatra'), value: panchangData.nakshatra },
                { label: t('yoga'), value: panchangData.yoga },
                { label: t('karana'), value: panchangData.karana },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{item.label}</div>
                  <div className="font-bold text-lg dark:text-white">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#FFF5E6] dark:bg-gray-700/50 p-6 rounded-2xl border border-[#FFD700] border-dashed">
                <h3 className="font-bold text-[#4A2C2A] dark:text-orange-100 mb-4 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{t('shubh_muhurat')} (अभिजीत)</span>
                </h3>
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">{panchangData.shubhMahurat}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-900/50 border-dashed">
                <h3 className="font-bold text-red-800 dark:text-red-400 mb-4 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>{t('rahukaal')} ({language === 'hi' ? 'अशुभ' : 'Inauspicious'})</span>
                </h3>
                <div className="text-2xl font-bold text-red-700 dark:text-red-500">{panchangData.rahukaal}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Details */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold mb-6 flex items-center space-x-2 dark:text-white">
              <Sunrise className="text-[#FF9933] w-5 h-5" />
              <span>{t('sunrise')} {language === 'hi' ? 'और' : '&'} {t('sunset')}</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-gray-700 rounded-xl">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('sunrise')}</span>
                <span className="font-bold dark:text-white">{panchangData.sunrise}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-gray-700 rounded-xl">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('sunset')}</span>
                <span className="font-bold dark:text-white">{panchangData.sunset}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold mb-6 flex items-center space-x-2 dark:text-white">
              <Moon className="text-blue-500 w-5 h-5" />
              <span>{t('moonrise')} {language === 'hi' ? 'और' : '&'} {t('moonset')}</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-gray-700 rounded-xl">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('moonrise')}</span>
                <span className="font-bold dark:text-white">{panchangData.moonrise}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-gray-700 rounded-xl">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('moonset')}</span>
                <span className="font-bold dark:text-white">{panchangData.moonset}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
