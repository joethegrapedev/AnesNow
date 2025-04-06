import { JobStatus } from "../components/Anaesthetist/JobCard";

// Base type for all medical procedures
export interface MedicalProcedure {
  id: string;
  date: string;
  duration: string;
  location: string;
  surgeonName: string;
  surgeryName: string;
  remarks?: string;
  isPriority?: boolean;
  fee?: number;
}

// User data interface for profile information
export interface UserData {
  name: string;
  email: string;
  phone: string;
  bio?: string;
  specialization?: string;
  experience?: string;
  profileImage?: string;
  // Add other fields that exist in your user data
}

// Case interface for Dashboard (subset of procedure data)
export interface Case extends MedicalProcedure {
  time: string;
  isCancelled?: boolean;
}

// Job interface for job listings (subset of procedure data)
export interface Job extends MedicalProcedure {
  startTime: string;
  fee: number;
  status: JobStatus;
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

// Add this at the end of your file after the other mock data:

// Mock user data - mimics user collection in Firestore
export const mockUsers: Record<string, UserData> = {
  "user-001": {
    name: "Dr. Alex Morgan",
    bio: "Board-certified anesthesiologist with 10+ years of experience specializing in cardiac and pediatric cases.",
    phone: "+1 (555) 123-4567",
    email: "alex.morgan@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    specialization: "Cardiac & Pediatric Anesthesiology",
    experience: "10+ years"
  },
  "user-002": {
    name: "Dr. Sarah Chen",
    bio: "Fellowship-trained in regional anesthesia with special interest in orthopedic cases.",
    phone: "+1 (555) 987-6543",
    email: "sarah.chen@example.com",
    profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
    specialization: "Regional Anesthesia",
    experience: "8 years"
  },
};

// Helper function to get current user data
// In a real app, this would check authentication state
export function getCurrentUserData(): UserData {
  // Return the first user as default
  return mockUsers["user-001"];
}