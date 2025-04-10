import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { Calendar } from "react-native-feather";
import DateTimePicker from "@react-native-community/datetimepicker";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (dateStr: string, dateObj?: Date) => void;
  error?: string;
  helperText?: string;
  testID?: string;
}

const DatePicker = ({ 
  label, 
  value, 
  onChange, 
  error, 
  helperText = "Format: DD/MM/YY",
  testID
}: DatePickerProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [displayValue, setDisplayValue] = useState("");
  const dateInputRef = useRef<TextInput>(null);

  // Set display value on mount and when value changes
  useEffect(() => {
    try {
      if (value) {
        const dateObj = new Date(value);
        if (!isNaN(dateObj.getTime())) {
          setDisplayValue(formatDateForDisplay(dateObj));
        }
      }
    } catch (e) {
      console.log("Error parsing date:", e);
    }
  }, [value]);
  
  // Format date as DD/MM/YY
  const formatDateForDisplay = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().substring(2);
    return `${day}/${month}/${year}`;
  };
  
  // Get a Date object from the value string
  const getDateObject = (): Date => {
    try {
      if (!value) return new Date();
      const date = new Date(value);
      return isNaN(date.getTime()) ? new Date() : date;
    } catch (e) {
      return new Date();
    }
  };
  
  // Handle date selection from date picker
  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Update display value
      setDisplayValue(formatDateForDisplay(selectedDate));
      
      // Pass ISO string to parent
      onChange(selectedDate.toISOString(), selectedDate);
    }
  };
  
  // Handle manual text input
  const handleDateInput = (text: string) => {
    setDisplayValue(text);
    
    // Only try to parse when we have enough characters for a complete date
    if (text.length >= 6) {
      // Extract numbers, ignoring separators
      const digitsOnly = text.replace(/\D/g, '');
      
      if (digitsOnly.length >= 6) {
        const day = parseInt(digitsOnly.substring(0, 2));
        const month = parseInt(digitsOnly.substring(2, 4)) - 1; // JS months are 0-indexed
        const year = 2000 + parseInt(digitsOnly.substring(4, 6)); // Assume 20xx
        
        // Create and validate the date
        const dateObj = new Date(year, month, day);
        
        // Check if date is valid
        const isValid = 
          dateObj.getDate() === day && 
          dateObj.getMonth() === month && 
          dateObj.getFullYear() === year;
        
        // Check if date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isNotPast = dateObj >= today;
        
        if (isValid && isNotPast) {
          // Valid date - pass ISO string to parent
          onChange(dateObj.toISOString(), dateObj);
        } else {
          // Invalid date - show error but don't clear field
          if (!isValid) {
            Alert.alert("Invalid Date", "Please enter a valid date in DD/MM/YY format.");
          } else if (!isNotPast) {
            Alert.alert("Past Date", "Please enter a date that is not in the past.");
          }
        }
      }
    }
  };

  return (
    <View style={styles.inputGroup} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.dateInputContainer,
        error ? styles.inputError : null
      ]}>
        <Calendar width={20} height={20} stroke="#6B7280" style={styles.inputIcon} />
        <TextInput
          ref={dateInputRef}
          style={styles.dateTimeInput}
          value={displayValue}
          onChangeText={handleDateInput}
          placeholder="DD/MM/YY"
          keyboardType="numeric"
          maxLength={8}
        />
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowDatePicker(true)}
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
      
      {showDatePicker && (
        <DateTimePicker
          value={getDateObject()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#4B5563",
    marginBottom: 4,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  dateTimeInput: {
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

export default DatePicker;