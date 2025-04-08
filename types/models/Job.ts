export type JobStatus = 'available' | 'pending' | 'confirmed' | 'completed';

export interface Job {
  id: string;
  date: string;
  startTime: string;
  duration: string;
  surgeryName: string;
  surgeonName: string;
  location: string;
  fee: number;
  status: JobStatus;
  isPriority?: boolean;
  remarks?: string;
}