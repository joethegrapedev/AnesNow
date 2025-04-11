import { FieldValue } from 'firebase/firestore';

// Define JobStatus directly
export type JobStatus = 'available' | 'pending' | 'completed' | 'accepted' | 'confirmed' | 'cancelled';

// Visibility mode options
export type VisibilityMode = 'specific' | 'sequential' | 'timed' | 'all';

// Base type for all medical procedures
export interface MedicalProcedure {
  id: string;
  date: string;
  duration: string;
  location: string;
  surgeonName: string;
  surgeryName: string;
  remarks?: string;
  fee?: number;
  startTime: string;
  
  // Visibility system fields
  visibilityMode?: VisibilityMode;
  preferredAnaesthetists?: string[];
  autoAccept?: boolean;
  acceptedBy?: string[];
  confirmedAnaesthetistId?: string;
  
  // Fields for sequential offering
  sequentialOfferIndex?: number;
  sequentialOfferDeadline?: string;
  sequentialOfferDuration?: number;
  
  // Fields for timed visibility
  timeDelayDays?: number;
  visibleToAllAfter?: string;
  
  // Timestamps
  createdAt?: string | FieldValue;
  updatedAt?: string | FieldValue;
  
  // Other fields
  status?: string;
  isPriority?: boolean;
}

// Form Data for creating a new job procedure
export interface JobFormData {
  surgeryName: string;
  surgeonName: string;
  date: string;
  startTime: string;
  duration: string;
  location: string;
  fee: number;
  remarks: string;
  visibilityMode: VisibilityMode;
  preferredAnaesthetists: string[];
  autoAccept: boolean;
  timeDelayDays: number;
  sequentialOfferDuration: number;
}

// User data interface for profile information
export interface UserData {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role?: 'anaesthetist' | 'clinic';
  profileImage?: string;
  
  // Common fields
  bio?: string;
  isProfileComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Anaesthetist-specific fields
  specialization?: string;
  experience?: string;
  qualifications?: string[];
  jobAcceptanceRate?: number;
  completedJobs?: number;
  
  // Clinic-specific fields
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  businessHours?: string;
  postedJobs?: string[];
}

// Case interface for Dashboard (subset of procedure data)
export interface Case extends MedicalProcedure {
  time: string;
  isCancelled?: boolean;
  isVisibleToCurrentUser?: boolean;
  isPreferred?: boolean;
}

// Job interface for job listings (subset of procedure data)
export interface Job extends MedicalProcedure {
  startTime: string;
  fee: number;
  status: JobStatus;
  isVisibleToCurrentUser?: boolean;
  isPreferred?: boolean;
  applicationDeadline?: string;
}

// Firebase-specific type
export interface FirebaseProcedure extends Omit<MedicalProcedure, 'createdAt' | 'updatedAt'> {
  createdAt: FieldValue;
  updatedAt: FieldValue;
}