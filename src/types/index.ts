// User types
export type UserRole = 'JYL' | 'LÄÄKÄRI' | 'HOITAJA' | 'ERIKOISLÄÄKÄRI' | 'ENSIHOITAJA' | 'CUSTOM' | 'POTILAS';

export interface JobTitle {
  id: string;
  name: string;
  level: number;
  color: string;
  canCreate?: boolean;
  permissions?: string[];
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  jobTitleId?: string;
  jobTitle?: string;
  name: string;
  expiresAt?: Date;
  supervisorId?: string;
  isOnDuty?: boolean;
  shiftStartedAt?: Date;
  avatar?: string;
  isPatient?: boolean;
  patientId?: string;
  location?: string;
  status?: 'available' | 'busy' | 'break' | 'lunch' | 'meeting' | 'offduty';
}

// Patient Account for Patient Portal login
export interface PatientAccount {
  id: string;
  patientId: string;
  username: string;
  password: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  canViewRecords: boolean;
  canViewPrescriptions: boolean;
  canViewLabResults: boolean;
  canViewAppointments: boolean;
  canSendMessages: boolean;
  canSubmitFeedback: boolean;
}

// Staff Account for Staff Portal login
export interface StaffAccount {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  jobTitleId?: string;
  jobTitle?: string;
  name: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  canViewTallennetut: boolean;
  canViewUusi: boolean;
  canViewArkistoidut: boolean;
  canViewPohjat: boolean;
  canViewMuokkaa: boolean;
  canViewReseptit: boolean;
  canViewKayttajat: boolean;
  canViewOhjeistukset: boolean;
  canViewRaportit: boolean;
  canViewVuorot: boolean;
  canApproveConfidential: boolean;
}

export interface UserPermissions {
  canViewTallennetut: boolean;
  canViewUusi: boolean;
  canViewArkistoidut: boolean;
  canViewPohjat: boolean;
  canViewMuokkaa: boolean;
  canViewReseptit: boolean;
  canViewKayttajat: boolean;
  canViewOhjeistukset: boolean;
  canViewRaportit: boolean;
  canViewVuorot: boolean;
  canApproveConfidential: boolean;
}

// Form field types
export type FieldType = 'text' | 'checkbox' | 'radio' | 'textarea' | 'select' | 'date' | 'signature' | 'approval' | 'reject';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  value?: string | boolean;
  row?: number;
  col?: number;
  width?: string;
  order?: number;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
  order?: number;
}

// Template types
export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  sections: FormSection[];
  createdBy: string;
  createdAt: Date;
  isDefault?: boolean;
  html?: string;
  images?: TemplateImage[];
  allowedRoles?: string[];
  allowedJobTitles?: string[];
  hasApprovalFlow?: boolean;
  category?: 'tt' | 'psykologi' | 'raportti' | 'vuoro' | 'muu';
  // Form access permissions for patients
  patientAccess?: 'none' | 'view' | 'partial' | 'full';
  // Which fields patients can fill (if partial access)
  patientEditableFields?: string[];
  // Whether patients can download the form
  canPatientDownload?: boolean;
}

export interface TemplateImage {
  id: string;
  src: string;
  position: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'custom';
  customX?: number;
  customY?: number;
  width?: number;
  height?: number;
  isDraggable?: boolean;
}

// Saved form types
export type FormStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'confidential';

export interface SavedForm {
  id: string;
  templateId: string;
  templateName: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  createdByName?: string;
  patientId?: string;
  patientName?: string;
  isArchived?: boolean;
  isConfidential?: boolean;
  status?: FormStatus;
  approvedBy?: string;
  approvedAt?: Date;
  visibleTo?: string[];
  rejectionReason?: string;
}

// Prescription types
export interface Prescription {
  id: string;
  patientId?: string;
  patientName: string;
  medication: string;
  medicationName?: string;
  dosage: string;
  instructions: string;
  prescribedBy: string;
  prescribedByName?: string;
  prescribedAt: Date;
  validUntil?: Date;
  expiresAt?: Date;
  isConfidential?: boolean;
}

// Notice/Instruction types
export interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'ilmoitus' | 'ohjeistus' | 'tiedote';
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  visibleToRoles?: string[];
  isPinned?: boolean;
}

// Shift/Availability types
export interface ShiftStatus {
  userId: string;
  userName: string;
  jobTitle?: string;
  isOnDuty: boolean;
  startedAt?: Date;
  estimatedEnd?: Date;
  location?: string;
  status: 'available' | 'busy' | 'break' | 'offduty';
  note?: string;
  updatedAt: Date;
}

// Navigation items
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  requiredRole?: UserRole;
  requiredPermission?: keyof UserPermissions;
}

// Confidential approval request
export interface ApprovalRequest {
  id: string;
  formId: string;
  formName: string;
  requestedBy: string;
  requestedByName: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  reason?: string;
  visibleTo?: string[];
}

// Patient registry types
export type PatientStatus = 'active' | 'inactive' | 'deceased' | 'transferred';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  age: number;
  occupation?: string;
  status: PatientStatus;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  notes?: string;
  allergies?: string[];
}

// Hierarchical Diagnosis System
// Level 1: Category (e.g., "Sydän- ja verisuonisairaudet")
// Level 2: Specific Diagnosis (e.g., "Eteisvärinä")
// Level 3: ICD-10 Code

export interface DiagnosisCategory {
  id: string;
  code: string; // ICD-10 chapter code (e.g., "I00-I99")
  name: string; // Category name (e.g., "Sydän- ja verisuonisairaudet")
  description?: string;
  isActive: boolean;
}

export interface SpecificDiagnosis {
  id: string;
  categoryId: string; // Link to parent category
  icd10Code: string; // Full ICD-10 code (e.g., "I48.9")
  name: string; // Diagnosis name (e.g., "Eteisvärinä")
  description?: string;
  commonSymptoms?: string[];
  typicalTreatments?: string[];
  isActive: boolean;
}

export interface Diagnosis {
  id: string;
  patientId: string;
  categoryId?: string;
  specificDiagnosisId?: string;
  code: string; // ICD-10 code
  name: string; // Diagnosis name
  description?: string;
  diagnosedBy: string;
  diagnosedByName?: string;
  diagnosedAt: Date;
  isPrimary: boolean;
  isChronic: boolean;
  notes?: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  type: 'procedure' | 'surgery' | 'therapy' | 'medication' | 'other';
  name: string;
  description?: string;
  performedBy: string;
  performedByName?: string;
  performedAt: Date;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
}

export interface Examination {
  id: string;
  patientId: string;
  type: string;
  results: string;
  performedBy: string;
  performedByName?: string;
  performedAt: Date;
  notes?: string;
  attachments?: string[];
}

export interface LabValue {
  id: string;
  patientId: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange?: string;
  isAbnormal: boolean;
  takenAt: Date;
  resultsAt?: Date;
  orderedBy: string;
  orderedByName?: string;
  notes?: string;
}

export interface Disease {
  id: string;
  patientId: string;
  name: string;
  icd10Code?: string;
  diagnosedAt?: Date;
  isActive: boolean;
  notes?: string;
}

// Audit log types
export type LogAction = 
  | 'login' | 'logout' | 'view_patient' | 'create_patient' | 'update_patient' | 'delete_patient'
  | 'create_diagnosis' | 'create_treatment' | 'create_examination' | 'create_lab'
  | 'view_form' | 'create_form' | 'update_form' | 'delete_form' | 'archive_form'
  | 'export_pdf' | 'create_prescription' | 'send_notification' | 'update_settings'
  | 'chat_message' | 'create_note' | 'update_note' | 'approve_request';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: LogAction;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  details?: string;
  timestamp: Date;
  ipAddress?: string;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  sentBy: string;
  sentByName?: string;
  sentAt: Date;
  targetRoles?: string[];
  targetJobTitles?: string[];
  targetUsers?: string[];
  isRead: boolean;
  readBy?: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
}

// Chat types
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  sentAt: Date;
  isEdited: boolean;
  editedAt?: Date;
  replyTo?: string;
}

// Shared notes types
export interface SharedNote {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
  updatedByName?: string;
  isPinned: boolean;
  color?: string;
  visibleToRoles?: string[];
}

// Settings types
export interface SystemSettings {
  appearance: {
    primaryColor: string;
    logoUrl?: string;
    customCss?: string;
  };
  features: {
    enableChat: boolean;
    enableNotifications: boolean;
    enableAuditLog: boolean;
    enablePatientRegistry: boolean;
    enablePrescriptions: boolean;
    enableShiftTracking: boolean;
    enableConfidentialMode: boolean;
  };
  permissions: {
    whoCanViewPatients: string[];
    whoCanCreatePatients: string[];
    whoCanEditPatients: string[];
    whoCanDeletePatients: string[];
    whoCanViewLogs: string[];
    whoCanExportPdf: string[];
    whoCanSendNotifications: string[];
  };
  security: {
    requirePasswordForPdf: boolean;
    requireReasonForPdf: boolean;
    sessionTimeoutMinutes: number;
  };
}

// Custom status indicator
export interface CustomStatus {
  id: string;
  userId: string;
  userName: string;
  status: 'available' | 'busy' | 'break' | 'lunch' | 'meeting' | 'offduty' | 'custom';
  customStatusText?: string;
  message?: string;
  visibleToAll: boolean;
  updatedAt: Date;
  until?: Date;
}

// Sidebar group
export interface SidebarGroup {
  id: string;
  name: string;
  icon: string;
  order: number;
  isVisible: boolean;
  visibleToRoles?: string[];
  items: NavItem[];
}

// Work shift tracking
export interface WorkShift {
  id: string;
  userId: string;
  userName: string;
  startedAt: Date;
  endedAt?: Date;
  breakMinutes: number;
  location?: string;
  notes?: string;
  totalHours?: number;
  isActive: boolean;
}

// Single patient view account
export interface SinglePatientAccount {
  id: string;
  patientId: string;
  username: string;
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  canViewHistory: boolean;
  canViewDiagnoses: boolean;
  canViewPrescriptions: boolean;
  canViewLabValues: boolean;
}

// Patient Portal Access
export interface PatientPortalAccess {
  id: string;
  patientId: string;
  accessCode: string;
  expiresAt: Date;
  canViewRecords: boolean;
  canViewAppointments: boolean;
  canViewPrescriptions: boolean;
  canViewLabResults: boolean;
  createdBy: string;
  createdAt: Date;
}

// Laboratory Order
export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  orderedBy: string;
  orderedByName: string;
  orderedAt: Date;
  tests: LabTest[];
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent' | 'stat';
  notes?: string;
  completedAt?: Date;
  results?: string;
}

export interface LabTest {
  id: string;
  name: string;
  code: string;
  category: string;
  status: 'pending' | 'completed';
  result?: string;
  referenceRange?: string;
  unit?: string;
  isAbnormal?: boolean;
}

// Imaging Study
export interface ImagingStudy {
  id: string;
  patientId: string;
  patientName: string;
  type: 'xray' | 'ct' | 'mri' | 'ultrasound' | 'pet' | 'mammography';
  bodyPart: string;
  indication: string;
  orderedBy: string;
  orderedByName: string;
  orderedAt: Date;
  status: 'ordered' | 'scheduled' | 'in_progress' | 'completed' | 'reported';
  priority: 'normal' | 'urgent' | 'stat';
  appointmentDate?: Date;
  technician?: string;
  radiologist?: string;
  findings?: string;
  conclusion?: string;
  images?: string[];
  report?: string;
  reportedAt?: Date;
}

// Referral to Specialist
export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  fromDoctorId: string;
  fromDoctorName: string;
  toSpecialty: string;
  toDoctorName?: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'sent' | 'accepted' | 'completed' | 'cancelled';
  createdAt: Date;
  sentAt?: Date;
  completedAt?: Date;
  notes?: string;
  diagnosis?: string;
  clinicalInfo?: string;
}

// Electronic Signature
export interface ElectronicSignature {
  id: string;
  userId: string;
  userName: string;
  signatureData: string;
  signedAt: Date;
  documentType: string;
  documentId: string;
  ipAddress?: string;
}

// Form Version
export interface FormVersion {
  id: string;
  templateId: string;
  version: number;
  name: string;
  data: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  changeNotes?: string;
}

// User Group
export interface UserGroup {
  id: string;
  name: string;
  description?: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
  color?: string;
}

// Chat Channel
export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  members: string[];
  isPrivate: boolean;
  createdBy: string;
  createdAt: Date;
  messages: ChatMessage[];
}

// Appointment
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  duration: number;
  type: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  room?: string;
  createdAt: Date;
  createdBy: string;
}

// Cloud Backup
export interface CloudBackup {
  id: string;
  backupDate: Date;
  dataSize: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  provider: 'google_drive' | 'dropbox' | 'onedrive';
  fileUrl?: string;
  createdBy: string;
}

// Encryption Key
export interface EncryptionKey {
  id: string;
  keyData: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

// Patient Portal Feedback
export type FeedbackType = 'general' | 'complaint' | 'compliment' | 'suggestion' | 'technical';
export type FeedbackStatus = 'new' | 'read' | 'in_progress' | 'resolved' | 'closed';

export interface PatientFeedback {
  id: string;
  patientId: string;
  patientName: string;
  type: FeedbackType;
  subject: string;
  message: string;
  rating?: number;
  status: FeedbackStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  assignedToName?: string;
  response?: string;
  respondedAt?: Date;
  respondedBy?: string;
  respondedByName?: string;
  isAnonymous: boolean;
  attachments?: string[];
}

// Patient Portal Message
export interface PatientPortalMessage {
  id: string;
  patientId: string;
  senderType: 'patient' | 'staff';
  senderId: string;
  senderName: string;
  subject: string;
  content: string;
  sentAt: Date;
  isRead: boolean;
  readAt?: Date;
  attachments?: string[];
}

// Patient Portal Activity
export interface PatientPortalActivity {
  id: string;
  patientId: string;
  action: 'login' | 'view_record' | 'view_prescription' | 'view_lab' | 'view_appointment' | 'send_message' | 'submit_feedback' | 'book_appointment' | 'cancel_appointment' | 'view_diagnosis' | 'download_document';
  details?: string;
  timestamp: Date;
  ipAddress?: string;
}

// Patient Document - Documents shared with patient
export interface PatientDocument {
  id: string;
  patientId: string;
  name: string;
  type: 'lab_result' | 'imaging_report' | 'discharge_summary' | 'referral' | 'prescription' | 'other';
  content?: string;
  fileUrl?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  isVisibleToPatient: boolean;
  description?: string;
}

// Patient Question - Questions patient can ask
export interface PatientQuestion {
  id: string;
  patientId: string;
  category: 'medication' | 'symptoms' | 'appointment' | 'test_results' | 'general';
  question: string;
  answer?: string;
  askedAt: Date;
  answeredAt?: Date;
  answeredBy?: string;
  answeredByName?: string;
  status: 'pending' | 'answered' | 'closed';
  isPublic: boolean;
}

// Patient Health Tracker - Patient can track their own health data
export interface PatientHealthTracker {
  id: string;
  patientId: string;
  type: 'blood_pressure' | 'weight' | 'blood_sugar' | 'temperature' | 'pain' | 'mood' | 'sleep' | 'other';
  value: string;
  unit?: string;
  notes?: string;
  recordedAt: Date;
  isSharedWithDoctor: boolean;
}

// Patient Reminder - Reminders for patient
export interface PatientReminder {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  type: 'medication' | 'appointment' | 'test' | 'exercise' | 'other';
  scheduledAt: Date;
  isCompleted: boolean;
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
}

// Page Permission with job title support
export interface PagePermission {
  pageId: string;
  allowedRoles: string[];
  allowedJobTitles: string[];
  requireBoth?: boolean;
}
