import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { MapPin, Clock, DollarSign, Calendar, User, FileText, X, Check } from 'react-native-feather'
import AnaesthetistCard from '../../../components/Clinic/AnaesthetistCard'
import { 
  getProcedureById, 
  confirmAnaesthetist, 
  cancelProcedure,
  convertFirestoreDocToMedicalProcedure // Import the converter
} from '../../../data/ProceduresService'
import { db, auth } from '../../../FirebaseConfig'
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc // Added for direct document fetching
} from 'firebase/firestore'
import { JobStatus, MedicalProcedure, UserData } from '../../../data/DataTypes'

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [job, setJob] = useState<MedicalProcedure | null>(null)
  const [loading, setLoading] = useState(true)
  const [applicants, setApplicants] = useState<UserData[]>([])
  const [preferredAnaesthetists, setPreferredAnaesthetists] = useState<UserData[]>([])
  const [refreshKey, setRefreshKey] = useState(0) // Added for forcing refresh

  // Fetch job data on component mount or when refresh is triggered
  useEffect(() => {
    fetchJobData()
  }, [id, refreshKey])

  // Fetch anaesthetists data when job changes
  useEffect(() => {
    if (job) {
      fetchAnaesthetists()
    }
  }, [job])

  // Function to refresh all data
  const refreshData = () => {
    setRefreshKey(prev => prev + 1)
  }

  const fetchJobData = async () => {
    if (!id) return

    try {
      setLoading(true)
      const jobData = await getProcedureById(id)
      
      if (jobData) {
        console.log("Job data fetched:", jobData.id)
        setJob(jobData)
      } else {
        console.warn("No job data returned for ID:", id)
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
      // Batch fetch users for better performance
      const userIds = new Set<string>()
      
      // Add all accepted anaesthetists
      if (job.acceptedBy && job.acceptedBy.length > 0) {
        job.acceptedBy.forEach(uid => userIds.add(uid))
      }
      
      // Add all preferred anaesthetists
      if (job.preferredAnaesthetists && job.preferredAnaesthetists.length > 0) {
        job.preferredAnaesthetists.forEach(uid => userIds.add(uid))
      }
      
      if (userIds.size === 0) {
        setApplicants([])
        setPreferredAnaesthetists([])
        return
      }
      
      // Convert Set to Array for the 'in' query
      const userIdsArray = Array.from(userIds)
      
      // Fetch all users in one query (firestore limits 'in' queries to 10 items)
      const fetchedUsers: Record<string, UserData> = {}
      
      // Split into batches of 10 if needed
      const batchSize = 10
      for (let i = 0; i < userIdsArray.length; i += batchSize) {
        const batch = userIdsArray.slice(i, i + batchSize)
        
        const usersQuery = query(
          collection(db, "users"),
          where("uid", "in", batch)
        )
        
        const usersSnapshot = await getDocs(usersQuery)
        
        usersSnapshot.docs.forEach(doc => {
          const userData = {
            uid: doc.id,
            ...doc.data()
          } as UserData
          
          fetchedUsers[userData.uid] = userData
        })
      }
      
      // Filter for applicants and preferred
      if (job.acceptedBy && job.acceptedBy.length > 0) {
        const applicantsList = job.acceptedBy
          .map(uid => fetchedUsers[uid])
          .filter(Boolean) // Remove any undefined entries
        
        setApplicants(applicantsList)
      }
      
      if (job.preferredAnaesthetists && job.preferredAnaesthetists.length > 0) {
        const preferredList = job.preferredAnaesthetists
          .map(uid => fetchedUsers[uid])
          .filter(Boolean) // Remove any undefined entries
        
        setPreferredAnaesthetists(preferredList)
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
              
              // Navigate back to dashboard after successful cancellation
              setTimeout(() => {
                router.back() // Go back to previous screen
              }, 1500)
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

  // Render the job details UI
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Job details section */}
        <View style={styles.jobDetailCard}>
          <Text style={styles.surgeryName}>{job.surgeryName}</Text>
          
          <View style={styles.detailRow}>
            <Calendar width={18} height={18} stroke="#6B7280" style={styles.icon} />
            <Text style={styles.detailText}>{job.date}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Clock width={18} height={18} stroke="#6B7280" style={styles.icon} />
            <Text style={styles.detailText}>{job.startTime} · {job.duration}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin width={18} height={18} stroke="#6B7280" style={styles.icon} />
            <Text style={styles.detailText}>{job.location}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <User width={18} height={18} stroke="#6B7280" style={styles.icon} />
            <Text style={styles.detailText}>{job.surgeonName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <DollarSign width={18} height={18} stroke="#6B7280" style={styles.icon} />
            <Text style={styles.detailText}>${job.fee?.toLocaleString() || "0"}</Text>
          </View>
          
          {job.remarks && (
            <View style={styles.remarksContainer}>
              <View style={styles.detailRow}>
                <FileText width={18} height={18} stroke="#6B7280" style={styles.icon} />
                <Text style={styles.detailText}>Remarks</Text>
              </View>
              <Text style={styles.remarks}>{job.remarks}</Text>
            </View>
          )}
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <View style={[styles.statusBadge, getStatusBadgeStyle(job.status as JobStatus)]}>
              <Text style={[styles.statusText, getStatusTextStyle(job.status as JobStatus)]}>
                {getStatusText(job.status as JobStatus)}
              </Text>
            </View>
          </View>

          {/* Cancel Job Button - only show for available or pending jobs */}
          {(job.status === "available" || job.status === "pending") && (
            <TouchableOpacity style={styles.cancelJobButton} onPress={handleCancelJob}>
              <X width={16} height={16} stroke="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.cancelButtonText}>Cancel Job</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Applicants section - show if there are applicants and job is not confirmed */}
        {applicants.length > 0 && job.status !== "confirmed" && job.status !== "cancelled" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Applicants</Text>
            {applicants.map(anaesthetist => (
              <AnaesthetistCard
                key={anaesthetist.uid}
                anaesthetist={anaesthetist}
                showActions={true}
                actionButton={
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => handleConfirmAnaesthetist(anaesthetist.uid)}
                  >
                    <Check width={16} height={16} stroke="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                }
              />
            ))}
          </View>
        )}

        {/* Confirmed Anaesthetist section - show if job is confirmed */}
        {job.status === "confirmed" && job.confirmedAnaesthetistId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confirmed Anaesthetist</Text>
            {applicants
              .filter(a => a.uid === job.confirmedAnaesthetistId)
              .map(anaesthetist => (
                <AnaesthetistCard
                  key={anaesthetist.uid}
                  anaesthetist={anaesthetist}
                  isConfirmed={true}
                />
              ))}
          </View>
        )}

        {/* Preferred Anaesthetists section */}
        {preferredAnaesthetists.length > 0 && job.visibilityMode !== "all" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferred Anaesthetists</Text>
            {preferredAnaesthetists.map(anaesthetist => (
              <AnaesthetistCard
                key={anaesthetist.uid}
                anaesthetist={anaesthetist}
                isPreferred={true}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to get status badge style
const getStatusBadgeStyle = (status: JobStatus) => {
  switch (status) {
    case 'available': return { backgroundColor: '#F3F4F6' }; // Gray
    case 'pending': return { backgroundColor: '#FEF3C7' }; // Yellow
    case 'confirmed': return { backgroundColor: '#D1FAE5' }; // Green
    case 'cancelled': return { backgroundColor: '#FEE2E2' }; // Red
    default: return { backgroundColor: '#F3F4F6' }; // Gray default
  }
};

// Helper function to get status text style
const getStatusTextStyle = (status: JobStatus) => {
  switch (status) {
    case 'available': return { color: '#4B5563' }; // Gray text
    case 'pending': return { color: '#92400E' }; // Yellow text
    case 'confirmed': return { color: '#047857' }; // Green text
    case 'cancelled': return { color: '#B91C1C' }; // Red text
    default: return { color: '#4B5563' }; // Gray default
  }
};

// Helper function to get status text
const getStatusText = (status: JobStatus): string => {
  switch (status) {
    case 'available': return 'Open';
    case 'pending': return 'Pending';
    case 'confirmed': return 'Confirmed';
    case 'cancelled': return 'Cancelled';
    default: return 'Unknown';
  }
};

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
  scrollContainer: {
    padding: 16,
  },
  jobDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  surgeryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
  },
  remarksContainer: {
    marginTop: 16,
  },
  remarks: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cancelJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B91C1C',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#047857',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
})
