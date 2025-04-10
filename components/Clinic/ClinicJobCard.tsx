import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Calendar, Clock, MapPin, User, DollarSign, AlertCircle, Users } from "react-native-feather"
import { Job } from "../../data/mockData"
import { JobStatus } from "../Anaesthetist/JobCard"  // Import JobStatus from where it's exported

type JobCardProps = {
  job: Job
  onPress: (jobId: string) => void
  showApplicationCount?: boolean
}

export default function ClinicJobCard({ job, onPress, showApplicationCount = false }: JobCardProps) {
  // Determine status color and text
  const getStatusInfo = () => {
    switch (job.status) {
      case "available":
        return { backgroundColor: styles.grayBg, textStyle: styles.grayText, text: "Open" }
      case "pending":
        return { backgroundColor: styles.yellowBg, textStyle: styles.yellowText, text: "Pending" }
      case "confirmed":
        return { backgroundColor: styles.greenBg, textStyle: styles.greenText, text: "Confirmed" }
      case "completed":
        return { backgroundColor: styles.blueBg, textStyle: styles.blueText, text: "Completed" }
      default:
        return { backgroundColor: styles.grayBg, textStyle: styles.grayText, text: "Open" }
    }
  }

  // Determine visibility badge
  const getVisibilityBadge = () => {
    switch (job.visibilityMode) {
      case "specific":
        return { backgroundColor: styles.purpleBg, textStyle: styles.purpleText, text: "Specific Anaesthetists" }
      case "sequential":
        return { backgroundColor: styles.indigoBg, textStyle: styles.indigoText, text: "Sequential Offering" }
      case "timed":
        return { backgroundColor: styles.blueBg, textStyle: styles.blueText, text: "Timed Release" }
      case "all":
        return { backgroundColor: styles.grayBg, textStyle: styles.grayText, text: "Open to All" }
      default:
        return { backgroundColor: styles.grayBg, textStyle: styles.grayText, text: "Open to All" }
    }
  }

  const statusInfo = getStatusInfo()
  const visibilityInfo = getVisibilityBadge()

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(job.id)}
    >
      <View style={styles.container}>
        {/* Status and Date */}
        <View style={styles.headerRow}>
          <View style={styles.dateContainer}>
            <Calendar width={16} height={16} stroke="#6B7280" style={styles.iconMarginRight} />
            <Text style={styles.dateText}>{job.date}</Text>
          </View>

          <View style={[styles.badge, statusInfo.backgroundColor]}>
            <Text style={[styles.badgeText, statusInfo.textStyle]}>{statusInfo.text}</Text>
          </View>
        </View>

        {/* Surgery Name */}
        <Text style={styles.surgeryName}>{job.surgeryName}</Text>

        {/* Time and Duration */}
        <View style={styles.detailRow}>
          <Clock width={16} height={16} stroke="#6B7280" style={styles.iconMarginRight} />
          <Text style={styles.detailText}>
            {job.startTime} · {job.duration}
          </Text>
        </View>

        {/* Location */}
        <View style={styles.detailRow}>
          <MapPin width={16} height={16} stroke="#6B7280" style={styles.iconMarginRight} />
          <Text style={styles.detailText}>{job.location}</Text>
        </View>

        {/* Surgeon */}
        <View style={styles.detailRow}>
          <User width={16} height={16} stroke="#6B7280" style={styles.iconMarginRight} />
          <Text style={styles.detailText}>{job.surgeonName}</Text>
        </View>

        {/* Fee */}
        <View style={styles.detailRow}>
          <DollarSign width={16} height={16} stroke="#6B7280" style={styles.iconMarginRight} />
          <Text style={styles.detailText}>${job.fee.toLocaleString()}</Text>
        </View>

        {/* Visibility Badge */}
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, visibilityInfo.backgroundColor]}>
            <Text style={[styles.badgeText, visibilityInfo.textStyle]}>{visibilityInfo.text}</Text>
          </View>
        </View>

        {/* Applications Count (if enabled) */}
        {showApplicationCount && job.acceptedBy && job.acceptedBy.length > 0 && (
          <View style={styles.applicationsContainer}>
            <Users width={16} height={16} stroke="#4F46E5" style={styles.iconMarginRight} />
            <Text style={styles.applicationsText}>
              {job.acceptedBy.length} anaesthetist{job.acceptedBy.length !== 1 ? "s" : ""} applied
            </Text>
          </View>
        )}

        {/* Remarks (if any) */}
        {job.remarks && (
          <View style={styles.remarksContainer}>
            <View style={styles.remarksContent}>
              <AlertCircle width={16} height={16} stroke="#6B7280" style={[styles.iconMarginRight, styles.alignTop]} />
              <Text style={styles.remarksText}>{job.remarks}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden'
  },
  container: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#4B5563',
  },
  surgeryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: '#6B7280',
  },
  iconMarginRight: {
    marginRight: 8,
  },
  alignTop: {
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  applicationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 8,
    borderRadius: 8,
  },
  applicationsText: {
    color: '#4F46E5',
  },
  remarksContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  remarksContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  remarksText: {
    color: '#6B7280',
    flex: 1,
  },
  
  // Color styles for badges
  yellowBg: {
    backgroundColor: '#FEF3C7',
  },
  yellowText: {
    color: '#B45309',
  },
  blueBg: {
    backgroundColor: '#EFF6FF',
  },
  blueText: {
    color: '#1D4ED8',
  },
  greenBg: {
    backgroundColor: '#ECFDF5',
  },
  greenText: {
    color: '#047857',
  },
  redBg: {
    backgroundColor: '#FEE2E2',
  },
  redText: {
    color: '#B91C1C',
  },
  grayBg: {
    backgroundColor: '#F3F4F6',
  },
  grayText: {
    color: '#4B5563',
  },
  purpleBg: {
    backgroundColor: '#F5F3FF',
  },
  purpleText: {
    color: '#6D28D9',
  },
  indigoBg: {
    backgroundColor: '#EEF2FF',
  },
  indigoText: {
    color: '#4338CA',
  }
});
