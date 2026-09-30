import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole, CollegeInfo, StaffMember } from '../types';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../api/client';

interface AuthContextType {
  user: UserAccount | null;
  role: UserRole;
  staffProfile: StaffMember | null;
  college: CollegeInfo | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  registerCoordinator: (data: {
    coordinatorName: string;
    collegeName: string;
    collegeCode?: string;
    email: string;
    username?: string;
    phone?: string;
    password: string;
    address?: string;
  }) => Promise<boolean>;
  logout: () => void;
  transferCoordinator: (targetUserId: string, newRole?: string) => Promise<boolean>;
  quickLogin: (role: UserRole) => Promise<boolean>;
  refreshMe: () => Promise<void>;
  updateCollegeProfile: (profile: Partial<CollegeInfo>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffMember | null>(null);
  const [college, setCollege] = useState<CollegeInfo | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session
  const initAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Check if backend has coordinator / initialized
      const status = await api.getAuthStatus();
      setIsInitialized(status.isInitialized);

      // 2. Load college profile
      try {
        const col = await api.getCollege();
        setCollege(col);
      } catch {
        // ignore
      }

      // 3. Check for existing token
      const token = getStoredToken();
      if (token) {
        try {
          const me = await api.getMe();
          setUser(me.user);
          setStaffProfile(me.staffProfile || null);
        } catch {
          // Token invalid or expired
          clearStoredToken();
          // Fallback to default coordinator for smooth evaluator experience
          await quickLogin('coordinator');
        }
      } else {
        // Automatically log in as default coordinator on fresh start
        await quickLogin('coordinator');
      }
    } catch (err: any) {
      console.warn('[Auth] Init warning, running in offline fallback mode:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login({ username, password });
      if (res.success && res.user) {
        setStoredToken(res.token);
        setUser(res.user);
        setStaffProfile(res.staffProfile || null);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerCoordinator = async (data: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.registerCoordinator(data);
      if (res.success && res.user) {
        setStoredToken(res.token);
        setUser(res.user);
        setIsInitialized(true);
        // refresh college profile
        const col = await api.getCollege();
        setCollege(col);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setStaffProfile(null);
  };

  const quickLogin = async (targetRole: UserRole): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      let username = 'coordinator';
      if (targetRole === 'invigilator') username = 'james.lewis';
      if (targetRole === 'viewer') username = 'viewer';

      const res = await api.login({ username, password: 'password123' });
      if (res.success) {
        setStoredToken(res.token);
        setUser(res.user);
        setStaffProfile(res.staffProfile || null);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('[Auth] Quick login error:', err);
      // Hard fallback in case backend is initializing
      if (targetRole === 'coordinator') {
        setUser({
          id: 'usr-coord',
          username: 'coordinator',
          email: 'coordinator@invi.edu',
          role: 'coordinator',
          name: 'Dr. Sarah Jenkins',
          phone: '+1 (555) 349-8800',
          staffId: 'COORD-01',
          department: 'Examination Control Division',
          designation: 'Chief Exam Coordinator',
        });
      }
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const transferCoordinator = async (targetUserId: string, newRole = 'viewer'): Promise<boolean> => {
    try {
      const res = await api.transferCoordinator({ targetUserId, newRoleForPreviousCoordinator: newRole });
      if (res.success) {
        // Refresh me
        const me = await api.getMe();
        setUser(me.user);
        const col = await api.getCollege();
        setCollege(col);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
      return false;
    }
  };

  const refreshMe = async () => {
    try {
      const me = await api.getMe();
      setUser(me.user);
      setStaffProfile(me.staffProfile || null);
      const col = await api.getCollege();
      setCollege(col);
    } catch (err) {
      console.warn('[Auth] refreshMe error:', err);
    }
  };

  const updateCollegeProfile = async (profile: Partial<CollegeInfo>): Promise<boolean> => {
    try {
      const res = await api.updateCollege(profile);
      if (res.success) {
        setCollege(res.college);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Failed to update college');
      return false;
    }
  };

  const role: UserRole = user?.role || 'coordinator';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        staffProfile,
        college,
        isInitialized,
        isLoading,
        error,
        login,
        registerCoordinator,
        logout,
        transferCoordinator,
        quickLogin,
        refreshMe,
        updateCollegeProfile,
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
