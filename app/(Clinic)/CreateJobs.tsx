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
import { Calendar, Clock, Users, ChevronRight } from "react-native-feather"
import { router } from "expo-router"
import AnaesthetistCard from "../../components/Clinic/AnaesthetistCard"
import DateTimePicker from "@react-native-community/datetimepicker"
import { MedicalProcedure, VisibilityMode, UserData } from "../../data/mockData"
import { db, auth } from "../../FirebaseConfig"
import { collection, query, where, getDocs, limit, addDoc } from "firebase/firestore"
import { createProcedure, testFirebaseConnection } from "../../data/ProceduresService"

export default function CreateJobScreen() {
  const [jobData, setJobData] = useState<Partial<MedicalProcedure>>({
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
  })

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showPreferredAnaesthetists, setShowPreferredAnaesthetists] = useState(false)
  const [loading, setLoading] = useState(false)
  const [anaesthetists, setAnaesthetists] = useState<UserData[]>([])
  const [startTimeDate, setStartTimeDate] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchAnaesthetists()
  }, [])

  // Check Firebase connection on mount
  useEffect(() => {
    const checkFirebase = async () => {
      try {
        console.log("Testing Firebase connection...");
        const result = await testFirebaseConnection();
        console.log("Firebase connection test result:", result);
        
        // Also check if the 'procedures' collection exists
        try {
          const proceduresRef = collection(db, "procedures");
          const testQuery = query(proceduresRef, limit(1));
          const snapshot = await getDocs(testQuery);
          console.log("Procedures collection exists, document count:", snapshot.size);
        } catch (collectionError) {
          console.error("Error accessing procedures collection:", collectionError);
        }
      } catch (error) {
        console.error("Firebase connection test failed:", error);
      }
    };
    
    checkFirebase();
  }, []);

  const testDirectFirebase = async () => {
    try {
      console.log("DIRECT FIREBASE TEST: Starting");
      setLoading(true);
      
      // Check authentication
      if (!auth.currentUser) {
        console.log("DIRECT FIREBASE TEST: Not authenticated");
        Alert.alert("Error", "Not authenticated. Please log in first.");
        return;
      }
      
      // Try to write a very simple test document
      const testCollection = collection(db, "test_docs");
      const testDoc = {
        text: "Test from CreateJobs",
        timestamp: new Date().toISOString(),
        creator: auth.currentUser.uid
      };
      
      console.log("DIRECT FIREBASE TEST: Attempting write:", testDoc);
      const docRef = await addDoc(testCollection, testDoc);
      console.log("DIRECT FIREBASE TEST: Success! Doc ID:", docRef.id);
      
      Alert.alert("Test Success", `Created test document with ID: ${docRef.id}`);
      return true;
    } catch (error) {
      console.error("DIRECT FIREBASE TEST FAILED:", error);
      Alert.alert("Test Failed", `Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

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
    console.log(`Setting ${field} to:`, value)
    setJobData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      console.log("Selected date:", selectedDate.toISOString())
      handleInputChange("date", selectedDate.toISOString())
    }
  }

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(false)
    if (selectedTime) {
      setStartTimeDate(selectedTime)
      const formattedTime = selectedTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      console.log("Selected time:", formattedTime)
      handleInputChange("startTime", formattedTime)
    }
  }

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
    if (!jobData.surgeryName) {
      Alert.alert("Error", "Please enter a surgery name")
      return false
    }

    if (!jobData.surgeonName) {
      Alert.alert("Error", "Please enter a surgeon name")
      return false
    }

    if (!jobData.date) {
      Alert.alert("Error", "Please select a date")
      return false
    }

    if (!jobData.startTime) {
      Alert.alert("Error", "Please select a start time")
      return false
    }

    if (!jobData.duration) {
      Alert.alert("Error", "Please enter a duration")
      return false
    }

    if (!jobData.location) {
      Alert.alert("Error", "Please enter a location")
      return false
    }

    if (
      (jobData.visibilityMode === "specific" ||
        jobData.visibilityMode === "sequential" ||
        jobData.visibilityMode === "timed") &&
      (!jobData.preferredAnaesthetists || jobData.preferredAnaesthetists.length === 0)
    ) {
      Alert.alert("Error", "Please select at least one preferred anaesthetist")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    try {
      // Validate form
      if (!validateForm()) {
        return;
      }
      
      // Set submitting state
      setIsSubmitting(true);
      console.log("SUBMIT: Starting job creation...");
      
      // Check auth
      if (!auth.currentUser) {
        console.error("SUBMIT: No authenticated user");
        Alert.alert("Authentication Required", "You must be logged in to create a job");
        return;
      }
      
      console.log("SUBMIT: User authenticated as", auth.currentUser.uid);
      
      // Test Firebase connection first
      try {
        console.log("SUBMIT: Testing Firebase connection...");
        const connectionTest = await testFirebaseConnection();
        if (!connectionTest) {
          Alert.alert("Connection Error", "Could not connect to the database. Please check your internet connection and try again.");
          return;
        }
        console.log("SUBMIT: Firebase connection test passed");
      } catch (connectionError) {
        console.error("SUBMIT: Firebase connection test failed:", connectionError);
        Alert.alert("Connection Error", "Failed to connect to the database");
        return;
      }
      
      // Create a fresh copy of the data
      const cleanData = JSON.parse(JSON.stringify(jobData));
      
      // Convert form data for Firestore
      const enhancedJobData: Partial<MedicalProcedure> = {
        ...cleanData,
        // Ensure numeric fields are numbers
        fee: typeof cleanData.fee === 'string' ? parseFloat(cleanData.fee) : (cleanData.fee || 0),
        sequentialOfferDuration: typeof cleanData.sequentialOfferDuration === 'string' 
          ? parseInt(cleanData.sequentialOfferDuration) 
          : (cleanData.sequentialOfferDuration || 24),
        timeDelayDays: typeof cleanData.timeDelayDays === 'string'
          ? parseInt(cleanData.timeDelayDays)
          : (cleanData.timeDelayDays || 2),
      };
      
      // Add special fields
      if (enhancedJobData.visibilityMode === "sequential") {
        const deadline = new Date();
        const hours = enhancedJobData.sequentialOfferDuration || 24;
        deadline.setHours(deadline.getHours() + hours);
        enhancedJobData.sequentialOfferDeadline = deadline.toISOString();
      }
      
      if (enhancedJobData.visibilityMode === "timed") {
        const visibleDate = new Date();
        const days = enhancedJobData.timeDelayDays || 2;
        visibleDate.setDate(visibleDate.getDate() + days);
        enhancedJobData.visibleToAllAfter = visibleDate.toISOString();
      }
      
      console.log("SUBMIT: Prepared job data:", JSON.stringify(enhancedJobData, null, 2));
      
      try {
        // Create procedure using service
        console.log("SUBMIT: Calling createProcedure...");
        const newProcedureId = await createProcedure(enhancedJobData);
        
        console.log("SUBMIT: Success! Created procedure ID:", newProcedureId);
        
        Alert.alert(
          "Success",
          "Job created successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                console.log("SUBMIT: Navigating to dashboard");
                router.replace("/(Clinic)/ClinicDashboard");
              }
            }
          ]
        );
      } catch (createError) {
        console.error("SUBMIT: Create procedure error:", createError);
        
        let errorMessage = "Failed to create job";
        if (createError instanceof Error) {
          errorMessage += `: ${createError.message}`;
        }
        
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("SUBMIT: General error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDateObject = () => {
    try {
      return jobData.date ? new Date(jobData.date) : new Date()
    } catch (e) {
      return new Date()
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (e) {
      return "Select date"
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Debug info - remove for production */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Auth Status: {auth.currentUser ? `Signed in as ${auth.currentUser.email}` : "Not signed in"}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.testButton, {backgroundColor: '#3B82F6', marginBottom: 12}]}
        onPress={testDirectFirebase}
      >
        <Text style={{color: 'white', fontWeight: '500'}}>Test Firebase</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={styles.scrollView}>
          <Text style={styles.screenTitle}>Create New Job</Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>SURGERY DETAILS</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Surgery Name</Text>
              <TextInput
                style={styles.input}
                value={jobData.surgeryName}
                onChangeText={(text) => handleInputChange("surgeryName", text)}
                placeholder="e.g., Laparoscopic Cholecystectomy"
              />
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar width={20} height={20} stroke="#6B7280" style={styles.inputIcon} />
                <Text style={styles.inputText}>{formatDate(jobData.date || "")}</Text>
              </TouchableOpacity>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock width={20} height={20} stroke="#6B7280" style={styles.inputIcon} />
                <Text style={styles.inputText}>{jobData.startTime || "Select time"}</Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={startTimeDate}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>

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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fee (USD)</Text>
              <TextInput
                style={styles.input}
                value={jobData.fee?.toString()}
                onChangeText={(text) => handleInputChange("fee", text)}
                placeholder="e.g., 1200"
                keyboardType="numeric"
              />
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
  dateInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
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
  debugInfo: {
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  debugText: {
    color: '#92400E',
    fontSize: 12,
  },
  testButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
})

