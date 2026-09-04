import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  getDocFromServer,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { Job, WorkerProfile, VerificationRequest, DisputeItem } from "../types";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errMsg = error instanceof Error ? error.message : String(error);
  if (
    errMsg.includes("unavailable") ||
    errMsg.includes("offline") ||
    errMsg.includes("Failed to get document")
  ) {
    // Firestore operates automatically in offline mode with indexedDB local cache
    return;
  }
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.debug("Firestore background notice: ", JSON.stringify(errInfo));
}

export const COLLECTIONS = {
  WORKERS: "workers",
  JOBS: "jobs",
  VERIFICATIONS: "verifications",
  DISPUTES: "disputes",
  ACCOUNTS: "accounts",
  SOS_ALERTS: "sosAlerts",
  SECURITY_VERIFICATIONS: "securityVerifications",
};

/**
 * Save / Update Worker in Firestore
 */
export async function syncWorkerToFirestore(worker: WorkerProfile) {
  const path = `${COLLECTIONS.WORKERS}/${worker.id}`;
  try {
    const workerRef = doc(db, COLLECTIONS.WORKERS, worker.id);
    await setDoc(
      workerRef,
      {
        ...worker,
        syncedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save / Update Job in Firestore
 */
export async function syncJobToFirestore(job: Job) {
  const path = `${COLLECTIONS.JOBS}/${job.id}`;
  try {
    const jobRef = doc(db, COLLECTIONS.JOBS, job.id);
    await setDoc(
      jobRef,
      {
        ...job,
        syncedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save / Update User Account (Worker/Customer/Admin credentials) in Firestore
 */
export async function syncAccountToFirestore(account: {
  id: string;
  phone: string;
  password: string;
  name: string;
  role: "worker" | "customer" | "admin";
  extraData?: any;
}) {
  const safeId = (account.id || account.phone || "acc_" + Date.now())
    .replace(/[^a-zA-Z0-9_.-]/g, "_")
    .toLowerCase();
  const path = `${COLLECTIONS.ACCOUNTS}/${safeId}`;
  try {
    const accRef = doc(db, COLLECTIONS.ACCOUNTS, safeId);
    await setDoc(
      accRef,
      {
        ...account,
        syncedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save / Update Verification in Firestore
 */
export async function syncVerificationToFirestore(
  verification: VerificationRequest,
) {
  const path = `${COLLECTIONS.VERIFICATIONS}/${verification.id}`;
  try {
    const verifRef = doc(db, COLLECTIONS.VERIFICATIONS, verification.id);
    await setDoc(
      verifRef,
      {
        ...verification,
        syncedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save / Update Dispute in Firestore
 */
export async function syncDisputeToFirestore(dispute: DisputeItem) {
  const path = `${COLLECTIONS.DISPUTES}/${dispute.id}`;
  try {
    const disputeRef = doc(db, COLLECTIONS.DISPUTES, dispute.id);
    await setDoc(
      disputeRef,
      {
        ...dispute,
        syncedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save / Dispatch Security OTP Record in Firestore
 */
export async function recordSecurityOtpInFirestore(data: {
  identifier: string;
  type: "email" | "phone";
  code: string;
  role: string;
}) {
  const safeId = data.identifier.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const path = `${COLLECTIONS.SECURITY_VERIFICATIONS}/${safeId}`;
  try {
    const otpRef = doc(db, COLLECTIONS.SECURITY_VERIFICATIONS, safeId);
    await setDoc(
      otpRef,
      {
        ...data,
        dispatchedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      },
      { merge: true },
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Verify Security OTP Record from Firestore
 */
export async function verifySecurityOtpInFirestore(
  identifier: string,
  code: string,
): Promise<boolean> {
  const safeId = identifier.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const path = `${COLLECTIONS.SECURITY_VERIFICATIONS}/${safeId}`;
  try {
    const otpRef = doc(db, COLLECTIONS.SECURITY_VERIFICATIONS, safeId);
    const snap = await getDocFromServer(otpRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.code === code) {
        return true;
      }
    }
  } catch (error) {
    console.debug("Firestore OTP lookup note:", error);
  }
  return false;
}

/**
 * Permanently delete all data across all Firestore collections
 */
export async function clearAllFirestoreData(): Promise<void> {
  const collectionNames = [
    COLLECTIONS.WORKERS,
    COLLECTIONS.JOBS,
    COLLECTIONS.VERIFICATIONS,
    COLLECTIONS.DISPUTES,
    COLLECTIONS.ACCOUNTS,
    COLLECTIONS.SECURITY_VERIFICATIONS,
    COLLECTIONS.SOS_ALERTS,
  ];

  for (const collName of collectionNames) {
    try {
      const colRef = collection(db, collName);
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const deleteOps = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
        await Promise.allSettled(deleteOps);
      }
    } catch (err) {
      console.warn(`Firestore clear notice for collection ${collName}:`, err);
    }
  }
}
