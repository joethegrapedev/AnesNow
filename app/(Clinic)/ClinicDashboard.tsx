import { useState, useEffect, useCallback } from "react"
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
import { MedicalProcedure, Job, JobStatus } from "../../data/DataTypes"
import { 
  getClinicProcedures,
  getProceduresByStatus
} from "../../data/ProceduresService"
import { clearCache } from "../../data/DataService"
import { testFirebaseConnection } from "../../data/ProceduresService"
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../FirebaseConfig';

function convertProcedureToJob(procedure: MedicalProcedure): Job {
  return {
    ...procedure,
    fee: procedure.fee ?? 0,
    startTime: procedure.startTime || '',
    status: procedure.status as JobStatus || 'available',
    isVisibleToCurrentUser: true
  } as Job;
}


export default function ClinicDashboardScreen() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [procedures, setProcedures] = useState<MedicalProcedure[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchProcedures = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true)
      setError(null)
      
      if (forceRefresh) {
        clearCache();
      }
      
      let clinicProcedures: MedicalProcedure[] = [];
      
      console.log(`Fetching procedures with status filter: ${selectedStatus}`);
      
      // Map UI status to JobStatus type
      const statusMap: Record<string, JobStatus> = {
        "all": "all" as any, // special case - handled differently
        "available": "available",
        "pending": "pending",
        "accepted": "accepted",
        "confirmed": "confirmed",
        "cancelled": "cancelled"
      };
      
      // Get properly typed status from map
      const mappedStatus = statusMap[selectedStatus];
      
      try {
        if (selectedStatus !== "all") {
          console.log(`Calling getProceduresByStatus with: ${mappedStatus}`);
          clinicProcedures = await getProceduresByStatus(mappedStatus);
        } else {
          console.log('Calling getClinicProcedures');
          clinicProcedures = await getClinicProcedures();
        }
        
        console.log(`Retrieved ${clinicProcedures.length} procedures`);
        
        // Log the first procedure to help with debugging
        if (clinicProcedures.length > 0) {
          console.log('First procedure sample:', JSON.stringify({
            id: clinicProcedures[0].id,
            surgeryName: clinicProcedures[0].surgeryName,
            status: clinicProcedures[0].status
          }));
        }
        
        clinicProcedures.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        });
        
        setProcedures(clinicProcedures)
      } catch (queryError) {
        console.error("Error in specific query:", queryError);
        throw queryError;
      }
    } catch (error) {
      console.error("Error fetching procedures:", error);
      
      // Better error message
      let errorMessage = "Failed to load jobs. Please try again.";
      if (error instanceof Error) {
        errorMessage += ` (${error.message})`;
      }
      
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchProcedures()
  }, [fetchProcedures])

  useEffect(() => {
    fetchProcedures()
  }, [selectedStatus, fetchProcedures])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchProcedures(true)
    } catch (error) {
      console.error("Error refreshing procedures:", error)
    } finally {
      setRefreshing(false)
    }
  }, [fetchProcedures])

  const filteredProcedures = procedures
    .filter(proc => {
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

  const handleJobPress = (jobId: string) => {
    router.push(`/(Clinic)/job-details/${jobId}`)
  }

  const getStatusCounts = useCallback(() => {
    return {
      total: procedures.length,
      open: procedures.filter(proc => proc.status === "available").length,
      pending: procedures.filter(proc => proc.status === "pending").length,
      accepted: procedures.filter(proc => proc.status === "accepted").length,
      confirmed: procedures.filter(proc => proc.status === "confirmed").length,
      cancelled: procedures.filter(proc => proc.status === "cancelled").length,
    }
  }, [procedures])

  const statusCounts = getStatusCounts()

  const today = new Date()
  const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }
  const formattedDate = today.toLocaleDateString("en-US", options)

  const statusCategories = [
    { id: "all", label: "All", count: statusCounts.total },
    { id: "available", label: "Open", count: statusCounts.open },
    { id: "pending", label: "Pending", count: statusCounts.pending },
    { id: "accepted", label: "Accepted", count: statusCounts.accepted },
    { id: "confirmed", label: "Confirmed", count: statusCounts.confirmed },
    { id: "cancelled", label: "Cancelled", count: statusCounts.cancelled }
  ];

  const handleCreateJobPress = () => {
    router.push("/(Clinic)/CreateJobs")
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerSubtitle}>Welcome back</Text>
            <Text style={styles.headerTitle}>City General Hospital</Text>
          </View>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

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

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search width={18} height={18} stroke="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

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
              accessibilityLabel={`Filter by ${category.label} jobs`}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedStatus === category.id }}
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

      <ScrollView 
        style={styles.jobsScrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {__DEV__ && (
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={async () => {
              try {
                const testResult = await testFirebaseConnection();
                Alert.alert("Test Result", `Firebase connection test: ${testResult ? 'SUCCESS' : 'FAILED'}`);
              } catch (e) {
                Alert.alert("Error", `Test failed: ${e instanceof Error ? e.message : String(e)}`);
              }
            }}
          >
            <Text style={styles.debugButtonText}>Test Connection</Text>
          </TouchableOpacity>
        )}

        <View style={styles.jobsHeader}>
          <Text style={styles.jobsCount}>
            {filteredProcedures.length} Job{filteredProcedures.length !== 1 ? "s" : ""}
          </Text>
          <TouchableOpacity 
            style={styles.filterButton}
            accessibilityLabel="More filters"
            accessibilityRole="button"
          >
            <Filter width={16} height={16} stroke="#6B7280" style={styles.filterIcon} />
            <Text style={styles.filterText}>More Filters</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => fetchProcedures(true)}
              accessibilityLabel="Retry loading jobs"
              accessibilityRole="button"
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredProcedures.length > 0 ? (
          filteredProcedures.map((proc) => (
            <JobCard 
              key={proc.id} 
              job={convertProcedureToJob(proc)}
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
              onPress={handleCreateJobPress}
              accessibilityLabel="Create new job"
              accessibilityRole="button"
            >
              <Text style={styles.createJobButtonText}>Create New Job</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateJobPress}
        accessibilityLabel="Create new job"
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

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
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSubtitle: {
    color: '#C7D2FE',
    fontSize: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  dateText: {
    color: '#A5B4FC',
  },
  statsScrollView: {
    marginBottom: 8,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 128,
  },
  blueCard: {
    backgroundColor: '#EFF6FF',
  },
  yellowCard: {
    backgroundColor: '#FFFBEB',
  },
  greenCard: {
    backgroundColor: '#ECFDF5',
  },
  statsCardLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  statsCardValue: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '700',
  },
  blueCardLabel: {
    color: '#3B82F6',
    fontSize: 12,
    marginBottom: 4,
  },
  blueCardValue: {
    color: '#1E40AF',
    fontSize: 20,
    fontWeight: '700',
  },
  yellowCardLabel: {
    color: '#F59E0B',
    fontSize: 12,
    marginBottom: 4,
  },
  yellowCardValue: {
    color: '#92400E',
    fontSize: 20,
    fontWeight: '700',
  },
  greenCardLabel: {
    color: '#10B981',
    fontSize: 12,
    marginBottom: 4,
  },
  greenCardValue: {
    color: '#065F46',
    fontSize: 20,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#1F2937',
    fontSize: 16,
    padding: 0,
  },
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
  allButtonActive: {
    backgroundColor: '#E0E7FF',
  },
  openButtonActive: {
    backgroundColor: '#EFF6FF',
  },
  pendingButtonActive: {
    backgroundColor: '#FFFBEB',
  },
  acceptedButtonActive: {
    backgroundColor: '#F0FDF4',
  },
  confirmedButtonActive: {
    backgroundColor: '#ECFDF5',
  },
  cancelledButtonActive: {
    backgroundColor: '#FEF2F2',
  },
  allTextActive: {
    color: '#4338CA',
  },
  openTextActive: {
    color: '#1D4ED8',
  },
  pendingTextActive: {
    color: '#B45309',
  },
  acceptedTextActive: {
    color: '#047857',
  },
  confirmedTextActive: {
    color: '#047857',
  },
  cancelledTextActive: {
    color: '#B91C1C',
  },
  jobsScrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  jobsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  jobsCount: {
    color: '#1F2937',
    fontWeight: '600',
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
    marginRight: 4,
  },
  filterText: {
    color: '#4B5563',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateTitle: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '500',
  },
  emptyStateDescription: {
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 300,
  },
  createJobButton: {
    marginTop: 24,
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createJobButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 16,
  },
  loader: {
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#4F46E5',
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 30,
    color: 'white'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  errorText: {
    color: '#B91C1C',
    marginBottom: 16,
    textAlign: 'center'
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  debugButton: {
    backgroundColor: '#4F46E5',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  debugButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
