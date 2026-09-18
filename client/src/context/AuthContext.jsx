import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('nccforce_token');
      const savedUser = localStorage.getItem('nccforce_user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify token is still valid by calling /auth/me
          const res = await authService.getMe();
          if (res.success && res.data) {
            const userData = res.data;
            setUser(userData);
            localStorage.setItem('nccforce_user', JSON.stringify(userData));
          }
        } catch (err) {
          // Token expired or invalid
          console.warn('Session expired, logging out');
          localStorage.removeItem('nccforce_token');
          localStorage.removeItem('nccforce_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data) {
        const { user: userData, token } = res.data;
        localStorage.setItem('nccforce_token', token);
        localStorage.setItem('nccforce_user', JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, error: res.message || 'Login failed' };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const fbResult = await signInWithPopup(auth, googleProvider);
      const idToken = await fbResult.user.getIdToken();
      const res = await authService.firebaseLogin(idToken);
      if (res.success && res.data) {
        const { user: userData, token } = res.data;
        localStorage.setItem('nccforce_token', token);
        localStorage.setItem('nccforce_user', JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, error: res.message || 'Firebase login failed' };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Google sign-in failed';
      return { success: false, error: message };
    }
  };

  // Aliases for backward compatibility with existing login pages
  const loginOfficer = (email, password) => login(email, password);
  const loginCadet = (email, password) => login(email, password);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nccforce_token');
    localStorage.removeItem('nccforce_user');
  };

  const isOfficer = () => user?.role === 'officer';
  const isCadet = () => user?.role === 'cadet';
  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, loginOfficer, loginCadet, loginWithGoogle, logout, isOfficer, isCadet, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
