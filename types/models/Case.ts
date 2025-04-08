export interface Case {
  id: string
  date: string
  time: string
  duration: string
  location: string
  surgeonName: string
  surgeryName: string
  remarks?: string
  isCancelled?: boolean
}