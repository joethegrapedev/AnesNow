import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native"
import { useState } from "react"
import JobCard, { Job, JobStatus } from "../JobCard"
import { mockConfirmedJobs } from "../../../data/mockData" // Import from centralized data file



export default function ConfirmedJobs() {
  const [refreshing, setRefreshing] = useState(false)
  const [jobs, setJobs] = useState(mockConfirmedJobs)

  const onRefresh = () => {
    setRefreshing(true)
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {jobs.length > 0 ? (
          <>
            {jobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job}
                onViewDetails={() => {}}
              />
            ))}
            <View style={styles.spacer} />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No confirmed jobs</Text>
            <Text style={styles.emptyDescription}>Confirmed jobs will appear here</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // gray-50
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
    color: '#6B7280', // gray-500
    fontSize: 18,
  },
  emptyDescription: {
    color: '#9CA3AF', // gray-400
    marginTop: 8,
  }
});

