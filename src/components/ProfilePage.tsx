import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { sendEmailVerification, reload } from 'firebase/auth';
import { UserProfile, PanditProfile } from '../types';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Shield, Save, Camera, Star, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [panditData, setPanditData] = useState<PanditProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setProfile(data);
          setName(data.name || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');

          if (data.role === 'pandit') {
            const panditDoc = await getDoc(doc(db, 'pandits', auth.currentUser.uid));
            if (panditDoc.exists()) {
              setPanditData(panditDoc.data() as PanditProfile);
            }
          }
        }
      } catch (error) {
        console.error(error);
        toast.error('प्रोफ़ाइल लोड करने में विफल');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSendVerification = async () => {
    if (!auth.currentUser) return;
    setVerifying(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('सत्यापन ईमेल भेज दिया गया है। कृपया अपना इनबॉक्स चेक करें।');
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        toast.error('बहुत अधिक प्रयास। कृपया कुछ समय बाद पुनः प्रयास करें।');
      } else {
        toast.error('ईमेल भेजने में विफल');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleRefreshVerification = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await reload(auth.currentUser);
      const isVerified = auth.currentUser.emailVerified;
      
      if (isVerified) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          emailVerified: true
        });
        setProfile(prev => prev ? { ...prev, emailVerified: true } : null);
        toast.success('ईमेल सफलतापूर्वक सत्यापित हो गया है!');
      } else {
        toast.info('ईमेल अभी तक सत्यापित नहीं हुआ है।');
      }
    } catch (error) {
      toast.error('स्थिति अपडेट करने में विफल');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        name,
        phone,
        address,
        updatedAt: new Date().toISOString()
      });
      toast.success('प्रोफ़ाइल सफलतापूर्वक अपडेट की गई');
    } catch (error) {
      toast.error('अपडेट विफल रहा');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20">लोड हो रहा है...</div>;
  }

  if (!profile) {
    return <div className="text-center py-20 text-red-500">प्रोफ़ाइल नहीं मिली</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#4A2C2A] dark:text-orange-100">मेरी प्रोफ़ाइल</h1>
        <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${
          profile.role === 'super_admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
          profile.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
          profile.role === 'pandit' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {profile.role.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-[#FFF5E6] dark:bg-gray-700 rounded-full flex items-center justify-center text-[#FF9933] text-4xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
                {name[0] || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 bg-[#FF9933] p-2 rounded-full text-white shadow-md hover:bg-[#FF8811] transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold dark:text-white">{name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{profile.email}</p>
            
            <div className="flex flex-col items-center space-y-2 mb-4">
              {auth.currentUser?.emailVerified ? (
                <div className="flex items-center space-x-1 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-xs font-bold">
                  <CheckCircle className="w-3 h-3" />
                  <span>ईमेल सत्यापित</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3 w-full">
                  <div className="flex items-center space-x-1 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl text-xs font-bold w-full justify-center border border-amber-100 dark:border-amber-900/30">
                    <AlertCircle className="w-4 h-4" />
                    <span>ईमेल सत्यापित नहीं है</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 w-full">
                    <button 
                      onClick={handleSendVerification}
                      disabled={verifying}
                      className="w-full py-2 bg-[#FF9933] text-white rounded-xl text-xs font-bold hover:bg-[#FF8811] transition-all shadow-sm disabled:opacity-50"
                    >
                      {verifying ? 'भेज रहा है...' : 'सत्यापन लिंक भेजें'}
                    </button>
                    <button 
                      onClick={handleRefreshVerification}
                      className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    >
                      स्थिति रिफ्रेश करें
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {profile.role === 'pandit' && panditData && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-around">
                <div className="text-center">
                  <div className="flex items-center justify-center text-yellow-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 font-bold dark:text-white">{panditData.rating}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase">रेटिंग</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-blue-500 mb-1">
                    <Award className="w-4 h-4" />
                    <span className="ml-1 font-bold dark:text-white">{panditData.experience}y</span>
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase">अनुभव</div>
                </div>
              </div>
            )}
          </div>

          {profile.role === 'pandit' && panditData && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold mb-4 flex items-center space-x-2 dark:text-white">
                <Shield className="w-5 h-5 text-[#FF9933]" />
                <span>विशेषज्ञता</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {panditData.specialization.map((spec) => (
                  <span key={spec} className="bg-[#FFF5E6] dark:bg-gray-700 text-[#FF9933] px-3 py-1 rounded-full text-xs font-bold">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>पूरा नाम</span>
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FFF5E6] dark:bg-gray-700 border-2 border-transparent focus:border-[#FF9933] rounded-xl outline-none transition-all dark:text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>ईमेल (अपरिवर्तनीय)</span>
                </label>
                <input 
                  type="email" 
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent rounded-xl text-gray-400 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>मोबाइल नंबर</span>
                </label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FFF5E6] dark:bg-gray-700 border-2 border-transparent focus:border-[#FF9933] rounded-xl outline-none transition-all dark:text-white"
                  placeholder="9876543210"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span>भूमिका</span>
                </label>
                <input 
                  type="text" 
                  value={profile.role}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent rounded-xl text-gray-400 cursor-not-allowed uppercase"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>स्थायी पता</span>
              </label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-[#FFF5E6] dark:bg-gray-700 border-2 border-transparent focus:border-[#FF9933] rounded-xl outline-none transition-all h-32 resize-none dark:text-white"
                placeholder="अपना पूरा पता यहाँ लिखें..."
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={saving}
                className="w-full md:w-auto bg-[#FF9933] text-white px-10 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-[#FF8811] transition-all shadow-lg disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'सहेज रहा है...' : 'प्रोफ़ाइल सहेजें'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
