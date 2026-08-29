import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, department?: string) => Promise<void>;
  googleLogin: (data: { credential: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('college_rag_user');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('college_rag_token')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount: verify the stored token against the backend.
  // If backend is offline/unreachable, keep the locally cached user session
  // to avoid logging out during Render cold starts.
  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('college_rag_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.user);
          localStorage.setItem('college_rag_user', JSON.stringify(res.user));
        } catch (err: any) {
          const status = err?.response?.status;
          if (status === 401 || status === 403) {
            // Token is genuinely invalid or expired — clear session
            localStorage.removeItem('college_rag_token');
            localStorage.removeItem('college_rag_user');
            setToken(null);
            setUser(null);
          }
          // For network errors (backend offline, cold start): keep cached session
          // The user will be re-verified on next API call
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const res = await authApi.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('college_rag_token', newToken);
    localStorage.setItem('college_rag_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const signup = async (name: string, email: string, password: string, department?: string): Promise<void> => {
    const res = await authApi.signup({ name, email, password, department });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('college_rag_token', newToken);
    localStorage.setItem('college_rag_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  /**
   * Google OAuth login.
   * Sends only the `credential` (Google ID token from GSI SDK).
   * The backend verifies it cryptographically with Google before creating/updating the user.
   */
  const googleLogin = async (data: { credential: string }): Promise<void> => {
    const res = await authApi.googleAuth(data);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('college_rag_token', newToken);
    localStorage.setItem('college_rag_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('college_rag_token');
    localStorage.removeItem('college_rag_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        googleLogin,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
