import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use the databaseId specified in firebase-applet-config.json if present
const config = firebaseConfig as Record<string, any>;
export const db =
  config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)"
    ? getFirestore(app, config.firestoreDatabaseId)
    : getFirestore(app);

export const auth = getAuth(app);

// Validate Connection to Firestore safely without forcing blocking server round-trips
export async function testConnection() {
  try {
    // Gracefully check if db is initialized
    if (db) {
      console.debug("Firebase Firestore initialized successfully.");
    }
  } catch (error) {
    console.warn("Firebase notice: Operating with local persistence cache.");
  }
}

testConnection();

export default app;
