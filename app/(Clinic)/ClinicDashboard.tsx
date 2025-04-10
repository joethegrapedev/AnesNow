import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native"
import { Calendar, Search, Filter } from "react-native-feather"
import { router } from "expo-router"
import JobCard from "../../components/Clinic/ClinicJobCard"
import StatusFilter from "../../components/Clinic/StatusFilter"
import { getJobsByStatus } from "../../data/mockData"  // Import this helper function instead

export default function ClinicDashboardScreen() {
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Get jobs using the helper function
  const allJobs = getJobsByStatus("available")
    .concat(getJobsByStatus("pending"))
    .concat(getJobsByStatus("confirmed"))
    .concat(getJobsByStatus("completed"));

  // Filter jobs based on selected status
  const filteredJobs = selectedStatus === "all" 
    ? allJobs 
    : allJobs.filter(job => job.status === selectedStatus);

  const handleJobPress = (jobId: string) => {
    router.push(`/(Clinic)/job-details/${jobId}`)
  }

  // Get counts for dashboard stats
  const getStatusCounts = () => {
    const counts = {
      total: allJobs.length,
      open: allJobs.filter(job => job.status === "available").length,
      pending: allJobs.filter(job => job.status === "pending").length,
      accepted: allJobs.filter(job => job.status === "accepted").length,
      confirmed: allJobs.filter(job => job.status === "confirmed").length,
      cancelled: allJobs.filter(job => job.status === "cancelled").length,
    }

    return counts
  }

  const statusCounts = getStatusCounts()

  // Get today's date for the greeting
  const today = new Date()
  const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }
  const formattedDate = today.toLocaleDateString("en-US", options)

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerSubtitle}>Welcome back</Text>
            <Text style={styles.headerTitle}>City General Hospital</Text>
          </View>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        {/* Stats Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.statsScrollView}
        >
          <View style={styles.statsCard}>
            <Text style={styles.statsCardLabel}>Total Jobs</Text>
            <Text style={styles.statsCardValue}>{statusCounts.total}</Text>
          </View>

          <View style={[styles.statsCard, styles.blueCard]}>
            <Text style={styles.blueCardLabel}>Open</Text>
            <Text style={styles.blueCardValue}>{statusCounts.open}</Text>
          </View>

          <View style={[styles.statsCard, styles.yellowCard]}>
            <Text style={styles.yellowCardLabel}>Pending</Text>
            <Text style={styles.yellowCardValue}>{statusCounts.pending}</Text>
          </View>

          <View style={[styles.statsCard, styles.greenCard]}>
            <Text style={styles.greenCardLabel}>Confirmed</Text>
            <Text style={styles.greenCardValue}>{statusCounts.confirmed}</Text>
          </View>
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search width={18} height={18} stroke="#6B7280" />
          <Text style={styles.searchPlaceholder}>Search jobs...</Text>
        </View>
      </View>

      {/* Status Filter */}
      <StatusFilter selectedStatus={selectedStatus} onStatusChange={setSelectedStatus} />

      {/* Job List */}
      <ScrollView style={styles.jobsScrollView}>
        <View style={styles.jobsHeader}>
          <Text style={styles.jobsCount}>
            {filteredJobs.length} Job{filteredJobs.length !== 1 ? "s" : ""}
          </Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter width={16} height={16} stroke="#6B7280" style={styles.filterIcon} />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onPress={handleJobPress} 
              showApplicationCount={true} 
            />
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Calendar width={48} height={48} stroke="#9CA3AF" style={styles.emptyStateIcon} />
            <Text style={styles.emptyStateTitle}>No jobs found</Text>
            <Text style={styles.emptyStateDescription}>
              {selectedStatus === "all"
                ? "You haven't posted any jobs yet"
                : `You don't have any ${selectedStatus} jobs`}
            </Text>
            <TouchableOpacity
              style={styles.createJobButton}
              onPress={() => router.push("/(Clinic)/CreateJobs")}
            >
              <Text style={styles.createJobButtonText}>Create New Job</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
  },
  header: {
    backgroundColor: '#4F46E5', // bg-indigo-600
    paddingHorizontal: 16, // px-4
    paddingTop: 16, // pt-4
    paddingBottom: 24, // pb-6
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16, // mb-4
  },
  headerSubtitle: {
    color: '#C7D2FE', // text-indigo-100
    fontSize: 14, // text-sm
  },
  headerTitle: {
    color: '#FFFFFF', // text-white
    fontSize: 20, // text-xl
    fontWeight: '700', // font-bold
  },
  dateText: {
    color: '#A5B4FC', // text-indigo-200
  },
  statsScrollView: {
    marginBottom: 8, // mb-2
  },
  statsCard: {
    backgroundColor: '#FFFFFF', // bg-white
    borderRadius: 12, // rounded-xl
    padding: 12, // p-3
    marginRight: 12, // mr-3
    width: 128, // w-32
  },
  blueCard: {
    backgroundColor: '#EFF6FF', // bg-blue-50
  },
  yellowCard: {
    backgroundColor: '#FFFBEB', // bg-yellow-50
  },
  greenCard: {
    backgroundColor: '#ECFDF5', // bg-green-50
  },
  statsCardLabel: {
    color: '#6B7280', // text-gray-500
    fontSize: 12, // text-xs
    marginBottom: 4, // mb-1
  },
  statsCardValue: {
    color: '#1F2937', // text-gray-800
    fontSize: 20, // text-xl
    fontWeight: '700', // font-bold
  },
  blueCardLabel: {
    color: '#3B82F6', // text-blue-500
    fontSize: 12, // text-xs
    marginBottom: 4, // mb-1
  },
  blueCardValue: {
    color: '#1E40AF', // text-blue-800
    fontSize: 20, // text-xl
    fontWeight: '700', // font-bold
  },
  yellowCardLabel: {
    color: '#F59E0B', // text-yellow-500
    fontSize: 12, // text-xs
    marginBottom: 4, // mb-1
  },
  yellowCardValue: {
    color: '#92400E', // text-yellow-800
    fontSize: 20, // text-xl
    fontWeight: '700', // font-bold
  },
  greenCardLabel: {
    color: '#10B981', // text-green-500
    fontSize: 12, // text-xs
    marginBottom: 4, // mb-1
  },
  greenCardValue: {
    color: '#065F46', // text-green-800
    fontSize: 20, // text-xl
    fontWeight: '700', // font-bold
  },
  searchContainer: {
    paddingHorizontal: 16, // px-4
    paddingVertical: 12, // py-3
    backgroundColor: '#FFFFFF', // bg-white
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // border-b border-gray-200
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // bg-gray-100
    borderRadius: 8, // rounded-lg
    paddingHorizontal: 12, // px-3
    paddingVertical: 10, // py-2.5
  },
  searchPlaceholder: {
    marginLeft: 8, // ml-2
    color: '#6B7280', // text-gray-500
  },
  jobsScrollView: {
    flex: 1,
    paddingHorizontal: 16, // px-4
    paddingTop: 16, // pt-4
  },
  jobsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16, // mb-4
  },
  jobsCount: {
    color: '#1F2937', // text-gray-800
    fontWeight: '600', // font-semibold
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIcon: {
    marginRight: 4, // mr-1
  },
  filterText: {
    color: '#4B5563', // text-gray-600
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80, // py-20
  },
  emptyStateIcon: {
    marginBottom: 16, // mb-4
    opacity: 0.5,
  },
  emptyStateTitle: {
    color: '#374151', // text-gray-700
    fontSize: 18, // text-lg
    fontWeight: '500', // font-medium
  },
  emptyStateDescription: {
    color: '#6B7280', // text-gray-500
    marginTop: 4, // mt-1
    textAlign: 'center',
    maxWidth: 300, // max-w-xs
  },
  createJobButton: {
    marginTop: 24, // mt-6
    backgroundColor: '#6366F1', // bg-indigo-500
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2
    borderRadius: 8, // rounded-lg
  },
  createJobButtonText: {
    color: '#FFFFFF', // text-white
    fontWeight: '500', // font-medium
  },
  bottomSpacer: {
    height: 16, // h-4
  },
});
