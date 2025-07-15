// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyARV0ZMbvZOS-BHlRI64GET6RCUjDRqZe4",
  authDomain: "budget-planner-eb328.firebaseapp.com",
  projectId: "budget-planner-eb328",
  storageBucket: "budget-planner-eb328.appspot.com",
  messagingSenderId: "847896780800",
  appId: "1:847896780800:web:27231b48e2793c74d8b8e5"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
