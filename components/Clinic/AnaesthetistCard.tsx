import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native"
import { Star, Check, X } from "react-native-feather"
import type { UserData } from "../../data/mockData"

type AnaesthetistCardProps = {
  anaesthetist: UserData
  isPreferred?: boolean
  onSelect?: () => void
  onRemove?: () => void
  showActions?: boolean
}

export default function AnaesthetistCard({
  anaesthetist,
  isPreferred = false,
  onSelect,
  onRemove,
  showActions = true,
}: AnaesthetistCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.rowContainer}>
        {/* Profile Image */}
        <Image
          source={{ uri: anaesthetist.profileImage || "https://via.placeholder.com/60" }}
          style={styles.profileImage}
        />

        {/* Info */}
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.name}>{anaesthetist.name}</Text>
              <Text style={styles.specialization}>{anaesthetist.specialization || "General Anaesthetist"}</Text>
            </View>

            {isPreferred && (
              <View style={styles.preferredBadge}>
                <Text style={styles.preferredText}>Preferred</Text>
              </View>
            )}
          </View>

          {/* Experience and Rating */}
          <View style={styles.statsRow}>
            <Text style={styles.experienceText}>{anaesthetist.experience || "5+ years"}</Text>
            <View style={styles.ratingContainer}>
              <Star width={14} height={14} fill="#FBBF24" stroke="#FBBF24" />
              <Text style={styles.ratingText}>
                {anaesthetist.jobAcceptanceRate ? (anaesthetist.jobAcceptanceRate * 5).toFixed(1) : "4.8"}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          {showActions && (
            <View style={styles.actionRow}>
              {onSelect && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.selectButton]}
                  onPress={onSelect}
                >
                  <Check width={16} height={16} stroke="#4F46E5" style={{marginRight: 4}} />
                  <Text style={styles.selectButtonText}>Select</Text>
                </TouchableOpacity>
              )}

              {onRemove && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={onRemove}
                >
                  <X width={16} height={16} stroke="#6B7280" style={{marginRight: 4}} />
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6"
  },
  rowContainer: {
    flexDirection: "row",
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937"
  },
  specialization: {
    color: "#6B7280"
  },
  preferredBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  preferredText: {
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  experienceText: {
    color: "#6B7280",
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "#6B7280",
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  selectButton: {
    backgroundColor: "#EEF2FF",
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: "#F3F4F6",
    marginLeft: 8,
  },
  selectButtonText: {
    color: "#4F46E5",
    fontWeight: "500",
  },
  removeButtonText: {
    color: "#4B5563",
    fontWeight: "500",
  },
});
