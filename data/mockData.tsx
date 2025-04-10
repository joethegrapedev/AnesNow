import { JobStatus } from "../components/Anaesthetist/JobCard";

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
  fee?: number;  // Keeping as optional
  
  // New visibility system fields
  visibilityMode?: VisibilityMode;  // Making optional for backward compatibility
  preferredAnaesthetists?: string[];  // Array of user UIDs
  autoAccept?: boolean;  // Whether to auto-confirm first respondent
  acceptedBy?: string[];  // Array of anaesthetists who accepted
  confirmedAnaesthetistId?: string;  // UID of confirmed anaesthetist
  
  // Fields for sequential offering
  sequentialOfferIndex?: number;  // Current index in preferred list
  sequentialOfferDeadline?: string;  // ISO timestamp when current offer expires
  sequentialOfferDuration?: number;  // Minutes each anaesthetist has to respond

  // Fields for timed visibility
  timeDelayDays?: number;  // Days before showing to all
  visibleToAllAfter?: string;  // ISO timestamp when job becomes visible to all
  
  // Timestamps
  createdAt?: string;  // ISO timestamp of creation
  updatedAt?: string;  // ISO timestamp of last update
  
  // Legacy field (will be replaced by visibilityMode)
  isPriority?: boolean;
}

// User data interface for profile information
export interface UserData {
  uid?: string;  // Firebase Auth UID
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
  specialization?: string;  // Keeping as optional as requested
  experience?: string;
  qualifications?: string[];
  jobAcceptanceRate?: number;
  completedJobs?: number;
  
  // Clinic-specific fields
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  businessHours?: string;
  postedJobs?: string[];  // Array of job IDs
}

// Case interface for Dashboard (subset of procedure data)
export interface Case extends MedicalProcedure {
  time: string;
  isCancelled?: boolean;
  isVisibleToCurrentUser?: boolean;  // Helper field for UI
  isPreferred?: boolean;  // Helper to show if user is preferred
}

// Job interface for job listings (subset of procedure data)
export interface Job extends MedicalProcedure {
  startTime: string;
  fee: number;
  status: JobStatus;
  isVisibleToCurrentUser?: boolean;  // Helper field for UI
  isPreferred?: boolean;  // Helper to show if user is preferred
  applicationDeadline?: string;  // For timed visibility mode
}

// Main data structure - mimics a Firestore collection
export const mockProcedures: Record<string, MedicalProcedure> = {
  "proc-001": {
    id: "proc-001",
    date: "Mon, 15 Apr 2024",
    duration: "2 hours",
    location: "City General Hospital, OR 3",
    surgeonName: "Dr. Sarah Johnson",
    surgeryName: "Laparoscopic Cholecystectomy",
    remarks: "Patient has history of hypertension. Please review pre-op assessment.",
    isPriority: true,
    fee: 1200,
    // New fields
    visibilityMode: "specific",
    preferredAnaesthetists: ["user-001", "user-002"],
    autoAccept: false,
    acceptedBy: [],
    createdAt: new Date(2024, 3, 10).toISOString(),
  },
  "proc-002": {
    id: "proc-002",
    date: "Wed, 17 Apr 2024",
    duration: "1.5 hours",
    location: "Orthopaedic Specialists Clinic",
    surgeonName: "Dr. Michael Chen",
    surgeryName: "Knee Arthroscopy",
    isPriority: true,
    fee: 950,
  },
  "proc-003": {
    id: "proc-003",
    date: "Thu, 18 Apr 2024",
    duration: "3 hours",
    location: "City General Hospital, OR 2",
    surgeonName: "Dr. Robert Williams",
    surgeryName: "Total Hip Replacement",
    remarks: "Patient is allergic to latex. Please ensure latex-free environment.",
    isPriority: false,
    fee: 1800,
    // Sequential offering with deadline
    visibilityMode: "sequential",
    preferredAnaesthetists: ["user-002", "user-001"],
    sequentialOfferIndex: 0,
    sequentialOfferDuration: 60, // 60 minutes to respond
    sequentialOfferDeadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    autoAccept: false,
    acceptedBy: [],
    createdAt: new Date(2024, 3, 12).toISOString(),
  },
  "proc-004": {
    id: "proc-004",
    date: "Fri, 19 Apr 2024",
    duration: "1 hour",
    location: "Vision Care Center",
    surgeonName: "Dr. Emily Patel",
    surgeryName: "Cataract Surgery",
    isPriority: false,
    fee: 750,
    // New fields
    visibilityMode: "timed",
    preferredAnaesthetists: ["user-001"],
    timeDelayDays: 3,
    visibleToAllAfter: new Date(2024, 3, 17).toISOString(),
    autoAccept: true,
    acceptedBy: [],
    createdAt: new Date(2024, 3, 14).toISOString(),
  },
  "proc-005": {
    id: "proc-005",
    date: "Mon, 22 Apr 2024",
    duration: "2.5 hours",
    location: "Heart Institute",
    surgeonName: "Dr. James Wilson",
    surgeryName: "Coronary Angioplasty",
    remarks: "High-risk patient. Cardiology consult completed.",
    isPriority: false,
    fee: 1600,
  },
  "proc-006": {
    id: "proc-006",
    date: "Tue, 16 Apr 2024",
    duration: "2 hours",
    location: "City General Hospital, OR 1",
    surgeonName: "Dr. Lisa Thompson",
    surgeryName: "Appendectomy",
    isPriority: false,
    fee: 1100,
  },
  "proc-007": {
    id: "proc-007",
    date: "Thu, 18 Apr 2024",
    duration: "1 hour",
    location: "Hand Surgery Specialists",
    surgeonName: "Dr. David Brown",
    surgeryName: "Carpal Tunnel Release",
    remarks: "Patient requested minimal sedation.",
    isPriority: true,
    fee: 850,
  },
  "proc-008": {
    id: "proc-008",
    date: "Fri, 19 Apr 2024",
    duration: "2.5 hours",
    location: "Neurology Center",
    surgeonName: "Dr. Patricia Garcia",
    surgeryName: "Lumbar Puncture",
    isPriority: false,
    fee: 1200,
  },
  "proc-009": {
    id: "proc-009",
    date: "Mon, 15 Apr 2024",
    duration: "1.5 hours",
    location: "ENT Specialists",
    surgeonName: "Dr. Jennifer Lee",
    surgeryName: "Tonsillectomy",
    isPriority: false,
    fee: 900,
  },
  "proc-010": {
    id: "proc-010",
    date: "Wed, 24 Apr 2024",
    duration: "3 hours",
    location: "Spine Center",
    surgeonName: "Dr. Thomas Garcia",
    surgeryName: "Spinal Fusion",
    remarks: "Complex case. Pre-op meeting scheduled for April 22.",
    isPriority: true,
    fee: 2200,
  },
  "proc-011": {
    id: "proc-011",
    date: "Fri, 26 Apr 2024",
    duration: "2 hours",
    location: "City General Hospital, OR 4",
    surgeonName: "Dr. Richard Martinez",
    surgeryName: "Hernia Repair",
    isPriority: false,
    fee: 1050,
  },
  "proc-012": {
    id: "proc-012",
    date: "Mon, 29 Apr 2024",
    duration: "4 hours",
    location: "Cardiac Center",
    surgeonName: "Dr. Elizabeth Wilson",
    surgeryName: "Coronary Bypass",
    remarks: "Patient has multiple comorbidities. Full medical history provided.",
    isPriority: true,
    fee: 3000,
  },
  "proc-013": {
    id: "proc-013",
    date: "Wed, 24 Apr 2024",
    duration: "2 hours",
    location: "Downtown Surgery Center",
    surgeonName: "Dr. Amanda Lee",
    surgeryName: "Endoscopic Sinus Surgery",
    remarks: "Patient has history of difficult intubation.",
    fee: 1400,
    visibilityMode: "sequential",
    preferredAnaesthetists: ["user-001", "user-002"],
    sequentialOfferIndex: 0,
    sequentialOfferDuration: 30, // 30 minutes to respond
    sequentialOfferDeadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
    autoAccept: false,
    acceptedBy: [],
    createdAt: new Date().toISOString(),
  },
};

// Status mapping (mimics a separate Firestore collection or field)
export const procedureStatus: Record<string, { status: JobStatus, startTime: string }> = {
  "proc-001": { status: "available", startTime: "09:00 AM" },
  "proc-002": { status: "available", startTime: "11:30 AM" },
  "proc-003": { status: "available", startTime: "08:00 AM" },
  "proc-004": { status: "available", startTime: "14:00 PM" },
  "proc-005": { status: "available", startTime: "10:30 AM" },
  "proc-006": { status: "pending", startTime: "13:00 PM" },
  "proc-007": { status: "pending", startTime: "15:30 PM" },
  "proc-008": { status: "pending", startTime: "09:30 AM" },
  "proc-009": { status: "confirmed", startTime: "08:00 AM" },
  "proc-010": { status: "confirmed", startTime: "10:00 AM" },
  "proc-011": { status: "confirmed", startTime: "14:30 PM" },
  "proc-012": { status: "confirmed", startTime: "11:00 AM" },
  "proc-013": { status: "available", startTime: "13:30 PM" },
};

// Helper functions to transform data into the required formats

// For Dashboard
export const mockCases: Case[] = Object.values(mockProcedures)
  .filter(proc => ["proc-001", "proc-002", "proc-003", "proc-004", "proc-005"].includes(proc.id))
  .map(proc => ({
    ...proc,
    time: procedureStatus[proc.id].startTime,
    isCancelled: false,
  })) as Case[];

// For Jobs
export const mockAvailableJobs: Job[] = Object.values(mockProcedures)
  .filter(proc => procedureStatus[proc.id]?.status === "available")
  .map(proc => ({
    ...proc,
    startTime: procedureStatus[proc.id].startTime,
    status: procedureStatus[proc.id].status,
    fee: proc.fee || 0,
  })) as Job[];

export const mockPendingJobs: Job[] = Object.values(mockProcedures)
  .filter(proc => procedureStatus[proc.id]?.status === "pending")
  .map(proc => ({
    ...proc,
    startTime: procedureStatus[proc.id].startTime,
    status: procedureStatus[proc.id].status,
    fee: proc.fee || 0,
  })) as Job[];

export const mockConfirmedJobs: Job[] = Object.values(mockProcedures)
  .filter(proc => procedureStatus[proc.id]?.status === "confirmed")
  .map(proc => ({
    ...proc,
    startTime: procedureStatus[proc.id].startTime,
    status: procedureStatus[proc.id].status,
    fee: proc.fee || 0,
  })) as Job[];

// Helper function to get jobs by status - useful when converting to Firestore
export function getJobsByStatus(status: JobStatus): Job[] {
  return Object.values(mockProcedures)
    .filter(proc => procedureStatus[proc.id]?.status === status)
    .map(proc => ({
      ...proc,
      startTime: procedureStatus[proc.id].startTime,
      status: procedureStatus[proc.id].status,
      fee: proc.fee || 0,
    })) as Job[];
}

// Mock user data - mimics user collection in Firestore
export const mockUsers: Record<string, UserData> = {
  "user-001": {
    uid: "user-001",
    name: "Dr. Alex Morgan",
    bio: "Board-certified anesthesiologist with 10+ years of experience specializing in cardiac and pediatric cases.",
    phone: "+1 (555) 123-4567",
    email: "alex.morgan@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    specialization: "Cardiac & Pediatric Anesthesiology",
    experience: "10+ years",
    role: "anaesthetist",
    isProfileComplete: true,
    qualifications: ["Board Certified", "Fellowship in Pediatric Anesthesiology"],
    jobAcceptanceRate: 0.87,
    completedJobs: 42,
    createdAt: new Date(2023, 10, 15).toISOString(),
    updatedAt: new Date(2024, 3, 1).toISOString()
  },
  "user-002": {
    uid: "user-002",
    name: "Dr. Sarah Chen",
    bio: "Fellowship-trained in regional anesthesia with special interest in orthopedic cases.",
    phone: "+1 (555) 987-6543",
    email: "sarah.chen@example.com",
    profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
    specialization: "Regional Anesthesia",
    experience: "8 years",
    role: "anaesthetist",
    isProfileComplete: true,
    qualifications: ["Fellowship in Regional Anesthesia"],
    jobAcceptanceRate: 0.92,
    completedJobs: 37,
    createdAt: new Date(2023, 11, 10).toISOString(),
    updatedAt: new Date(2024, 2, 20).toISOString()
  },
  "clinic-001": {
    uid: "clinic-001",
    name: "Dr. James Wilson",
    email: "jwilson@citygeneralhospital.com",
    phone: "+1 (555) 234-5678",
    profileImage: "https://randomuser.me/api/portraits/men/45.jpg",
    role: "clinic",
    clinicName: "City General Hospital",
    clinicAddress: "123 Medical Center Blvd, Los Angeles, CA 90012",
    clinicPhone: "+1 (555) 234-5000",
    businessHours: "Mon-Fri, 8:00 AM - 6:00 PM",
    postedJobs: ["proc-001", "proc-003", "proc-006"],
    isProfileComplete: true,
    createdAt: new Date(2023, 9, 5).toISOString(),
    updatedAt: new Date(2024, 1, 15).toISOString()
  }
};

// Helper function to get current user data
// In a real app, this would check authentication state
export function getCurrentUserData(): UserData {
  // Return the first user as default
  return mockUsers["user-001"];
}

// Helper function to check if a job should be visible to a specific user
export function isJobVisibleToUser(job: MedicalProcedure, userId: string): boolean {
  // Default to true if no visibility mode is set (for backward compatibility)
  if (!job.visibilityMode) return true;
  
  // If job has a confirmed anaesthetist, only visible to that person
  if (job.confirmedAnaesthetistId) {
    return job.confirmedAnaesthetistId === userId;
  }
  
  switch (job.visibilityMode) {
    case 'specific':
      return job.preferredAnaesthetists?.includes(userId) || false;
      
    case 'sequential':
      // Only visible to the current anaesthetist in sequence
      const currentIndex = job.sequentialOfferIndex || 0;
      return job.preferredAnaesthetists?.[currentIndex] === userId;
      
    case 'timed':
      // Visible to preferred anaesthetists immediately
      if (job.preferredAnaesthetists?.includes(userId)) {
        return true;
      }
      
      // Check if past the visibility window
      if (job.visibleToAllAfter) {
        const now = new Date().toISOString();
        return now >= job.visibleToAllAfter;
      }
      
      return false;
      
    case 'all':
      return true;
      
    default:
      return true;
  }
}

// Helper function to get visible jobs for a user (to replace in your existing functions)
export function getJobsVisibleToUser(userId: string): Job[] {
  return Object.values(mockProcedures)
    .filter(job => isJobVisibleToUser(job, userId))
    .map(proc => ({
      ...proc,
      startTime: procedureStatus[proc.id]?.startTime || "",
      status: procedureStatus[proc.id]?.status || "available",
      fee: proc.fee || 0,
      isVisibleToCurrentUser: true,
      isPreferred: proc.preferredAnaesthetists?.includes(userId) || false
    })) as Job[];
}