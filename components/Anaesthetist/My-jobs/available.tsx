import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native"
import { useState } from "react"
import JobCard from "../JobCard"
import { mockAvailableJobs, getJobsByStatus, JobStatus, Job } from "../../../data/mockData" // Import types from mockData

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

  const handleAcceptJob = (jobId: string) => {
    alert(`Job ${jobId} accepted! Waiting for clinic confirmation.`);
    // In a real app, this would call an API to accept the job
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {sortedJobs.length > 0 ? (
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
  }
});

