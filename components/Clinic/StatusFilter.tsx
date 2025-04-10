import { Text, TouchableOpacity, ScrollView, StyleSheet, View } from "react-native"

type StatusFilterProps = {
  selectedStatus: string
  onStatusChange: (status: string) => void
}

export default function StatusFilter({ selectedStatus, onStatusChange }: StatusFilterProps) {
  const statuses = [
    { id: "all", label: "All Jobs" },
    { id: "available", label: "Open" },  // Changed "open" to "available" to match JobStatus type
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "completed", label: "Completed" },  // Changed "accepted" to "completed" to match JobStatus
    { id: "cancelled", label: "Cancelled" },  // This may need adjustment based on your actual status types
  ]

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
    >
      {statuses.map((status) => (
        <TouchableOpacity
          key={status.id}
          onPress={() => onStatusChange(status.id)}
          style={[
            styles.filterButton,
            selectedStatus === status.id ? styles.selectedButton : styles.unselectedButton
          ]}
        >
          <Text 
            style={[
              styles.filterText,
              selectedStatus === status.id ? styles.selectedText : styles.unselectedText
            ]}
          >
            {status.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',  // gray-200
  },
  scrollViewContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,  // rounded-full
  },
  selectedButton: {
    backgroundColor: '#EEF2FF',  // indigo-100
  },
  unselectedButton: {
    backgroundColor: '#F3F4F6',  // gray-100
  },
  filterText: {
    fontWeight: '500',  // font-medium
  },
  selectedText: {
    color: '#4338CA',  // indigo-700
  },
  unselectedText: {
    color: '#4B5563',  // gray-600
  }
});
