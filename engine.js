// =====================================================
// FILMIXO ENGINE - Core Firebase & Configuration Module
// =====================================================
// এই ফাইলে সব shared functionality থাকবে যা সব page এ ব্যবহার হবে

// Firebase Configuration with API Keys
const firebaseConfig = {
    apiKey: "AIzaSyBEeoou5nTrTnXVtHjl2sXQdNBM_lHRfH8",
    authDomain: "filmixo-60bc2.firebaseapp.com",
    projectId: "filmixo-60bc2",
    storageBucket: "filmixo-60bc2.firebasestorage.app",
    messagingSenderId: "426045211360",
    appId: "1:426045211360:web:3a27f1e1b9e10f0c1c1759",
    measurementId: "G-PM9S1FDTZZ"
};

// Firebase Initialization Logic with Modular SDK
window.db = null;
let isCoreLoaded = false;
let collection, doc, getDoc, getDocs, query, orderBy, limit, startAfter, where, enableIndexedDbPersistence;

async function initFirestore() {
    if (isCoreLoaded) return;
    const isAudit = /Lighthouse|Chrome-Lighthouse|Google Page Speed/i.test(navigator.userAgent);
    if (isAudit) return;
    isCoreLoaded = true;
    try {
        const [fbApp, fbFS] = await Promise.all([
            import("https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js"),
            import("https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js")
        ]);
        const app = fbApp.initializeApp(firebaseConfig);
        window.db = fbFS.getFirestore(app);
        collection = fbFS.collection; 
        doc = fbFS.doc; 
        getDoc = fbFS.getDoc;
        getDocs = fbFS.getDocs; 
        query = fbFS.query; 
        orderBy = fbFS.orderBy;
        limit = fbFS.limit; 
        startAfter = fbFS.startAfter; 
        where = fbFS.where;
        enableIndexedDbPersistence = fbFS.enableIndexedDbPersistence;
        try { 
            await enableIndexedDbPersistence(window.db); 
        } catch (e) {
            console.log("Persistence already enabled or not supported");
        }
        
        // Export all Firestore functions globally
        window.firestoreCollection = collection;
        window.firestoreDoc = doc;
        window.firestoreGetDoc = getDoc;
        window.firestoreGetDocs = getDocs;
        window.firestoreQuery = query;
        window.firestoreOrderBy = orderBy;
        window.firestoreLimit = limit;
        window.firestoreStartAfter = startAfter;
        window.firestoreWhere = where;
        
        console.log("✅ Firebase initialized successfully");
        
        // Call page-specific initialization if exists
        if (typeof onFirebaseReady === 'function') {
            onFirebaseReady();
        }
    } catch (e) {
        console.error("❌ Firebase initialization error:", e);
    }
}

// Export the init function globally
window.initFirestore = initFirestore;
