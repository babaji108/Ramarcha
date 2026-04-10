import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'hi' | 'en' | 'sa' | 'gu';

interface Translations {
  [key: string]: {
    hi: string;
    en: string;
    sa: string;
    gu: string;
  };
}

export const translations: Translations = {
  home: { hi: 'होम', en: 'Home', sa: 'गृहम्', gu: 'હોમ' },
  panchang: { hi: 'पंचांग', en: 'Panchang', sa: 'पञ्चाङ्गम्', gu: 'પંચાંગ' },
  gallery: { hi: 'गैलरी', en: 'Gallery', sa: 'वीथिका', gu: 'ગેલેરી' },
  dashboard: { hi: 'डैशबोर्ड', en: 'Dashboard', sa: 'फलकम्', gu: 'ડેશબોર્ડ' },
  profile: { hi: 'प्रोफ़ाइल', en: 'Profile', sa: 'विवरणम्', gu: 'પ્રોફાઇલ' },
  logout: { hi: 'लॉगआउट', en: 'Logout', sa: 'निर्गमनम्', gu: 'લૉગઆઉટ' },
  login: { hi: 'लॉगिन', en: 'Login', sa: 'प्रवेशः', gu: 'લોગિન' },
  welcome: { hi: 'रामर्चा में आपका स्वागत है', en: 'Welcome to Ramarcha', sa: 'रामर्चायां स्वागतम्', gu: 'રામર્ચામાં આપનું સ્વાગત છે' },
  hero_desc: { hi: 'अखाड़ा परिषद द्वारा संचालित धार्मिक सेवाओं का विश्वसनीय मंच', en: 'Trusted platform for religious services managed by Akhada Parishad', sa: 'अखाडा परिषदा संचालितं धार्मिकसेवानां विश्वसनीयं मञ्चम्', gu: 'અખાડા પરિષદ દ્વારા સંચાલિત ધાર્મિક સેવાઓનું વિશ્વસનીય મંચ' },
  book_puja: { hi: 'पूजा बुक करें', en: 'Book Puja', sa: 'पूजां आरक्षयतु', gu: 'પૂજા બુક કરો' },
  our_services: { hi: 'हमारी सेवाएँ', en: 'Our Services', sa: 'अस्माकं सेवाः', gu: 'અમારી સેવાઓ' },
  donation: { hi: 'दान', en: 'Donation', sa: 'दानम्', gu: 'દાન' },
  sant_seva: { hi: 'संत सेवा', en: 'Sant Seva', sa: 'सन्त सेवा', gu: 'સંત સેવા' },
  go_seva: { hi: 'गो सेवा', en: 'Go Seva', sa: 'गो सेवा', gu: 'ગૌ સેવા' },
  hari_guru_seva: { hi: 'हरि गुरु सेवा', en: 'Hari Guru Seva', sa: 'हरि गुरु सेवा', gu: 'હરિ ગુરુ સેવા' },
  donate_now: { hi: 'अभी दान करें', en: 'Donate Now', sa: 'इदानीं दानं ददातु', gu: 'અત્યારે દાન કરો' },
  donation_appeal: { hi: 'आश्रम में संत सेवा, गो सेवा व हरि गुरु सेवा के लिए आपका सहयोग प्रार्थनीय है।', en: 'Your support is requested for Sant Seva, Go Seva, and Hari Guru Seva in the Ashram.', sa: 'आश्रमे सन्तसेवायै, गोसेवायै, हरिगुरुसेवायै च भवतः सहयोगः प्रार्थनीयः।', gu: 'આશ્રમમાં સંત સેવા, ગૌ સેવા અને हरि गुरु सेवा के लिए आपका सहयोग प्रार्थनीय है।' },
  sant_desc: { hi: 'आश्रम में संतों की सेवा और सत्कार के लिए।', en: 'For the service and hospitality of saints in the Ashram.', sa: 'आश्रमे सन्तानां सेवायै सत्काराय च।', gu: 'આશ્રમમાં સંતોની સેવા અને સત્કાર માટે.' },
  go_desc: { hi: 'गौशाला में गायों के चारे और देखभाल के लिए।', en: 'For fodder and care of cows in the Gaushala.', sa: 'गौशालायां गवां ग्रासाय रक्षणाय च।', gu: 'ગૌશાળામાં ગાયોના ઘાસચારા અને સંભાળ માટે.' },
  hari_guru_desc: { hi: 'हरि गुरु सेवा और आश्रम के विकास कार्यों के लिए।', en: 'For Hari Guru Seva and Ashram development works.', sa: 'हरिगुरुसेवायै आश्रमस्य विकासकार्येभ्यः च।', gu: 'હરિ ગુરુ સેવા અને આશ્રમના વિકાસ કાર્યો માટે.' },
  secure_payment: { hi: 'सुरक्षित भुगतान', en: 'Secure Payment', sa: 'सुरक्षितं शोधनम्', gu: 'સુરક્ષિત ચુકવણી' },
  tax_benefit: { hi: 'सभी दान आयकर अधिनियम की धारा 80G के तहत कर मुक्त हैं।', en: 'All donations are tax-exempt under Section 80G of the Income Tax Act.', sa: 'सर्वाणि दानानि आयकर-अधिनियमस्य ८०जी धारायाः अन्तर्गतं करमुक्तानि सन्ति।', gu: 'તમામ દાન આવકવેરા અધિનિયમની કલમ 80G હેઠળ કરમુક્ત છે.' },
  daily_panchang: { hi: 'दैनिक पंचांग', en: 'Daily Panchang', sa: 'दैनिक पञ्चाङ्गम्', gu: 'દૈનિક પંચાંગ' },
  panchang_desc: { hi: 'आज का शुभ मुहूर्त और ग्रह स्थिति', en: 'Today\'s auspicious time and planetary positions', sa: 'अद्यतनः शुभमुहूर्तः ग्रहस्थितिः च', gu: 'આજનો શુભ મુહૂર્ત અને ગ્રહ સ્થિતિ' },
  tithi: { hi: 'तिथि', en: 'Tithi', sa: 'तिथिः', gu: 'તિથિ' },
  nakshatra: { hi: 'नक्षत्र', en: 'Nakshatra', sa: 'नक्षत्रम्', gu: 'નક્ષત્ર' },
  yoga: { hi: 'योग', en: 'Yoga', sa: 'योगः', gu: 'યોગ' },
  karana: { hi: 'करण', en: 'Karana', sa: 'करणम्', gu: 'કરણ' },
  sunrise: { hi: 'सूर्योदय', en: 'Sunrise', sa: 'सूर्योदयः', gu: 'સૂર્યોદય' },
  sunset: { hi: 'सूर्यास्त', en: 'Sunset', sa: 'सूर्यास्तः', gu: 'સૂર્યાસ્ત' },
  moonrise: { hi: 'चन्द्रोदय', en: 'Moonrise', sa: 'चन्द्रोदयः', gu: 'ચંદ્રોદય' },
  moonset: { hi: 'चन्द्रास्त', en: 'Moonset', sa: 'चन्द्रास्तः', gu: 'ચંદ્રાસ્ત' },
  shubh_muhurat: { hi: 'शुभ मुहूर्त', en: 'Auspicious Time', sa: 'शुभमुहूर्तः', gu: 'શુભ મુહૂર્ત' },
  rahukaal: { hi: 'राहुकाल', en: 'Rahukaal', sa: 'राहुकालः', gu: 'રાહુકાલ' },
  upcoming_events: { hi: 'आगामी कार्यक्रम', en: 'Upcoming Events', sa: 'आगामिनः कार्यक्रमाः', gu: 'આગામી કાર્યક્રમો' },
  events_desc: { hi: 'अखाड़ा परिषद द्वारा आयोजित विशेष उत्सव', en: 'Special festivals organized by Akhada Parishad', sa: 'अखाडा परिषदा आयोजिताः विशेषाः उत्सवाः', gu: 'અખાડા પરિષદ દ્વારા આયોજિત વિશેષ ઉત્સવો' },
  photo_gallery: { hi: 'फोटो गैलरी', en: 'Photo Gallery', sa: 'चित्रवीथिका', gu: 'ફોટો ગેલેરી' },
  gallery_desc: { hi: 'मंदिर और उत्सवों की कुछ झलकियाँ', en: 'Glimpses of the temple and festivals', sa: 'मन्दिरस्य उत्सवानां च काश्चन झलकयः', gu: 'મંદિર અને उत्सवોની કેટલીક ઝલક' },
  view_details: { hi: 'विवरण देखें', en: 'View Details', sa: 'विवरणं पश्यतु', gu: 'વિગતો જુઓ' },
  select_language: { hi: 'भाषा चुनें', en: 'Select Language', sa: 'भाषां चिनोतु', gu: 'ભાષા પસંદ કરો' },
  devotees_joined: { hi: '10,000+ श्रद्धालु जुड़े', en: '10,000+ Devotees Joined', sa: '१०,०००+ भक्ताः सम्मिलिताः', gu: '10,000+ ભક્તો જોડાયા' },
  daily_darshan: { hi: 'दैनिक दर्शन', en: 'Daily Darshan', sa: 'दैनिक दर्शनम्', gu: 'દૈનિક દર્શન' },
  testimonials: { hi: 'श्रद्धालुओं के अनुभव', en: 'Devotee Experiences', sa: 'भक्तानां अनुभवाः', gu: 'ભક્તોના અનુભવો' },
  newsletter_title: { hi: 'आध्यात्मिक संदेश प्राप्त करें', en: 'Receive Spiritual Messages', sa: 'आध्यात्मिक सन्देशान् प्राप्नुवन्तु', gu: 'આધ્યાત્મિક સંદેશાઓ મેળવો' },
  subscribe: { hi: 'सब्सक्राइब करें', en: 'Subscribe', sa: 'सदस्यतां गृह्णातु', gu: 'સબ્સ્ક્રાઇબ કરો' },
  stats_puja: { hi: 'संपन्न पूजाएं', en: 'Pujas Completed', sa: 'संपन्नाः पूजाः', gu: 'સંપન્ન પૂજાઓ' },
  stats_pandit: { hi: 'अनुभवी पंडित', en: 'Expert Pandits', sa: 'अनुभवाः पण्डिताः', gu: 'અનુભવી પંડિતો' },
  stats_ashram: { hi: 'सेवा केंद्र', en: 'Service Centers', sa: 'सेवाकेन्द्राणि', gu: 'સેવા કેન્દ્રો' },
  akhada_website: { hi: 'अखाड़ा वेबसाइट', en: 'Akhada Website', sa: 'अखाडा जालस्थानम्', gu: 'અખાડા વેબસાઇટ' },
  detailed_panchang: { hi: 'विस्तृत पंचांग', en: 'Detailed Panchang', sa: 'विस्तृतं पञ्चाङ्गम्', gu: 'વિગતવાર પંચાંગ' },
  whatsapp_us: { hi: 'व्हाट्सएप करें', en: 'WhatsApp Us', sa: 'व्हाट्सएप सन्देशः', gu: 'વોટ્સએપ કરો' },
  membership: { hi: 'सदस्यता', en: 'Membership', sa: 'सदस्यता', gu: 'સભ્યપદ' },
  seva_samiti: { hi: 'सेवा समिति', en: 'Seva Samiti', sa: 'सेवा समिति', gu: 'સેવા સમિતિ' },
  membership_form: { hi: 'सदस्यता फार्म', en: 'Membership Form', sa: 'सदस्यता पत्रम्', gu: 'સભ્યપદ ફોર્મ' },
  become_member: { hi: 'सदस्य बनें', en: 'Become a Member', sa: 'सदस्यः भवतु', gu: 'સભ્ય બનો' },
  membership_desc: { hi: 'आश्रम सेवा संगठन का स्थायी सदस्य या दानदाता बनने के लिए आवेदन करें।', en: 'Apply to become a permanent member or donor of the Ashram Seva Organization.', sa: 'आश्रमसेवा-सङ्घस्य स्थायी सदस्यः दाता वा भवितुं आवेदनं कुर्वन्तु।', gu: 'આશ્રમ સેવા સંગઠનના કાયમી સભ્ય અથવા દાતા બનવા માટે અરજી કરો.' },
  contact: { hi: 'संपर्क', en: 'Contact', sa: 'सम्पर्कः', gu: 'સંપર્ક' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'hi';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
