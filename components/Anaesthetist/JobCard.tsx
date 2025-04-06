import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, Clock, MapPin, DollarSign, User } from 'react-native-feather';

export type JobStatus = 'available' | 'pending' | 'confirmed' | 'completed';

export interface Job {
  id: string;
  date: string;
  startTime: string;
  duration: string;
  surgeryName: string;
  surgeonName: string;
  location: string;
  fee: number;
  status: JobStatus;
  isPriority?: boolean;
  remarks?: string;
}

interface JobCardProps {
  job: Job;
  onAccept?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
}

export default function JobCard({ job, onAccept, onCancel, onViewDetails }: JobCardProps) {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(job.id);
    }
  };

  return (
    <View style={[
      styles.cardContainer,
      job.isPriority ? styles.priorityCard : null
    ]}>
      {job.isPriority && (
        <View style={styles.priorityBadge}>
          <Text style={styles.priorityBadgeText}>Priority</Text>
        </View>
      )}
      
      <View style={styles.headerRow}>
        <View style={styles.surgeryInfoContainer}>
          <Text style={styles.surgeryName}>{job.surgeryName}</Text>
          <View style={styles.surgeonRow}>
            <User width={14} height={14} stroke="#6B7280" style={styles.iconMarginRight} />
            <Text style={styles.surgeonName}>{job.surgeonName}</Text>
          </View>
        </View>
        
        <View style={styles.feeContainer}>
          <Text style={styles.feeText}>${job.fee.toLocaleString()}</Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Calendar width={16} height={16} stroke="#6B7280" style={styles.iconMarginRight} />
          <Text style={styles.detailText}>{job.date}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock width={16} height={16} stroke="#6B7280" style={styles.iconMarginRight} />
          <Text style={styles.detailText}>{job.startTime} · {job.duration}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin width={16} height={16} stroke="#6B7280" style={styles.iconMarginRight} />
          <Text style={styles.detailText}>{job.location}</Text>
        </View>
      </View>
      
      {job.status === 'pending' && (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>Awaiting Confirmation</Text>
        </View>
      )}
      
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.detailsButton, styles.marginRight]}
          onPress={handleViewDetails}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
        
        {job.status === 'available' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton, styles.marginLeft]}
            onPress={() => onAccept && onAccept(job.id)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        )}
        
        {job.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton, styles.marginLeft]}
            onPress={() => onCancel && onCancel(job.id)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 16, // rounded-2xl
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    padding: 16, // p-4
    marginBottom: 16, // mb-4
  },
  priorityCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5', // border-indigo-500
  },
  priorityBadge: {
    backgroundColor: '#EEF2FF', // bg-indigo-100
    borderRadius: 8, // rounded-lg
    paddingHorizontal: 8, // px-2
    paddingVertical: 4, // py-1
    marginBottom: 8, // mb-2
    alignSelf: 'flex-start', // self-start
  },
  priorityBadgeText: {
    color: '#4338CA', // text-indigo-700
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12, // mb-3
  },
  surgeryInfoContainer: {
    flex: 1,
  },
  surgeryName: {
    fontSize: 18, // text-lg
    fontWeight: '600', // font-semibold
    color: '#1F2937', // text-gray-800
  },
  surgeonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4, // mt-1
  },
  surgeonName: {
    color: '#6B7280', // text-gray-600
    fontSize: 14, // text-sm
  },
  feeContainer: {
    backgroundColor: '#F3F4F6', // bg-gray-100
    borderRadius: 8, // rounded-lg
    paddingHorizontal: 12, // px-3
    paddingVertical: 4, // py-1
  },
  feeText: {
    color: '#4B5563', // text-gray-700
    fontWeight: '500', // font-medium
  },
  detailsContainer: {
    marginVertical: 8, // space-y-2
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Part of space-y-2
  },
  detailText: {
    color: '#6B7280', // text-gray-600
  },
  iconMarginRight: {
    marginRight: 8, // mr-2
  },
  pendingBadge: {
    marginTop: 12, // mt-3
    backgroundColor: '#FEF3C7', // bg-yellow-100
    borderRadius: 8, // rounded-lg
    paddingHorizontal: 12, // px-3
    paddingVertical: 8, // py-2
  },
  pendingBadgeText: {
    color: '#B45309', // text-yellow-700
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16, // mt-4
  },
  actionButton: {
    flex: 1,
    borderRadius: 8, // rounded-lg
    paddingVertical: 8, // py-2
    alignItems: 'center',
  },
  detailsButton: {
    backgroundColor: '#F3F4F6', // bg-gray-100
  },
  detailsButtonText: {
    color: '#4B5563', // text-gray-700
    fontWeight: '500', // font-medium
  },
  acceptButton: {
    backgroundColor: '#4F46E5', // bg-indigo-500
  },
  acceptButtonText: {
    color: 'white', // text-white
    fontWeight: '500', // font-medium
  },
  cancelButton: {
    backgroundColor: '#E5E7EB', // bg-gray-200
  },
  cancelButtonText: {
    color: '#4B5563', // text-gray-700
    fontWeight: '500', // font-medium
  },
  marginRight: {
    marginRight: 8, // mr-2
  },
  marginLeft: {
    marginLeft: 8, // ml-2
  },
});

