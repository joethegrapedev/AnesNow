import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { JobStatus, MedicalProcedure, UserData } from '../../../data/mockData'
import { MapPin, Clock, DollarSign, Calendar, User, FileText, X, Check } from 'react-native-feather'
import AnaesthetistCard from '../../../components/Clinic/AnaesthetistCard'
import { 
  getProcedureById, 
  confirmAnaesthetist, 
  cancelProcedure 
} from '../../../data/ProceduresService'
import { db } from '../../../FirebaseConfig'
import { collection, getDocs, query, where } from 'firebase/firestore'

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [job, setJob] = useState<MedicalProcedure | null>(null)
  const [loading, setLoading] = useState(true)
  const [applicants, setApplicants] = useState<UserData[]>([])
  const [preferredAnaesthetists, setPreferredAnaesthetists] = useState<UserData[]>([])

  // Fetch job data on component mount
  useEffect(() => {
    fetchJobData()
  }, [id])

  // Fetch anaesthetists data when job changes
  useEffect(() => {
    if (job) {
      fetchAnaesthetists()
    }
  }, [job])

  const fetchJobData = async () => {
    if (!id) return

    try {
      setLoading(true)
      const jobData = await getProcedureById(id)
      
      if (jobData) {
        setJob(jobData)
      }
    } catch (error) {
      console.error("Error fetching job:", error)
      Alert.alert("Error", "Failed to load job details")
    } finally {
      setLoading(false)
    }
  }

  const fetchAnaesthetists = async () => {
    if (!job) return

    try {
      // Fetch accepted anaesthetists (applicants)
      if (job.acceptedBy && job.acceptedBy.length > 0) {
        const applicantsQuery = query(
          collection(db, "users"),
          where("uid", "in", job.acceptedBy)
        )
        
        const applicantsSnapshot = await getDocs(applicantsQuery)
        const applicantsList = applicantsSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as UserData[]
        
        setApplicants(applicantsList)
      } else {
        setApplicants([])
      }

      // Fetch preferred anaesthetists
      if (job.preferredAnaesthetists && job.preferredAnaesthetists.length > 0) {
        const preferredQuery = query(
          collection(db, "users"),
          where("uid", "in", job.preferredAnaesthetists)
        )
        
        const preferredSnapshot = await getDocs(preferredQuery)
        const preferredList = preferredSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as UserData[]
        
        setPreferredAnaesthetists(preferredList)
      } else {
        setPreferredAnaesthetists([])
      }
    } catch (error) {
      console.error("Error fetching anaesthetists:", error)
    }
  }

  const handleConfirmAnaesthetist = async (anaesthetistId: string) => {
    if (!id) return
    
    Alert.alert(
      "Confirm Anaesthetist",
      "Are you sure you want to confirm this anaesthetist for the job?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setLoading(true)
              await confirmAnaesthetist(id, anaesthetistId)
              await fetchJobData() // Refresh job data
              Alert.alert("Success", "Anaesthetist confirmed successfully!")
            } catch (error) {
              console.error("Error confirming anaesthetist:", error)
              Alert.alert("Error", "Failed to confirm anaesthetist")
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const handleCancelJob = async () => {
    if (!id) return
    
    Alert.alert(
      "Cancel Job",
      "Are you sure you want to cancel this job?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel Job",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true)
              await cancelProcedure(id)
              await fetchJobData() // Refresh job data
              Alert.alert("Success", "Job cancelled successfully!")
            } catch (error) {
              console.error("Error cancelling job:", error)
              Alert.alert("Error", "Failed to cancel job")
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    )
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFoundText}>Job not found</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Keep your existing UI rendering code */}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    color: '#6B7280', // text-gray-500
  },
  // Add other styles as needed
})
