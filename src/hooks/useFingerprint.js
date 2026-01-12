import { useState, useEffect } from 'react';
import { getFingerprint } from '../utils/fingerprint';

export const useFingerprint = () => {
  const [fingerprint, setFingerprint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const fp = await getFingerprint();
        setFingerprint(fp);
      } catch (error) {
        console.error('Fingerprint error:', error);
      }
      setLoading(false);
    };
    load();
  }, []);

  return { fingerprint, loading };
};
