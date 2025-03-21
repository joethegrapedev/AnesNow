export type UserRole = 'clinic' | 'anesthetist';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: UserRole;
}

export interface Clinic extends User {
  role: 'clinic';
  address: string;
  contactPhone: string;
  businessType: string; //e.g. spine clinic, plastics
}

export interface Anesthetist extends User {
  role: 'anesthetist';
  qualification: string;
  yearsOfExperience: number;
  specializations: string[];
  availability?: Availability[];
}

export interface Availability {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Job {
  id: string;
  clinicId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  compensation: number;
  requirements: string[];
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  anesthetistId?: string;
  createdAt: Date;
}

export interface JobApplication {
    id: string;
    jobId: string;
    anesthetistId: string;
    status: 'pending' | 'accepted' | 'rejected';
    appliedAt: string;
  }