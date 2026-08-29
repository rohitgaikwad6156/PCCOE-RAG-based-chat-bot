import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, department?: string, role?: string) => Promise<void>;
  googleLogin: (data: { email?: string; name?: string; avatar?: string; googleId?: string; credential?: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('college_rag_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('college_rag_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('college_rag_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.user);
          localStorage.setItem('college_rag_user', JSON.stringify(res.user));
        } catch (err) {
          localStorage.removeItem('college_rag_token');
          localStorage.removeItem('college_rag_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('college_rag_token', newToken);
    localStorage.setItem('college_rag_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const signup = async (name: string, email: string, password: string, department?: string, role?: string) => {
    const res = await authApi.signup({ name, email, password, department, role });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('college_rag_token', newToken);
    localStorage.setItem('college_rag_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const googleLogin = async (data: { email?: string; name?: string; avatar?: string; googleId?: string; credential?: string }) => {
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
