import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { Clock } from "react-native-feather";
import DateTimePicker from "@react-native-community/datetimepicker";

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (timeStr: string, timeObj?: Date) => void;
  error?: string;
  helperText?: string;
  testID?: string;
}

const TimePicker = ({ 
  label, 
  value, 
  onChange, 
  error, 
  helperText = "Format: HH:MM AM/PM or 24h format",
  testID
}: TimePickerProps) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const [timeObj, setTimeObj] = useState(new Date());
  const timeInputRef = useRef<TextInput>(null);
  
  // Format time as HH:MM AM/PM
  const formatTimeForDisplay = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Validate and parse time input
  const validateAndParseTime = (timeStr: string): Date | null => {
    // Support both 12-hour (e.g., "3:30 PM") and 24-hour (e.g., "15:30") formats
    const time12hRegex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
    const time24hRegex = /^(\d{1,2}):(\d{2})$/;
    
    let hours, minutes, period;
    let match = timeStr.match(time12hRegex);
    
    if (match) {
      hours = parseInt(match[1]);
      minutes = parseInt(match[2]);
      period = match[3].toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    } else {
      match = timeStr.match(time24hRegex);
      if (!match) return null;
      
      hours = parseInt(match[1]);
      minutes = parseInt(match[2]);
    }
    
    // Validate hours and minutes
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time;
  };
  
  // Handle time selection from time picker
  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const formattedTime = formatTimeForDisplay(selectedTime);
      setDisplayValue(formattedTime);
      setTimeObj(selectedTime);
      onChange(formattedTime, selectedTime);
    }
  };
  
  // Handle manual input
  const handleTimeInput = (text: string) => {
    setDisplayValue(text);
    
    if (text.length >= 4) {
      const time = validateAndParseTime(text);
      if (time) {
        setTimeObj(time);
        const formattedTime = formatTimeForDisplay(time);
        onChange(formattedTime, time);
      }
    }
  };

  // Add this useEffect to handle initial formatting
  useEffect(() => {
    try {
      if (value) {
        // Check if it's a valid time
        const timeParts = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeParts) {
          setDisplayValue(value);
        } else {
          // If it's a Date object string, format it
          const timeObj = new Date(value);
          if (!isNaN(timeObj.getTime())) {
            setDisplayValue(formatTimeForDisplay(timeObj));
            setTimeObj(timeObj);
          }
        }
      }
    } catch (e) {
      console.log("Error parsing time:", e);
    }
  }, [value]);

  return (
    <View style={styles.inputGroup} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.timeInputContainer,
        error ? styles.inputError : null
      ]}>
        <Clock width={20} height={20} stroke="#6B7280" style={styles.inputIcon} />
        <TextInput
          ref={timeInputRef}
          style={styles.timeInput}
          value={displayValue}
          onChangeText={handleTimeInput}
          placeholder="HH:MM AM/PM"
        />
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.pickerButtonText}>Select</Text>
        </TouchableOpacity>
      </View>
      
      {helperText && !error && (
        <Text style={styles.inputHelper}>{helperText}</Text>
      )}
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {showTimePicker && (
        <DateTimePicker
          value={timeObj}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#4B5563",
    marginBottom: 4,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  timeInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#1F2937',
  },
  pickerButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  pickerButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputHelper: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
  },
  inputError: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#F87171",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
});

export default TimePicker;