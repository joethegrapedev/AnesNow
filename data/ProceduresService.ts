import { db, auth } from "../FirebaseConfig";
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  Timestamp,
  orderBy,
  limit,
  FieldValue
} from "firebase/firestore";
import { MedicalProcedure, JobStatus } from "../data/mockData";

// Interface for procedure with Firebase-specific fields
export interface FirebaseProcedure extends Omit<MedicalProcedure, 'createdAt' | 'updatedAt'> {
  createdAt: FieldValue | null;
  updatedAt: FieldValue | null;
  postedBy: string;
}

// This function logs the current structure to help debug
export async function debugFirebaseConnection() {
  try {
    console.log("Checking Firebase connection...");
    const proceduresRef = collection(db, "procedures");
    console.log("Collection reference created:", proceduresRef);
    
    const testQuery = query(proceduresRef, limit(1));
    const snapshot = await getDocs(testQuery);
    console.log("Query executed, documents found:", snapshot.size);
    
    return true;
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return false;
  }
}

// Test Firebase connection
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    console.log("Testing Firebase connection...");
    
    // Check auth status
    const user = auth.currentUser;
    console.log("Current auth user:", user ? user.uid : "Not authenticated");
    
    // Try a simple collection query
    const testQuery = query(collection(db, "test_docs"), limit(1));
    const testSnapshot = await getDocs(testQuery);
    console.log("Test query successful, doc count:", testSnapshot.size);
    
    return true;
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return false;
  }
}

// Create a new procedure with complete error handling and logging
export async function createProcedure(procedureData: Partial<MedicalProcedure>): Promise<string> {
  try {
    // Check authentication first
    if (!auth.currentUser) {
      console.error("CREATE PROCEDURE: User not authenticated");
      throw new Error("You must be signed in to create a procedure");
    }
    
    console.log("CREATE PROCEDURE: Authenticated as", auth.currentUser.uid);
    
    // Create a clean object for Firestore
    const safeData: Record<string, any> = {};
    
    // Copy all original data, converting any complex objects to string
    Object.entries(procedureData).forEach(([key, value]) => {
      // Skip null/undefined values
      if (value === null || value === undefined) return;
      
      // Safe conversion for Firestore
      if (value instanceof Date) {
        safeData[key] = value.toISOString();
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        safeData[key] = JSON.stringify(value);
      } else {
        safeData[key] = value;
      }
    });
    
    // Add required fields
    const procedureToCreate = {
      ...safeData,
      postedBy: auth.currentUser.uid,
      status: "available" as JobStatus,
      acceptedBy: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    console.log("CREATE PROCEDURE: Prepared document:", procedureToCreate);
    
    try {
      // Force collection path to ensure it exists
      const proceduresCollectionRef = collection(db, "procedures");
      console.log("CREATE PROCEDURE: Got collection ref");
      
      // Add the document
      const docRef = await addDoc(proceduresCollectionRef, procedureToCreate);
      const procedureId = docRef.id;
      console.log("CREATE PROCEDURE: Created document with ID:", procedureId);
      
      // Update with ID
      await updateDoc(doc(db, "procedures", procedureId), { id: procedureId });
      console.log("CREATE PROCEDURE: Updated document with its ID");
      
      return procedureId;
    } catch (firestoreError) {
      console.error("CREATE PROCEDURE: Firestore error:", firestoreError);
      throw firestoreError;
    }
  } catch (error) {
    console.error("CREATE PROCEDURE: General error:", error);
    throw error;
  }
}

// Fetch all procedures
export async function getAllProcedures(): Promise<MedicalProcedure[]> {
  try {
    const proceduresQuery = query(
      collection(db, "procedures"),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(proceduresQuery);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as MedicalProcedure[];
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
      return { id: procedureDoc.id, ...procedureDoc.data() } as MedicalProcedure;
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
    const proceduresQuery = query(
      collection(db, "procedures"),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(proceduresQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalProcedure));
  } catch (error) {
    console.error("Error getting procedures:", error);
    throw error;
  }
}

// Get procedures posted by the current clinic
export async function getClinicProcedures(): Promise<MedicalProcedure[]> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated");
    }

    const proceduresQuery = query(
      collection(db, "procedures"),
      where("postedBy", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(proceduresQuery);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as MedicalProcedure[];
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
      proceduresMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
    
    allSnapshot.docs.forEach(doc => {
      if (!proceduresMap.has(doc.id)) {
        proceduresMap.set(doc.id, { id: doc.id, ...doc.data() });
      }
    });
    
    return Array.from(proceduresMap.values()) as MedicalProcedure[];
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