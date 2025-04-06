import { useState } from "react"
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from "react-native"
import { Calendar, Clock, MapPin, MessageSquare, AlertCircle, X } from "react-native-feather"

export interface Case {
  id: string
  date: string
  time: string
  duration: string
  location: string
  surgeonName: string
  surgeryName: string
  remarks?: string
  isCancelled?: boolean
}

interface CaseCardProps {
  caseData: Case
  onCancel: (id: string) => void
  onRequestChange: (id: string) => void
}

export default function CaseCard({ caseData, onCancel, onRequestChange }: CaseCardProps) {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
  }

  const handleCancel = () => {
    onCancel(caseData.id)
    setIsModalVisible(false)
  }

  const handleRequestChange = () => {
    onRequestChange(caseData.id)
    setIsModalVisible(false)
  }

  // Truncate remarks if they're too long
  const displayRemarks =
    caseData.remarks && caseData.remarks.length > 50 ? caseData.remarks.substring(0, 50) + "..." : caseData.remarks

  return (
    <>
      <TouchableOpacity
        style={[styles.cardContainer, caseData.isCancelled && styles.cancelledCard]}
        onPress={toggleModal}
        disabled={caseData.isCancelled}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconTextRow}>
            <Calendar width={16} height={16} stroke="#6B7280" />
            <Text style={styles.dateText}>{caseData.date}</Text>
          </View>

          {caseData.isCancelled && (
            <View style={styles.cancelledBadge}>
              <Text style={styles.cancelledBadgeText}>Cancelled</Text>
            </View>
          )}
        </View>

        <Text style={styles.surgeryName}>{caseData.surgeryName}</Text>

        <View style={styles.iconTextRow}>
          <Clock width={16} height={16} stroke="#6B7280" />
          <Text style={styles.detailText}>
            {caseData.time} · {caseData.duration}
          </Text>
        </View>

        <View style={styles.iconTextRowMargin}>
          <MapPin width={16} height={16} stroke="#6B7280" />
          <Text style={styles.detailText}>{caseData.location}</Text>
        </View>

        <View style={styles.surgeonContainer}>
          <Text style={styles.surgeonText}>Surgeon: {caseData.surgeonName}</Text>
        </View>

        {caseData.remarks && (
          <View style={styles.remarksContainer}>
            <View style={styles.iconTextRow}>
              <AlertCircle width={16} height={16} stroke="#6B7280" style={{marginTop: 2}} />
              <Text style={styles.remarksText}>{displayRemarks}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.chatButton}>
          <MessageSquare width={16} height={16} stroke="#4F46E5" />
          <Text style={styles.chatButtonText}>Chat with Clinic</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Modal for expanded view */}
      <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={toggleModal}>
        <Pressable style={styles.modalOverlay} onPress={toggleModal}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Case Details</Text>
              <TouchableOpacity onPress={toggleModal}>
                <X width={24} height={24} stroke="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBodyContainer}>
              <Text style={styles.modalSurgeryName}>{caseData.surgeryName}</Text>
              <Text style={styles.modalSurgeonName}>Surgeon: {caseData.surgeonName}</Text>

              <View style={styles.modalDetailRow}>
                <Calendar width={18} height={18} stroke="#6B7280" />
                <Text style={styles.modalDetailText}>{caseData.date}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Clock width={18} height={18} stroke="#6B7280" />
                <Text style={styles.modalDetailText}>
                  {caseData.time} · {caseData.duration}
                </Text>
              </View>

              <View style={[styles.modalDetailRow, {marginBottom: 16}]}>
                <MapPin width={18} height={18} stroke="#6B7280" />
                <Text style={styles.modalDetailText}>{caseData.location}</Text>
              </View>
            </View>

            {caseData.remarks && (
              <View style={styles.modalRemarksContainer}>
                <Text style={styles.modalRemarksTitle}>Remarks:</Text>
                <Text style={styles.modalRemarksText}>{caseData.remarks}</Text>
              </View>
            )}

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel Case</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changeRequestButton}
                onPress={handleRequestChange}
              >
                <Text style={styles.changeRequestButtonText}>Request Time Change</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
    padding: 16,
  },
  cancelledCard: {
    opacity: 0.6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconTextRowMargin: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    color: '#6B7280',
    marginLeft: 8,
  },
  cancelledBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cancelledBadgeText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
  },
  surgeryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailText: {
    color: '#6B7280',
    marginLeft: 8,
  },
  surgeonContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginBottom: 12,
  },
  surgeonText: {
    color: '#4B5563',
    fontWeight: '500',
  },
  remarksContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  remarksText: {
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
  },
  chatButtonText: {
    color: '#4F46E5',
    fontWeight: '500',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '92%',
    maxWidth: 400,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBodyContainer: {
    marginBottom: 16,
  },
  modalSurgeryName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSurgeonName: {
    color: '#4B5563',
    fontWeight: '500',
    marginBottom: 16,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalDetailText: {
    color: '#4B5563',
    marginLeft: 8,
    fontSize: 16,
  },
  modalRemarksContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalRemarksTitle: {
    color: '#4B5563',
    fontWeight: '500',
    marginBottom: 4,
  },
  modalRemarksText: {
    color: '#6B7280',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#DC2626',
    fontWeight: '500',
  },
  changeRequestButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  changeRequestButtonText: {
    color: '#D97706',
    fontWeight: '500',
  },
});

