import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole, UserPermissions, PatientAccount } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginAsPatient: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isJYL: boolean;
  isDoctor: boolean;
  isSupervisor: boolean;
  isPatient: boolean;
  checkEditPassword: (password: string) => boolean;
  getUserPermissions: () => UserPermissions;
  canAccessPage: (page: string) => boolean;
  canFillTemplate: (templateId: string) => boolean;
  canApprove: () => boolean;
  updateShiftStatus: (isOnDuty: boolean, status?: string, location?: string) => void;
  getShiftStatus: () => { isOnDuty: boolean; status?: string; location?: string };
  patientAccount: PatientAccount | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Predefined users (hidden from UI)
const VALID_USERS: Record<string, { 
  password: string; 
  role: UserRole; 
  name: string;
  jobTitleId?: string;
  jobTitle?: string;
  supervisorId?: string;
}> = {
  'ruutu.koskela': { 
    password: 'Ruutu243', 
    role: 'JYL', 
    name: 'Ruutu Koskela',
    jobTitleId: 'jyl',
    jobTitle: 'Johtava ylilääkäri'
  },
  'laakarit.ek': { 
    password: 'Laakar1', 
    role: 'LÄÄKÄRI', 
    name: 'Lääkäri Ek',
    jobTitleId: 'laakari',
    jobTitle: 'Lääkäri',
    supervisorId: 'ruutu.koskela'
  },
};

const EDIT_PASSWORD = 'Muokkaalaakarit';

// Default permissions
const DEFAULT_PERMISSIONS: UserPermissions = {
  canViewTallennetut: true,
  canViewUusi: true,
  canViewArkistoidut: true,
  canViewPohjat: false,
  canViewMuokkaa: false,
  canViewReseptit: true,
  canViewKayttajat: false,
  canViewOhjeistukset: true,
  canViewRaportit: true,
  canViewVuorot: true,
  canApproveConfidential: false,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hus_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
        localStorage.removeItem('hus_user');
        return null;
      }
      return parsed;
    }
    return null;
  });

  const [patientAccount, setPatientAccount] = useState<PatientAccount | null>(() => {
    const saved = localStorage.getItem('hus_patient_account');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
        localStorage.removeItem('hus_patient_account');
        return null;
      }
      return parsed;
    }
    return null;
  });

  const [shiftStatus, setShiftStatus] = useState(() => {
    const saved = localStorage.getItem('hus_shift_status');
    return saved ? JSON.parse(saved) : { isOnDuty: false };
  });

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    // First, check staff accounts from localStorage
    const staffAccounts = JSON.parse(localStorage.getItem('hus_staff_accounts') || '[]');
    const staffAccount = staffAccounts.find((a: any) => 
      a.username === username && a.password === password && a.isActive
    );
    
    if (staffAccount) {
      if (staffAccount.expiresAt && new Date(staffAccount.expiresAt) < new Date()) {
        return false; // Account expired
      }
      
      // Create staff user
      const staffUser: User = {
        id: staffAccount.id,
        username: staffAccount.username,
        role: staffAccount.role,
        name: staffAccount.name,
        jobTitleId: staffAccount.jobTitleId,
        jobTitle: staffAccount.jobTitle,
        isOnDuty: false,
      };
      
      setUser(staffUser);
      setPatientAccount(null);
      localStorage.setItem('hus_user', JSON.stringify(staffUser));
      localStorage.removeItem('hus_patient_account');
      return true;
    }

    // Check predefined users
    const userData = VALID_USERS[username];
    if (userData && userData.password === password) {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        role: userData.role,
        name: userData.name,
        jobTitleId: userData.jobTitleId,
        jobTitle: userData.jobTitle,
        supervisorId: userData.supervisorId,
        isOnDuty: false,
      };
      setUser(newUser);
      setPatientAccount(null); // Clear patient account when staff logs in
      localStorage.setItem('hus_user', JSON.stringify(newUser));
      localStorage.removeItem('hus_patient_account');
      return true;
    }
    return false;
  }, []);

  const loginAsPatient = useCallback(async (username: string, password: string): Promise<boolean> => {
    // Check patient accounts from localStorage
    const accounts = JSON.parse(localStorage.getItem('hus_patient_accounts') || '[]');
    const account = accounts.find((a: any) => 
      a.username === username && a.password === password && a.isActive === true
    );
    
    if (account) {
      // Check expiration (handle string dates from JSON)
      if (account.expiresAt) {
        const expiryDate = new Date(account.expiresAt);
        if (expiryDate < new Date()) {
          return false; // Account expired
        }
      }
      
      setPatientAccount(account);
      
      // Create a patient user
      const patientUser: User = {
        id: account.id,
        username: account.username,
        role: 'POTILAS',
        name: account.username, // Will be updated with patient name
        isPatient: true,
        patientId: account.patientId,
      };
      
      setUser(patientUser);
      localStorage.setItem('hus_user', JSON.stringify(patientUser));
      localStorage.setItem('hus_patient_account', JSON.stringify(account));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setPatientAccount(null);
    localStorage.removeItem('hus_user');
    localStorage.removeItem('hus_patient_account');
    localStorage.removeItem('hus_shift_status');
  }, []);

  const checkEditPassword = useCallback((password: string): boolean => {
    return password === EDIT_PASSWORD;
  }, []);

  const getUserPermissions = useCallback((): UserPermissions => {
    if (!user) return DEFAULT_PERMISSIONS;
    
    if (user.role === 'JYL') {
      return {
        canViewTallennetut: true,
        canViewUusi: true,
        canViewArkistoidut: true,
        canViewPohjat: true,
        canViewMuokkaa: true,
        canViewReseptit: true,
        canViewKayttajat: true,
        canViewOhjeistukset: true,
        canViewRaportit: true,
        canViewVuorot: true,
        canApproveConfidential: true,
      };
    }
    
    return {
      ...DEFAULT_PERMISSIONS,
      canApproveConfidential: user.role === 'ERIKOISLÄÄKÄRI',
    };
  }, [user]);

  const canAccessPage = useCallback((page: string): boolean => {
    if (!user) return false;
    
    // Patient accounts can only access patient portal
    if (user.isPatient || user.role === 'POTILAS') {
      return page === 'potilasportaali';
    }
    
    if (user.role === 'JYL') return true;
    
    // Check page permissions from localStorage
    const pagePermissions = JSON.parse(localStorage.getItem('hus_page_permissions_v2') || '{}');
    const perm = pagePermissions[page];
    
    if (perm) {
      // Check roles
      const roleAllowed = perm.roles?.includes('all') || perm.roles?.includes(user.role);
      
      // Check job titles
      const jobTitleAllowed = !perm.jobTitles || perm.jobTitles.length === 0 || 
        (user.jobTitle && perm.jobTitles.includes(user.jobTitle));
      
      // If both are specified, either one grants access
      if (perm.roles?.length > 0 && perm.jobTitles?.length > 0) {
        return roleAllowed || jobTitleAllowed;
      }
      
      // Otherwise check what's specified
      if (perm.jobTitles?.length > 0) {
        return jobTitleAllowed;
      }
      
      return roleAllowed;
    }
    
    // Fallback to old permission system
    const permissions = getUserPermissions();
    switch (page) {
      case 'tallennetut': return permissions.canViewTallennetut;
      case 'uusi': return permissions.canViewUusi;
      case 'arkistoidut': return permissions.canViewArkistoidut;
      case 'pohjat': return permissions.canViewPohjat;
      case 'muokkaa': return permissions.canViewMuokkaa;
      case 'reseptit': return permissions.canViewReseptit;
      case 'kayttajat': return permissions.canViewKayttajat;
      case 'ohjeistukset': return permissions.canViewOhjeistukset;
      case 'raportit': return permissions.canViewRaportit;
      case 'vuorot': return permissions.canViewVuorot;
      default: return true;
    }
  }, [user, getUserPermissions]);

  const canFillTemplate = useCallback((templateId: string): boolean => {
    if (!user) return false;
    // JYL can fill all templates
    if (user.role === 'JYL') return true;
    // Doctors and specialists can fill most templates
    if (['LÄÄKÄRI', 'ERIKOISLÄÄKÄRI'].includes(user.role)) return true;
    // Others have limited access
    return ['vuorotulo', 'raportti'].includes(templateId);
  }, [user]);

  const canApprove = useCallback((): boolean => {
    if (!user) return false;
    return user.role === 'JYL' || user.role === 'ERIKOISLÄÄKÄRI';
  }, [user]);

  const updateShiftStatus = useCallback((isOnDuty: boolean, status?: string, location?: string) => {
    const newStatus = { isOnDuty, status, location, updatedAt: new Date() };
    setShiftStatus(newStatus);
    localStorage.setItem('hus_shift_status', JSON.stringify(newStatus));
    
    // Update user object too
    if (user) {
      const updatedUser = { 
        ...user, 
        isOnDuty, 
        shiftStartedAt: isOnDuty ? new Date() : undefined 
      };
      setUser(updatedUser);
      localStorage.setItem('hus_user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const getShiftStatus = useCallback(() => shiftStatus, [shiftStatus]);

  const value: AuthContextType = {
    user,
    login,
    loginAsPatient,
    logout,
    isJYL: user?.role === 'JYL',
    isDoctor: user?.role === 'LÄÄKÄRI' || user?.role === 'ERIKOISLÄÄKÄRI',
    isSupervisor: user?.role === 'JYL' || user?.role === 'ERIKOISLÄÄKÄRI',
    isPatient: user?.isPatient === true || user?.role === 'POTILAS',
    checkEditPassword,
    getUserPermissions,
    canAccessPage,
    canFillTemplate,
    canApprove,
    updateShiftStatus,
    getShiftStatus,
    patientAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
