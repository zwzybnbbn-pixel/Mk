// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// إعداداتك الخاصة من Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA1EHgsgdTYklLxlil25_BFfbeRVaFeYdQ",
  authDomain: "doctors-c949e.firebaseapp.com",
  projectId: "doctors-c949e",
  storageBucket: "doctors-c949e.firebasestorage.app",
  messagingSenderId: "45730369066",
  appId: "1:45730369066:web:ef1accc112adb532843d53",
  measurementId: "G-CGKS5Y15BH"
};

// تشغيل Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);