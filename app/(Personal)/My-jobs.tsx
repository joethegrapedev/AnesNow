import { useState } from "react"
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet } from "react-native"
import AvailableJobs from "../../components/Anaesthetist/My-jobs/available"
import PendingJobs from "../../components/Anaesthetist/My-jobs/pending"
import ConfirmedJobs from "../../components/Anaesthetist/My-jobs/confirmed"

type TabType = "available" | "pending" | "confirmed"

export default function MyJobsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("available")

  const renderTabContent = () => {
    switch (activeTab) {
      case "available":
        return <AvailableJobs />
      case "pending":
        return <PendingJobs />
      case "confirmed":
        return <ConfirmedJobs />
      default:
        return <AvailableJobs />
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Title Bar */}
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>My Cases</Text>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TabButton title="Available" isActive={activeTab === "available"} onPress={() => setActiveTab("available")} />
        <TabButton title="Pending" isActive={activeTab === "pending"} onPress={() => setActiveTab("pending")} />
        <TabButton title="Confirmed" isActive={activeTab === "confirmed"} onPress={() => setActiveTab("confirmed")} />
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </SafeAreaView>
  )
}

interface TabButtonProps {
  title: string
  isActive: boolean
  onPress: () => void
}

function TabButton({ title, isActive, onPress }: TabButtonProps) {
  // Determine which style to use based on tab type and active state
  const getTabStyle = () => {
    if (!isActive) return styles.tabInactive;
    
    switch (title) {
      case "Available":
        return styles.tabActiveAvailable;
      case "Pending":
        return styles.tabActivePending;
      case "Confirmed":
        return styles.tabActiveConfirmed;
      default:
        return styles.tabInactive;
    }
  };

  // Determine which text style to use based on tab type and active state
  const getTextStyle = () => {
    if (!isActive) return styles.tabTextInactive;
    
    switch (title) {
      case "Available":
        return styles.tabTextAvailable;
      case "Pending":
        return styles.tabTextPending;
      case "Confirmed":
        return styles.tabTextConfirmed;
      default:
        return styles.tabTextInactive;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.tabButton,
        getTabStyle(),
        isActive && styles.tabButtonActive
      ]}
      onPress={onPress}
    >
      <Text style={getTextStyle()}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
  },
  titleBar: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // border-gray-200
    paddingTop: 40,
    alignContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '600', // semibold
    color: '#111827', // text-gray-900
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // border-gray-200
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12, // py-3
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366F1', // border-indigo-500
  },
  tabInactive: {
    backgroundColor: 'white',
  },
  tabActiveAvailable: {
    backgroundColor: '#EEF2FF', // Light indigo
  },
  tabActivePending: {
    backgroundColor: '#FEF2F2', // Light red
  },
  tabActiveConfirmed: {
    backgroundColor: '#F0FDF4', // Light green
  },
  tabTextInactive: {
    color: '#6B7280', // text-gray-500
    fontWeight: '500', // font-medium
    textAlign: 'center',
  },
  tabTextAvailable: {
    color: '#4F46E5', // text-indigo-600
    fontWeight: '500', // font-medium
    textAlign: 'center',
  },
  tabTextPending: {
    color: '#DC2626', // text-red-600
    fontWeight: '500', // font-medium
    textAlign: 'center',
  },
  tabTextConfirmed: {
    color: '#16A34A', // text-green-600
    fontWeight: '500', // font-medium
    textAlign: 'center',
  },
});

