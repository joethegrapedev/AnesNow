import { useState, useEffect, useMemo } from "react"
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert, StyleSheet } from "react-native"
import { Calendar, Clock, MapPin, DollarSign, User, Users, Check, X } from "react-native-feather"
import { useLocalSearchParams, router } from "expo-router"
import { getJobsByStatus, mockUsers } from "../../../data/mockData"
import AnaesthetistCard from "../../../components/Clinic/AnaesthetistCard"
import type { Job} from "../../../data/mockData"
import { UserData, JobStatus } from '../../../data/mockData'; // Adjust the import path

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams()
  
  // Get all jobs and find the one with matching ID
  const allJobs = useMemo(() => {
    return getJobsByStatus("available")
      .concat(getJobsByStatus("pending"))
      .concat(getJobsByStatus("confirmed"))
      .concat(getJobsByStatus("completed"));
  }, []);
  
  const [job, setJob] = useState<Job | undefined>(
    allJobs.find(j => j.id === id)
  )
  
  // Filter anaesthetists from mockUsers
  const mockAnaesthetists = useMemo(() => {
    return Object.values(mockUsers).filter(user => 
      user.role === "anaesthetist"
    );
  }, []);
  
  const [applicants, setApplicants] = useState<UserData[]>([]);

  useEffect(() => {
    if (job && job.acceptedBy && job.acceptedBy.length > 0) {
      const jobApplicants = job.acceptedBy
        .map((applicantId: string) => {
          return mockAnaesthetists.find((a) => a.uid === applicantId);
        })
        .filter((applicant): applicant is UserData => applicant !== undefined);

      setApplicants(jobApplicants);
    }
  }, [job, mockAnaesthetists]);

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFoundText}>Job not found</Text>
      </SafeAreaView>
    )
  }

  // Determine status color and text
  const getStatusInfo = () => {
    switch (job.status) {
      case "pending":
        return { backgroundColor: styles.yellowBg, textStyle: styles.yellowText, text: "Pending" }
      case "accepted":
        return { backgroundColor: styles.blueBg, textStyle: styles.blueText, text: "Accepted" }
      case "confirmed":
        return { backgroundColor: styles.greenBg, textStyle: styles.greenText, text: "Confirmed" }
      case "cancelled":
        return { backgroundColor: styles.redBg, textStyle: styles.redText, text: "Cancelled" }
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

  const handleConfirmAnaesthetist = (anaesthetistId: string) => {
    Alert.alert("Confirm Anaesthetist", "Are you sure you want to confirm this anaesthetist for the job?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Confirm",
        onPress: () => {
          // In a real app, this would update the job in Firebase
          setJob({
            ...job,
            status: "confirmed" as JobStatus, // Add type assertion here
            confirmedAnaesthetistId: anaesthetistId,
          })
          alert("Anaesthetist confirmed successfully!")
        },
      },
    ])
  }

  const handleCancelJob = () => {
    Alert.alert("Cancel Job", "Are you sure you want to cancel this job?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes, Cancel Job",
        style: "destructive",
        onPress: () => {
          // In a real app, this would update the job in Firebase
          setJob({
            ...job,
            status: "cancelled" as JobStatus, // Add type assertion
          })
          alert("Job cancelled successfully!")
        },
      },
    ])
  }

  const handleEditJob = () => {
    // In a real app, this would navigate to an edit page
    alert("Edit job functionality would go here")
  }

  const getPreferredAnaesthetists = () => {
    if (!job?.preferredAnaesthetists || job.preferredAnaesthetists.length === 0) {
      return []
    }

    return job.preferredAnaesthetists
      .map((id) => mockAnaesthetists.find((a) => a.uid === id))
      .filter((anaesthetist): anaesthetist is UserData => anaesthetist !== undefined);
  }

  const preferredAnaesthetists = getPreferredAnaesthetists()

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Job Details Card */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Job Details</Text>
            <View style={[styles.badge, statusInfo.backgroundColor]}>
              <Text style={statusInfo.textStyle}>{statusInfo.text}</Text>
            </View>
          </View>

          <Text style={styles.surgeryTitle}>{job.surgeryName}</Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Calendar width={18} height={18} stroke="#6B7280" style={styles.detailIcon} />
              <Text style={styles.detailText}>{job.date}</Text>
            </View>

            <View style={styles.detailRow}>
              <Clock width={18} height={18} stroke="#6B7280" style={styles.detailIcon} />
              <Text style={styles.detailText}>
                {job.startTime} · {job.duration}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MapPin width={18} height={18} stroke="#6B7280" style={styles.detailIcon} />
              <Text style={styles.detailText}>{job.location}</Text>
            </View>

            <View style={styles.detailRow}>
              <User width={18} height={18} stroke="#6B7280" style={styles.detailIcon} />
              <Text style={styles.detailText}>{job.surgeonName}</Text>
            </View>

            <View style={styles.detailRow}>
              <DollarSign width={18} height={18} stroke="#6B7280" style={styles.detailIcon} />
              <Text style={styles.detailText}>${job.fee.toLocaleString()}</Text>
            </View>
          </View>

          {job.remarks && (
            <View style={styles.remarksContainer}>
              <Text style={styles.remarksTitle}>Remarks:</Text>
              <Text style={styles.remarksText}>{job.remarks}</Text>
            </View>
          )}

          <View style={styles.badgeRow}>
            <View style={[styles.badge, visibilityInfo.backgroundColor]}>
              <Text style={visibilityInfo.textStyle}>{visibilityInfo.text}</Text>
            </View>
            {job.autoAccept && (
              <View style={[styles.badge, styles.greenBg, styles.marginLeft]}>
                <Text style={styles.greenText}>Auto-Accept Enabled</Text>
              </View>
            )}
          </View>

          {job.status !== "cancelled" && job.status !== "confirmed" && (
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton, styles.marginRight]}
                onPress={handleEditJob}
              >
                <Text style={styles.editButtonText}>Edit Job</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton, styles.marginLeft]}
                onPress={handleCancelJob}
              >
                <Text style={styles.cancelButtonText}>Cancel Job</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Preferred Anaesthetists */}
        {preferredAnaesthetists.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Users width={18} height={18} stroke="#6B7280" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Preferred Anaesthetists</Text>
            </View>

            {preferredAnaesthetists.map((anaesthetist) => (
              <AnaesthetistCard
                key={anaesthetist.uid}
                anaesthetist={anaesthetist}
                isPreferred={true}
                showActions={false}
              />
            ))}
          </View>
        )}

        {/* Applicants */}
        {applicants.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Users width={18} height={18} stroke="#6B7280" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Applicants</Text>
            </View>

            {applicants.map((anaesthetist) => (
              <View key={anaesthetist.uid} style={styles.applicantContainer}>
                <AnaesthetistCard
                  anaesthetist={anaesthetist}
                  isPreferred={job.preferredAnaesthetists?.includes(anaesthetist.uid)}
                  showActions={false}
                />

                {job.status !== "confirmed" && job.status !== "cancelled" && (
                  <View style={styles.applicantActionsRow}>
                    <TouchableOpacity
                      style={[styles.applicantActionButton, styles.confirmButton, styles.marginRight]}
                      onPress={() => handleConfirmAnaesthetist(anaesthetist.uid)}
                    >
                      <Check width={16} height={16} stroke="#059669" style={styles.actionIcon} />
                      <Text style={styles.confirmButtonText}>Confirm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.applicantActionButton, styles.declineButton, styles.marginLeft]}
                      onPress={() => {}}
                    >
                      <X width={16} height={16} stroke="#6B7280" style={styles.actionIcon} />
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {job.confirmedAnaesthetistId === anaesthetist.uid && (
                  <View style={styles.confirmedBanner}>
                    <Text style={styles.confirmedText}>Confirmed for this job</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    color: '#6B7280', // text-gray-500
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
    padding: 16, // px-4 py-4
  },
  card: {
    backgroundColor: '#FFFFFF', // bg-white
    borderRadius: 12, // rounded-xl
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // shadow-sm
    padding: 16, // p-4
    marginBottom: 16, // mb-4
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12, // mb-3
  },
  headerTitle: {
    fontSize: 20, // text-xl
    fontWeight: '700', // font-bold
    color: '#1F2937', // text-gray-800
  },
  surgeryTitle: {
    fontSize: 18, // text-lg
    fontWeight: '600', // font-semibold
    color: '#1F2937', // text-gray-800
    marginBottom: 16, // mb-4
  },
  detailsContainer: {
    marginBottom: 16, // mb-4
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // space-y-3
  },
  detailIcon: {
    marginRight: 12, // mr-3
  },
  detailText: {
    color: '#4B5563', // text-gray-700
  },
  remarksContainer: {
    backgroundColor: '#F9FAFB', // bg-gray-50
    padding: 16, // p-4
    borderRadius: 8, // rounded-lg
    marginBottom: 16, // mb-4
  },
  remarksTitle: {
    color: '#4B5563', // text-gray-700
    fontWeight: '500', // font-medium
    marginBottom: 4, // mb-1
  },
  remarksText: {
    color: '#6B7280', // text-gray-600
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // mb-4
  },
  badge: {
    paddingHorizontal: 8, // px-2
    paddingVertical: 4, // py-1
    borderRadius: 4, // rounded
  },
  marginLeft: {
    marginLeft: 8, // ml-2
  },
  marginRight: {
    marginRight: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 8, // rounded-lg
    paddingVertical: 12, // py-3
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#EEF2FF', // bg-indigo-100
  },
  editButtonText: {
    color: '#4338CA', // text-indigo-700
    fontWeight: '500', // font-medium
  },
  cancelButton: {
    backgroundColor: '#FEF2F2', // bg-red-100
  },
  cancelButtonText: {
    color: '#DC2626', // text-red-600
    fontWeight: '500', // font-medium
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // mb-3
  },
  sectionIcon: {
    marginRight: 8, // mr-2
  },
  sectionTitle: {
    fontSize: 18, // text-lg
    fontWeight: '600', // font-semibold
    color: '#1F2937', // text-gray-800
  },
  applicantContainer: {
    marginBottom: 16, // mb-4
  },
  applicantActionsRow: {
    flexDirection: 'row',
    marginTop: 8, // mt-2
  },
  applicantActionButton: {
    flex: 1,
    borderRadius: 8, // rounded-lg
    paddingVertical: 8, // py-2
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: '#ECFDF5', // bg-green-100
  },
  confirmButtonText: {
    color: '#047857', // text-green-700
    fontWeight: '500', // font-medium
  },
  declineButton: {
    backgroundColor: '#F3F4F6', // bg-gray-100
  },
  declineButtonText: {
    color: '#4B5563', // text-gray-700
    fontWeight: '500', // font-medium
  },
  actionIcon: {
    marginRight: 4, // mr-1
  },
  confirmedBanner: {
    marginTop: 8, // mt-2
    backgroundColor: '#ECFDF5', // bg-green-100
    borderRadius: 8, // rounded-lg
    padding: 8, // p-2
  },
  confirmedText: {
    color: '#047857', // text-green-700
    textAlign: 'center',
    fontWeight: '500', // font-medium
  },
  backButton: {
    backgroundColor: '#F3F4F6', // bg-gray-200
    borderRadius: 8, // rounded-lg
    paddingVertical: 12, // py-3
    alignItems: 'center',
    marginBottom: 32, // mb-8
  },
  backButtonText: {
    color: '#4B5563', // text-gray-700
    fontWeight: '500', // font-medium
  },
  // Badge colors
  yellowBg: {
    backgroundColor: '#FEF3C7', // bg-yellow-100
  },
  yellowText: {
    color: '#B45309', // text-yellow-700
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
  },
  blueBg: {
    backgroundColor: '#EFF6FF', // bg-blue-100
  },
  blueText: {
    color: '#1D4ED8', // text-blue-700
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
  },
  greenBg: {
    backgroundColor: '#ECFDF5', // bg-green-100
  },
  greenText: {
    color: '#047857', // text-green-700
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
  },
  redBg: {
    backgroundColor: '#FEE2E2', // bg-red-100
  },
  redText: {
    color: '#B91C1C', // text-red-700
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
  },
  grayBg: {
    backgroundColor: '#F3F4F6', // bg-gray-100
  },
  grayText: {
    color: '#4B5563', // text-gray-700
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
  },
  purpleBg: {
    backgroundColor: '#F5F3FF', // bg-purple-100
  },
  purpleText: {
    color: '#6D28D9', // text-purple-700
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
  },
  indigoBg: {
    backgroundColor: '#EEF2FF', // bg-indigo-100
  },
  indigoText: {
    color: '#4338CA', // text-indigo-700
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
  }
});
