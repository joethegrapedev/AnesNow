import { Case } from "../components/Anaesthetist/CaseCard";
import { auth, db } from "../FirebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { mockCases } from "./mockData";

// Create a cache for cases data
let casesCache: Record<string, {
  data: Case[],
  timestamp: number
}> = {};

// Cache expiration time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

// Function to fetch cases from Firestore (replace mock implementation with real Firebase)
export async function fetchCases(status: "upcoming" | "cancelled"): Promise<Case[]> {
  // Check if we have a valid cache
  const cacheKey = `cases_${status}`;
  const cachedData = casesCache[cacheKey];
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp < CACHE_EXPIRY)) {
    console.log(`Using cached ${status} cases data`);
    return cachedData.data;
  }
  
  // In a real app with Firebase, you would fetch from Firestore
  // This is just a simulated API delay for now
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is logged in");
    }
    
    // Simulate API delay - replace this with actual Firebase query
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For now, return mock data
    // In your real implementation, replace with Firebase query:
    /*
    const casesRef = collection(db, "cases");
    const q = query(
      casesRef,
      where("anaesthetistId", "==", user.uid),
      where("status", "==", status === "cancelled" ? "cancelled" : "active"),
      orderBy("date", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    const casesData: Case[] = [];
    
    querySnapshot.forEach((doc) => {
      casesData.push({
        id: doc.id,
        ...doc.data()
      } as Case);
    });
    */
    
    // Mock implementation
    const casesData = status === "cancelled" 
      ? mockCases.filter(c => c.isCancelled) 
      : mockCases.filter(c => !c.isCancelled);
    
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

// Clear cache when needed (e.g., after adding/updating a case)
export function clearCasesCache(): void {
  casesCache = {};
}