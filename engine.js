// ═══════════════════════════════════════════════════════════
// engine.js - Universal Firebase API Vault
// Purpose: Central Firebase handshake only
// ═══════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyCnqm72oG_E-Ii-Jn0Qey7CUxjdKuB7blo",
    authDomain: "filmax-a4a7c.firebaseapp.com",
    projectId: "filmax-a4a7c",
    storageBucket: "filmax-a4a7c.firebasestorage.app",
    messagingSenderId: "752890341089",
    appId: "1:752890341089:web:a1f3e67088d1cc8f01baa5",
    measurementId: "G-CRVRGVV78C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };
