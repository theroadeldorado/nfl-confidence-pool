import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise = null;

// Initialize fingerprint agent (lazy load)
const getAgent = () => {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  return fpPromise;
};

// Get browser fingerprint
export const getFingerprint = async () => {
  try {
    const agent = await getAgent();
    const result = await agent.get();
    return result.visitorId;
  } catch (error) {
    console.error('Fingerprint error:', error);
    // Fallback to random ID if fingerprinting fails
    return 'fallback_' + Math.random().toString(36).substring(2, 15);
  }
};

// Hash a fingerprint for storage (extra privacy)
export const hashFingerprint = async (fingerprint) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
