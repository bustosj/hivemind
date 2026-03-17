// ─────────────────────────────────────────
//  useGoogleAuth Hook
//  Wraps expo-auth-session/providers/google
//  Call signIn() → get idToken → pass to authStore
// ─────────────────────────────────────────

import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../store/authStore';

WebBrowser.maybeCompleteAuthSession();

// 🔑 Replace with your OAuth client IDs from Google Cloud Console
//    (same project as your Firebase project)
//    Android: create an OAuth credential for "Android" in GCC
//    iOS:     create an OAuth credential for "iOS" in GCC
//    Web:     create an OAuth credential for "Web application"
const GOOGLE_CLIENT_IDS = {
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  iosClientId:     'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  webClientId:     'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};

export function useGoogleAuth() {
  const signInWithGoogle = useAuthStore(s => s.signInWithGoogle);

  const [request, response, promptAsync] = Google.useAuthRequest(GOOGLE_CLIENT_IDS);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        signInWithGoogle(id_token).catch(console.error);
      }
    }
  }, [response]);

  return {
    signIn:  () => promptAsync(),
    request, // null until ready
  };
}
