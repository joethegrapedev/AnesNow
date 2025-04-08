export interface User {
  name: string
  email: string
  phone: string
  role: "anaesthetist" | "clinic"
  profileImage: string
  bio?: string
  createdAt: Date
  updatedAt?: Date
  isProfileComplete: boolean
}