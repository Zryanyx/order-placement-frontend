import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  setAuth: (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    set({ token: null, user: null, isAuthenticated: false });
  },
  
  initAuth: () => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      try {
        const user = JSON.parse(userInfo);
        set({ token, user, isAuthenticated: true });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        set({ token: null, user: null, isAuthenticated: false });
      }
    }
  },
}));

