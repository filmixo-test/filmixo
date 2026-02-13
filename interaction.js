
import { db } from './engine.js';
import { doc, updateDoc, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. View Counter Logic (Atomic Increment) ---
export async function incrementView(id) {
    const sessionKey = `v_f_x_${id}`;
    if (!sessionStorage.getItem(sessionKey)) {
        const docRef = doc(db, "movies", id);
        try {
            await updateDoc(docRef, { views: increment(1) });
            sessionStorage.setItem(sessionKey, "true");
        } catch (e) { console.error("LAB_SYNC_ERROR", e); }
    }
    listenToStats(id);
}

// --- 2. Like/Audit Confirmation Logic ---
export function setupLikeSystem(id) {
    const likeBtn = document.getElementById('like-btn');
    const likeCountLabel = document.getElementById('like-count');
    const storageKey = `l_f_x_${id}`;

    if (localStorage.getItem(storageKey)) {
        likeBtn.classList.add('active');
        likeBtn.disabled = true;
        likeBtn.style.opacity = "0.7";
    }

    likeBtn.addEventListener('click', async () => {
        if (localStorage.getItem(storageKey)) return;

        const docRef = doc(db, "movies", id);
        // Optimistic UI Update
        const currentLikes = parseInt(likeCountLabel.innerText);
        likeCountLabel.innerText = currentLikes + 1;
        likeBtn.disabled = true;

        try {
            await updateDoc(docRef, { likes: increment(1) });
            localStorage.setItem(storageKey, "true");
            likeBtn.classList.add('active');
        } catch (e) { console.error("DATA_COMMIT_FAILURE", e); }
    });
}

// --- 3. Real-time Statistics Sync ---
function listenToStats(id) {
    const docRef = doc(db, "movies", id);
    onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
            const data = snap.data();
            const vElem = document.getElementById('view-count');
            const lElem = document.getElementById('like-count');
            
            if (vElem) vElem.innerText = (data.views || 0).toLocaleString();
            if (lElem) lElem.innerText = (data.likes || 0).toLocaleString();
        }
    });
}