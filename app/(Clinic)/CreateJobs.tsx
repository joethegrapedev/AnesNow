import { useState, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Users, ChevronRight } from "react-native-feather"
import { router } from "expo-router"
import AnaesthetistCard from "../../components/Clinic/AnaesthetistCard"
import { MedicalProcedure, VisibilityMode, UserData, JobFormData } from "../../data/DataTypes"
import { db, auth } from "../../FirebaseConfig"
import { collection, query, where, getDocs } from "firebase/firestore"
import { createProcedure } from "../../data/ProceduresService"
import DatePicker from '../../components/Clinic/CreateJobs/DatePicker';
import TimePicker from '../../components/Clinic/CreateJobs/TimePicker';

import { clearCache } from "../../data/DataService";

export default function CreateJobScreen() {
  const [jobData, setJobData] = useState<JobFormData>({
    surgeryName: "",
    surgeonName: "",
    date: new Date().toISOString(),
    startTime: new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    duration: "",
    location: "",
    fee: 0,
    remarks: "",
    visibilityMode: "all",
    preferredAnaesthetists: [],
    autoAccept: false,
    timeDelayDays: 2,
    sequentialOfferDuration: 24,
  });

  const [loading, setLoading] = useState(false)
  const [anaesthetists, setAnaesthetists] = useState<UserData[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('success');
  const [showPreferredAnaesthetists, setShowPreferredAnaesthetists] = useState(false);

  useEffect(() => {
    fetchAnaesthetists()
  }, [])

  const fetchAnaesthetists = async () => {
    try {
      setLoading(true)
      const anaesthetistsQuery = query(
        collection(db, "users"),
        where("role", "==", "anaesthetist")
      )

      const querySnapshot = await getDocs(anaesthetistsQuery)
      const anaesthetistsList = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserData[]

      setAnaesthetists(anaesthetistsList)
    } catch (error) {
      console.error("Error fetching anaesthetists:", error)
      Alert.alert("Error", "Failed to load anaesthetists. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    console.log(`Setting ${field} to:`, value);
    setJobData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (fieldErrors[field]) {
      clearFieldError(field);
    }
  };

  const clearFieldError = (field: string) => {
    setFieldErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const togglePreferredAnaesthetist = (anaesthetistId: string) => {
    setJobData((prev) => {
      const preferredAnaesthetists = prev.preferredAnaesthetists || []
      const isAlreadyPreferred = preferredAnaesthetists.includes(anaesthetistId)

      if (isAlreadyPreferred) {
        return {
          ...prev,
          preferredAnaesthetists: preferredAnaesthetists.filter((id) => id !== anaesthetistId),
        }
      } else {
        return {
          ...prev,
          preferredAnaesthetists: [...preferredAnaesthetists, anaesthetistId],
        }
      }
    })
  }

  const validateForm = () => {
    const errors: Record<string, string> = {};
    let isFormValid = true;

    if (!jobData.surgeryName?.trim()) {
      errors.surgeryName = "Surgery name is required";
      isFormValid = false;
    }

    if (!jobData.surgeonName?.trim()) {
      errors.surgeonName = "Surgeon name is required";
      isFormValid = false;
    }

    if (!jobData.date) {
      errors.date = "Date is required";
      isFormValid = false;
    } else {
      try {
        const dateObj = new Date(jobData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dateObj < today) {
          errors.date = "Date cannot be in the past";
          isFormValid = false;
        }
      } catch (e) {
        errors.date = "Invalid date format";
        isFormValid = false;
      }
    }

    if (!jobData.startTime) {
      errors.startTime = "Start time is required";
      isFormValid = false;
    }

    if (!jobData.duration?.trim()) {
      errors.duration = "Duration is required";
      isFormValid = false;
    }

    if (!jobData.location?.trim()) {
      errors.location = "Location is required";
      isFormValid = false;
    }

    if (jobData.fee === undefined || jobData.fee === null) {
      errors.fee = "Fee is required";
      isFormValid = false;
    } else {
      const feeValue = typeof jobData.fee === 'string' 
        ? parseFloat(jobData.fee) 
        : jobData.fee;
      
      if (isNaN(feeValue)) {
        errors.fee = "Fee must be a number";
        isFormValid = false;
      }
    }

    if (
      (jobData.visibilityMode === "specific" ||
        jobData.visibilityMode === "sequential" ||
        jobData.visibilityMode === "timed") &&
      (!jobData.preferredAnaesthetists || jobData.preferredAnaesthetists.length === 0)
    ) {
      errors.preferredAnaesthetists = "Select at least one preferred anaesthetist";
      isFormValid = false;
    }

    if (jobData.visibilityMode === "sequential") {
      const duration = typeof jobData.sequentialOfferDuration === 'string'
        ? parseInt(jobData.sequentialOfferDuration)
        : jobData.sequentialOfferDuration;
      
      if (!duration || isNaN(duration) || duration <= 0) {
        errors.sequentialOfferDuration = "Enter a positive number of hours";
        isFormValid = false;
      }
    }

    if (jobData.visibilityMode === "timed") {
      const days = typeof jobData.timeDelayDays === 'string'
        ? parseInt(jobData.timeDelayDays)
        : jobData.timeDelayDays;
      
      if (!days || isNaN(days) || days <= 0) {
        errors.timeDelayDays = "Enter a positive number of days";
        isFormValid = false;
      }
    }

    setFieldErrors(errors);
    
    if (!isFormValid) {
      setTimeout(() => {
        for (const field of Object.keys(errors)) {
          const element = document.getElementById(`field-${field}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          }
        }
      }, 100);
    }

    return isFormValid;
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    console.log("Showing notification:", message, type);
    setShowSuccessNotification(false);
    setTimeout(() => {
      setNotificationMessage(message);
      setNotificationType(type);
      setShowSuccessNotification(true);
    }, 100);
  };

  const handleNotificationHide = () => {
    setShowSuccessNotification(false);
    if (notificationType === 'success') {
      setTimeout(() => {
        router.push("/(Clinic)/ClinicDashboard");
      }, 300);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      if (!validateForm()) {
        return;
      }
      
      setIsSubmitting(true);
      console.log("SUBMIT: Starting job creation...");
      
      if (!auth.currentUser) {
        console.error("SUBMIT: No authenticated user");
        Alert.alert("Authentication Required", "You must be logged in to create a job");
        return;
      }
      
      const cleanData = JSON.parse(JSON.stringify(jobData));
      
      const enhancedJobData: Partial<MedicalProcedure> = {
        ...cleanData,
        fee: typeof cleanData.fee === 'string' ? parseFloat(cleanData.fee) : (cleanData.fee || 0),
        sequentialOfferDuration: typeof cleanData.sequentialOfferDuration === 'string' 
          ? parseInt(cleanData.sequentialOfferDuration) 
          : (cleanData.sequentialOfferDuration || 24),
        timeDelayDays: typeof cleanData.timeDelayDays === 'string'
          ? parseInt(cleanData.timeDelayDays)
          : (cleanData.timeDelayDays || 2),
        acceptedBy: [], 
        status: 'available',
        sequentialOfferIndex: 0,
      };
      
      const requiredFields = enhancedJobData as Required<Pick<MedicalProcedure, 'surgeryName' | 'date' | 'startTime'>> & Partial<MedicalProcedure>;

      if (enhancedJobData.visibilityMode === "sequential") {
        const deadline = new Date();
        const hours = enhancedJobData.sequentialOfferDuration || 24;
        deadline.setHours(deadline.getHours() + hours);
        requiredFields.sequentialOfferDeadline = deadline.toISOString();
      }

      if (enhancedJobData.visibilityMode === "timed") {
        const visibleDate = new Date();
        const days = enhancedJobData.timeDelayDays || 2;
        visibleDate.setDate(visibleDate.getDate() + days);
        requiredFields.visibleToAllAfter = visibleDate.toISOString();
      }

      console.log("SUBMIT: Prepared job data:", JSON.stringify(requiredFields, null, 2));

      try {
        console.log("SUBMIT: Calling createProcedure...");
        const newProcedureId = await createProcedure(requiredFields);
        
        console.log("SUBMIT: Success! Created procedure ID:", newProcedureId);
        
        clearCache();
        
        resetForm();
        
        showNotification("Job created successfully!", 'success');
        
      } catch (createError) {
        console.error("SUBMIT: Create procedure error:", createError);
        
        let errorMessage = "Failed to create job";
        if (createError instanceof Error) {
          errorMessage += `: ${createError.message}`;
        }
        
        showNotification(errorMessage, 'error');
      }
    } catch (error) {
      console.error("SUBMIT: General error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setJobData({
      surgeryName: "",
      surgeonName: "",
      date: new Date().toISOString(),
      startTime: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      duration: "",
      location: "",
      fee: 0,
      remarks: "",
      visibilityMode: "all" as VisibilityMode,
      preferredAnaesthetists: [] as string[],
      autoAccept: false,
      timeDelayDays: 2,
      sequentialOfferDuration: 24,
    });
    
    setNotificationMessage("");
    setShowSuccessNotification(false);
    setFieldErrors({});
    router.push("/(Clinic)/ClinicDashboard");
    //INSERT NOTIF THING HERE
  };

  return (
  <SafeAreaView style={styles.container}>
    
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={styles.scrollView}>
          <Text style={styles.screenTitle}>Create New Job</Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>SURGERY DETAILS</Text>

            <View style={styles.inputGroup} id="field-surgeryName">
              <Text style={styles.label}>Surgery Name</Text>
              <TextInput
                style={[
                  styles.input, 
                  fieldErrors.surgeryName && styles.inputError
                ]}
                value={jobData.surgeryName}
                onChangeText={(text) => handleInputChange("surgeryName", text)}
                placeholder="e.g., Laparoscopic Cholecystectomy"
              />
              {fieldErrors.surgeryName && (
                <Text style={styles.errorText}>{fieldErrors.surgeryName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Surgeon Name</Text>
              <TextInput
                style={styles.input}
                value={jobData.surgeonName}
                onChangeText={(text) => handleInputChange("surgeonName", text)}
                placeholder="e.g., Dr. Sarah Johnson"
              />
            </View>

            <DatePicker
              label="Date"
              value={jobData.date ?? ''}
              onChange={(dateStr, _dateObj) => handleInputChange("date", dateStr)}
              error={fieldErrors.date}
              testID="field-date"
            />

            <TimePicker
              label="Start Time"
              value={jobData.startTime ?? ''}
              onChange={(timeStr, _timeObj) => handleInputChange("startTime", timeStr)}
              error={fieldErrors.startTime}
              testID="field-startTime"
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Duration</Text>
              <TextInput
                style={styles.input}
                value={jobData.duration?.toString()}
                onChangeText={(text) => handleInputChange("duration", text)}
                placeholder="e.g., 2 hours"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={jobData.location}
                onChangeText={(text) => handleInputChange("location", text)}
                placeholder="e.g., City General Hospital, OR 3"
              />
            </View>

            <View style={styles.inputGroup} id="field-fee">
              <Text style={styles.label}>Fee (USD)</Text>
              <TextInput
                style={[
                  styles.input, 
                  fieldErrors.fee && styles.inputError
                ]}
                value={jobData.fee?.toString()}
                onChangeText={(text) => handleInputChange("fee", text)}
                placeholder="e.g., 1200"
                keyboardType="numeric"
              />
              {fieldErrors.fee && (
                <Text style={styles.errorText}>{fieldErrors.fee}</Text>
              )}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>VISIBILITY SETTINGS</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Who can see this job?</Text>

              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => handleInputChange("visibilityMode", "all")}
              >
                <View
                  style={[
                    styles.radioOuter,
                    jobData.visibilityMode === "all" && styles.radioOuterSelected,
                  ]}
                >
                  {jobData.visibilityMode === "all" && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>All anaesthetists</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => handleInputChange("visibilityMode", "specific")}
              >
                <View
                  style={[
                    styles.radioOuter,
                    jobData.visibilityMode === "specific" && styles.radioOuterSelected,
                  ]}
                >
                  {jobData.visibilityMode === "specific" && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Specific anaesthetists only</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => handleInputChange("visibilityMode", "sequential")}
              >
                <View
                  style={[
                    styles.radioOuter,
                    jobData.visibilityMode === "sequential" && styles.radioOuterSelected,
                  ]}
                >
                  {jobData.visibilityMode === "sequential" && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Sequential offering (one-by-one)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => handleInputChange("visibilityMode", "timed")}
              >
                <View
                  style={[
                    styles.radioOuter,
                    jobData.visibilityMode === "timed" && styles.radioOuterSelected,
                  ]}
                >
                  {jobData.visibilityMode === "timed" && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Timed release (preferred first, then all)</Text>
              </TouchableOpacity>
            </View>

            {(jobData.visibilityMode === "specific" ||
              jobData.visibilityMode === "sequential" ||
              jobData.visibilityMode === "timed") && (
              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowPreferredAnaesthetists(!showPreferredAnaesthetists)}
                >
                  <View style={styles.selectButtonContent}>
                    <Users width={20} height={20} stroke="#6B7280" style={styles.inputIcon} />
                    <Text style={styles.inputText}>
                      {jobData.preferredAnaesthetists && jobData.preferredAnaesthetists.length > 0
                        ? `${jobData.preferredAnaesthetists.length} anaesthetists selected`
                        : "Select preferred anaesthetists"}
                    </Text>
                  </View>
                  <ChevronRight width={20} height={20} stroke="#6B7280" />
                </TouchableOpacity>

                {showPreferredAnaesthetists && (
                  <View style={styles.anaesthetistsList}>
                    {loading ? (
                      <ActivityIndicator size="large" color="#4F46E5" />
                    ) : anaesthetists.length > 0 ? (
                      anaesthetists.map((anaesthetist) => (
                        <AnaesthetistCard
                          key={anaesthetist.uid}
                          anaesthetist={anaesthetist}
                          isPreferred={
                            jobData.preferredAnaesthetists?.includes(anaesthetist.uid || "") || false
                          }
                          onSelect={() => togglePreferredAnaesthetist(anaesthetist.uid || "")}
                          onRemove={() => togglePreferredAnaesthetist(anaesthetist.uid || "")}
                          showActions={true}
                        />
                      ))
                    ) : (
                      <Text style={styles.noDataText}>No anaesthetists found</Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {jobData.visibilityMode === "sequential" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hours each anaesthetist has to respond</Text>
                <TextInput
                  style={styles.input}
                  value={jobData.sequentialOfferDuration?.toString()}
                  onChangeText={(text) => handleInputChange("sequentialOfferDuration", text)}
                  placeholder="e.g., 24"
                  keyboardType="numeric"
                />
              </View>
            )}

            {jobData.visibilityMode === "timed" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Days before showing to all anaesthetists</Text>
                <TextInput
                  style={styles.input}
                  value={jobData.timeDelayDays?.toString()}
                  onChangeText={(text) => handleInputChange("timeDelayDays", text)}
                  placeholder="e.g., 2"
                  keyboardType="numeric"
                />
              </View>
            )}

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Auto-accept first respondent</Text>
              <Switch
                value={jobData.autoAccept}
                onValueChange={(value) => handleInputChange("autoAccept", value)}
                trackColor={{ false: "#D1D5DB", true: "#818CF8" }}
                thumbColor={jobData.autoAccept ? "#4F46E5" : "#F9FAFB"}
              />
            </View>
            <Text style={styles.helperText}>
              If enabled, the first anaesthetist who accepts will be automatically confirmed.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>ADDITIONAL INFORMATION</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Remarks (Optional)</Text>
              <TextInput
                style={styles.textArea}
                value={jobData.remarks}
                onChangeText={(text) => handleInputChange("remarks", text)}
                placeholder="Any special requirements or notes"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create Job</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardLabel: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#4B5563",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    color: "#1F2937",
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
  inputText: {
    color: "#1F2937",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: "#4F46E5",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4F46E5",
  },
  radioText: {
    color: "#1F2937",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
  },
  selectButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  anaesthetistsList: {
    marginTop: 12,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  helperText: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    color: "#1F2937",
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 32,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  noDataText: {
    textAlign: "center",
    color: "#6B7280",
    padding: 16,
  },
  disabledButton: {
    backgroundColor: "#A5B4FC",
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
})

