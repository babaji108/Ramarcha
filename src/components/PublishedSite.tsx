import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2 } from 'lucide-react';

export default function PublishedSite() {
  const { id } = useParams();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSite = async () => {
      if (!id) {
        setError('Invalid site ID');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'published_sites', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setHtml(docSnap.data().html);
        } else {
          setError('Site not found. It may have been deleted or the URL is incorrect.');
        }
      } catch (err) {
        console.error("Error fetching site:", err);
        setError('Error loading the website. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Loading Website...</h2>
      </div>
    );
  }

  if (error || !html) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-600">{error || 'Something went wrong.'}</p>
        </div>
      </div>
    );
  }

  // Render the HTML in a full-screen iframe to isolate styles and scripts
  return (
    <iframe 
      srcDoc={html} 
      className="w-full h-screen border-none" 
      title="Published Website"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
}
