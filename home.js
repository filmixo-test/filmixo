
import { db } from './engine.js';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const categories = [
    "Legacy Deconstruction", "Narrative Entropy", 
    "Cinematic Forensics", "Speculative Assets", 
    "Auteur Credibility", "Optical Physics"
];

let lastVisiblePost = null;
const POST_LIMIT = 10;

// --- Helper: Create Movie Card HTML ---
const createCard = (data, id) => {
    return `
        <div class="movie-card" onclick="location.href='post.html?id=${id}'">
            <img src="${data.thumbnail}" alt="${data.title}" class="card-img" loading="lazy">
            <div class="card-info">
                <h3 class="card-title">${data.title}</h3>
            </div>
        </div>`;
};

// --- Helper: Create "View All" Card ---
const createViewAllCard = (catName) => {
    return `
        <div class="movie-card view-all-card" onclick="location.href='category.html?cat=${encodeURIComponent(catName)}'">
            <div class="card-img" style="display:flex; align-items:center; justify-content:center; background:#1a1a1a;">
                <i class="fa-arrow-right-to-bracket" style="font-size:30px; color:var(--accent-gold);"></i>
            </div>
            <div class="card-info" style="text-align:center;">
                <h3 class="card-title" style="color:var(--accent-gold);">VIEW ALL AUDITS</h3>
            </div>
        </div>`;
};

// --- Function: Load Category Sliders ---
async function loadCategorySliders() {
    for (let i = 0; i < categories.length; i++) {
        const catName = categories[i];
        const sectionId = `cat-section-${i + 1}`;
        const container = document.getElementById(sectionId);
        
        if (!container) continue;

        container.innerHTML = `<h2 class="section-title">${catName}</h2><div class="slider-container" id="list-${i}"></div>`;
        const listContainer = document.getElementById(`list-${i}`);

        const q = query(collection(db, "movies"), where("category", "==", catName), limit(10));
        const snap = await getDocs(q);
        
        let html = '';
        snap.forEach(doc => html += createCard(doc.data(), doc.id));
        if (!snap.empty) {
            html += createViewAllCard(catName);
            listContainer.innerHTML = html;
        }
    }
}

// --- Function: Load Recent Posts ---
async function loadRecentPosts(isMore = false) {
    const container = document.getElementById('recent-posts-container');
    let q = query(collection(db, "movies"), orderBy("timestamp", "desc"), limit(POST_LIMIT));

    if (isMore && lastVisiblePost) {
        q = query(collection(db, "movies"), orderBy("timestamp", "desc"), startAfter(lastVisiblePost), limit(POST_LIMIT));
    }

    const snap = await getDocs(q);
    if (snap.empty) {
        if(isMore) document.getElementById('load-more-btn').innerText = "NO MORE DATA";
        return;
    }

    lastVisiblePost = snap.docs[snap.docs.length - 1];
    
    let html = '';
    snap.forEach(doc => html += createCard(doc.data(), doc.id));
    
    if (isMore) {
        container.insertAdjacentHTML('beforeend', html);
    } else {
        container.innerHTML = html;
    }
}

// --- Initialize Page ---
document.addEventListener('DOMContentLoaded', () => {
    loadCategorySliders();
    loadRecentPosts();

    document.getElementById('load-more-btn').addEventListener('click', () => {
        loadRecentPosts(true);
    });
});