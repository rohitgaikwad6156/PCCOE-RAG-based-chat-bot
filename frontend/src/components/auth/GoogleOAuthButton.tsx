import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Mail, ArrowRight, ExternalLink, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../services/authApi';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleOAuthButtonProps {
  label?: string;
}

/**
 * GoogleOAuthButton
 *
 * Production mode (VITE_GOOGLE_CLIENT_ID set):
 *   Uses official Google Identity Services SDK — sends only the credential token to backend.
 *
 * Development / unconfigured mode (no VITE_GOOGLE_CLIENT_ID):
 *   Shows a simple email + name form that signs in/registers via email password-less
 *   using the backend's existing signup/login flow. This lets you develop and test
 *   WITHOUT needing a Google Cloud project configured.
 */
export const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({ label = 'Continue with Google' }) => {
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const [isGoogleBtnRendered, setIsGoogleBtnRendered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [devEmail, setDevEmail] = useState('');
  const [devName, setDevName] = useState('');
  const [sdkError, setSdkError] = useState(false);

  const { googleLogin, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/chat';
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isDevMode = !GOOGLE_CLIENT_ID;

  // ── Production: Official Google GSI SDK flow ──────────────────────────────
  const handleCredentialResponse = async (response: any) => {
    if (!response.credential) {
      showToast('Google sign-in did not return a credential. Please try again.', 'error');
      return;
    }
    try {
      setIsLoading(true);
      await googleLogin({ credential: response.credential });
      showToast('Signed in with Google successfully!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Google sign-in failed.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDevMode) return; // Skip SDK init in dev mode

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        setSdkError(true);
        return;
      }
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          const containerWidth = googleBtnContainerRef.current.offsetWidth || 360;
          const targetWidth = Math.min(400, Math.max(250, containerWidth));

          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: targetWidth,
          });
          if (googleBtnContainerRef.current.children.length > 0) {
            setIsGoogleBtnRendered(true);
            setSdkError(false);
          } else {
            setSdkError(true);
          }
        }
      } catch {
        setSdkError(true);
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initializeGoogle();
        }
      }, 200);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!isGoogleBtnRendered) setSdkError(true);
      }, 8000);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [GOOGLE_CLIENT_ID]);

  // ── Development mode: Email + auto-register form ──────────────────────────
  const handleDevSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = devEmail.trim().toLowerCase();
    if (!cleanEmail) return;
    const derivedName = devName.trim() || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    setIsLoading(true);
    try {
      // Try login first, then signup if account doesn't exist
      try {
        await login(cleanEmail, 'DevPassword2026!');
      } catch {
        // Account doesn't exist — create it
        const res = await authApi.signup({ name: derivedName, email: cleanEmail, password: 'DevPassword2026!', department: 'Computer Engineering' });
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('college_rag_token', newToken);
        localStorage.setItem('college_rag_user', JSON.stringify(newUser));
        window.location.replace(from);
        return;
      }
      showToast(`Signed in as ${derivedName}`, 'success');
      setShowDevModal(false);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Sign-in failed. Is the backend running?';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Dev mode render ───────────────────────────────────────────────────────
  if (isDevMode) {
    return (
      <div className="w-full space-y-2">
        {/* Dev mode notice */}
        <div className="w-full p-2.5 rounded-xl bg-amber-950/40 border border-amber-700/40 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[10px] text-amber-300/90 leading-relaxed">
            <span className="font-bold">Dev mode</span> — Set{' '}
            <code className="bg-amber-950 px-0.5 rounded font-mono">VITE_GOOGLE_CLIENT_ID</code> for real Google OAuth.{' '}
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer"
              className="underline text-amber-400 inline-flex items-center gap-0.5 hover:text-amber-200">
              Setup <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Dev sign-in button */}
        <button
          type="button"
          onClick={() => setShowDevModal(true)}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-brand-500/50 text-slate-200 text-xs font-semibold shadow-sm flex items-center justify-center gap-2.5 transition-all group active:scale-[0.99] cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span>{label} (Dev)</span>
        </button>

        {/* Dev sign-in modal */}
        {showDevModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Development Sign-In</h3>
                  <p className="text-[10px] text-amber-400">Google OAuth not configured — using dev mode</p>
                </div>
              </div>

              <form onSubmit={handleDevSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="your@email.com"
                    value={devEmail}
                    onChange={e => setDevEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Name (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={devName}
                    onChange={e => setDevName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDevModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !devEmail.trim()}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-3 h-3" /></>}
                  </button>
                </div>
              </form>

              <p className="text-[9px] text-slate-500 text-center mt-3">
                Account created automatically if it doesn't exist • Password: <code className="font-mono">DevPassword2026!</code>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Production mode render ─────────────────────────────────────────────────
  return (
    <div className="w-full">
      {isLoading && (
        <div className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center gap-2.5">
          <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
          <span className="text-xs font-semibold text-slate-300">Verifying with Google...</span>
        </div>
      )}

      {/* Official Google GSI rendered button */}
      <div
        ref={googleBtnContainerRef}
        className={`w-full flex justify-center items-center overflow-hidden min-h-[44px] ${isLoading ? 'hidden' : ''}`}
      />

      {/* Fallback while SDK initializes */}
      {!isGoogleBtnRendered && !isLoading && !sdkError && (
        <button type="button" disabled
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 text-xs font-semibold flex items-center justify-center gap-2.5 cursor-wait">
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          <span>Loading Google Sign-In...</span>
        </button>
      )}

      {/* SDK error fallback */}
      {sdkError && !isGoogleBtnRendered && (
        <div className="w-full p-3 rounded-xl bg-red-950/40 border border-red-700/50 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-red-300">
            Google Sign-In failed to load. Check your Client ID authorized origins include{' '}
            <code className="font-mono bg-red-950 px-1 rounded">http://localhost:5173</code>.
          </div>
        </div>
      )}
    </div>
  );
};
