import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDvLIfnVgBzRvpVBJTm8mHv_E8fijVIaLw",
  authDomain: "attendance-faaba.firebaseapp.com",
  projectId: "attendance-faaba",
  storageBucket: "attendance-faaba.firebasestorage.app",
  messagingSenderId: "253713395268",
  appId: "1:253713395268:web:22acfa9e4896fe12ab9611",
  measurementId: "G-QQFN084NQZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
