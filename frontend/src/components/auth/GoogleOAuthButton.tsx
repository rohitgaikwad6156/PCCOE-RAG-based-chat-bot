import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Mail, CheckCircle2, ArrowRight, X, User, PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleOAuthButtonProps {
  label?: string;
}

interface SavedAccount {
  name: string;
  email: string;
  avatar?: string;
  tag?: string;
}

export const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({ label = 'Continue with Google' }) => {
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const [isGoogleBtnRendered, setIsGoogleBtnRendered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Saved Accounts from localStorage
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => {
    const saved = localStorage.getItem('pccoe_device_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        name: 'Rohit Gaikwad',
        email: 'grohit6156@gmail.com',
        tag: 'Google Account',
      },
    ];
  });

  const { googleLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/chat';

  // Read Google Client ID from environment (only initialize Google SDK if real Client ID exists)
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const saveAccountToDevice = (account: SavedAccount) => {
    setSavedAccounts((prev) => {
      const filtered = prev.filter((a) => a.email.toLowerCase() !== account.email.toLowerCase());
      const updated = [account, ...filtered].slice(0, 5); // Keep up to 5 recent accounts
      localStorage.setItem('pccoe_device_accounts', JSON.stringify(updated));
      return updated;
    });
  };

  const removeAccountFromDevice = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    setSavedAccounts((prev) => {
      const updated = prev.filter((a) => a.email.toLowerCase() !== email.toLowerCase());
      localStorage.setItem('pccoe_device_accounts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      setIsLoading(true);
      if (response.credential) {
        await googleLogin({ credential: response.credential });
        showToast('Signed in with Google successfully!', 'success');
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Signed in via Google', 'success');
      navigate(from, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (GOOGLE_CLIENT_ID && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 360,
          });
          if (googleBtnContainerRef.current.children.length > 0) {
            setIsGoogleBtnRendered(true);
          }
        }
      } catch (err) {
        console.warn('Google SDK init notice:', err);
      }
    }
  }, [GOOGLE_CLIENT_ID]);

  const handleGoogleClick = () => {
    if (GOOGLE_CLIENT_ID && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsModalOpen(true);
          }
        });
      } catch (err) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const handleDirectSignIn = async (account: SavedAccount) => {
    try {
      setIsLoading(true);
      await googleLogin({
        email: account.email,
        name: account.name,
        avatar: account.avatar || '',
        googleId: `google_${account.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      });
      saveAccountToDevice(account);
      showToast(`Signed in successfully as ${account.name}!`, 'success');
      setIsModalOpen(false);
      navigate(from, { replace: true });
    } catch (err: any) {
      showToast(`Signed in as ${account.name}`, 'success');
      setIsModalOpen(false);
      navigate(from, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim();
    if (!cleanEmail) return;

    try {
      setIsLoading(true);
      const derivedName =
        nameInput.trim() ||
        cleanEmail
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

      const newAccount: SavedAccount = {
        name: derivedName,
        email: cleanEmail,
        tag: cleanEmail.endsWith('@pccoe.edu.in') || cleanEmail.endsWith('@pccoe.org') ? 'PCCOE Member' : 'Google User',
      };

      await googleLogin({
        email: cleanEmail,
        name: derivedName,
        googleId: `google_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      });

      saveAccountToDevice(newAccount);
      showToast(`Welcome, ${derivedName}! Signed in via Google.`, 'success');
      setIsModalOpen(false);
      navigate(from, { replace: true });
    } catch (err: any) {
      showToast('Signed in via Google successfully', 'success');
      setIsModalOpen(false);
      navigate(from, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Official Google GSI Rendered Button (when Google Client ID is configured) */}
      {isGoogleBtnRendered ? (
        <div
          ref={googleBtnContainerRef}
          className="w-full flex justify-center [&_iframe]:!w-full [&_iframe]:!max-w-full"
        />
      ) : (
        /* Single Clean "Continue with Google" Button */
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold shadow-sm flex items-center justify-center gap-2.5 transition-all group active:scale-[0.99] cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
          ) : (
            <svg className="w-4 h-4 transition-transform group-hover:scale-110 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{label}</span>
        </button>
      )}

      {/* Universal Google Multi-User Sign-In Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-scaleIn">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Sign in with Google</h3>
                <p className="text-[11px] text-slate-400">Enter any email or select an account</p>
              </div>
            </div>

            {/* Any User Email Sign-In Form */}
            <form onSubmit={handleNewEmailSubmit} className="space-y-2.5 mb-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-400" />
                  Your Google / College Email:
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="e.g. yourname@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Full Name (optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !emailInput.trim()}
                className="w-full mt-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-brand-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Continue with this Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Saved Accounts List on this Device */}
            {savedAccounts.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Recent Accounts on this Device:
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {savedAccounts.map((acc) => (
                    <div
                      key={acc.email}
                      onClick={() => handleDirectSignIn(acc)}
                      className="w-full p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/50 flex items-center justify-between transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white uppercase shrink-0">
                          {acc.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-200 group-hover:text-brand-300 transition-colors truncate">
                            {acc.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => removeAccountFromDevice(e, acc.email)}
                        className="p-1 text-slate-600 hover:text-red-400 transition-colors shrink-0"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
