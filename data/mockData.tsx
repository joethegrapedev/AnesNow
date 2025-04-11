/**
 * @deprecated This file is being phased out. Import from DataTypes.tsx and DataService.tsx instead.
 */

import { 
  JobStatus, 
  VisibilityMode, 
  MedicalProcedure, 
  UserData, 
  Case, 
  Job 
} from './DataTypes';

import {
  getJobsByStatus,
  getJobsVisibleToUser,
  getCurrentUserData,
  isJobVisibleToUser
} from './DataService';

// Re-export all types for backward compatibility
export {
  JobStatus,
  VisibilityMode,
  MedicalProcedure,
  UserData,
  Case,
  Job,
  getJobsByStatus,
  getJobsVisibleToUser,
  getCurrentUserData,
  isJobVisibleToUser
};

// Keep your mock data object definitions for testing
// But mark them deprecated
/** @deprecated Use Firebase data instead */
export const mockProcedures: Record<string, MedicalProcedure> = {
  "proc-001": {
    id: "proc-001",
    date: "Mon, 15 Apr 2024",
    startTime: "09:00 AM",
    duration: "2 hours",
    location: "City General Hospital, OR 3",
    surgeonName: "Dr. Sarah Johnson",
    surgeryName: "Laparoscopic Cholecystectomy",
    remarks: "Patient has history of hypertension. Please review pre-op assessment.",
    isPriority: true,
    fee: 1200,
    visibilityMode: "specific",
    preferredAnaesthetists: ["user-001", "user-002"],
    autoAccept: false,
    acceptedBy: [],
    createdAt: new Date(2024, 3, 10).toISOString(),
  },
  "proc-002": {
    id: "proc-002",
    date: "Wed, 17 Apr 2024",
    startTime: "11:30 AM",
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
    startTime: "08:00 AM",
    duration: "3 hours",
    location: "City General Hospital, OR 2",
    surgeonName: "Dr. Robert Williams",
    surgeryName: "Total Hip Replacement",
    remarks: "Patient is allergic to latex. Please ensure latex-free environment.",
    isPriority: false,
    fee: 1800,
    visibilityMode: "sequential",
    preferredAnaesthetists: ["user-002", "user-001"],
    sequentialOfferIndex: 0,
    sequentialOfferDuration: 60,
    sequentialOfferDeadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    autoAccept: false,
    acceptedBy: [],
    createdAt: new Date(2024, 3, 12).toISOString(),
  },
  "proc-004": {
    id: "proc-004",
    date: "Fri, 19 Apr 2024",
    startTime: "14:00 PM",
    duration: "1 hour",
    location: "Vision Care Center",
    surgeonName: "Dr. Emily Patel",
    surgeryName: "Cataract Surgery",
    isPriority: false,
    fee: 750,
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
    startTime: "10:30 AM",
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
    startTime: "13:00 PM",
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
    startTime: "15:30 PM",
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
    startTime: "09:30 AM",
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
    startTime: "08:00 AM",
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
    startTime: "10:00 AM",
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
    startTime: "14:30 PM",
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
    startTime: "11:00 AM",
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
    startTime: "13:30 PM",
    duration: "2 hours",
    location: "Downtown Surgery Center",
    surgeonName: "Dr. Amanda Lee",
    surgeryName: "Endoscopic Sinus Surgery",
    remarks: "Patient has history of difficult intubation.",
    fee: 1400,
    visibilityMode: "sequential",
    preferredAnaesthetists: ["user-001", "user-002"],
    sequentialOfferIndex: 0,
    sequentialOfferDuration: 30,
    sequentialOfferDeadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    autoAccept: false,
    acceptedBy: [],
    createdAt: new Date().toISOString(),
  },
};

/** @deprecated Use Firebase data instead */
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

/** @deprecated Use Firebase data instead */
export const mockCases: Case[] = Object.values(mockProcedures)
  .filter(proc => ["proc-001", "proc-002", "proc-003", "proc-004", "proc-005"].includes(proc.id))
  .map(proc => ({
    ...proc,
    time: procedureStatus[proc.id].startTime,
    isCancelled: false,
  })) as Case[];

/** @deprecated Use Firebase data instead */
export const mockAvailableJobs: Job[] = Object.values(mockProcedures)
  .filter(proc => procedureStatus[proc.id]?.status === "available")
  .map(proc => ({
    ...proc,
    startTime: procedureStatus[proc.id].startTime,
    status: procedureStatus[proc.id].status,
    fee: proc.fee || 0,
  })) as Job[];

/** @deprecated Use Firebase data instead */
export const mockPendingJobs: Job[] = Object.values(mockProcedures)
  .filter(proc => procedureStatus[proc.id]?.status === "pending")
  .map(proc => ({
    ...proc,
    startTime: procedureStatus[proc.id].startTime,
    status: procedureStatus[proc.id].status,
    fee: proc.fee || 0,
  })) as Job[];

/** @deprecated Use Firebase data instead */
export const mockConfirmedJobs: Job[] = Object.values(mockProcedures)
  .filter(proc => procedureStatus[proc.id]?.status === "confirmed")
  .map(proc => ({
    ...proc,
    startTime: procedureStatus[proc.id].startTime,
    status: procedureStatus[proc.id].status,
    fee: proc.fee || 0,
  })) as Job[];

/** @deprecated Use Firebase data instead */
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