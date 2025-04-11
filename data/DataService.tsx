import { db, auth } from "../FirebaseConfig";
import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  QueryDocumentSnapshot
} from "firebase/firestore";

import { 
  MedicalProcedure, 
  JobStatus, 
  UserData, 
  Job, 
  Case,
  VisibilityMode 
} from "./DataTypes";

// Cache for performance optimization
const cache: Record<string, {data: any, timestamp: number}> = {};
const CACHE_EXPIRY = 60 * 1000; // 1 minute

/**
 * Helper function to check if a job should be visible to a specific user
 */
export function isJobVisibleToUser(job: MedicalProcedure, userId: string): boolean {
  // Maintain the same visibility logic from your mockData
  if (!job.visibilityMode) return true;
  
  if (job.confirmedAnaesthetistId) {
    return job.confirmedAnaesthetistId === userId;
  }
  
  switch (job.visibilityMode) {
    case 'specific':
      return job.preferredAnaesthetists?.includes(userId) || false;
      
    case 'sequential':
      const currentIndex = job.sequentialOfferIndex || 0;
      return job.preferredAnaesthetists?.[currentIndex] === userId;
      
    case 'timed':
      if (job.preferredAnaesthetists?.includes(userId)) {
        return true;
      }
      
      if (job.visibleToAllAfter) {
        const now = new Date().toISOString();
        return now >= job.visibleToAllAfter;
      }
      return false;
      
    case 'all':
      return true;
      
    default:
      return true;
  }
}

/**
 * Helper function to convert Firestore document to our interface
 */
function convertDocToJob(doc: QueryDocumentSnapshot<DocumentData>): Job {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    status: data.status as JobStatus || 'available',
    fee: data.fee || 0,
    startTime: data.startTime || '',
  } as Job;
}

/**
 * Get jobs by status - compatible with the mock data version
 */
export async function getJobsByStatus(status: JobStatus): Promise<Job[]> {
  const cacheKey = `jobs_${status}`;
  const now = Date.now();
  
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_EXPIRY) {
    return cache[cacheKey].data;
  }
  
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("No user signed in");
      return [];
    }
    
    const jobsRef = collection(db, "procedures");
    const q = query(
      jobsRef,
      where("status", "==", status),
      orderBy("date", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    const jobs: Job[] = [];
    
    querySnapshot.forEach((doc) => {
      jobs.push(convertDocToJob(doc));
    });
    
    cache[cacheKey] = {
      data: jobs,
      timestamp: now
    };
    
    return jobs;
  } catch (error) {
    console.error(`Error fetching ${status} jobs:`, error);
    return [];
  }
}

/**
 * Get jobs visible to the current user
 */
export async function getJobsVisibleToUser(userId: string = ''): Promise<Job[]> {
  const cacheKey = `visible_jobs_${userId}`;
  const now = Date.now();
  
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_EXPIRY) {
    return cache[cacheKey].data;
  }
  
  try {
    if (!userId && !auth.currentUser) {
      console.log("No user ID provided or signed in");
      return [];
    }
    
    const currentUserId = userId || auth.currentUser!.uid;
    
    // First get jobs specifically for this user
    const specificJobsRef = collection(db, "procedures");
    const specificQ = query(
      specificJobsRef,
      where("preferredAnaesthetists", "array-contains", currentUserId)
    );
    
    const specificSnapshot = await getDocs(specificQ);
    let visibleJobs: Job[] = [];
    
    specificSnapshot.forEach((doc) => {
      visibleJobs.push(convertDocToJob(doc));
    });
    
    // Then get all public jobs
    const publicJobsRef = collection(db, "procedures");
    const publicQ = query(
      publicJobsRef,
      where("visibilityMode", "==", "all")
    );
    
    const publicSnapshot = await getDocs(publicQ);
    publicSnapshot.forEach((doc) => {
      // Avoid duplicates
      if (!visibleJobs.some(job => job.id === doc.id)) {
        visibleJobs.push(convertDocToJob(doc));
      }
    });
    
    // Get timed jobs where deadline has passed
    const timedJobsRef = collection(db, "procedures");
    const timedQ = query(
      timedJobsRef,
      where("visibilityMode", "==", "timed"),
      where("visibleToAllAfter", "<=", new Date().toISOString())
    );
    
    const timedSnapshot = await getDocs(timedQ);
    timedSnapshot.forEach((doc) => {
      if (!visibleJobs.some(job => job.id === doc.id)) {
        visibleJobs.push(convertDocToJob(doc));
      }
    });
    
    // Add isVisibleToCurrentUser and isPreferred flags
    visibleJobs = visibleJobs.map(job => ({
      ...job,
      isVisibleToCurrentUser: true,
      isPreferred: job.preferredAnaesthetists?.includes(currentUserId) || false
    }));
    
    cache[cacheKey] = {
      data: visibleJobs,
      timestamp: now
    };
    
    return visibleJobs;
  } catch (error) {
    console.error("Error fetching visible jobs:", error);
    return [];
  }
}

/**
 * Get current user data
 */
export async function getCurrentUserData(): Promise<UserData | null> {
  const cacheKey = 'current_user';
  const now = Date.now();
  
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_EXPIRY) {
    return cache[cacheKey].data;
  }
  
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("No user signed in");
      return null;
    }
    
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = {
        uid: userDoc.id,
        ...userDoc.data()
      } as UserData;
      
      cache[cacheKey] = {
        data: userData,
        timestamp: now
      };
      
      return userData;
    } else {
      console.log("User document not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

/**
 * Clear cache
 */
export function clearCache(): void {
  Object.keys(cache).forEach(key => {
    delete cache[key];
  });
}