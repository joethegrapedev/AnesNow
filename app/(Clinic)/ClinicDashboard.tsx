import { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert
} from "react-native"
import { Calendar, Search, Filter } from "react-native-feather"
import { router } from "expo-router"
import JobCard from "../../components/Clinic/ClinicJobCard"
import { MedicalProcedure, Job } from "../../data/mockData" // Make sure to import Job type
import { 
  getClinicProcedures,
  getProceduresByStatus 
} from "../../data/ProceduresService"

// Add this conversion function to handle the type differences
function convertProcedureToJob(procedure: MedicalProcedure): Job {
  return {
    ...procedure,
    fee: procedure.fee ?? 0, // Provide default for optional fee
    // Add defaults for any other required fields in the Job type
  } as Job;
}

export default function ClinicDashboardScreen() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [procedures, setProcedures] = useState<MedicalProcedure[]>([])

  // Fetch procedures on component mount
  useEffect(() => {
    fetchProcedures()
  }, [])

  const fetchProcedures = async () => {
    try {
      setLoading(true)
      const clinicProcedures = await getClinicProcedures()
      setProcedures(clinicProcedures)
    } catch (error) {
      console.error("Error fetching procedures:", error)
      Alert.alert("Error", "Failed to load jobs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchProcedures()
    } catch (error) {
      console.error("Error refreshing procedures:", error)
    } finally {
      setRefreshing(false)
    }
  }

  // Search functionality
  const handleSearch = (text: string) => {
    setSearchQuery(text)
  }

  // Apply search filter and status filter
  const filteredProcedures = procedures
    .filter(proc => {
      // First apply search filter if query exists
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          proc.surgeryName?.toLowerCase().includes(query) ||
          proc.surgeonName?.toLowerCase().includes(query) ||
          proc.location?.toLowerCase().includes(query)
        )
      }
      return true
    })
    .filter(proc => {
      // Then apply status filter
      return selectedStatus === "all" ? true : proc.status === selectedStatus
    })

  const handleJobPress = (jobId: string) => {
    router.push(`/(Clinic)/job-details/${jobId}`)
  }

  // Get counts for dashboard stats
  const getStatusCounts = () => {
    const counts = {
      total: procedures.length,
      open: procedures.filter(proc => proc.status === "available").length,
      pending: procedures.filter(proc => proc.status === "pending").length,
      accepted: procedures.filter(proc => proc.status === "accepted").length,
      confirmed: procedures.filter(proc => proc.status === "confirmed").length,
      cancelled: procedures.filter(proc => proc.status === "cancelled").length,
    }

    return counts
  }

  const statusCounts = getStatusCounts()

  // Get today's date for the greeting
  const today = new Date()
  const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }
  const formattedDate = today.toLocaleDateString("en-US", options)

  // Define status categories for filter buttons
  const statusCategories = [
    { id: "all", label: "All", count: statusCounts.total },
    { id: "available", label: "Open", count: statusCounts.open },
    { id: "pending", label: "Pending", count: statusCounts.pending },
    { id: "accepted", label: "Accepted", count: statusCounts.accepted },
    { id: "confirmed", label: "Confirmed", count: statusCounts.confirmed },
    { id: "cancelled", label: "Cancelled", count: statusCounts.cancelled }
  ];

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
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Enhanced Status Filter - Square Buttons */}
      <View style={styles.statusFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.statusButton,
                selectedStatus === category.id && getStatusButtonStyle(category.id)
              ]}
              onPress={() => setSelectedStatus(category.id)}
            >
              <Text 
                style={[
                  styles.statusButtonText,
                  selectedStatus === category.id && getStatusTextStyle(category.id)
                ]}
              >
                {category.label}
              </Text>
              <Text 
                style={[
                  styles.statusButtonCount,
                  selectedStatus === category.id && getStatusTextStyle(category.id)
                ]}
              >
                {category.count}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Job List */}
      <ScrollView 
        style={styles.jobsScrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.jobsHeader}>
          <Text style={styles.jobsCount}>
            {filteredProcedures.length} Job{filteredProcedures.length !== 1 ? "s" : ""}
          </Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter width={16} height={16} stroke="#6B7280" style={styles.filterIcon} />
            <Text style={styles.filterText}>More Filters</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
        ) : filteredProcedures.length > 0 ? (
          filteredProcedures.map((proc) => (
            <JobCard 
              key={proc.id} 
              job={convertProcedureToJob(proc)} // Convert the type here
              onPress={() => handleJobPress(proc.id)} 
              showApplicationCount={true} 
            />
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Calendar width={48} height={48} stroke="#9CA3AF" style={styles.emptyStateIcon} />
            <Text style={styles.emptyStateTitle}>No jobs found</Text>
            <Text style={styles.emptyStateDescription}>
              {selectedStatus === "all"
                ? searchQuery 
                  ? "No jobs match your search" 
                  : "You haven't posted any jobs yet"
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

// Helper function to get button style based on status
function getStatusButtonStyle(status: string): any {
  switch (status) {
    case "all": return styles.allButtonActive;
    case "available": return styles.openButtonActive;
    case "pending": return styles.pendingButtonActive;
    case "accepted": return styles.acceptedButtonActive;
    case "confirmed": return styles.confirmedButtonActive;
    case "cancelled": return styles.cancelledButtonActive;
    default: return styles.allButtonActive;
  }
}

// Helper function to get text style based on status
function getStatusTextStyle(status: string): any {
  switch (status) {
    case "all": return styles.allTextActive;
    case "available": return styles.openTextActive;
    case "pending": return styles.pendingTextActive;
    case "accepted": return styles.acceptedTextActive;
    case "confirmed": return styles.confirmedTextActive;
    case "cancelled": return styles.cancelledTextActive;
    default: return styles.allTextActive;
  }
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
  searchInput: {
    flex: 1,
    marginLeft: 8, // ml-2
    color: '#1F2937', // text-gray-800
    fontSize: 16,
    padding: 0, // Remove default padding
  },
  searchPlaceholder: {
    marginLeft: 8, // ml-2
    color: '#6B7280', // text-gray-500
  },
  // New Status Filter Styles
  statusFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusButton: {
    width: 90,
    height: 76,
    marginLeft: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  statusButtonText: {
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 14,
  },
  statusButtonCount: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 18,
    marginTop: 4,
  },
  // Active button styles
  allButtonActive: {
    backgroundColor: '#E0E7FF', // indigo-100
  },
  openButtonActive: {
    backgroundColor: '#EFF6FF', // blue-50
  },
  pendingButtonActive: {
    backgroundColor: '#FFFBEB', // yellow-50
  },
  acceptedButtonActive: {
    backgroundColor: '#F0FDF4', // green-50
  },
  confirmedButtonActive: {
    backgroundColor: '#ECFDF5', // green-100
  },
  cancelledButtonActive: {
    backgroundColor: '#FEF2F2', // red-50
  },
  // Active text styles
  allTextActive: {
    color: '#4338CA', // indigo-700
  },
  openTextActive: {
    color: '#1D4ED8', // blue-700
  },
  pendingTextActive: {
    color: '#B45309', // yellow-700
  },
  acceptedTextActive: {
    color: '#047857', // green-700
  },
  confirmedTextActive: {
    color: '#047857', // green-700
  },
  cancelledTextActive: {
    color: '#B91C1C', // red-700
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
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
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
  loader: {
    marginTop: 40,
  },
});
