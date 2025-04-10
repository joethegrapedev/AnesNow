import { useState, useEffect } from "react"
import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native"
import JobCard from "../JobCard"
import { Job, MedicalProcedure, JobStatus } from "../../../data/mockData"
import { getAnaesthetistVisibleProcedures, acceptProcedure } from "../../../data/ProceduresService"

// Improved converter function with proper type handling
const convertToJob = (procedure: MedicalProcedure): Job => {
  return {
    ...procedure,
    fee: procedure.fee ?? 0, // Default for fee
    status: (procedure.status as JobStatus) ?? "available", // Cast and provide default
    // Add any other required fields from Job type that might be missing in MedicalProcedure
  };
};

export default function AvailableJobs() {
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([]) // Change back to Job[]

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const procedures = await getAnaesthetistVisibleProcedures()
      
      // Convert each procedure to a Job
      const jobsData = procedures.map(convertToJob)
      setJobs(jobsData)
    } catch (error) {
      console.error("Error fetching available jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchJobs()
    setRefreshing(false)
  }

  // Enhanced sorting logic to prioritize sequential jobs with deadlines
  const sortedJobs = [...jobs].sort((a, b) => {
    // First, prioritize sequential jobs
    if (a.visibilityMode === 'sequential' && b.visibilityMode !== 'sequential') return -1;
    if (a.visibilityMode !== 'sequential' && b.visibilityMode === 'sequential') return 1;
    
    // Then sort by priority
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    
    // If both are sequential, sort by deadline (sooner deadlines first)
    if (a.visibilityMode === 'sequential' && b.visibilityMode === 'sequential') {
      if (a.sequentialOfferDeadline && b.sequentialOfferDeadline) {
        return new Date(a.sequentialOfferDeadline).getTime() - new Date(b.sequentialOfferDeadline).getTime();
      }
    }
    
    return 0;
  });

  const handleAcceptJob = async (jobId: string) => {
    try {
      setLoading(true)
      await acceptProcedure(jobId)
      // Remove accepted job from available jobs
      setJobs(jobs.filter(job => job.id !== jobId))
      alert(`Job accepted! Waiting for clinic confirmation.`)
    } catch (error) {
      console.error("Error accepting job:", error)
      alert("Failed to accept job. Please try again.")
    } finally {
      setLoading(false)
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading available jobs...</Text>
        ) : sortedJobs.length > 0 ? (
          <>
            {sortedJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job}
                onAccept={() => handleAcceptJob(job.id)}
                onViewDetails={() => {}}
              />
            ))}
            <View style={styles.spacer} />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No available jobs</Text>
            <Text style={styles.emptyDescription}>Check back later for new opportunities</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // gray-50 equivalent
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  spacer: {
    height: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#6B7280', // gray-500 equivalent
    fontSize: 18,
  },
  emptyDescription: {
    color: '#6B7280', // gray-500 equivalent
    fontSize: 14,
    marginTop: 8,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6B7280',
  }
})

