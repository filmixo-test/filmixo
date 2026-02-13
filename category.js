
import { db } from './engine.js';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const gridContainer = document.getElementById('category-grid');
const loadMoreBtn = document.getElementById('cat-load-more');
const urlParams = new URLSearchParams(window.location.search);

let catName = urlParams.get('cat');
let searchQuery = urlParams.get('search');
let lastDoc = null;
const PAGE_SIZE = 12; // ক্যাটাগরি পেইজে ১২টি করে কার্ড লোড হবে

// --- 1. UI Title Update ---
const updateHeader = () => {
    const titleElem = document.getElementById('cat-title');
    if (catName) {
        titleElem.innerText = catName;
    } else if (searchQuery) {
        titleElem.innerText = `RESULTS: ${searchQuery.toUpperCase()}`;
    }
};

// --- 2. Movie Card Template ---
const createCard = (data, id) => {
    return `
        <div class="movie-card" onclick="location.href='post.html?id=${id}'">
            <img src="${data.thumbnail}" alt="${data.title}" class="card-img" loading="lazy">
            <div class="card-info">
                <h3 class="card-title">${data.title}</h3>
            </div>
        </div>`;
};

// --- 3. Core Data Fetching Engine ---
async function fetchAssets(isLoadMore = false) {
    let q;
    const baseRef = collection(db, "movies");

    // ক্যাটাগরি অথবা সার্চ অনুযায়ী কোয়েরি তৈরি
    if (catName) {
        q = query(baseRef, where("category", "==", catName), orderBy("timestamp", "desc"), limit(PAGE_SIZE));
    } else if (searchQuery) {
        // ফায়ারবেজ নেটিভ সার্চ লজিক (Case Sensitive)
        q = query(baseRef, where("title", ">=", searchQuery), where("title", "<=", searchQuery + '\uf8ff'), limit(PAGE_SIZE));
    } else {
        q = query(baseRef, orderBy("timestamp", "desc"), limit(PAGE_SIZE));
    }

    // প্যাগিনেশন লজিক
    if (isLoadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
    }

    try {
        const snap = await getDocs(q);
        if (snap.empty) {
            if (!isLoadMore) gridContainer.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>NO CORRESPONDING DATA FOUND IN ARCHIVES.</p>";
            loadMoreBtn.style.display = "none";
            return;
        }

        lastDoc = snap.docs[snap.docs.length - 1];
        let html = "";
        snap.forEach(doc => html += createCard(doc.data(), doc.id));

        if (isLoadMore) {
            gridContainer.insertAdjacentHTML('beforeend', html);
        } else {
            gridContainer.innerHTML = html;
        }

        // যদি রেজাল্ট ১২টির কম হয় তবে বাটন লুকানো
        loadMoreBtn.style.display = snap.docs.length < PAGE_SIZE ? "none" : "inline-block";

    } catch (error) {
        console.error("DATABASE_SYNC_CRITICAL_FAILURE", error);
    }
}

// --- Initialize Lab Search ---
document.addEventListener('DOMContentLoaded', () => {
    updateHeader();
    fetchAssets();

    loadMoreBtn.addEventListener('click', () => {
        fetchAssets(true);
    });
});