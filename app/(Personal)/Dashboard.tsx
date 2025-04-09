import { useState, useRef, useEffect } from "react"
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  StyleSheet,
  Animated,
  ActivityIndicator
} from "react-native"
import { User, Calendar, Bell, Search } from "react-native-feather"
import { router } from "expo-router"
import CaseCard, { Case } from "../../components/Anaesthetist/CaseCard"
import UserMenu from "../../components/Anaesthetist/UserMenu"
import { auth, db } from "../../FirebaseConfig"
import { doc, getDoc } from "firebase/firestore"
import { fetchCases } from "../../data/caseService"

export default function DashboardScreen() {
  const [cases, setCases] = useState<Case[]>([])
  const [cancelledCases, setCancelledCases] = useState<Case[]>([])
  const [activeTab, setActiveTab] = useState<"upcoming" | "cancelled">("upcoming")
  const [isUserMenuVisible, setIsUserMenuVisible] = useState<boolean>(false)
  const [userName, setUserName] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingCases, setIsLoadingCases] = useState<boolean>(true)
  
  // Create a ref for scroll position tracking
  const scrollY = useRef(new Animated.Value(0)).current

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error("No user is logged in");
          setIsLoading(false);
          return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.name || "User");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch case data for active tab
  useEffect(() => {
    const loadCases = async () => {
      setIsLoadingCases(true);
      
      try {
        if (activeTab === "upcoming") {
          const upcomingCases = await fetchCases("upcoming");
          setCases(upcomingCases);
        } else {
          const cancelledCasesData = await fetchCases("cancelled");
          setCancelledCases(cancelledCasesData);
        }
      } catch (error) {
        console.error(`Error loading ${activeTab} cases:`, error);
      } finally {
        setIsLoadingCases(false);
      }
    };
    
    loadCases();
  }, [activeTab]);

  const handleCancelCase = (id: string) => {
    const caseToCancel = cases.find((c) => c.id === id)
    if (caseToCancel) {
      const updatedCase: Case = { ...caseToCancel, isCancelled: true }
      setCases(cases.filter((c) => c.id !== id))
      setCancelledCases([...cancelledCases, updatedCase])
    }
  }

  const handleRequestChange = (id: string) => {
    // In a real app, this would open a form or send a request
    alert(`Request to change timing for case ${id} sent to clinic.`)
  }

  const handleLogout = () => {
    // In a real app, this would handle the logout process
    alert("Logged out!")
    router.replace("/")
  }

  const toggleUserMenu = () => {
    setIsUserMenuVisible(!isUserMenuVisible)
  }

  // Group cases by date
  const groupCasesByDate = (casesToGroup: Case[]): Record<string, Case[]> => {
    const grouped: Record<string, Case[]> = {}

    casesToGroup.forEach((caseItem) => {
      const date = caseItem.date
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(caseItem)
    })

    return grouped
  }

  const groupedCases = groupCasesByDate(cases)
  const groupedCancelledCases = groupCasesByDate(cancelledCases)

  // Get today's date for the greeting
  const today = new Date()
  // Fix the DateTimeFormatOptions type
  const options: Intl.DateTimeFormatOptions = { 
    weekday: "long", 
    month: "long", 
    day: "numeric" 
  }
  const formattedDate = today.toLocaleDateString("en-US", options)

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.welcomeText}>Welcome back</Text>
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.doctorName}>{userName}</Text>
              )}
            </View>

            <View style={styles.iconRow}>
              <TouchableOpacity style={styles.iconButton}>
                <Bell width={20} height={20} stroke="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={toggleUserMenu}
              >
                <User width={20} height={20} stroke="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.scheduleTitle}>Today's Schedule</Text>
              <Text style={styles.scheduleDate}>{formattedDate}</Text>
            </View>

            <View style={styles.calendarRow}>
              <Calendar width={16} height={16} stroke="#A5B4FC" style={styles.calendarIcon} />
              <Text style={styles.caseCount}>
                {cases.filter((c) => c.date.includes("Today")).length} cases scheduled today
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search width={18} height={18} stroke="#6B7280" />
            <Text style={styles.searchPlaceholder}>Search cases...</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "upcoming" && styles.activeTabButton]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text style={[styles.tabText, activeTab === "upcoming" && styles.activeTabText]}>
              Upcoming Cases
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "cancelled" && styles.activeTabButton]}
            onPress={() => setActiveTab("cancelled")}
          >
            <View style={styles.tabButtonContent}>
              <Text
                style={[styles.tabText, activeTab === "cancelled" && styles.activeTabText]}
              >
                Cancelled Cases
              </Text>
              {cancelledCases.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cancelledCases.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isLoadingCases ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Loading cases...</Text>
            </View>
          ) : activeTab === "upcoming" ? (
            Object.keys(groupedCases).length > 0 ? (
              Object.entries(groupedCases).map(([date, dateCases]: [string, Case[]]) => (
                <View key={date} style={styles.dateGroup}>
                  <View style={styles.dateHeader}>
                    <View style={styles.dateDot} />
                    <Text style={styles.dateText}>{date}</Text>
                  </View>
                  {dateCases.map((caseItem: Case) => (
                    <CaseCard
                      key={caseItem.id}
                      caseData={caseItem}
                      onCancel={handleCancelCase}
                      onRequestChange={handleRequestChange}
                    />
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Image 
                  source={{ uri: "https://via.placeholder.com/120" }} 
                  style={styles.emptyImage} 
                />
                <Text style={styles.emptyTitle}>No upcoming cases</Text>
                <Text style={styles.emptyDescription}>
                  When you have scheduled cases, they will appear here
                </Text>
              </View>
            )
          ) : Object.keys(groupedCancelledCases).length > 0 ? (
            Object.entries(groupedCancelledCases).map(([date, dateCases]: [string, Case[]]) => (
              <View key={date} style={styles.dateGroup}>
                <View style={styles.dateHeader}>
                  <View style={styles.cancelledDateDot} />
                  <Text style={styles.dateText}>{date}</Text>
                </View>
                {dateCases.map((caseItem: Case) => (
                  <CaseCard
                    key={caseItem.id}
                    caseData={caseItem}
                    onCancel={handleCancelCase}
                    onRequestChange={handleRequestChange}
                  />
                ))}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Image 
                source={{ uri: "https://via.placeholder.com/120" }} 
                style={styles.emptyImage} 
              />
              <Text style={styles.emptyTitle}>No cancelled cases</Text>
              <Text style={styles.emptyDescription}>Cancelled cases will appear here</Text>
            </View>
          )}
          <View style={styles.spacer} />
        </View>
      </Animated.ScrollView>

      <UserMenu 
        isVisible={isUserMenuVisible} 
        onClose={() => setIsUserMenuVisible(false)} 
        onLogout={handleLogout} 
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // bg-gray-50
  },
  scrollContainer: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: "#4F46E5", // bg-indigo-600
    paddingHorizontal: 16, // px-4
    paddingTop: 16, // pt-4
    paddingBottom: 24, // pb-6
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16, // mb-4
  },
  welcomeText: {
    color: "#C7D2FE", // text-indigo-100
    fontSize: 14, // text-sm
  },
  doctorName: {
    color: "#FFFFFF", // text-white
    fontSize: 20, // text-xl
    fontWeight: "700", // font-bold
  },
  iconRow: {
    flexDirection: "row",
  },
  iconButton: {
    width: 40, // w-10
    height: 40, // h-10
    borderRadius: 20, // rounded-full
    backgroundColor: "#6366F1", // bg-indigo-500
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12, // Add space between icons
  },
  iconButton1: {
    marginRight: 12, // mr-3
  },
  scheduleCard: {
    backgroundColor: "#6366F1", // bg-indigo-500
    borderRadius: 12, // rounded-xl
    padding: 16, // p-4
    marginBottom: 8, // mb-2
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8, // mb-2
  },
  scheduleTitle: {
    color: "#FFFFFF", // text-white
    fontWeight: "500", // font-medium
  },
  scheduleDate: {
    color: "#C7D2FE", // text-indigo-200
  },
  calendarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    marginRight: 8, // mr-2
  },
  caseCount: {
    color: "#C7D2FE", // text-indigo-100
  },
  searchContainer: {
    paddingHorizontal: 16, // px-4
    paddingVertical: 12, // py-3
    backgroundColor: "#FFFFFF", // bg-white
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB", // border-gray-200
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6", // bg-gray-100
    borderRadius: 8, // rounded-lg
    paddingHorizontal: 12, // px-3
    paddingVertical: 10, // py-2.5
  },
  searchPlaceholder: {
    marginLeft: 8, // ml-2
    color: "#6B7280", // text-gray-500
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF", // bg-white
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB", // border-gray-200
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12, // py-3
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#6366F1", // border-indigo-500
  },
  tabButtonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    textAlign: "center",
    fontWeight: "500", // font-medium
    color: "#6B7280", // text-gray-500
  },
  activeTabText: {
    color: "#4F46E5", // text-indigo-600
  },
  badge: {
    marginLeft: 8, // ml-2
    backgroundColor: "#EF4444", // bg-red-500
    borderRadius: 9999, // rounded-full
    width: 20, // w-5
    height: 20, // h-5
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF", // text-white
    fontSize: 12, // text-xs
    fontWeight: "700", // font-bold
  },
  content: {
    flex: 1,
    paddingHorizontal: 16, // px-4
    paddingTop: 16, // pt-4
  },
  dateGroup: {
    marginBottom: 24, // mb-6
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12, // mb-3
  },
  dateDot: {
    width: 8, // w-2
    height: 8, // h-2
    borderRadius: 4, // rounded-full
    backgroundColor: "#6366F1", // bg-indigo-500
    marginRight: 8, // mr-2
  },
  cancelledDateDot: {
    width: 8, // w-2
    height: 8, // h-2
    borderRadius: 4, // rounded-full
    backgroundColor: "#EF4444", // bg-red-500
    marginRight: 8, // mr-2
  },
  dateText: {
    color: "#374151", // text-gray-700
    fontWeight: "600", // font-semibold
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80, // py-20
  },
  emptyImage: {
    width: 128, // w-32
    height: 128, // h-32
    marginBottom: 16, // mb-4
    opacity: 0.5,
  },
  emptyTitle: {
    color: "#374151", // text-gray-700
    fontSize: 18, // text-lg
    fontWeight: "500", // font-medium
  },
  emptyDescription: {
    color: "#6B7280", // text-gray-500
    marginTop: 4, // mt-1
    textAlign: "center",
    maxWidth: 300, // max-w-xs
  },
  spacer: {
    height: 16, // h-4
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
  },
});

