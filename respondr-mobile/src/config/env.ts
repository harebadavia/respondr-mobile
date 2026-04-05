export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || '',
  firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  easProjectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || '',
};

export function assertRuntimeConfig() {
  const missing = [] as string[];
  if (!env.apiBaseUrl) missing.push('EXPO_PUBLIC_API_BASE_URL');
  if (!env.firebaseApiKey) missing.push('EXPO_PUBLIC_FIREBASE_API_KEY');
  if (!env.firebaseAuthDomain) missing.push('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!env.firebaseProjectId) missing.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
  if (!env.firebaseStorageBucket) missing.push('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!env.firebaseMessagingSenderId) missing.push('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!env.firebaseAppId) missing.push('EXPO_PUBLIC_FIREBASE_APP_ID');

  return {
    ready: missing.length === 0,
    missing,
  };
}
