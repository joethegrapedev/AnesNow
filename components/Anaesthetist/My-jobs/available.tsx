import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native"
import { useState } from "react"
import JobCard, { Job, JobStatus } from "../JobCard"
import { mockAvailableJobs, getJobsByStatus } from "../../../data/mockData" // Import from centralized data file

export default function AvailableJobs() {
  const [refreshing, setRefreshing] = useState(false)
  const [jobs, setJobs] = useState(mockAvailableJobs)

  const onRefresh = () => {
    setRefreshing(true)
    // Simulate a refresh - in a real app, this would fetch fresh data
    setTimeout(() => {
      // Here you could use getJobsByStatus to simulate a new API call
      const freshJobs = getJobsByStatus("available");
      setJobs(freshJobs);
      setRefreshing(false)
    }, 1000)
  }

  // Sort jobs to show priority jobs first
  const sortedJobs = [...jobs].sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1
    if (!a.isPriority && b.isPriority) return 1
    return 0
  })

  const handleAcceptJob = (jobId: string) => {
    alert(`Job ${jobId} accepted! Waiting for clinic confirmation.`)
    // In a real app, this would call an API to accept the job
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {sortedJobs.length > 0 ? (
          <>
            {sortedJobs.map((job: Job) => (
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
            <Text style={styles.emptyText}>No available jobs found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
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
  }
});

