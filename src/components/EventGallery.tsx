import React from 'react';
import { motion } from 'motion/react';
import { ImageIcon, Calendar, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function EventGallery() {
  const { t, language } = useLanguage();

  const events = [
    {
      id: 1,
      title: language === 'hi' ? 'महा शिवरात्रि महोत्सव' : 'Maha Shivratri Festival',
      date: language === 'hi' ? '18 मार्च 2026' : '18 March 2026',
      location: language === 'hi' ? 'मुख्य मंदिर परिसर' : 'Main Temple Complex',
      image: 'https://picsum.photos/seed/shiv/800/600'
    },
    {
      id: 2,
      title: language === 'hi' ? 'सामूहिक विवाह समारोह' : 'Mass Wedding Ceremony',
      date: language === 'hi' ? '25 मार्च 2026' : '25 March 2026',
      location: language === 'hi' ? 'अखाड़ा भवन' : 'Akhada Bhavan',
      image: 'https://picsum.photos/seed/wedding/800/600'
    },
    {
      id: 3,
      title: language === 'hi' ? 'राम नवमी शोभा यात्रा' : 'Ram Navami Procession',
      date: language === 'hi' ? '2 अप्रैल 2026' : '2 April 2026',
      location: language === 'hi' ? 'नगर भ्रमण' : 'City Tour',
      image: 'https://picsum.photos/seed/ram/800/600'
    }
  ];

  const galleryImages = [
    'https://picsum.photos/seed/1/400/400',
    'https://picsum.photos/seed/2/400/400',
    'https://picsum.photos/seed/3/400/400',
    'https://picsum.photos/seed/4/400/400',
    'https://picsum.photos/seed/5/400/400',
    'https://picsum.photos/seed/6/400/400',
  ];

  return (
    <div className="space-y-16">
      <section>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#4A2C2A] dark:text-orange-100 mb-4">{t('upcoming_events')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('events_desc')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => (
            <motion.div 
              key={event.id}
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group"
            >
              <div className="h-48 overflow-hidden relative">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#FF9933]">
                  {language === 'hi' ? 'आगामी' : 'Upcoming'}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 dark:text-white">{event.title}</h3>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#FF9933]" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#FF9933]" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <button className="w-full mt-6 border-2 border-[#FF9933] text-[#FF9933] py-2 rounded-xl font-bold hover:bg-[#FF9933] hover:text-white transition-all">
                  {t('view_details')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#4A2C2A] dark:text-orange-100 mb-4">{t('photo_gallery')}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t('gallery_desc')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((img, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm"
            >
              <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
