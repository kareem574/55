import React from 'react';
import { User } from 'firebase/auth';
import { LogOut, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface GoogleSignInButtonProps {
  user: User | null;
  isLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onRefresh?: () => void;
  isSyncing?: boolean;
  authError?: string | null;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  user,
  isLoading,
  onLogin,
  onLogout,
  onRefresh,
  isSyncing,
  authError,
}) => {
  if (user) {
    return (
      <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 shadow-sm">
        {/* User avatar or placeholder */}
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'Google User'} 
            className="w-6 h-6 rounded-full border border-emerald-400 shrink-0"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {user.displayName ? user.displayName[0] : 'G'}
          </div>
        )}

        <div className="hidden sm:block text-right">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-100 max-w-[130px] truncate">
              {user.displayName || user.email?.split('@')[0]}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/60">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>متصل بالشيت</span>
            </span>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="مزامنة فورية من الشيت الآن"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        )}

        <button
          onClick={onLogout}
          className="p-1 rounded-lg hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          title="تسجيل الخروج"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onLogin}
        disabled={isLoading}
        className="gsi-material-button relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-md border border-slate-200 transition-all active:scale-95 cursor-pointer disabled:opacity-70"
        title="تسجيل الدخول بحساب Google لقراءة الشيت الأصلي مباشرة"
      >
        {/* Google Official Colorful SVG Icon */}
        <div className="w-4 h-4 shrink-0">
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
        </div>

        <span>
          {isLoading ? 'جاري الاتصال بجوجل...' : 'ربط وقراءة الشيت بحساب Google'}
        </span>
      </button>

      {authError && (
        <div className="hidden lg:flex items-center gap-1 text-[11px] text-rose-400 bg-rose-950/40 px-2 py-1 rounded-lg border border-rose-800/50">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>{authError}</span>
        </div>
      )}
    </div>
  );
};
