import { db, auth } from "../FirebaseConfig";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  limit,
  FieldValue,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
import { MedicalProcedure, JobStatus, VisibilityMode } from "./DataTypes";

// Define FirebaseProcedure interface for better Firestore integration
export interface FirebaseProcedure {
  id: string;
  date: string;
  duration: string;
  location: string;
  surgeonName: string;
  surgeryName: string;
  remarks?: string;
  fee?: number;
  startTime: string;
  
  // Visibility system fields
  visibilityMode?: VisibilityMode;
  preferredAnaesthetists?: string[];
  autoAccept?: boolean;
  acceptedBy?: string[];
  confirmedAnaesthetistId?: string;
  
  // Fields for sequential offering
  sequentialOfferIndex?: number;
  sequentialOfferDeadline?: string;
  sequentialOfferDuration?: number;
  
  // Fields for timed visibility
  timeDelayDays?: number;
  visibleToAllAfter?: string;
  
  // Firestore specific fields
  createdAt: FieldValue | null;
  updatedAt: FieldValue | null;
  postedBy: string;
  status: JobStatus;
}

// Enhanced converter function with better error handling and debugging
export function convertFirestoreDocToMedicalProcedure(
  doc: QueryDocumentSnapshot<DocumentData>
): MedicalProcedure {
  try {
    const data = doc.data();
    
    // Handle Firestore timestamp conversion
    let createdAt: string | undefined = undefined;
    let updatedAt: string | undefined = undefined;
    
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      createdAt = data.createdAt.toDate().toISOString();
    }
    
    if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
      updatedAt = data.updatedAt.toDate().toISOString();
    }
    
    // Ensure status is always defined and valid
    let status = data.status || 'available';
    
    // Validate status is a valid JobStatus
    const validStatuses = ['available', 'pending', 'accepted', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      console.warn(`Invalid status '${status}' found in document ${doc.id}, defaulting to 'available'`);
      status = 'available';
    }
    
    const procedure: MedicalProcedure = {
      id: doc.id,
      ...data,
      createdAt,
      updatedAt,
      status
    } as MedicalProcedure;
    
    return procedure;
  } catch (error) {
    console.error(`Error converting document ${doc.id}:`, error);
    throw error;
  }
}

// This function logs the current structure to help debug
export async function debugFirebaseConnection() {
  try {
    const proceduresCollection = collection(db, "procedures");
    console.log("Procedures collection reference:", proceduresCollection);
    
    const snapshot = await getDocs(proceduresCollection);
    console.log("Number of procedures:", snapshot.size);
    
    snapshot.forEach(doc => {
      console.log("Document ID:", doc.id);
      console.log("Document data:", doc.data());
    });
    
    return "Debug complete";
  } catch (error) {
    console.error("Debug failed:", error);
    throw error;
  }
}

// Test Firebase connection
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Test connectivity to Firestore
    const testDoc = await getDocs(collection(db, "procedures"));
    console.log("Connection test success, found", testDoc.size, "documents");
    return true;
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return false;
  }
};

// Create a new procedure
export async function createProcedure(
  procedureData: Partial<MedicalProcedure>
): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    // Validate required fields
    if (!procedureData.surgeryName || !procedureData.date || !procedureData.startTime) {
      throw new Error("Missing required job information");
    }
    
    const newProcedureData = {
      ...procedureData,
      status: "available" as JobStatus,
      acceptedBy: procedureData.acceptedBy || [],
      preferredAnaesthetists: procedureData.preferredAnaesthetists || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      postedBy: user.uid
    };
    
    // Add to Firestore and get auto-generated ID
    const docRef = await addDoc(collection(db, "procedures"), newProcedureData);
    const generatedId = docRef.id;
    
    // Update the document with its ID
    await updateDoc(doc(db, "procedures", docRef.id), {
      id: generatedId
    });
    
    return generatedId;
  } catch (error) {
    console.error("Error creating procedure:", error);
    throw error;
  }
}

// Updated function with proper conversion
export async function getAllProcedures(): Promise<MedicalProcedure[]> {
  try {
    const proceduresQuery = query(
      collection(db, "procedures"),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(proceduresQuery);
    return snapshot.docs.map(doc => convertFirestoreDocToMedicalProcedure(doc));
  } catch (error) {
    console.error("Error fetching procedures:", error);
    throw error;
  }
}

// Get a procedure by ID
export async function getProcedureById(procedureId: string): Promise<MedicalProcedure | null> {
  try {
    const procedureDoc = await getDoc(doc(db, "procedures", procedureId));
    
    if (procedureDoc.exists()) {
      return convertFirestoreDocToMedicalProcedure(procedureDoc as QueryDocumentSnapshot<DocumentData>);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting procedure:", error);
    throw error;
  }
}

// Get procedures by status
export async function getProceduresByStatus(status: JobStatus): Promise<MedicalProcedure[]> {
  try {
    console.log(`getProceduresByStatus: Looking for procedures with status ${status}`);
    
    // Ensure the user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Create query based on status + current user
    const proceduresQuery = query(
      collection(db, "procedures"),
      where("status", "==", status),
      where("postedBy", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    
    console.log(`Executing firestore query for status: ${status}`);
    
    const querySnapshot = await getDocs(proceduresQuery);
    console.log(`Found ${querySnapshot.docs.length} procedures with status ${status}`);
    
    const procedures = querySnapshot.docs.map(doc => {
      const procedure = convertFirestoreDocToMedicalProcedure(doc);
      return procedure;
    });
    
    return procedures;
  } catch (error) {
    console.error(`Error getting procedures with status ${status}:`, error);
    throw error;
  }
}

// Get procedures posted by the current clinic
export async function getClinicProcedures(): Promise<MedicalProcedure[]> {
  try {
    console.log('getClinicProcedures: Fetching all procedures for current user');
    
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated");
    }

    console.log(`Querying procedures for user: ${user.uid}`);
    
    const proceduresQuery = query(
      collection(db, "procedures"),
      where("postedBy", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(proceduresQuery);
    console.log(`Retrieved ${snapshot.docs.length} total procedures`);
    
    // Log the first document for debugging
    if (snapshot.docs.length > 0) {
      const firstDoc = snapshot.docs[0];
      console.log("Sample document data:", JSON.stringify({
        id: firstDoc.id,
        ...firstDoc.data()
      }, null, 2).substring(0, 200) + "...");
    }
    
    return snapshot.docs.map(doc => convertFirestoreDocToMedicalProcedure(doc));
  } catch (error) {
    console.error("Error fetching clinic procedures:", error);
    throw error;
  }
}

// Get procedures visible to the current anaesthetist
export async function getAnaesthetistVisibleProcedures(): Promise<MedicalProcedure[]> {
  try {
    // Ensure the user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated");
    }

    // Get procedures specifically assigned to this anaesthetist
    const specificProceduresQuery = query(
      collection(db, "procedures"),
      where("preferredAnaesthetists", "array-contains", user.uid),
      where("status", "==", "available")
    );
    
    // Get procedures visible to all anaesthetists
    const allVisibleProceduresQuery = query(
      collection(db, "procedures"),
      where("visibilityMode", "==", "all"),
      where("status", "==", "available")
    );
    
    // Execute both queries
    const [specificSnapshot, allSnapshot] = await Promise.all([
      getDocs(specificProceduresQuery),
      getDocs(allVisibleProceduresQuery)
    ]);
    
    // Combine and deduplicate results
    const proceduresMap = new Map();
    
    specificSnapshot.docs.forEach(doc => {
      proceduresMap.set(doc.id, convertFirestoreDocToMedicalProcedure(doc));
    });
    
    allSnapshot.docs.forEach(doc => {
      if (!proceduresMap.has(doc.id)) {
        proceduresMap.set(doc.id, convertFirestoreDocToMedicalProcedure(doc));
      }
    });
    
    return Array.from(proceduresMap.values());
  } catch (error) {
    console.error("Error getting visible procedures:", error);
    throw error;
  }
}

// Update a procedure
export async function updateProcedure(
  procedureId: string, 
  procedureData: Partial<MedicalProcedure>
): Promise<void> {
  try {
    const updateData = {
      ...procedureData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(doc(db, "procedures", procedureId), updateData);
  } catch (error) {
    console.error("Error updating procedure:", error);
    throw error;
  }
}

// Delete a procedure
export async function deleteProcedure(procedureId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "procedures", procedureId));
  } catch (error) {
    console.error("Error deleting procedure:", error);
    throw error;
  }
}

// Accept a procedure (for anaesthetists)
export async function acceptProcedure(procedureId: string): Promise<void> {
  try {
    // Ensure the user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated");
    }
    
    // Get the current procedure
    const procedureRef = doc(db, "procedures", procedureId);
    const procedureDoc = await getDoc(procedureRef);
    
    if (!procedureDoc.exists()) {
      throw new Error("Procedure not found");
    }
    
    const procedureData = procedureDoc.data();
    const acceptedBy = procedureData.acceptedBy || [];
    
    // Check if the user has already accepted
    if (acceptedBy.includes(user.uid)) {
      throw new Error("You've already accepted this procedure");
    }
    
    // Update the procedure
    const updatedAcceptedBy = [...acceptedBy, user.uid];
    
    // If autoAccept is true and this is the first acceptance, set status to confirmed
    const updates: any = {
      acceptedBy: updatedAcceptedBy,
      updatedAt: serverTimestamp()
    };
    
    if (procedureData.autoAccept && acceptedBy.length === 0) {
      updates.status = "confirmed";
      updates.confirmedAnaesthetistId = user.uid;
    } else if (acceptedBy.length === 0) {
      updates.status = "pending";
    }
    
    await updateDoc(procedureRef, updates);
  } catch (error) {
    console.error("Error accepting procedure:", error);
    throw error;
  }
}

// Confirm an anaesthetist for a procedure (for clinics)
export async function confirmAnaesthetist(
  procedureId: string, 
  anaesthetistId: string
): Promise<void> {
  try {
    await updateDoc(doc(db, "procedures", procedureId), {
      status: "confirmed" as JobStatus,
      confirmedAnaesthetistId: anaesthetistId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error confirming anaesthetist:", error);
    throw error;
  }
}

// Cancel a procedure
export async function cancelProcedure(procedureId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "procedures", procedureId), {
      status: "cancelled" as JobStatus,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error cancelling procedure:", error);
    throw error;
  }
}