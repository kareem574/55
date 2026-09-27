import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Provider with Google Sheets and Google Drive Readonly Scopes
export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;

// Cache the access token in memory. NEVER store in localStorage per security guidelines.
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token not cached yet (e.g. page refresh)
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('لم يتم استلام رمز الوصول (Access Token) من حساب جوجل');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    
    // Provide user-friendly Arabic error message for common popup errors
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('المتصفح منع النافذة المنبثقة (Popup Blocked). يرجى السماح بالنوافذ المنبثقة من إعدادات المتصفح.');
    }
    if (error?.code === 'auth/popup-closed-by-user') {
      throw new Error('تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية. اضغط للمحاولة مرة أخرى.');
    }
    if (error?.code === 'auth/cancelled-popup-request') {
      throw new Error('تم إلغاء طلب تسجيل الدخول السابق.');
    }
    
    throw new Error(error?.message || 'تعذر تسجيل الدخول بحساب Google');
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const googleLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
