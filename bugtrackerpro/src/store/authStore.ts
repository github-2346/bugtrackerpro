import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

// Simulated users database
const usersDb: Map<string, { user: User; password: string }> = new Map();

// Initialize with demo users
const initDemoUsers = () => {
  const demoUsers = [
    { id: '1', email: 'admin@bugtracker.com', name: 'Admin', role: 'ADMIN' as Role, password: 'admin123' },
    { id: '2', email: 'manager@bugtracker.com', name: 'Manager', role: 'MANAGER' as Role, password: 'manager123' },
    { id: '3', email: 'dev@bugtracker.com', name: 'Developer', role: 'DEVELOPER' as Role, password: 'dev123' },
  ];
  
  demoUsers.forEach(({ password, ...user }) => {
    usersDb.set(user.email, { 
      user: { ...user, createdAt: new Date().toISOString() }, 
      password 
    });
  });
};

initDemoUsers();

const generateToken = () => {
  return 'jwt_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        const userData = usersDb.get(email);
        if (userData && userData.password === password) {
          const token = generateToken();
          set({ user: userData.user, token, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      register: async (name: string, email: string, password: string, role: Role) => {
        if (usersDb.has(email)) {
          return false;
        }
        
        const newUser: User = {
          id: Date.now().toString(),
          email,
          name,
          role,
          createdAt: new Date().toISOString(),
        };
        
        usersDb.set(email, { user: newUser, password });
        const token = generateToken();
        set({ user: newUser, token, isAuthenticated: true });
        return true;
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      updateProfile: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const getAllUsers = (): User[] => {
  return Array.from(usersDb.values()).map(u => u.user);
};
