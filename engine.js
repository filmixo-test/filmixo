
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Filmixo Central Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAsD8wucLsudzY5oNbiixLGyjN2apdV0Q",
  authDomain: "my-ad-analytics-4560a.firebaseapp.com",
  databaseURL: "https://my-ad-analytics-4560a-default-rtdb.firebaseio.com",
  projectId: "my-ad-analytics-4560a",
  storageBucket: "my-ad-analytics-4560a.firebasestorage.app",
  messagingSenderId: "104213283950",
  appId: "1:104213283950:web:b5a25ecd54df809625127f",
  measurementId: "G-WS7QSQ9H0Y"
};

// Initialize Core Services
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Global Error Handler for Analytics
export const logEvent = (name, params) => {
    if (analytics) {
        import("https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js").then(m => m.logEvent(analytics, name, params));
    }
};

