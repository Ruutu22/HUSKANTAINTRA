import { useState, useCallback, useEffect } from 'react';
import type { SavedForm, FormTemplate, Prescription, User, JobTitle, Notice, ShiftStatus, ApprovalRequest, Patient, Diagnosis, DiagnosisCategory, Treatment, Examination, LabValue, Disease, AuditLog, Notification, ChatMessage, SharedNote, SystemSettings, CustomStatus, WorkShift, SinglePatientAccount, PatientPortalAccess, LabOrder, ImagingStudy, Referral, UserGroup, ChatChannel, Appointment, ElectronicSignature, FormVersion, PatientAccount, PatientDocument, PatientQuestion, PatientHealthTracker, PatientReminder, StaffAccount, Medication, PatientMedication, Message, Conversation } from '@/types';

// Generic hook for localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key]);

  return [storedValue, setValue];
}

// Job titles hook
export function useJobTitles() {
  const [jobTitles, setJobTitles] = useLocalStorage<JobTitle[]>('hus_jobtitles', [
    { id: 'jyl', name: 'Johtava ylilääkäri', level: 100, color: '#7c3aed', canCreate: true },
    { id: 'erikoislaakari', name: 'Erikoislääkäri', level: 80, color: '#0066b3', canCreate: true },
    { id: 'laakari', name: 'Lääkäri', level: 60, color: '#0891b2' },
    { id: 'ensihoitaja', name: 'Perustason ensihoitaja', level: 40, color: '#059669' },
    { id: 'hoitaja', name: 'Hoitaja', level: 30, color: '#d97706' },
  ]);

  const addJobTitle = useCallback((title: Omit<JobTitle, 'id'>) => {
    const newTitle: JobTitle = {
      ...title,
      id: Math.random().toString(36).substr(2, 9),
    };
    setJobTitles(prev => [...prev, newTitle]);
    return newTitle.id;
  }, [setJobTitles]);

  const updateJobTitle = useCallback((id: string, updates: Partial<JobTitle>) => {
    setJobTitles(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [setJobTitles]);

  const deleteJobTitle = useCallback((id: string) => {
    setJobTitles(prev => prev.filter(t => t.id !== id));
  }, [setJobTitles]);

  const getJobTitleById = useCallback((id: string) => {
    return jobTitles.find(t => t.id === id);
  }, [jobTitles]);

  return {
    jobTitles,
    addJobTitle,
    updateJobTitle,
    deleteJobTitle,
    getJobTitleById,
  };
}

// Saved forms hook
export function useSavedForms() {
  const [forms, setForms] = useLocalStorage<SavedForm[]>('hus_forms', []);

  const addForm = useCallback((form: Omit<SavedForm, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newForm: SavedForm = {
      ...form,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setForms(prev => [newForm, ...prev]);
    return newForm.id;
  }, [setForms]);

  const updateForm = useCallback((id: string, data: Partial<SavedForm>) => {
    setForms(prev => prev.map(form => 
      form.id === id ? { ...form, ...data, updatedAt: new Date() } : form
    ));
  }, [setForms]);

  const deleteForm = useCallback((id: string) => {
    setForms(prev => prev.filter(form => form.id !== id));
  }, [setForms]);

  const archiveForm = useCallback((id: string) => {
    setForms(prev => prev.map(form => 
      form.id === id ? { ...form, isArchived: true, updatedAt: new Date() } : form
    ));
  }, [setForms]);

  const unarchiveForm = useCallback((id: string) => {
    setForms(prev => prev.map(form => 
      form.id === id ? { ...form, isArchived: false, updatedAt: new Date() } : form
    ));
  }, [setForms]);

  const getFormById = useCallback((id: string) => {
    return forms.find(form => form.id === id);
  }, [forms]);

  const renameForm = useCallback((id: string, patientName: string) => {
    setForms(prev => prev.map(form => 
      form.id === id ? { ...form, patientName, updatedAt: new Date() } : form
    ));
  }, [setForms]);

  const searchForms = useCallback((query: string, includeArchived = false) => {
    const searchLower = query.toLowerCase();
    return forms.filter(form => {
      if (!includeArchived && form.isArchived) return false;
      return (
        form.patientName?.toLowerCase().includes(searchLower) ||
        form.templateName?.toLowerCase().includes(searchLower) ||
        form.createdByName?.toLowerCase().includes(searchLower)
      );
    });
  }, [forms]);

  return {
    forms: forms.filter(f => !f.isArchived),
    archivedForms: forms.filter(f => f.isArchived),
    allForms: forms,
    addForm,
    updateForm,
    deleteForm,
    archiveForm,
    unarchiveForm,
    getFormById,
    renameForm,
    searchForms,
  };
}

// Templates hook
export function useTemplates() {
  const [templates, setTemplates] = useLocalStorage<FormTemplate[]>('hus_templates', []);

  // Initialize default templates if none exist
  useEffect(() => {
    if (templates.length === 0) {
      const defaultTemplates: FormTemplate[] = [
        {
          id: 'poliisi-tt',
          name: 'Poliisi työterveys',
          description: 'Työterveystarkastuslomake poliisiviranomaisille',
          sections: [],
          createdBy: 'system',
          createdAt: new Date(),
          isDefault: true,
          category: 'tt',
          allowedRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI'],
          hasApprovalFlow: true,
        },
        {
          id: 'psykologi',
          name: 'Psykologin arviointi',
          description: 'Psykologin arviointilomake',
          sections: [],
          createdBy: 'system',
          createdAt: new Date(),
          isDefault: true,
          category: 'psykologi',
          allowedRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI'],
          hasApprovalFlow: true,
        },
        {
          id: 'vuorotulo',
          name: 'Vuoroon tulo',
          description: 'Vuoroon ilmoittautumislomake',
          sections: [],
          createdBy: 'system',
          createdAt: new Date(),
          isDefault: true,
          category: 'vuoro',
          allowedRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'],
        },
        {
          id: 'raportti',
          name: 'Tapahtumaraportti',
          description: 'Yleinen tapahtumaraporttilomake',
          sections: [],
          createdBy: 'system',
          createdAt: new Date(),
          isDefault: true,
          category: 'raportti',
          allowedRoles: ['JYL', 'LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'HOITAJA', 'ENSIHOITAJA'],
        },
      ];
      setTemplates(defaultTemplates);
    }
  }, []);

  const addTemplate = useCallback((template: Omit<FormTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: FormTemplate = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate.id;
  }, [setTemplates]);

  const updateTemplate = useCallback((id: string, data: Partial<FormTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, ...data } : template
    ));
  }, [setTemplates]);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  }, [setTemplates]);

  const getTemplateById = useCallback((id: string) => {
    return templates.find(template => template.id === id);
  }, [templates]);

  const getTemplatesByCategory = useCallback((category: string) => {
    return templates.filter(t => t.category === category);
  }, [templates]);

  const canUserFillTemplate = useCallback((templateId: string, userRole: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return false;
    if (!template.allowedRoles || template.allowedRoles.length === 0) return true;
    return template.allowedRoles.includes(userRole);
  }, [templates]);

  // Export template to JSON
  const exportTemplate = useCallback((templateId: string): string | null => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return null;
    return JSON.stringify(template, null, 2);
  }, [templates]);

  // Export all templates to JSON
  const exportAllTemplates = useCallback((): string => {
    return JSON.stringify(templates, null, 2);
  }, [templates]);

  // Import template from JSON
  const importTemplate = useCallback((jsonString: string, userId: string): string | null => {
    try {
      const imported = JSON.parse(jsonString);
      // Validate required fields
      if (!imported.name || !imported.sections) {
        throw new Error('Invalid template format');
      }
      
      const newTemplate: FormTemplate = {
        ...imported,
        id: Math.random().toString(36).substr(2, 9),
        createdBy: userId,
        createdAt: new Date(),
        isDefault: false,
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate.id;
    } catch (error) {
      console.error('Error importing template:', error);
      return null;
    }
  }, [setTemplates]);

  // Import multiple templates from JSON
  const importTemplates = useCallback((jsonString: string, userId: string): number => {
    try {
      const imported = JSON.parse(jsonString);
      if (!Array.isArray(imported)) {
        throw new Error('Expected array of templates');
      }
      
      let count = 0;
      imported.forEach((template: any) => {
        if (template.name && template.sections) {
          const newTemplate: FormTemplate = {
            ...template,
            id: Math.random().toString(36).substr(2, 9),
            createdBy: userId,
            createdAt: new Date(),
            isDefault: false,
          };
          setTemplates(prev => [...prev, newTemplate]);
          count++;
        }
      });
      
      return count;
    } catch (error) {
      console.error('Error importing templates:', error);
      return 0;
    }
  }, [setTemplates]);

  // Duplicate template
  const duplicateTemplate = useCallback((templateId: string, userId: string): string | null => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return null;
    
    const duplicated: FormTemplate = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
      name: `${template.name} (Kopio)`,
      createdBy: userId,
      createdAt: new Date(),
      isDefault: false,
    };
    
    setTemplates(prev => [...prev, duplicated]);
    return duplicated.id;
  }, [setTemplates]);

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    getTemplatesByCategory,
    canUserFillTemplate,
    exportTemplate,
    exportAllTemplates,
    importTemplate,
    importTemplates,
    duplicateTemplate,
  };
}

// Prescriptions hook
export function usePrescriptions() {
  const [prescriptions, setPrescriptions] = useLocalStorage<Prescription[]>('hus_prescriptions', []);

  const addPrescription = useCallback((prescription: Omit<Prescription, 'id' | 'prescribedAt'>) => {
    const newPrescription: Prescription = {
      ...prescription,
      id: Math.random().toString(36).substr(2, 9),
      prescribedAt: new Date(),
    };
    setPrescriptions(prev => [newPrescription, ...prev]);
    return newPrescription.id;
  }, [setPrescriptions]);

  const deletePrescription = useCallback((id: string) => {
    setPrescriptions(prev => prev.filter(p => p.id !== id));
  }, [setPrescriptions]);

  const getPrescriptionsByPatient = useCallback((patientName: string) => {
    return prescriptions.filter(p => p.patientName.toLowerCase() === patientName.toLowerCase());
  }, [prescriptions]);

  const searchPrescriptions = useCallback((query: string) => {
    const searchLower = query.toLowerCase();
    return prescriptions.filter(p =>
      p.patientName.toLowerCase().includes(searchLower) ||
      p.medication.toLowerCase().includes(searchLower) ||
      p.prescribedByName?.toLowerCase().includes(searchLower)
    );
  }, [prescriptions]);

  return {
    prescriptions,
    addPrescription,
    deletePrescription,
    getPrescriptionsByPatient,
    searchPrescriptions,
  };
}

// Notices/Instructions hook
export function useNotices() {
  const [notices, setNotices] = useLocalStorage<Notice[]>('hus_notices', []);

  const addNotice = useCallback((notice: Omit<Notice, 'id' | 'createdAt'>) => {
    const newNotice: Notice = {
      ...notice,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setNotices(prev => [newNotice, ...prev]);
    return newNotice.id;
  }, [setNotices]);

  const updateNotice = useCallback((id: string, updates: Partial<Notice>) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  }, [setNotices]);

  const deleteNotice = useCallback((id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  }, [setNotices]);

  const getActiveNotices = useCallback((userRole?: string) => {
    const now = new Date();
    return notices.filter(n => {
      if (n.expiresAt && new Date(n.expiresAt) < now) return false;
      if (userRole && n.visibleToRoles && n.visibleToRoles.length > 0) {
        return n.visibleToRoles.includes(userRole);
      }
      return true;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notices]);

  return {
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    getActiveNotices,
  };
}

// Shift status hook
export function useShiftStatus() {
  const [shiftStatuses, setShiftStatuses] = useLocalStorage<ShiftStatus[]>('hus_shiftstatus', []);

  const updateShiftStatus = useCallback((status: Omit<ShiftStatus, 'updatedAt'>) => {
    const newStatus: ShiftStatus = {
      ...status,
      updatedAt: new Date(),
    };
    setShiftStatuses(prev => {
      const existing = prev.find(s => s.userId === status.userId);
      if (existing) {
        return prev.map(s => s.userId === status.userId ? newStatus : s);
      }
      return [...prev, newStatus];
    });
  }, [setShiftStatuses]);

  const getOnDutyUsers = useCallback(() => {
    return shiftStatuses.filter(s => s.isOnDuty).sort((a, b) => 
      new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime()
    );
  }, [shiftStatuses]);

  const getUserStatus = useCallback((userId: string) => {
    return shiftStatuses.find(s => s.userId === userId);
  }, [shiftStatuses]);

  return {
    shiftStatuses,
    updateShiftStatus,
    getOnDutyUsers,
    getUserStatus,
  };
}

// Approval requests hook
export function useApprovalRequests() {
  const [requests, setRequests] = useLocalStorage<ApprovalRequest[]>('hus_approvals', []);

  const addRequest = useCallback((request: Omit<ApprovalRequest, 'id' | 'requestedAt'>) => {
    const newRequest: ApprovalRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      requestedAt: new Date(),
    };
    setRequests(prev => [newRequest, ...prev]);
    return newRequest.id;
  }, [setRequests]);

  const approveRequest = useCallback((id: string, approvedBy: string, visibleTo?: string[]) => {
    setRequests(prev => prev.map(r => 
      r.id === id ? { 
        ...r, 
        status: 'approved', 
        approvedBy, 
        approvedAt: new Date(),
        visibleTo 
      } : r
    ));
  }, [setRequests]);

  const rejectRequest = useCallback((id: string, reason?: string) => {
    setRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'rejected', reason } : r
    ));
  }, [setRequests]);

  const getPendingRequests = useCallback(() => {
    return requests.filter(r => r.status === 'pending');
  }, [requests]);

  const getRequestByFormId = useCallback((formId: string) => {
    return requests.find(r => r.formId === formId);
  }, [requests]);

  return {
    requests,
    addRequest,
    approveRequest,
    rejectRequest,
    getPendingRequests,
    getRequestByFormId,
  };
}

// Users hook (for JYL to manage users)
export function useUsers() {
  const [users, setUsers] = useLocalStorage<User[]>('hus_users', []);

  const addUser = useCallback((user: Omit<User, 'id'>, expiresIn?: { value: number; unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' }) => {
    let expiresAt: Date | undefined;
    
    if (expiresIn) {
      expiresAt = new Date();
      switch (expiresIn.unit) {
        case 'minutes':
          expiresAt.setMinutes(expiresAt.getMinutes() + expiresIn.value);
          break;
        case 'hours':
          expiresAt.setHours(expiresAt.getHours() + expiresIn.value);
          break;
        case 'days':
          expiresAt.setDate(expiresAt.getDate() + expiresIn.value);
          break;
        case 'weeks':
          expiresAt.setDate(expiresAt.getDate() + expiresIn.value * 7);
          break;
        case 'months':
          expiresAt.setMonth(expiresAt.getMonth() + expiresIn.value);
          break;
      }
    }

    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      expiresAt,
    };
    setUsers(prev => [...prev, newUser]);
    return newUser.id;
  }, [setUsers]);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updates } : user));
  }, [setUsers]);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  }, [setUsers]);

  const getActiveUsers = useCallback(() => {
    return users.filter(user => !user.expiresAt || new Date(user.expiresAt) > new Date());
  }, [users]);

  const getUserById = useCallback((id: string) => {
    return users.find(u => u.id === id);
  }, [users]);

  return {
    users,
    activeUsers: getActiveUsers(),
    addUser,
    updateUser,
    deleteUser,
    getUserById,
  };
}

// Page permissions hook - supports both roles and job titles
export function usePagePermissions() {
  const [permissions, setPermissions] = useLocalStorage<Record<string, { roles: string[]; jobTitles: string[] }>>('hus_page_permissions_v2', {
    tallennetut: { roles: ['all'], jobTitles: [] },
    uusi: { roles: ['all'], jobTitles: [] },
    arkistoidut: { roles: ['all'], jobTitles: [] },
    pohjat: { roles: ['JYL'], jobTitles: [] },
    muokkaa: { roles: ['JYL'], jobTitles: [] },
    reseptit: { roles: ['all'], jobTitles: [] },
    kayttajat: { roles: ['JYL'], jobTitles: [] },
    ohjeistukset: { roles: ['all'], jobTitles: [] },
    raportit: { roles: ['all'], jobTitles: [] },
    vuorot: { roles: ['all'], jobTitles: [] },
    potilaat: { roles: ['all'], jobTitles: [] },
    diagnoosit: { roles: ['LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'JYL'], jobTitles: [] },
    labra: { roles: ['LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'JYL'], jobTitles: [] },
    kuvantaminen: { roles: ['LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'JYL'], jobTitles: [] },
    lahetteet: { roles: ['LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'JYL'], jobTitles: [] },
    ajanvaraus: { roles: ['all'], jobTitles: [] },
    ryhmat: { roles: ['JYL'], jobTitles: [] },
    chat: { roles: ['all'], jobTitles: [] },
    muistiot: { roles: ['all'], jobTitles: [] },
    asetukset: { roles: ['JYL'], jobTitles: [] },
    lokit: { roles: ['JYL'], jobTitles: [] },
    potilasportaali: { roles: ['all'], jobTitles: [] },
  });

  const updatePermission = useCallback((page: string, roles: string[], jobTitles: string[]) => {
    setPermissions(prev => ({ ...prev, [page]: { roles, jobTitles } }));
  }, [setPermissions]);

  const canAccessPage = useCallback((page: string, userRole: string, userJobTitle: string | undefined, isJYL: boolean, isPatient: boolean) => {
    if (isJYL) return true;
    if (isPatient) return page === 'potilasportaali'; // Patients only see patient portal
    
    const perm = permissions[page];
    if (!perm) return true;
    
    // Check roles
    const roleAllowed = perm.roles.includes('all') || perm.roles.includes(userRole);
    
    // Check job titles (if any job titles are specified)
    const jobTitleAllowed = perm.jobTitles.length === 0 || 
      (userJobTitle && perm.jobTitles.includes(userJobTitle));
    
    // If both roles and job titles are specified, user must match at least one
    if (perm.roles.length > 0 && perm.jobTitles.length > 0) {
      return roleAllowed || jobTitleAllowed;
    }
    
    // Otherwise just check what's specified
    if (perm.jobTitles.length > 0) {
      return jobTitleAllowed;
    }
    
    return roleAllowed;
  }, [permissions]);

  const getPagesForJobTitle = useCallback((jobTitle: string) => {
    return Object.entries(permissions)
      .filter(([_, perm]) => perm.jobTitles.includes(jobTitle) || perm.jobTitles.length === 0)
      .map(([page, _]) => page);
  }, [permissions]);

  return {
    permissions,
    updatePermission,
    canAccessPage,
    getPagesForJobTitle,
  };
}

// Patient registry hook
export function usePatients() {
  const [patients, setPatients] = useLocalStorage<Patient[]>('hus_patients', []);

  const addPatient = useCallback((patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'age'>) => {
    const birthDate = new Date(patient.birthDate);
    const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    const newPatient: Patient = {
      ...patient,
      id: Math.random().toString(36).substr(2, 9),
      age,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPatients(prev => [...prev, newPatient]);
    return newPatient.id;
  }, [setPatients]);

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, ...updates, updatedAt: new Date() };
      if (updates.birthDate) {
        const birthDate = new Date(updates.birthDate);
        updated.age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      }
      return updated;
    }));
  }, [setPatients]);

  const deletePatient = useCallback((id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
  }, [setPatients]);

  const getPatientById = useCallback((id: string) => {
    return patients.find(p => p.id === id);
  }, [patients]);

  const searchPatients = useCallback((query: string) => {
    const searchLower = query.toLowerCase();
    return patients.filter(p =>
      p.firstName.toLowerCase().includes(searchLower) ||
      p.lastName.toLowerCase().includes(searchLower) ||
      (p.occupation?.toLowerCase().includes(searchLower) ?? false)
    );
  }, [patients]);

  const getActivePatients = useCallback(() => {
    return patients.filter(p => p.status === 'active');
  }, [patients]);

  return {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    searchPatients,
    getActivePatients,
  };
}

// HIERARCHICAL DIAGNOSIS SYSTEM
// Level 1: Categories (ICD-10 Chapters)
const DEFAULT_DIAGNOSIS_CATEGORIES: DiagnosisCategory[] = [
  { id: 'cat-a00-b99', code: 'A00-B99', name: 'Tiettyin tarttuvat ja loissairaudet', isActive: true },
  { id: 'cat-c00-d48', code: 'C00-D48', name: 'Kasvaimet', isActive: true },
  { id: 'cat-d50-d89', code: 'D50-D89', name: 'Veritaudit ja verenmuodostuselinten sekä immuunijärjestelmän häiriöt', isActive: true },
  { id: 'cat-e00-e90', code: 'E00-E90', name: 'Aineenvaihduntasairaudet ja ravitsemushäiriöt', isActive: true },
  { id: 'cat-f00-f99', code: 'F00-F99', name: 'Mielenterveyden ja käyttäytymisen häiriöt', isActive: true },
  { id: 'cat-g00-g99', code: 'G00-G99', name: 'Hermoston sairaudet', isActive: true },
  { id: 'cat-h00-h59', code: 'H00-H59', name: 'Silmän ja silmäluonnin sairaudet', isActive: true },
  { id: 'cat-h60-h95', code: 'H60-H95', name: 'Korvan ja nielurisan sairaudet', isActive: true },
  { id: 'cat-i00-i99', code: 'I00-I99', name: 'Sydän- ja verisuonitaudit', isActive: true },
  { id: 'cat-j00-j99', code: 'J00-J99', name: 'Hengityselinten sairaudet', isActive: true },
  { id: 'cat-k00-k93', code: 'K00-K93', name: 'Ruoansulatuselinten sairaudet', isActive: true },
  { id: 'cat-l00-l99', code: 'L00-L99', name: 'Ihon ja ihonalaiskudoksen sairaudet', isActive: true },
  { id: 'cat-m00-m99', code: 'M00-M99', name: 'Tuki- ja liikuntaelinten sairaudet', isActive: true },
  { id: 'cat-n00-n99', code: 'N00-N99', name: 'Virtsa- ja sukupuolielinten sairaudet', isActive: true },
  { id: 'cat-o00-o99', code: 'O00-O99', name: 'Raskaus, synnytys ja lapsivuodeaika', isActive: true },
  { id: 'cat-p00-p96', code: 'P00-P96', name: 'Tietyt perinataalikauden alkuperää olevat tilat', isActive: true },
  { id: 'cat-q00-q99', code: 'Q00-Q99', name: 'Epämuodostumat, deformiteetit ja kromosomipoikkeavuudet', isActive: true },
  { id: 'cat-r00-r99', code: 'R00-R99', name: 'Oireet, merkit ja poikkeavat kliiniset löydökset', isActive: true },
  { id: 'cat-s00-t98', code: 'S00-T98', name: 'Tapaturmat, myrkytykset ja muut ulkoiset syyt', isActive: true },
  { id: 'cat-v01-y98', code: 'V01-Y98', name: 'Kuoleman ja sairastavuuden ulkoiset syyt', isActive: true },
  { id: 'cat-z00-z99', code: 'Z00-Z99', name: 'Terveystilanteen ja terveyspalvelujen yhteyteen liittyvät tekijät', isActive: true },
];

// Level 2: Specific Diagnoses with ICD-10 codes
import type { SpecificDiagnosis } from '@/types';

const DEFAULT_SPECIFIC_DIAGNOSES: SpecificDiagnosis[] = [
  // SYDÄN- JA VERISUONITAUDIT (I00-I99)
  { id: 'diag-i10', categoryId: 'cat-i00-i99', icd10Code: 'I10', name: 'Essentiaalinen (primaarinen) hypertensio', description: 'Korkea verenpaine', commonSymptoms: ['Päänsärky', 'Huimaus', 'Rintakipu', 'Hengenahdistus'], typicalTreatments: ['ACE-estäjät', 'Beetasalpaajat', 'Kalsiumkanavan salpaajat', 'Diureetit'], isActive: true },
  { id: 'diag-i20', categoryId: 'cat-i00-i99', icd10Code: 'I20.9', name: 'Angina pectoris', description: 'Rintakipu sydänvaiva', commonSymptoms: ['Rintakipu', 'Hengenahdistus', 'Väsymys', 'Säteilykipu käsivarteen'], typicalTreatments: ['Nitroglyseriini', 'Beetasalpaajat', 'Statiinit', 'Asetyylisalisyylihappo'], isActive: true },
  { id: 'diag-i21', categoryId: 'cat-i00-i99', icd10Code: 'I21.9', name: 'Akuutti sydäninfarkti', description: 'Sydänkohtaus', commonSymptoms: ['Voimakas rintakipu', 'Hengenahdistus', 'Pahoinvointi', 'Hikoilu'], typicalTreatments: ['Hätäangiografia', 'Stenttaus', 'Trombolyysi', 'Intensiivinen lääkitys'], isActive: true },
  { id: 'diag-i25', categoryId: 'cat-i00-i99', icd10Code: 'I25.9', name: 'Krooninen iskeeminen sydänsairaus', description: 'Sepelvaltimotauti', commonSymptoms: ['Rintakipu rasituksessa', 'Hengenahdistus', 'Väsymys'], typicalTreatments: ['Statiinit', 'Beetasalpaajat', 'ACE-estäjät', 'Verenohennuslääkitys'], isActive: true },
  { id: 'diag-i48', categoryId: 'cat-i00-i99', icd10Code: 'I48.9', name: 'Eteisvärinä ja eteislepatus', description: 'Sydämen rytmihäiriö', commonSymptoms: ['Sydämentykytys', 'Huimaus', 'Hengenahdistus', 'Rintakipu'], typicalTreatments: ['Antikoagulantit (Warfariini, DOAC)', 'Rytmihäiriölääkitys', 'Sähköinen kardioversio'], isActive: true },
  { id: 'diag-i50', categoryId: 'cat-i00-i99', icd10Code: 'I50.9', name: 'Sydämen vajaatoiminta', description: 'Sydämen pumppauskyvyn heikkeneminen', commonSymptoms: ['Hengenahdistus', 'Väsymys', 'Jalkojen turvotus', 'Yskä'], typicalTreatments: ['ACE-estäjät', 'Beetasalpaajat', 'Diureetit', 'Sartanit'], isActive: true },
  { id: 'diag-i63', categoryId: 'cat-i00-i99', icd10Code: 'I63.9', name: 'Aivoinfarkti', description: 'Aivoverenkiertohäiriö', commonSymptoms: ['Toispuolinen heikkous', 'Puhehäiriö', 'Kasvohalvaus', 'Näköhäiriö'], typicalTreatments: ['Trombolyysi', 'Endovaskulaarinen hoito', 'Antikoagulantit', 'Kuntoutus'], isActive: true },
  { id: 'diag-i64', categoryId: 'cat-i00-i99', icd10Code: 'I64', name: 'Aivoverenkiertohäiriö (AVH)', description: 'Aivohalvaus', commonSymptoms: ['Äkillinen heikkous', 'Puhehäiriö', 'Tajunnan häiriö', 'Näköhäiriö'], typicalTreatments: ['Akuuttihoito', 'Kuntoutus', 'Riskitekijöiden hallinta'], isActive: true },
  { id: 'diag-i70', categoryId: 'cat-i00-i99', icd10Code: 'I70.2', name: 'Ateroskleroosi', description: 'Valtimonkovettumatauti', commonSymptoms: ['Kipu kävellessä', 'Haavaumat', 'Kylmät raajat'], typicalTreatments: ['Statiinit', 'Verenohennuslääkitys', 'Elintapamuutokset'], isActive: true },
  { id: 'diag-i80', categoryId: 'cat-i00-i99', icd10Code: 'I80.2', name: 'Laskimotukos (tromboosi)', description: 'Veritulppa laskimossa', commonSymptoms: ['Jalan turvotus', 'Kipu', 'Lämpötilan nousu', 'Punaisuus'], typicalTreatments: ['Antikoagulantit (DOAC, Warfariini)', 'Kompressiosukat'], isActive: true },
  
  // DIABETES (E10-E14)
  { id: 'diag-e10', categoryId: 'cat-e00-e90', icd10Code: 'E10.9', name: 'Insuliiniriippuvainen diabetes mellitus', description: 'Tyypin 1 diabetes', commonSymptoms: ['Jano', 'Tiheä virtsaaminen', 'Väsymys', 'Painonpudotus', 'Näön hämärtyminen'], typicalTreatments: ['Insuliinihoito', 'Verensokerinseuranta', 'Hiilihydraattien laskenta'], isActive: true },
  { id: 'diag-e11', categoryId: 'cat-e00-e90', icd10Code: 'E11.9', name: 'Insuliinista riippumaton diabetes mellitus', description: 'Tyypin 2 diabetes', commonSymptoms: ['Väsymys', 'Näön hämärtyminen', 'Haavojen hitaus parantua', 'Tuntonerotukset', 'Kutina'], typicalTreatments: ['Metformiini', 'SGLT2-estäjät', 'GLP-1-agonistit', 'Insuliini'], isActive: true },
  { id: 'diag-e13', categoryId: 'cat-e00-e90', icd10Code: 'E13.9', name: 'Muu diabetes mellitus', description: 'Toissijainen diabetes', commonSymptoms: ['Vaihtelevat oireet'], typicalTreatments: ['Perussairauden hoito', 'Insuliini'], isActive: true },
  
  // KILPIRAUHASSAIRAUDET (E00-E07)
  { id: 'diag-e03', categoryId: 'cat-e00-e90', icd10Code: 'E03.9', name: 'Kilpirauhasen vajaatoiminta', description: 'Hypotyreoosi', commonSymptoms: ['Väsymys', 'Painonnousu', 'Kylmyys', 'Kuiva iho', 'Ummetus', 'Masennus'], typicalTreatments: ['Levotyroksiini (kilpirauhashormoni)'], isActive: true },
  { id: 'diag-e05', categoryId: 'cat-e00-e90', icd10Code: 'E05.9', name: 'Kilpirauhasen liikatoiminta', description: 'Hypertyreoosi', commonSymptoms: ['Painonpudotus', 'Hermostuneisuus', 'Hikoilu', 'Sydämentykytys', 'Ripuli'], typicalTreatments: ['Tiamatsoli', 'Radiojodi', 'Kilpirauhasen poisto'], isActive: true },
  { id: 'diag-e06', categoryId: 'cat-e00-e90', icd10Code: 'E06.3', name: 'Autoimmuuni kilpirauhastulehdus', description: 'Hashimoton tauti', commonSymptoms: ['Väsymys', 'Paineentunne kurkussa', 'Kylmyys'], typicalTreatments: ['Levotyroksiini'], isActive: true },
  
  // HENGITYSELINTEN SAIRAUKSET (J00-J99)
  { id: 'diag-j06', categoryId: 'cat-j00-j99', icd10Code: 'J06.9', name: 'Ylähengitystieinfektio', description: 'Flunssa', commonSymptoms: ['Nuha', 'Kurkkukipu', 'Yskä', 'Kuume', 'Päänsärky'], typicalTreatments: ['Lepo', 'Nesteytys', 'Särkylääkkeet', 'Oireenmukainen hoito'], isActive: true },
  { id: 'diag-j18', categoryId: 'cat-j00-j99', icd10Code: 'J18.9', name: 'Keuhkokuume', description: 'Pneumonia', commonSymptoms: ['Kuume', 'Yskä', 'Hengenahdistus', 'Rintakipu', 'Väsymys'], typicalTreatments: ['Antibiootit', 'Lepo', 'Nesteytys'], isActive: true },
  { id: 'diag-j44', categoryId: 'cat-j00-j99', icd10Code: 'J44.9', name: 'Keuhkoahtaumatauti', description: 'COPD', commonSymptoms: ['Hengenahdistus', 'Yskä', 'Limaisuus', 'Rintakireys'], typicalTreatments: ['Bronkodilataattorit', 'Inhalaatiokortisoni', 'Happihoito'], isActive: true },
  { id: 'diag-j45', categoryId: 'cat-j00-j99', icd10Code: 'J45.9', name: 'Astma', description: 'Keuhkoastma', commonSymptoms: ['Yskä', 'Hengenahdistus', 'Rintakireys', 'Vinkuna', 'Yöyskä'], typicalTreatments: ['Inhalaatiokortisoni', 'Beeta-2-agonistit', 'Leukotrieeniantagonistit'], isActive: true },
  { id: 'diag-j84', categoryId: 'cat-j00-j99', icd10Code: 'J84.1', name: 'Keuhkojen sidekudossairaus', description: 'Pulmonaalifibroosi', commonSymptoms: ['Kuiva yskä', 'Hengenahdistus', 'Väsymys'], typicalTreatments: ['Pirfenidoni', 'Nintedaniibi', 'Happihoito'], isActive: true },
  
  // IHO-SAIRAUDET (L00-L99)
  { id: 'diag-l20', categoryId: 'cat-l00-l99', icd10Code: 'L20.9', name: 'Atooppinen ihottuma', description: 'Ekseema', commonSymptoms: ['Kutina', 'Ihon kuivuus', 'Punaisuus', 'Halkeamat'], typicalTreatments: ['Kortisonivoiteet', 'Kosteuttajat', 'Antihistamiinit'], isActive: true },
  { id: 'diag-l23', categoryId: 'cat-l00-l99', icd10Code: 'L23.9', name: 'Allerginen kosketusihottuma', description: 'Allerginen reaktio', commonSymptoms: ['Kutina', 'Punaisuus', 'Rakkulat', 'Turvotus'], typicalTreatments: ['Vältä allergeenia', 'Kortisonivoiteet', 'Antihistamiinit'], isActive: true },
  { id: 'diag-l40', categoryId: 'cat-l00-l99', icd10Code: 'L40.9', name: 'Psoriaasi', description: 'Ihosairaus', commonSymptoms: ['Paksut hilseilevät läiskät', 'Kutina', 'Ihon kuivuus'], typicalTreatments: ['Paikallishoito (D-vitamiini, kortisoni)', 'Valohoito', 'Biologiset lääkkeet'], isActive: true },
  { id: 'diag-l50', categoryId: 'cat-l00-l99', icd10Code: 'L50.9', name: 'Nokkosihottuma', description: 'Urtikaria', commonSymptoms: ['Kutina', 'Koholla olevat punaiset läiskät', 'Turvotus'], typicalTreatments: ['Antihistamiinit', 'Kortisoni (vaikeissa tapauksissa)'], isActive: true },
  { id: 'diag-l70', categoryId: 'cat-l00-l99', icd10Code: 'L70.9', name: 'Akne', description: 'Finnit', commonSymptoms: ['Mustapäät', 'Märkäpäät', 'Tulehtuneet finnit'], typicalTreatments: ['Retinoidit', 'Bentsyyliperoksidi', 'Antibiootit'], isActive: true },
  
  // MIELENTERVEYS (F00-F99)
  { id: 'diag-f32', categoryId: 'cat-f00-f99', icd10Code: 'F32.9', name: 'Masennusjakso', description: 'Masennus', commonSymptoms: ['Alakuloisuus', 'Unihäiriöt', 'Väsymys', 'Mielenkiinnon puute', 'Ruokahalun muutokset'], typicalTreatments: ['Psykoterapia', 'Antidepressantit (SSRI, SNRI)', 'Liikunta'], isActive: true },
  { id: 'diag-f33', categoryId: 'cat-f00-f99', icd10Code: 'F33.9', name: 'Toistuva masennus', description: 'Krooninen masennus', commonSymptoms: ['Toistuvat masennusjaksot', 'Väsymys', 'Unihäiriöt'], typicalTreatments: ['Pitkäaikainen lääkitys', 'Psykoterapia', 'Elintapamuutokset'], isActive: true },
  { id: 'diag-f41', categoryId: 'cat-f00-f99', icd10Code: 'F41.9', name: 'Ahdistuneisuushäiriö', description: 'Ahdistus', commonSymptoms: ['Huolestuneisuus', 'Hermostuneisuus', 'Unihäiriöt', 'Sydämentykytys', 'Hikoilu'], typicalTreatments: ['Terapia (KVT)', 'Ahdistuslääkkeet (bentsodiatsepiinit)', 'SSRI-lääkkeet'], isActive: true },
  { id: 'diag-f43', categoryId: 'cat-f00-f99', icd10Code: 'F43.9', name: 'Reaktio vaikeaan stressiin', description: 'Stressi', commonSymptoms: ['Väsymys', 'Keskittymisvaikeudet', 'Unihäiriöt', 'Ärtyneisyys'], typicalTreatments: ['Terapia', 'Stressinhallinta', 'Mindfulness', 'Liikunta'], isActive: true },
  { id: 'diag-f84', categoryId: 'cat-f00-f99', icd10Code: 'F84.0', name: 'Autismi', description: 'Autismikirjon häiriö', commonSymptoms: ['Sosiaaliset vaikeudet', 'Toistuvat käyttäytymismallit', 'Aistiyliherkkyys'], typicalTreatments: ['Kuntoutus', 'Terapia', 'Tukipalvelut'], isActive: true },
  { id: 'diag-f90', categoryId: 'cat-f00-f99', icd10Code: 'F90.0', name: 'Tarkkaavaisuus- ja ylivilkkaushäiriö', description: 'ADHD', commonSymptoms: ['Keskittymisvaikeudet', 'Ylivilkkaus', 'Impulsiivisuus'], typicalTreatments: ['Stimulantit (metyylifenidaatti)', 'Terapia', 'Käyttäytymishoito'], isActive: true },
  
  // HERMOSTON SAIRAUDET (G00-G99)
  { id: 'diag-g20', categoryId: 'cat-g00-g99', icd10Code: 'G20', name: 'Parkinsonin tauti', description: 'Parkinsonismi', commonSymptoms: ['Vapina', 'Jäykkyys', 'Hidastuneet liikkeet', 'Asennonvaihtelut'], typicalTreatments: ['Levodopa', 'Dopamiiniagonistit', 'MAO-B-estäjät'], isActive: true },
  { id: 'diag-g35', categoryId: 'cat-g00-g99', icd10Code: 'G35', name: 'Multippeliskleroosi', description: 'MS-tauti', commonSymptoms: ['Näön hämärtyminen', 'Puutuminen', 'Heikkous', 'Tasapainovaikeudet'], typicalTreatments: ['Immunomoduloivat lääkkeet', 'Kortisoni (pahenemisvaiheissa)'], isActive: true },
  { id: 'diag-g43', categoryId: 'cat-g00-g99', icd10Code: 'G43.9', name: 'Migreeni', description: 'Päänsärky', commonSymptoms: ['Pulsivoiva päänsärky', 'Pahoinvointi', 'Valonarkuus', 'Ääniyliherkkyys'], typicalTreatments: ['Triptaanit', 'Kipulääkkeet', 'Ehkäisevä lääkitys'], isActive: true },
  { id: 'diag-g44', categoryId: 'cat-g00-g99', icd10Code: 'G44.2', name: 'Jännityspäänsärky', description: 'Stressipäänsärky', commonSymptoms: ['Puristava päänsärky', 'Pään paine', 'Niskajännitys'], typicalTreatments: ['Kipulääkkeet', 'Rentoutusharjoitukset', 'Fysioterapia'], isActive: true },
  { id: 'diag-g56', categoryId: 'cat-g00-g99', icd10Code: 'G56.0', name: 'Niskan hermojuuren oireyhtymä', description: 'Cervicobrachialgia', commonSymptoms: ['Niskakipu', 'Käsikipu', 'Puutuminen', 'Heikkus'], typicalTreatments: ['Kipulääkkeet', 'Fysioterapia', 'Kortisonipistokset'], isActive: true },
  { id: 'diag-g62', categoryId: 'cat-g00-g99', icd10Code: 'G62.9', name: 'Polyneuropatia', description: 'Hermovaurio', commonSymptoms: ['Puutuminen', 'Polttelu', 'Kipu', 'Heikkous raajoissa'], typicalTreatments: ['Kipulääkkeet', 'Gabapentiini', 'Pregabaliini'], isActive: true },
  
  // TUKI- JA LIIKUNTAELIMET (M00-M99)
  { id: 'diag-m16', categoryId: 'cat-m00-m99', icd10Code: 'M16.9', name: 'Lonkan nivelrikko', description: 'Coxarthrosis', commonSymptoms: ['Lonkkakipu', 'Jäykkyys', 'Liikkuvuuden väheneminen', 'Ontuminen'], typicalTreatments: ['Kipulääkkeet (parasetamoli, tulehduskipulääkkeet)', 'Fysioterapia', 'Lonkkaleikkaus'], isActive: true },
  { id: 'diag-m17', categoryId: 'cat-m00-m99', icd10Code: 'M17.9', name: 'Polven nivelrikko', description: 'Gonarthrosis', commonSymptoms: ['Polvikipu', 'Turvotus', 'Jäykkyys', 'Narina'], typicalTreatments: ['Kipulääkkeet', 'Fysioterapia', 'Polvileikkaus'], isActive: true },
  { id: 'diag-m23', categoryId: 'cat-m00-m99', icd10Code: 'M23.9', name: 'Polven sisäinen häiriö', description: 'Polvivamma', commonSymptoms: ['Polvikipu', 'Turvotus', 'Epävakaus', 'Lukkiutuminen'], typicalTreatments: ['Fysioterapia', 'Niveltähystys', 'Leikkaus'], isActive: true },
  { id: 'diag-m54', categoryId: 'cat-m00-m99', icd10Code: 'M54.9', name: 'Selkäkipu', description: 'Dorsalgia', commonSymptoms: ['Selkäkipu', 'Liikkuvuuden rajoitus', 'Säteilykipu'], typicalTreatments: ['Kipulääkkeet', 'Fysioterapia', 'Liikunta'], isActive: true },
  { id: 'diag-m54.5', categoryId: 'cat-m00-m99', icd10Code: 'M54.5', name: 'Alaselkäkipu', description: 'Lumbago', commonSymptoms: ['Alaselän kipu', 'Liikkuvuuden rajoitus', 'Säteilykipu jalkaan'], typicalTreatments: ['Kipulääkkeet', 'Fysioterapia', 'Liikunta', 'Lämpö'], isActive: true },
  { id: 'diag-m75', categoryId: 'cat-m00-m99', icd10Code: 'M75.1', name: 'Kiertäjäkalvosinoireyhtymä', description: 'Olkanivelen kipu', commonSymptoms: ['Olkanivelen kipu', 'Liikkuvuuden rajoitus', 'Yökivut'], typicalTreatments: ['Kipulääkkeet', 'Fysioterapia', 'Kortisonipistokset', 'Leikkaus'], isActive: true },
  { id: 'diag-m79', categoryId: 'cat-m00-m99', icd10Code: 'M79.7', name: 'Fibromyalgia', description: 'Krooninen kipuoireyhtymä', commonSymptoms: ['Yleistynyt kipu', 'Väsymys', 'Unihäiriöt', 'Muistivaikeudet'], typicalTreatments: ['Liikunta', 'Kipulääkkeet', 'Antidepressantit', 'Fysioterapia'], isActive: true },
  
  // VERITAUDIT (D50-D89)
  { id: 'diag-d50', categoryId: 'cat-d50-d89', icd10Code: 'D50.9', name: 'Rautapuutosanemia', description: 'Anemia', commonSymptoms: ['Väsymys', 'Kalpeus', 'Hengenahdistus', 'Huimaus', 'Hiustenlähtö'], typicalTreatments: ['Rautalisä', 'Rautaruiske'], isActive: true },
  { id: 'diag-d64', categoryId: 'cat-d50-d89', icd10Code: 'D64.9', name: 'Muu anemia', description: 'Anemia', commonSymptoms: ['Väsymys', 'Kalpeus', 'Hengenahdistus'], typicalTreatments: ['Hoidetaan perussairaus', 'Verensiirto (tarvittaessa)'], isActive: true },
  { id: 'diag-d69', categoryId: 'cat-d50-d89', icd10Code: 'D69.3', name: 'Idiopaattinen trombosytopeeninen purppura', description: 'ITP', commonSymptoms: ['Mustelmat', 'Vuototaipumus', 'Pistekuivat'], typicalTreatments: ['Kortisoni', 'Immunoglobuliini', 'Splenektomia'], isActive: true },
  
  // RUOANSULATUS (K00-K93)
  { id: 'diag-k21', categoryId: 'cat-k00-k93', icd10Code: 'K21.9', name: 'Refluksitauti', description: 'GERD', commonSymptoms: ['Närästys', 'Happaman maun nouseminen', 'Rintakipu', 'Yskä'], typicalTreatments: ['PPI-lääkkeet', 'H2-salpaajat', 'Elintapamuutokset'], isActive: true },
  { id: 'diag-k29', categoryId: 'cat-k00-k93', icd10Code: 'K29.7', name: 'Mahatulehdus', description: 'Gastriitti', commonSymptoms: ['Vatsakipu', 'Pahoinvointi', 'Ruokahaluttomuus'], typicalTreatments: ['PPI-lääkkeet', 'Helicobacter-hoito'], isActive: true },
  { id: 'diag-k50', categoryId: 'cat-k00-k93', icd10Code: 'K50.9', name: 'Crohnin tauti', description: 'IBD', commonSymptoms: ['Vatsakipu', 'Ripuli', 'Painonpudotus', 'Väsymys'], typicalTreatments: ['Kortisoni', 'Immunomodulaattorit', 'Biologiset lääkkeet'], isActive: true },
  { id: 'diag-k51', categoryId: 'cat-k00-k93', icd10Code: 'K51.9', name: 'Haavainen paksusuolentulehdus', description: 'Koliitti', commonSymptoms: ['Ripuli verellä', 'Vatsakipu', 'Kiireellisyyden tunne'], typicalTreatments: ['Mesalatsiini', 'Kortisoni', 'Biologiset lääkkeet'], isActive: true },
  { id: 'diag-k59', categoryId: 'cat-k00-k93', icd10Code: 'K59.0', name: 'Ummetus', description: 'Constipatio', commonSymptoms: ['Harvat ulosteet', 'Kova vatsa', 'Paineentunne'], typicalTreatments: ['Kuitu', 'Nesteytys', 'Ulostuslääkkeet'], isActive: true },
  { id: 'diag-k80', categoryId: 'cat-k00-k93', icd10Code: 'K80.2', name: 'Sappikivitauti', description: 'Kolelitiaasi', commonSymptoms: ['Oikean ylävatsan kipu', 'Pahoinvointi', 'Ruokahaluttomuus'], typicalTreatments: ['Kipulääkkeet', 'Sappirakon poisto'], isActive: true },
  
  // VIRTSA- JA SUKUPUOLIELIMET (N00-N99)
  { id: 'diag-n18', categoryId: 'cat-n00-n99', icd10Code: 'N18.9', name: 'Krooninen munuaissairaus', description: 'CKD', commonSymptoms: ['Väsymys', 'Turvotus', 'Verenpaineen nousu', 'Virtsaamismuutokset'], typicalTreatments: ['Verenpaineen hoito', 'ACE-estäjät', 'Dialyysi', 'Munuaisensiirto'], isActive: true },
  { id: 'diag-n20', categoryId: 'cat-n00-n99', icd10Code: 'N20.0', name: 'Munuaiskivitauti', description: 'Nefrolitiaasi', commonSymptoms: ['Kova selkäkipu', 'Veri virtsassa', 'Pahoinvointi'], typicalTreatments: ['Kipulääkkeet', 'Murskaus', 'Kiven poisto'], isActive: true },
  { id: 'diag-n30', categoryId: 'cat-n00-n99', icd10Code: 'N30.0', name: 'Virtsarakon tulehdus', description: 'Kystiitti', commonSymptoms: ['Tiheä virtsaaminen', 'Kirvely virtsatessa', 'Alavatsakipu'], typicalTreatments: ['Antibiootit', 'Nesteytys'], isActive: true },
  { id: 'diag-n39', categoryId: 'cat-n00-n99', icd10Code: 'N39.0', name: 'Virtsankarkailu', description: 'Inkontinenssi', commonSymptoms: ['Vuotavat virtsa', 'Kiireellisyyden tunne'], typicalTreatments: ['Lantionpohjan harjoitukset', 'Lääkitys', 'Leikkaus'], isActive: true },
  { id: 'diag-n80', categoryId: 'cat-n00-n99', icd10Code: 'N80.9', name: 'Endometrioosi', description: 'Kohdun limakalvon kasvu', commonSymptoms: ['Kuukautiskivut', 'Alavatsakipu', 'Hedelmättömyys'], typicalTreatments: ['Ehkäisypillerit', 'Kipulääkkeet', 'Leikkaus'], isActive: true },
  { id: 'diag-n85', categoryId: 'cat-n00-n99', icd10Code: 'N85.0', name: 'Kohdun limakalvon liikakasvu', description: 'Hyperplasia', commonSymptoms: ['Epäsäännölliset vuodot', 'Runsas vuoto'], typicalTreatments: ['Hormonihoito', 'Kaavinta'], isActive: true },
  
  // INFEKTIOT (A00-B99)
  { id: 'diag-a09', categoryId: 'cat-a00-b99', icd10Code: 'A09.9', name: 'Ripuli ja oksentelu', description: 'Gastroenteriitti', commonSymptoms: ['Ripuli', 'Oksentelu', 'Vatsakipu', 'Kuume'], typicalTreatments: ['Nesteytys', 'Lepo', 'Antibiootit (tarvittaessa)'], isActive: true },
  { id: 'diag-b34', categoryId: 'cat-a00-b99', icd10Code: 'B34.9', name: 'Virusinfektio', description: 'Viral infection', commonSymptoms: ['Kuume', 'Yskä', 'Väsymys', 'Kurkkukipu'], typicalTreatments: ['Oireenmukainen hoito', 'Lepo', 'Nesteytys'], isActive: true },
  { id: 'diag-b35', categoryId: 'cat-a00-b99', icd10Code: 'B35.9', name: 'Dermatofyytti', description: 'Sieni-infektio iholla', commonSymptoms: ['Kutina', 'Punaiset läiskät', 'Hilseily'], typicalTreatments: ['Paikalliset sienilääkkeet', 'Suun kautta sienilääkkeet'], isActive: true },
  
  // KASVAIMET (C00-D48)
  { id: 'diag-c78', categoryId: 'cat-c00-d48', icd10Code: 'C78.0', name: 'Keuhkojen sekundaarinen kasvain', description: 'Metastaasi keuhkoissa', commonSymptoms: ['Hengenahdistus', 'Yskä', 'Väsymys'], typicalTreatments: ['Sädehoito', 'Kemoterapia', 'Kohdennettu hoito'], isActive: true },
  { id: 'diag-c79', categoryId: 'cat-c00-d48', icd10Code: 'C79.9', name: 'Toissijainen kasvain', description: 'Metastaasi', commonSymptoms: ['Vaihtelevat oireet'], typicalTreatments: ['Kemoterapia', 'Sädehoito', 'Immunoterapia'], isActive: true },
  { id: 'diag-d48', categoryId: 'cat-c00-d48', icd10Code: 'D48.9', name: 'Neoplasmalle paikkaa osoittamaton', description: 'Kasvain', commonSymptoms: ['Vaihtelevat oireet'], typicalTreatments: ['Biopsia', 'Staging', 'Hoitosuunnitelma'], isActive: true },
  
  // OIREET (R00-R99)
  { id: 'diag-r50', categoryId: 'cat-r00-r99', icd10Code: 'R50.9', name: 'Kuume', description: 'Hypertermia', commonSymptoms: ['Lämpötilan nousu', 'Vilunväreet', 'Väsymys'], typicalTreatments: ['Särkylääkkeet', 'Nesteytys', 'Perussairauden hoito'], isActive: true },
  { id: 'diag-r51', categoryId: 'cat-r00-r99', icd10Code: 'R51', name: 'Päänsärky', description: 'Kefalgia', commonSymptoms: ['Päänsärky', 'Paineentunne'], typicalTreatments: ['Kipulääkkeet', 'Lepo'], isActive: true },
  { id: 'diag-r55', categoryId: 'cat-r00-r99', icd10Code: 'R55', name: 'Pyörtyminen', description: 'Synkopee', commonSymptoms: ['Tajunnan menetys', 'Huimaus', 'Heikkous'], typicalTreatments: ['Perussairauden hoito', 'Nesteytys'], isActive: true },
  { id: 'diag-r60', categoryId: 'cat-r00-r99', icd10Code: 'R60.0', name: 'Paikallinen turvotus', description: 'Edema', commonSymptoms: ['Turvotus', 'Painonnousu'], typicalTreatments: ['Diureetit', 'Kohonnut raaja'], isActive: true },
  { id: 'diag-r80', categoryId: 'cat-r00-r99', icd10Code: 'R80', name: 'Proteinuria', description: 'Valkuaisuus virtsassa', commonSymptoms: ['Vaahtoava virtsa'], typicalTreatments: ['Perussairauden hoito'], isActive: true },
];

// Diagnoses hook with hierarchical system
export function useDiagnoses() {
  const [diagnoses, setDiagnoses] = useLocalStorage<Diagnosis[]>('hus_diagnoses', []);
  const [categories, setCategories] = useLocalStorage<DiagnosisCategory[]>('hus_diagnosis_categories', DEFAULT_DIAGNOSIS_CATEGORIES);
  const [specificDiagnoses, setSpecificDiagnoses] = useLocalStorage<SpecificDiagnosis[]>('hus_specific_diagnoses', DEFAULT_SPECIFIC_DIAGNOSES);

  const addDiagnosis = useCallback((diagnosis: Omit<Diagnosis, 'id' | 'diagnosedAt'>) => {
    const newDiagnosis: Diagnosis = {
      ...diagnosis,
      id: Math.random().toString(36).substr(2, 9),
      diagnosedAt: new Date(),
    };
    setDiagnoses(prev => [newDiagnosis, ...prev]);
    return newDiagnosis.id;
  }, [setDiagnoses]);

  const deleteDiagnosis = useCallback((id: string) => {
    setDiagnoses(prev => prev.filter(d => d.id !== id));
  }, [setDiagnoses]);

  const getDiagnosesByPatient = useCallback((patientId: string) => {
    return diagnoses.filter(d => d.patientId === patientId).sort((a, b) => 
      new Date(b.diagnosedAt).getTime() - new Date(a.diagnosedAt).getTime()
    );
  }, [diagnoses]);

  const getPrimaryDiagnosis = useCallback((patientId: string) => {
    return diagnoses.find(d => d.patientId === patientId && d.isPrimary);
  }, [diagnoses]);

  // Category management
  const addCategory = useCallback((category: Omit<DiagnosisCategory, 'id'>) => {
    const newCategory: DiagnosisCategory = {
      ...category,
      id: Math.random().toString(36).substr(2, 9),
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory.id;
  }, [setCategories]);

  const updateCategory = useCallback((id: string, updates: Partial<DiagnosisCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setCategories]);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, [setCategories]);

  const getCategoryById = useCallback((id: string) => {
    return categories.find(c => c.id === id);
  }, [categories]);

  const searchCategories = useCallback((query: string) => {
    const searchLower = query.toLowerCase();
    return categories.filter(c =>
      c.name.toLowerCase().includes(searchLower) ||
      c.code.toLowerCase().includes(searchLower) ||
      c.description?.toLowerCase().includes(searchLower)
    );
  }, [categories]);

  // Specific diagnosis management
  const getSpecificDiagnosesByCategory = useCallback((categoryId: string) => {
    return specificDiagnoses.filter(d => d.categoryId === categoryId && d.isActive);
  }, [specificDiagnoses]);

  const getSpecificDiagnosisById = useCallback((id: string) => {
    return specificDiagnoses.find(d => d.id === id);
  }, [specificDiagnoses]);

  const searchSpecificDiagnoses = useCallback((query: string) => {
    const searchLower = query.toLowerCase();
    return specificDiagnoses.filter(d =>
      d.name.toLowerCase().includes(searchLower) ||
      d.icd10Code.toLowerCase().includes(searchLower) ||
      d.description?.toLowerCase().includes(searchLower)
    );
  }, [specificDiagnoses]);

  const addSpecificDiagnosis = useCallback((diagnosis: Omit<SpecificDiagnosis, 'id'>) => {
    const newDiagnosis: SpecificDiagnosis = {
      ...diagnosis,
      id: Math.random().toString(36).substr(2, 9),
    };
    setSpecificDiagnoses(prev => [...prev, newDiagnosis]);
    return newDiagnosis.id;
  }, [setSpecificDiagnoses]);

  return {
    diagnoses,
    categories,
    specificDiagnoses,
    addDiagnosis,
    deleteDiagnosis,
    getDiagnosesByPatient,
    getPrimaryDiagnosis,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    searchCategories,
    getSpecificDiagnosesByCategory,
    getSpecificDiagnosisById,
    searchSpecificDiagnoses,
    addSpecificDiagnosis,
  };
}

// Treatments hook
export function useTreatments() {
  const [treatments, setTreatments] = useLocalStorage<Treatment[]>('hus_treatments', []);

  const addTreatment = useCallback((treatment: Omit<Treatment, 'id' | 'performedAt'>) => {
    const newTreatment: Treatment = {
      ...treatment,
      id: Math.random().toString(36).substr(2, 9),
      performedAt: new Date(),
    };
    setTreatments(prev => [newTreatment, ...prev]);
    return newTreatment.id;
  }, [setTreatments]);

  const deleteTreatment = useCallback((id: string) => {
    setTreatments(prev => prev.filter(t => t.id !== id));
  }, [setTreatments]);

  const getTreatmentsByPatient = useCallback((patientId: string) => {
    return treatments.filter(t => t.patientId === patientId).sort((a, b) => 
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    );
  }, [treatments]);

  return {
    treatments,
    addTreatment,
    deleteTreatment,
    getTreatmentsByPatient,
  };
}

// Examinations hook
export function useExaminations() {
  const [examinations, setExaminations] = useLocalStorage<Examination[]>('hus_examinations', []);

  const addExamination = useCallback((examination: Omit<Examination, 'id' | 'performedAt'>) => {
    const newExamination: Examination = {
      ...examination,
      id: Math.random().toString(36).substr(2, 9),
      performedAt: new Date(),
    };
    setExaminations(prev => [newExamination, ...prev]);
    return newExamination.id;
  }, [setExaminations]);

  const deleteExamination = useCallback((id: string) => {
    setExaminations(prev => prev.filter(e => e.id !== id));
  }, [setExaminations]);

  const getExaminationsByPatient = useCallback((patientId: string) => {
    return examinations.filter(e => e.patientId === patientId).sort((a, b) => 
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    );
  }, [examinations]);

  return {
    examinations,
    addExamination,
    deleteExamination,
    getExaminationsByPatient,
  };
}

// Lab values hook
export function useLabValues() {
  const [labValues, setLabValues] = useLocalStorage<LabValue[]>('hus_labvalues', []);

  const addLabValue = useCallback((labValue: Omit<LabValue, 'id'>) => {
    const newLabValue: LabValue = {
      ...labValue,
      id: Math.random().toString(36).substr(2, 9),
    };
    setLabValues(prev => [newLabValue, ...prev]);
    return newLabValue.id;
  }, [setLabValues]);

  const deleteLabValue = useCallback((id: string) => {
    setLabValues(prev => prev.filter(l => l.id !== id));
  }, [setLabValues]);

  const getLabValuesByPatient = useCallback((patientId: string) => {
    return labValues.filter(l => l.patientId === patientId).sort((a, b) => 
      new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
    );
  }, [labValues]);

  return {
    labValues,
    addLabValue,
    deleteLabValue,
    getLabValuesByPatient,
  };
}

// Diseases hook
export function useDiseases() {
  const [diseases, setDiseases] = useLocalStorage<Disease[]>('hus_diseases', []);

  const addDisease = useCallback((disease: Omit<Disease, 'id'>) => {
    const newDisease: Disease = {
      ...disease,
      id: Math.random().toString(36).substr(2, 9),
    };
    setDiseases(prev => [newDisease, ...prev]);
    return newDisease.id;
  }, [setDiseases]);

  const updateDisease = useCallback((id: string, updates: Partial<Disease>) => {
    setDiseases(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, [setDiseases]);

  const deleteDisease = useCallback((id: string) => {
    setDiseases(prev => prev.filter(d => d.id !== id));
  }, [setDiseases]);

  const getDiseasesByPatient = useCallback((patientId: string) => {
    return diseases.filter(d => d.patientId === patientId);
  }, [diseases]);

  const getActiveDiseases = useCallback((patientId: string) => {
    return diseases.filter(d => d.patientId === patientId && d.isActive);
  }, [diseases]);

  return {
    diseases,
    addDisease,
    updateDisease,
    deleteDisease,
    getDiseasesByPatient,
    getActiveDiseases,
  };
}

// Audit log hook
export function useAuditLogs() {
  const [logs, setLogs] = useLocalStorage<AuditLog[]>('hus_auditlogs', []);

  const addLog = useCallback((log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 10000)); // Keep last 10000 logs
    return newLog.id;
  }, [setLogs]);

  const getLogsByUser = useCallback((userId: string) => {
    return logs.filter(l => l.userId === userId);
  }, [logs]);

  const getLogsByAction = useCallback((action: string) => {
    return logs.filter(l => l.action === action);
  }, [logs]);

  const getLogsByDateRange = useCallback((start: Date, end: Date) => {
    return logs.filter(l => {
      const ts = new Date(l.timestamp);
      return ts >= start && ts <= end;
    });
  }, [logs]);

  const searchLogs = useCallback((query: string) => {
    const searchLower = query.toLowerCase();
    return logs.filter(l =>
      l.userName.toLowerCase().includes(searchLower) ||
      l.action.toLowerCase().includes(searchLower) ||
      (l.targetName?.toLowerCase().includes(searchLower) ?? false) ||
      (l.details?.toLowerCase().includes(searchLower) ?? false)
    );
  }, [logs]);

  const clearOldLogs = useCallback((daysToKeep: number) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    setLogs(prev => prev.filter(l => new Date(l.timestamp) > cutoff));
  }, [setLogs]);

  return {
    logs,
    addLog,
    getLogsByUser,
    getLogsByAction,
    getLogsByDateRange,
    searchLogs,
    clearOldLogs,
  };
}

// Notifications hook
export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('hus_notifications', []);

  const sendNotification = useCallback((notification: Omit<Notification, 'id' | 'sentAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      sentAt: new Date(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification.id;
  }, [setNotifications]);

  const markAsRead = useCallback((id: string, userId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { 
        ...n, 
        isRead: true,
        readBy: [...(n.readBy || []), userId]
      } : n
    ));
  }, [setNotifications]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, [setNotifications]);

  const getNotificationsForUser = useCallback((userId: string, userRole: string, jobTitleId?: string) => {
    const now = new Date();
    return notifications.filter(n => {
      if (n.expiresAt && new Date(n.expiresAt) < now) return false;
      if (n.targetUsers?.includes(userId)) return true;
      if (n.targetRoles?.includes(userRole)) return true;
      if (jobTitleId && n.targetJobTitles?.includes(jobTitleId)) return true;
      return !n.targetUsers && !n.targetRoles && !n.targetJobTitles;
    }).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, [notifications]);

  const getUnreadCount = useCallback((userId: string, userRole: string, jobTitleId?: string) => {
    return getNotificationsForUser(userId, userRole, jobTitleId).filter(n => 
      !(n.readBy?.includes(userId))
    ).length;
  }, [getNotificationsForUser]);

  return {
    notifications,
    sendNotification,
    markAsRead,
    deleteNotification,
    getNotificationsForUser,
    getUnreadCount,
  };
}

// Chat hook
export function useChat() {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('hus_chat', []);

  const sendMessage = useCallback((message: Omit<ChatMessage, 'id' | 'sentAt' | 'isEdited'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      sentAt: new Date(),
      isEdited: false,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, [setMessages]);

  const editMessage = useCallback((id: string, newContent: string) => {
    setMessages(prev => prev.map(m => 
      m.id === id ? { ...m, content: newContent, isEdited: true, editedAt: new Date() } : m
    ));
  }, [setMessages]);

  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, [setMessages]);

  const getRecentMessages = useCallback((count: number = 50) => {
    return messages.slice(-count);
  }, [messages]);

  return {
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    getRecentMessages,
  };
}

// Shared notes hook
export function useSharedNotes() {
  const [notes, setNotes] = useLocalStorage<SharedNote[]>('hus_sharednotes', []);

  const addNote = useCallback((note: Omit<SharedNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: SharedNote = {
      ...note,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote.id;
  }, [setNotes]);

  const updateNote = useCallback((id: string, updates: Partial<SharedNote>, updatedBy: string, updatedByName: string) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { 
        ...n, 
        ...updates, 
        updatedAt: new Date(),
        updatedBy,
        updatedByName
      } : n
    ));
  }, [setNotes]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, [setNotes]);

  const getVisibleNotes = useCallback((userRole: string, isJYL: boolean) => {
    if (isJYL) return notes;
    return notes.filter(n => 
      !n.visibleToRoles || n.visibleToRoles.length === 0 || n.visibleToRoles.includes(userRole)
    );
  }, [notes]);

  const getPinnedNotes = useCallback((userRole: string, isJYL: boolean) => {
    return getVisibleNotes(userRole, isJYL).filter(n => n.isPinned);
  }, [getVisibleNotes]);

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    getVisibleNotes,
    getPinnedNotes,
  };
}

// Settings hook
export function useSettings() {
  const [settings, setSettings] = useLocalStorage<SystemSettings>('hus_settings', {
    appearance: {
      primaryColor: '#0066b3',
    },
    features: {
      enableChat: true,
      enableNotifications: true,
      enableAuditLog: true,
      enablePatientRegistry: true,
      enablePrescriptions: true,
      enableShiftTracking: true,
      enableConfidentialMode: true,
    },
    permissions: {
      whoCanViewPatients: ['all'],
      whoCanCreatePatients: ['LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'JYL'],
      whoCanEditPatients: ['LÄÄKÄRI', 'ERIKOISLÄÄKÄRI', 'JYL'],
      whoCanDeletePatients: ['JYL'],
      whoCanViewLogs: ['JYL'],
      whoCanExportPdf: ['all'],
      whoCanSendNotifications: ['JYL', 'ERIKOISLÄÄKÄRI'],
    },
    security: {
      requirePasswordForPdf: false,
      requireReasonForPdf: true,
      sessionTimeoutMinutes: 60,
    },
  });

  const updateSettings = useCallback((updates: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  const updateAppearance = useCallback((appearance: Partial<SystemSettings['appearance']>) => {
    setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, ...appearance } }));
  }, [setSettings]);

  const updateFeatures = useCallback((features: Partial<SystemSettings['features']>) => {
    setSettings(prev => ({ ...prev, features: { ...prev.features, ...features } }));
  }, [setSettings]);

  const updatePermissions = useCallback((permissions: Partial<SystemSettings['permissions']>) => {
    setSettings(prev => ({ ...prev, permissions: { ...prev.permissions, ...permissions } }));
  }, [setSettings]);

  const updateSecurity = useCallback((security: Partial<SystemSettings['security']>) => {
    setSettings(prev => ({ ...prev, security: { ...prev.security, ...security } }));
  }, [setSettings]);

  return {
    settings,
    updateSettings,
    updateAppearance,
    updateFeatures,
    updatePermissions,
    updateSecurity,
  };
}

// Custom status hook
export function useCustomStatus() {
  const [statuses, setStatuses] = useLocalStorage<CustomStatus[]>('hus_customstatus', []);

  const updateStatus = useCallback((status: Omit<CustomStatus, 'id' | 'updatedAt'>) => {
    const newStatus: CustomStatus = {
      ...status,
      id: Math.random().toString(36).substr(2, 9),
      updatedAt: new Date(),
    };
    setStatuses(prev => {
      const existing = prev.find(s => s.userId === status.userId);
      if (existing) {
        return prev.map(s => s.userId === status.userId ? { ...newStatus, id: existing.id } : s);
      }
      return [...prev, newStatus];
    });
  }, [setStatuses]);

  const getUserStatus = useCallback((userId: string) => {
    return statuses.find(s => s.userId === userId);
  }, [statuses]);

  const getAllVisibleStatuses = useCallback(() => {
    return statuses.filter(s => s.visibleToAll);
  }, [statuses]);

  const clearStatus = useCallback((userId: string) => {
    setStatuses(prev => prev.filter(s => s.userId !== userId));
  }, [setStatuses]);

  return {
    statuses,
    updateStatus,
    getUserStatus,
    getAllVisibleStatuses,
    clearStatus,
  };
}

// Work shifts hook
export function useWorkShifts() {
  const [shifts, setShifts] = useLocalStorage<WorkShift[]>('hus_workshifts', []);

  const startShift = useCallback((userId: string, userName: string, location?: string, notes?: string) => {
    // End any active shift first
    setShifts(prev => prev.map(s => 
      s.userId === userId && s.isActive 
        ? { ...s, isActive: false, endedAt: new Date() } 
        : s
    ));
    
    const newShift: WorkShift = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName,
      startedAt: new Date(),
      breakMinutes: 0,
      location,
      notes,
      isActive: true,
    };
    setShifts(prev => [newShift, ...prev]);
    return newShift.id;
  }, [setShifts]);

  const endShift = useCallback((shiftId: string, breakMinutes: number = 0) => {
    const endedAt = new Date();
    setShifts(prev => prev.map(s => {
      if (s.id !== shiftId) return s;
      const startedAt = new Date(s.startedAt);
      const totalMs = endedAt.getTime() - startedAt.getTime() - (breakMinutes * 60 * 1000);
      const totalHours = Math.round((totalMs / (1000 * 60 * 60)) * 100) / 100;
      return {
        ...s,
        endedAt,
        breakMinutes,
        totalHours: Math.max(0, totalHours),
        isActive: false,
      };
    }));
  }, [setShifts]);

  const getActiveShift = useCallback((userId: string) => {
    return shifts.find(s => s.userId === userId && s.isActive);
  }, [shifts]);

  const getUserShifts = useCallback((userId: string, startDate?: Date, endDate?: Date) => {
    let userShifts = shifts.filter(s => s.userId === userId);
    if (startDate) {
      userShifts = userShifts.filter(s => new Date(s.startedAt) >= startDate);
    }
    if (endDate) {
      userShifts = userShifts.filter(s => new Date(s.startedAt) <= endDate);
    }
    return userShifts.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [shifts]);

  const getTotalHoursForPeriod = useCallback((userId: string, startDate: Date, endDate: Date) => {
    const periodShifts = getUserShifts(userId, startDate, endDate);
    return periodShifts.reduce((total, shift) => total + (shift.totalHours || 0), 0);
  }, [getUserShifts]);

  const getAllActiveShifts = useCallback(() => {
    return shifts.filter(s => s.isActive);
  }, [shifts]);

  const addBreakToShift = useCallback((shiftId: string, minutes: number) => {
    setShifts(prev => prev.map(s => 
      s.id === shiftId ? { ...s, breakMinutes: s.breakMinutes + minutes } : s
    ));
  }, [setShifts]);

  return {
    shifts,
    startShift,
    endShift,
    getActiveShift,
    getUserShifts,
    getTotalHoursForPeriod,
    getAllActiveShifts,
    addBreakToShift,
  };
}

// Single patient accounts hook
export function useSinglePatientAccounts() {
  const [accounts, setAccounts] = useLocalStorage<SinglePatientAccount[]>('hus_singlepatient_accounts', []);

  const createAccount = useCallback((account: Omit<SinglePatientAccount, 'id' | 'createdAt'>) => {
    const newAccount: SinglePatientAccount = {
      ...account,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setAccounts(prev => [...prev, newAccount]);
    return newAccount.id;
  }, [setAccounts]);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  }, [setAccounts]);

  const getAccountByUsername = useCallback((username: string) => {
    return accounts.find(a => a.username === username);
  }, [accounts]);

  const getAccountsByPatient = useCallback((patientId: string) => {
    return accounts.filter(a => a.patientId === patientId);
  }, [accounts]);

  const isAccountValid = useCallback((account: SinglePatientAccount) => {
    if (!account.expiresAt) return true;
    return new Date(account.expiresAt) > new Date();
  }, []);

  return {
    accounts,
    createAccount,
    deleteAccount,
    getAccountByUsername,
    getAccountsByPatient,
    isAccountValid,
  };
}

// Patient Portal Access hook
export function usePatientPortal() {
  const [accessCodes, setAccessCodes] = useLocalStorage<PatientPortalAccess[]>('hus_patient_portal', []);

  const createAccess = useCallback((access: Omit<PatientPortalAccess, 'id' | 'accessCode' | 'createdAt'>) => {
    const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const newAccess: PatientPortalAccess = {
      ...access,
      id: Math.random().toString(36).substr(2, 9),
      accessCode,
      createdAt: new Date(),
    };
    setAccessCodes(prev => [...prev, newAccess]);
    return { id: newAccess.id, accessCode };
  }, [setAccessCodes]);

  const revokeAccess = useCallback((id: string) => {
    setAccessCodes(prev => prev.filter(a => a.id !== id));
  }, [setAccessCodes]);

  const getAccessByCode = useCallback((code: string) => {
    return accessCodes.find(a => a.accessCode === code);
  }, [accessCodes]);

  const getAccessByPatient = useCallback((patientId: string) => {
    return accessCodes.filter(a => a.patientId === patientId);
  }, [accessCodes]);

  const isAccessValid = useCallback((access: PatientPortalAccess) => {
    return new Date(access.expiresAt) > new Date();
  }, []);

  return {
    accessCodes,
    createAccess,
    revokeAccess,
    getAccessByCode,
    getAccessByPatient,
    isAccessValid,
  };
}

// Patient Accounts hook - for patient login credentials
export function usePatientAccounts() {
  const [accounts, setAccounts] = useLocalStorage<PatientAccount[]>('hus_patient_accounts', []);

  const createAccount = useCallback((account: Omit<PatientAccount, 'id' | 'createdAt'>) => {
    const newAccount: PatientAccount = {
      ...account,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setAccounts(prev => [...prev, newAccount]);
    return newAccount.id;
  }, [setAccounts]);

  const updateAccount = useCallback((id: string, updates: Partial<PatientAccount>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, [setAccounts]);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  }, [setAccounts]);

  const getAccountByUsername = useCallback((username: string) => {
    return accounts.find(a => a.username === username && a.isActive);
  }, [accounts]);

  const getAccountByPatientId = useCallback((patientId: string) => {
    return accounts.filter(a => a.patientId === patientId);
  }, [accounts]);

  const validateLogin = useCallback((username: string, password: string) => {
    const account = accounts.find(a => a.username === username && a.password === password && a.isActive);
    if (!account) return null;
    if (account.expiresAt && new Date(account.expiresAt) < new Date()) return null;
    return account;
  }, [accounts]);

  return {
    accounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountByUsername,
    getAccountByPatientId,
    validateLogin,
  };
}

export function useStaffAccounts() {
  const [accounts, setAccounts] = useLocalStorage<StaffAccount[]>('hus_staff_accounts', []);

  const createAccount = useCallback((account: Omit<StaffAccount, 'id' | 'createdAt'>) => {
    const newAccount: StaffAccount = {
      ...account,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setAccounts(prev => [...prev, newAccount]);
    return newAccount.id;
  }, [setAccounts]);

  const updateAccount = useCallback((id: string, updates: Partial<StaffAccount>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, [setAccounts]);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  }, [setAccounts]);

  const getAccountByUsername = useCallback((username: string) => {
    return accounts.find(a => a.username === username && a.isActive);
  }, [accounts]);

  const validateLogin = useCallback((username: string, password: string) => {
    const account = accounts.find(a => a.username === username && a.password === password && a.isActive);
    if (!account) return null;
    if (account.expiresAt && new Date(account.expiresAt) < new Date()) return null;
    return account;
  }, [accounts]);

  const getActiveAccounts = useCallback(() => {
    return accounts.filter(account => 
      account.isActive && (!account.expiresAt || new Date(account.expiresAt) > new Date())
    );
  }, [accounts]);

  return {
    accounts,
    activeAccounts: getActiveAccounts(),
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountByUsername,
    validateLogin,
  };
}

// Patient Documents hook
export function usePatientDocuments() {
  const [documents, setDocuments] = useLocalStorage<PatientDocument[]>('hus_patient_documents', []);

  const addDocument = useCallback((doc: Omit<PatientDocument, 'id' | 'uploadedAt'>) => {
    const newDoc: PatientDocument = {
      ...doc,
      id: Math.random().toString(36).substr(2, 9),
      uploadedAt: new Date(),
    };
    setDocuments(prev => [newDoc, ...prev]);
    return newDoc.id;
  }, [setDocuments]);

  const updateDocument = useCallback((id: string, updates: Partial<PatientDocument>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, [setDocuments]);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, [setDocuments]);

  const getDocumentsByPatient = useCallback((patientId: string, visibleOnly = false) => {
    let docs = documents.filter(d => d.patientId === patientId);
    if (visibleOnly) {
      docs = docs.filter(d => d.isVisibleToPatient);
    }
    return docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [documents]);

  const getDocumentsByType = useCallback((patientId: string, type: PatientDocument['type']) => {
    return documents.filter(d => d.patientId === patientId && d.type === type && d.isVisibleToPatient)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [documents]);

  return {
    documents,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocumentsByPatient,
    getDocumentsByType,
  };
}

// Patient Questions hook
export function usePatientQuestions() {
  const [questions, setQuestions] = useLocalStorage<PatientQuestion[]>('hus_patient_questions', []);

  const askQuestion = useCallback((question: Omit<PatientQuestion, 'id' | 'askedAt' | 'status'>) => {
    const newQuestion: PatientQuestion = {
      ...question,
      id: Math.random().toString(36).substr(2, 9),
      askedAt: new Date(),
      status: 'pending',
    };
    setQuestions(prev => [newQuestion, ...prev]);
    return newQuestion.id;
  }, [setQuestions]);

  const answerQuestion = useCallback((id: string, answer: string, answeredBy: string, answeredByName: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? {
      ...q,
      answer,
      answeredBy,
      answeredByName,
      answeredAt: new Date(),
      status: 'answered',
    } : q));
  }, [setQuestions]);

  const closeQuestion = useCallback((id: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, status: 'closed' } : q));
  }, [setQuestions]);

  const getQuestionsByPatient = useCallback((patientId: string) => {
    return questions.filter(q => q.patientId === patientId)
      .sort((a, b) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime());
  }, [questions]);

  const getPendingQuestions = useCallback(() => {
    return questions.filter(q => q.status === 'pending')
      .sort((a, b) => new Date(a.askedAt).getTime() - new Date(b.askedAt).getTime());
  }, [questions]);

  const getPublicQuestions = useCallback(() => {
    return questions.filter(q => q.isPublic && q.status === 'answered')
      .sort((a, b) => new Date(b.answeredAt!).getTime() - new Date(a.answeredAt!).getTime());
  }, [questions]);

  return {
    questions,
    askQuestion,
    answerQuestion,
    closeQuestion,
    getQuestionsByPatient,
    getPendingQuestions,
    getPublicQuestions,
  };
}

// Patient Health Tracker hook
export function usePatientHealthTracker() {
  const [entries, setEntries] = useLocalStorage<PatientHealthTracker[]>('hus_patient_health_tracker', []);

  const addEntry = useCallback((entry: Omit<PatientHealthTracker, 'id' | 'recordedAt'>) => {
    const newEntry: PatientHealthTracker = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      recordedAt: new Date(),
    };
    setEntries(prev => [newEntry, ...prev]);
    return newEntry.id;
  }, [setEntries]);

  const updateEntry = useCallback((id: string, updates: Partial<PatientHealthTracker>) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, [setEntries]);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, [setEntries]);

  const getEntriesByPatient = useCallback((patientId: string, type?: PatientHealthTracker['type']) => {
    let patientEntries = entries.filter(e => e.patientId === patientId);
    if (type) {
      patientEntries = patientEntries.filter(e => e.type === type);
    }
    return patientEntries.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  }, [entries]);

  const getSharedEntries = useCallback((patientId: string) => {
    return entries.filter(e => e.patientId === patientId && e.isSharedWithDoctor)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  }, [entries]);

  const getLatestEntry = useCallback((patientId: string, type: PatientHealthTracker['type']) => {
    return entries
      .filter(e => e.patientId === patientId && e.type === type)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
  }, [entries]);

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesByPatient,
    getSharedEntries,
    getLatestEntry,
  };
}

// Patient Reminders hook
export function usePatientReminders() {
  const [reminders, setReminders] = useLocalStorage<PatientReminder[]>('hus_patient_reminders', []);

  const createReminder = useCallback((reminder: Omit<PatientReminder, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newReminder: PatientReminder = {
      ...reminder,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      isCompleted: false,
    };
    setReminders(prev => [newReminder, ...prev]);
    return newReminder.id;
  }, [setReminders]);

  const completeReminder = useCallback((id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isCompleted: true, completedAt: new Date() } : r));
  }, [setReminders]);

  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, [setReminders]);

  const getRemindersByPatient = useCallback((patientId: string, includeCompleted = false) => {
    let patientReminders = reminders.filter(r => r.patientId === patientId);
    if (!includeCompleted) {
      patientReminders = patientReminders.filter(r => !r.isCompleted);
    }
    return patientReminders.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [reminders]);

  const getUpcomingReminders = useCallback((patientId: string, days: number = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return reminders.filter(r => 
      r.patientId === patientId && 
      !r.isCompleted && 
      new Date(r.scheduledAt) <= cutoff
    ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [reminders]);

  return {
    reminders,
    createReminder,
    completeReminder,
    deleteReminder,
    getRemindersByPatient,
    getUpcomingReminders,
  };
}

// Lab Orders hook
export function useLabOrders() {
  const [orders, setOrders] = useLocalStorage<LabOrder[]>('hus_lab_orders', []);

  const createOrder = useCallback((order: Omit<LabOrder, 'id' | 'orderedAt'>) => {
    const newOrder: LabOrder = {
      ...order,
      id: Math.random().toString(36).substr(2, 9),
      orderedAt: new Date(),
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder.id;
  }, [setOrders]);

  const updateOrder = useCallback((id: string, updates: Partial<LabOrder>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, [setOrders]);

  const completeOrder = useCallback((id: string, results: string) => {
    setOrders(prev => prev.map(o => 
      o.id === id ? { ...o, status: 'completed' as const, completedAt: new Date(), results } : o
    ));
  }, [setOrders]);

  const getOrdersByPatient = useCallback((patientId: string) => {
    return orders.filter(o => o.patientId === patientId).sort((a, b) => 
      new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
    );
  }, [orders]);

  const getPendingOrders = useCallback(() => {
    return orders.filter(o => o.status === 'pending' || o.status === 'in_progress');
  }, [orders]);

  return {
    orders,
    createOrder,
    updateOrder,
    completeOrder,
    getOrdersByPatient,
    getPendingOrders,
  };
}

// Imaging Studies hook
export function useImagingStudies() {
  const [studies, setStudies] = useLocalStorage<ImagingStudy[]>('hus_imaging_studies', []);

  const createStudy = useCallback((study: Omit<ImagingStudy, 'id' | 'orderedAt'>) => {
    const newStudy: ImagingStudy = {
      ...study,
      id: Math.random().toString(36).substr(2, 9),
      orderedAt: new Date(),
    };
    setStudies(prev => [newStudy, ...prev]);
    return newStudy.id;
  }, [setStudies]);

  const updateStudy = useCallback((id: string, updates: Partial<ImagingStudy>) => {
    setStudies(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [setStudies]);

  const addReport = useCallback((id: string, report: string, radiologist: string) => {
    setStudies(prev => prev.map(s => 
      s.id === id ? { 
        ...s, 
        status: 'reported' as const, 
        report, 
        radiologist, 
        reportedAt: new Date() 
      } : s
    ));
  }, [setStudies]);

  const getStudiesByPatient = useCallback((patientId: string) => {
    return studies.filter(s => s.patientId === patientId).sort((a, b) => 
      new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
    );
  }, [studies]);

  const getPendingStudies = useCallback(() => {
    return studies.filter(s => s.status === 'ordered' || s.status === 'scheduled');
  }, [studies]);

  return {
    studies,
    createStudy,
    updateStudy,
    addReport,
    getStudiesByPatient,
    getPendingStudies,
  };
}

// Referrals hook
export function useReferrals() {
  const [referrals, setReferrals] = useLocalStorage<Referral[]>('hus_referrals', []);

  const createReferral = useCallback((referral: Omit<Referral, 'id' | 'createdAt'>) => {
    const newReferral: Referral = {
      ...referral,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setReferrals(prev => [newReferral, ...prev]);
    return newReferral.id;
  }, [setReferrals]);

  const updateReferral = useCallback((id: string, updates: Partial<Referral>) => {
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, [setReferrals]);

  const sendReferral = useCallback((id: string) => {
    setReferrals(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'sent' as const, sentAt: new Date() } : r
    ));
  }, [setReferrals]);

  const completeReferral = useCallback((id: string) => {
    setReferrals(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'completed' as const, completedAt: new Date() } : r
    ));
  }, [setReferrals]);

  const getReferralsByPatient = useCallback((patientId: string) => {
    return referrals.filter(r => r.patientId === patientId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [referrals]);

  const getPendingReferrals = useCallback(() => {
    return referrals.filter(r => r.status === 'pending' || r.status === 'sent');
  }, [referrals]);

  return {
    referrals,
    createReferral,
    updateReferral,
    sendReferral,
    completeReferral,
    getReferralsByPatient,
    getPendingReferrals,
  };
}

// User Groups hook
export function useUserGroups() {
  const [groups, setGroups] = useLocalStorage<UserGroup[]>('hus_user_groups', []);

  const createGroup = useCallback((group: Omit<UserGroup, 'id' | 'createdAt'>) => {
    const newGroup: UserGroup = {
      ...group,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setGroups(prev => [...prev, newGroup]);
    return newGroup.id;
  }, [setGroups]);

  const updateGroup = useCallback((id: string, updates: Partial<UserGroup>) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, [setGroups]);

  const deleteGroup = useCallback((id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  }, [setGroups]);

  const addMember = useCallback((groupId: string, userId: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, members: [...g.members, userId] } : g
    ));
  }, [setGroups]);

  const removeMember = useCallback((groupId: string, userId: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, members: g.members.filter(m => m !== userId) } : g
    ));
  }, [setGroups]);

  return {
    groups,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
  };
}

// Chat Channels hook
export function useChatChannels() {
  const [channels, setChannels] = useLocalStorage<ChatChannel[]>('hus_chat_channels', []);

  const createChannel = useCallback((channel: Omit<ChatChannel, 'id' | 'createdAt' | 'messages'>) => {
    const newChannel: ChatChannel = {
      ...channel,
      id: Math.random().toString(36).substr(2, 9),
      messages: [],
      createdAt: new Date(),
    };
    setChannels(prev => [...prev, newChannel]);
    return newChannel.id;
  }, [setChannels]);

  const deleteChannel = useCallback((id: string) => {
    setChannels(prev => prev.filter(c => c.id !== id));
  }, [setChannels]);

  const sendMessage = useCallback((channelId: string, message: Omit<ChatMessage, 'id' | 'sentAt' | 'isEdited'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      sentAt: new Date(),
      isEdited: false,
    };
    setChannels(prev => prev.map(c => 
      c.id === channelId ? { ...c, messages: [...c.messages, newMessage] } : c
    ));
    return newMessage.id;
  }, [setChannels]);

  const getChannelMessages = useCallback((channelId: string, count: number = 50) => {
    const channel = channels.find(c => c.id === channelId);
    return channel?.messages.slice(-count) || [];
  }, [channels]);

  return {
    channels,
    createChannel,
    deleteChannel,
    sendMessage,
    getChannelMessages,
  };
}

// Appointments hook
export function useAppointments() {
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('hus_appointments', []);

  const createAppointment = useCallback((appointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment.id;
  }, [setAppointments]);

  const updateAppointment = useCallback((id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, [setAppointments]);

  const cancelAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'cancelled' as const } : a
    ));
  }, [setAppointments]);

  const getAppointmentsByPatient = useCallback((patientId: string) => {
    return appointments.filter(a => a.patientId === patientId && a.status !== 'cancelled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);

  const getAppointmentsByDoctor = useCallback((doctorId: string, date?: Date) => {
    let doctorAppointments = appointments.filter(a => a.doctorId === doctorId && a.status !== 'cancelled');
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      doctorAppointments = doctorAppointments.filter(a => {
        const apptDate = new Date(a.date);
        return apptDate >= startOfDay && apptDate <= endOfDay;
      });
    }
    return doctorAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);

  const getTodayAppointments = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return appointments.filter(a => {
      const apptDate = new Date(a.date);
      return apptDate >= today && apptDate < tomorrow && a.status !== 'cancelled';
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);

  return {
    appointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getAppointmentsByPatient,
    getAppointmentsByDoctor,
    getTodayAppointments,
  };
}

// Electronic Signatures hook
export function useElectronicSignatures() {
  const [signatures, setSignatures] = useLocalStorage<ElectronicSignature[]>('hus_signatures', []);

  const addSignature = useCallback((signature: Omit<ElectronicSignature, 'id' | 'signedAt'>) => {
    const newSignature: ElectronicSignature = {
      ...signature,
      id: Math.random().toString(36).substr(2, 9),
      signedAt: new Date(),
    };
    setSignatures(prev => [newSignature, ...prev]);
    return newSignature.id;
  }, [setSignatures]);

  const getSignaturesByDocument = useCallback((documentType: string, documentId: string) => {
    return signatures.filter(s => s.documentType === documentType && s.documentId === documentId)
      .sort((a, b) => new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime());
  }, [signatures]);

  const getSignaturesByUser = useCallback((userId: string) => {
    return signatures.filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime());
  }, [signatures]);

  const verifySignature = useCallback((signatureId: string) => {
    return signatures.find(s => s.id === signatureId);
  }, [signatures]);

  return {
    signatures,
    addSignature,
    getSignaturesByDocument,
    getSignaturesByUser,
    verifySignature,
  };
}

// Form Versions hook
export function useFormVersions() {
  const [versions, setVersions] = useLocalStorage<FormVersion[]>('hus_form_versions', []);

  const createVersion = useCallback((version: Omit<FormVersion, 'id' | 'createdAt'>) => {
    const newVersion: FormVersion = {
      ...version,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setVersions(prev => [newVersion, ...prev]);
    return newVersion.id;
  }, [setVersions]);

  const getVersionsByTemplate = useCallback((templateId: string) => {
    return versions.filter(v => v.templateId === templateId)
      .sort((a, b) => b.version - a.version);
  }, [versions]);

  const getLatestVersion = useCallback((templateId: string) => {
    const templateVersions = versions.filter(v => v.templateId === templateId);
    if (templateVersions.length === 0) return null;
    return templateVersions.reduce((latest, current) => 
      current.version > latest.version ? current : latest
    );
  }, [versions]);

  const getVersionById = useCallback((versionId: string) => {
    return versions.find(v => v.id === versionId);
  }, [versions]);

  const restoreVersion = useCallback((versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    return version?.data || null;
  }, [versions]);

  const compareVersions = useCallback((versionId1: string, versionId2: string) => {
    const v1 = versions.find(v => v.id === versionId1);
    const v2 = versions.find(v => v.id === versionId2);
    if (!v1 || !v2) return null;
    return {
      version1: v1,
      version2: v2,
      differences: findDifferences(v1.data, v2.data),
    };
  }, [versions]);

  return {
    versions,
    createVersion,
    getVersionsByTemplate,
    getLatestVersion,
    getVersionById,
    restoreVersion,
    compareVersions,
  };
}

// Helper function to find differences between two objects
function findDifferences(obj1: any, obj2: any, path = ''): string[] {
  const differences: string[] = [];
  const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
  
  keys.forEach(key => {
    const currentPath = path ? `${path}.${key}` : key;
    const val1 = obj1?.[key];
    const val2 = obj2?.[key];
    
    if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
      differences.push(...findDifferences(val1, val2, currentPath));
    } else if (val1 !== val2) {
      differences.push(`${currentPath}: "${val1}" → "${val2}"`);
    }
  });
  
  return differences;
}

// Mass Print hook
export function useMassPrint() {
  const [printQueue, setPrintQueue] = useLocalStorage<string[]>('hus_print_queue', []);

  const addToQueue = useCallback((formId: string) => {
    setPrintQueue(prev => {
      if (prev.includes(formId)) return prev;
      return [...prev, formId];
    });
  }, [setPrintQueue]);

  const removeFromQueue = useCallback((formId: string) => {
    setPrintQueue(prev => prev.filter(id => id !== formId));
  }, [setPrintQueue]);

  const clearQueue = useCallback(() => {
    setPrintQueue([]);
  }, [setPrintQueue]);

  const getQueue = useCallback(() => {
    return printQueue;
  }, [printQueue]);

  const isInQueue = useCallback((formId: string) => {
    return printQueue.includes(formId);
  }, [printQueue]);

  return {
    printQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    getQueue,
    isInQueue,
  };
}

// Form Permissions hook - manages patient access to forms
export function useFormPermissions() {
  const [formPermissions, setFormPermissions] = useLocalStorage<Record<string, {
    patientAccess: 'none' | 'view' | 'partial' | 'full';
    patientEditableFields?: string[];
    canPatientDownload: boolean;
  }>>('hus_form_permissions', {});

  const setFormAccess = useCallback((templateId: string, access: 'none' | 'view' | 'partial' | 'full', editableFields?: string[], canDownload = false) => {
    setFormPermissions(prev => ({
      ...prev,
      [templateId]: {
        patientAccess: access,
        patientEditableFields: editableFields,
        canPatientDownload: canDownload,
      }
    }));
  }, [setFormPermissions]);

  const canPatientViewForm = useCallback((templateId: string) => {
    const perm = formPermissions[templateId];
    if (!perm) return false;
    return perm.patientAccess !== 'none';
  }, [formPermissions]);

  const canPatientFillForm = useCallback((templateId: string) => {
    const perm = formPermissions[templateId];
    if (!perm) return false;
    return perm.patientAccess === 'full' || perm.patientAccess === 'partial';
  }, [formPermissions]);

  const canPatientDownloadForm = useCallback((templateId: string) => {
    const perm = formPermissions[templateId];
    if (!perm) return false;
    return perm.canPatientDownload;
  }, [formPermissions]);

  const getPatientEditableFields = useCallback((templateId: string) => {
    const perm = formPermissions[templateId];
    return perm?.patientEditableFields || [];
  }, [formPermissions]);

  const removeFormAccess = useCallback((templateId: string) => {
    setFormPermissions(prev => {
      const newPerms = { ...prev };
      delete newPerms[templateId];
      return newPerms;
    });
  }, [setFormPermissions]);

  return {
    formPermissions,
    setFormAccess,
    canPatientViewForm,
    canPatientFillForm,
    canPatientDownloadForm,
    getPatientEditableFields,
    removeFormAccess,
  };
}

// Medications hook
export function useMedications() {
  const [medications, setMedications] = useLocalStorage<Medication[]>('hus_medications', [
    { id: '1', genericName: 'Metoprololi', tradeName: 'Betaloc', category: 'reseptilääkkeet', atcCode: 'C07AB02', form: 'tabletti', strength: '50mg', isActive: true, createdAt: new Date() },
    { id: '2', genericName: 'Simvastatiini', tradeName: 'Zocor', category: 'reseptilääkkeet', atcCode: 'C10AA01', form: 'tabletti', strength: '20mg', isActive: true, createdAt: new Date() },
    { id: '3', genericName: 'Parasetamoli', tradeName: 'Panacod', category: 'yli-ilmoitus', form: 'tabletti', strength: '500mg', isActive: true, createdAt: new Date() },
  ]);

  const addMedication = useCallback((med: Omit<Medication, 'id' | 'createdAt'>) => {
    const newMed: Medication = {
      ...med,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setMedications(prev => [...prev, newMed]);
    return newMed.id;
  }, [setMedications]);

  const updateMedication = useCallback((id: string, updates: Partial<Medication>) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, [setMedications]);

  const deleteMedication = useCallback((id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  }, [setMedications]);

  const getMedicationsByCategory = useCallback((category: any) => {
    return medications.filter(m => m.category === category && m.isActive);
  }, [medications]);

  return {
    medications,
    addMedication,
    updateMedication,
    deleteMedication,
    getMedicationsByCategory,
  };
}

// Patient Medications hook
export function usePatientMedications() {
  const [patientMeds, setPatientMeds] = useLocalStorage<PatientMedication[]>('hus_patient_medications', []);

  const addPatientMedication = useCallback((med: Omit<PatientMedication, 'id'>) => {
    const newMed: PatientMedication = {
      ...med,
      id: Math.random().toString(36).substr(2, 9),
    };
    setPatientMeds(prev => [...prev, newMed]);
    return newMed.id;
  }, [setPatientMeds]);

  const updatePatientMedication = useCallback((id: string, updates: Partial<PatientMedication>) => {
    setPatientMeds(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, [setPatientMeds]);

  const deletePatientMedication = useCallback((id: string) => {
    setPatientMeds(prev => prev.filter(m => m.id !== id));
  }, [setPatientMeds]);

  const getPatientMedications = useCallback((patientId: string) => {
    return patientMeds.filter(m => m.patientId === patientId && m.isActive);
  }, [patientMeds]);

  return {
    patientMedications: patientMeds,
    addPatientMedication,
    updatePatientMedication,
    deletePatientMedication,
    getPatientMedications,
  };
}

// Messages hook
export function useMessages() {
  const [messages, setMessages] = useLocalStorage<Message[]>('hus_messages', []);
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('hus_conversations', []);

  const createConversation = useCallback((participantIds: string[], participantNames: string[]) => {
    const newConversation: Conversation = {
      id: Math.random().toString(36).substr(2, 9),
      participantIds,
      participantNames,
      createdAt: new Date(),
      isActive: true,
    };
    setConversations(prev => [...prev, newConversation]);
    return newConversation.id;
  }, [setConversations]);

  const sendMessage = useCallback((message: Omit<Message, 'id' | 'createdAt' | 'isRead' | 'readAt'>) => {
    const newMessage: Message = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      isRead: false,
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Update conversation
    setConversations(prev => prev.map(c => c.id === message.conversationId ? {
      ...c,
      lastMessage: message.content,
      lastMessageAt: new Date(),
    } : c));
    
    return newMessage.id;
  }, [setMessages, setConversations]);

  const markAsRead = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true, readAt: new Date() } : m));
  }, [setMessages]);

  const getConversation = useCallback((conversationId: string) => {
    return conversations.find(c => c.id === conversationId);
  }, [conversations]);

  const getConversationMessages = useCallback((conversationId: string) => {
    return messages.filter(m => m.conversationId === conversationId).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [messages]);

  const getUserConversations = useCallback((userId: string) => {
    return conversations.filter(c => c.participantIds.includes(userId));
  }, [conversations]);

  const getUnreadCount = useCallback((conversationId: string, userId: string) => {
    return messages.filter(m => m.conversationId === conversationId && m.recipientId === userId && !m.isRead).length;
  }, [messages]);

  return {
    messages,
    conversations,
    createConversation,
    sendMessage,
    markAsRead,
    getConversation,
    getConversationMessages,
    getUserConversations,
    getUnreadCount,
  };
}
