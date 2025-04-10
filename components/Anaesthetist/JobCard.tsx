import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, Clock, MapPin, DollarSign, User, AlertCircle, Clock as ClockTimer } from 'react-native-feather';
import { Job } from '../../data/mockData'; // Import JobStatus type

// export interface Job {
//   id: string;
//   date: string;
//   startTime: string;
//   duration: string;
//   surgeryName: string;
//   surgeonName: string;
//   location: string;
//   fee: number;
//   status: JobStatus;
//   isPriority?: boolean;
//   remarks?: string;
//   visibilityMode?: 'specific' | 'sequential' | 'timed' | 'all';
//   sequentialOfferDeadline?: string;
//   visibleToAllAfter?: string;
// }

// Add a helper function to calculate time remaining
const getTimeRemaining = (deadline: string): { hours: number, minutes: number, total: number } => {
  const total = Date.parse(deadline) - Date.now();
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)));
  
  return {
    total,
    hours,
    minutes
  };
}

interface JobCardProps {
  job: Job;
  onAccept?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
}

export default function JobCard({ job, onAccept, onCancel, onViewDetails }: JobCardProps) {
  // Add state for timer
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number, minutes: number, total: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Set up timer effect
  useEffect(() => {
    // For sequential mode - countdown until offer expires
    const deadlineToCheck = job.visibilityMode === 'sequential' ? 
      job.sequentialOfferDeadline : 
      job.visibilityMode === 'timed' ? job.visibleToAllAfter : null;

    if (deadlineToCheck) {
      const updateTimer = () => {
        const remaining = getTimeRemaining(deadlineToCheck);
        setTimeRemaining(remaining);
        setIsExpired(remaining.total <= 0);
      };

      // Initial update
      updateTimer();
      
      // Update timer every minute (changed from every second)
      const timerInterval = setInterval(updateTimer, 60000);
      
      return () => clearInterval(timerInterval);
    }
  }, [job.sequentialOfferDeadline, job.visibleToAllAfter, job.visibilityMode]);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(job.id);
    }
  };

  return (
    <View style={[
      styles.cardContainer,
      job.isPriority ? styles.priorityCard : null,
      job.visibilityMode === 'sequential' && styles.sequentialCard,
      job.visibilityMode === 'timed' && styles.timedCard
    ]}>
      {/* Timer Display for Sequential or Timed */}
      {(job.visibilityMode === 'sequential' || job.visibilityMode === 'timed') && timeRemaining && (
        <View style={[
          styles.timerContainer,
          job.visibilityMode === 'sequential' ? styles.sequentialTimerContainer : styles.timedTimerContainer
        ]}>
          {job.visibilityMode === 'sequential' ? (
            <AlertCircle width={16} height={16} stroke="#ef4444" style={styles.timerIcon} />
          ) : (
            <ClockTimer width={16} height={16} stroke="#0369a1" style={styles.timerIcon} />
          )}
          <Text style={job.visibilityMode === 'sequential' ? styles.sequentialTimerText : styles.timedTimerText}>
            {isExpired 
              ? (job.visibilityMode === 'sequential' ? "Offer expired" : "Available to all anaesthetists")
              : `${timeRemaining.hours > 0 ? `${timeRemaining.hours}h ` : ''}${timeRemaining.minutes}m ${job.visibilityMode === 'sequential' ? 'remaining' : 'until public'}`
            }
          </Text>
        </View>
      )}

      {/* Priority/Status badge */}
      {(job.isPriority || job.visibilityMode === 'sequential' || job.visibilityMode === 'timed') && (
        <View style={[
          styles.badgeContainer,
          job.visibilityMode === 'sequential' ? styles.sequentialBadge : 
          job.visibilityMode === 'timed' ? styles.timedBadge : styles.priorityBadge
        ]}>
          <Text style={[
            styles.badgeText,
            job.visibilityMode === 'sequential' ? styles.sequentialBadgeText :
            job.visibilityMode === 'timed' ? styles.timedBadgeText : styles.priorityBadgeText
          ]}>
            {job.visibilityMode === 'sequential' ? "Personal Offer" : 
             job.visibilityMode === 'timed' ? "Preferred Access" : "Priority"}
          </Text>
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
      
      {/* Rest of the card remains the same */}
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
  sequentialCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444', // red-500
  },
  timedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0369a1', // blue-600
  },
  badgeContainer: {
    borderRadius: 8, // rounded-lg
    paddingHorizontal: 8, // px-2
    paddingVertical: 4, // py-1
    marginBottom: 8, // mb-2
    alignSelf: 'flex-start', // self-start
  },
  priorityBadge: {
    backgroundColor: '#EEF2FF', // bg-indigo-100
  },
  sequentialBadge: {
    backgroundColor: '#FEF2F2', // bg-red-50
  },
  timedBadge: {
    backgroundColor: '#EFF6FF', // bg-blue-50
  },
  badgeText: {
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
  },
  priorityBadgeText: {
    color: '#4338CA', // text-indigo-700
  },
  sequentialBadgeText: {
    color: '#B91C1C', // text-red-700
  },
  timedBadgeText: {
    color: '#1D4ED8', // text-blue-700
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  sequentialTimerContainer: {
    backgroundColor: '#fef2f2', // red-50
  },
  timedTimerContainer: {
    backgroundColor: '#f0f9ff', // blue-50
  },
  timerIcon: {
    marginRight: 6,
  },
  sequentialTimerText: {
    color: '#ef4444', // red-500
    fontSize: 12,
    fontWeight: '500',
  },
  timedTimerText: {
    color: '#0284c7', // blue-500
    fontSize: 12,
    fontWeight: '500',
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

