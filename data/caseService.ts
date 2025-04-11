import { Case } from "./DataTypes";
import { auth, db } from "../FirebaseConfig";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
// Import convertFirestoreDocToMedicalProcedure from ProceduresService 
// to maintain consistent data conversion
import { convertFirestoreDocToMedicalProcedure } from "./ProceduresService";

// Create a cache for cases data
let casesCache: Record<string, {
  data: Case[],
  timestamp: number
}> = {};

// Cache expiration time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

/**
 * Helper function to safely convert Firestore document to Case type
 * Uses the common converter from ProceduresService as base
 */
function convertFirestoreDocToCase(doc: QueryDocumentSnapshot<DocumentData>): Case {
  // First get the base procedure data using the shared converter
  const procedureData = convertFirestoreDocToMedicalProcedure(doc);
  const data = doc.data();
  
  // Then extend it with Case-specific fields
  return {
    ...procedureData,
    time: procedureData.startTime || '', // Map startTime to time for Case interface
    isCancelled: procedureData.status === 'cancelled'
  };
}

/**
 * Fetch cases from Firestore based on status
 */
export async function fetchCases(status: "upcoming" | "cancelled"): Promise<Case[]> {
  // Check if we have a valid cache
  const cacheKey = `cases_${status}`;
  const cachedData = casesCache[cacheKey];
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp < CACHE_EXPIRY)) {
    console.log(`Using cached ${status} cases data`);
    return cachedData.data;
  }
  
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is logged in");
    }
    
    // Real Firebase implementation
    const casesRef = collection(db, "procedures");
    const q = query(
      casesRef,
      where("confirmedAnaesthetistId", "==", user.uid),
      where("status", "==", status === "cancelled" ? "cancelled" : "confirmed"),
      orderBy("date", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    const casesData: Case[] = [];
    
    querySnapshot.forEach((doc) => {
      // Use the converter function for type safety
      casesData.push(convertFirestoreDocToCase(doc));
    });
    
    // Cache the data
    casesCache[cacheKey] = {
      data: casesData,
      timestamp: now
    };
    
    return casesData;
  } catch (error) {
    console.error(`Error fetching ${status} cases:`, error);
    return [];
  }
}

/**
 * Clear cache when needed (e.g., after adding/updating a case)
 */
export function clearCasesCache(): void {
  casesCache = {};
}

/**
 * Clear a specific cache entry
 */
export function clearSpecificCaseCache(status: "upcoming" | "cancelled"): void {
  const cacheKey = `cases_${status}`;
  if (casesCache[cacheKey]) {
    delete casesCache[cacheKey];
  }
}