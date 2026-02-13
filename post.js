
import { db } from './engine.js';
import { doc, getDoc, collection, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { incrementView } from './interaction.js';

// --- 1. Get Movie ID from URL ---
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

if (!movieId) {
    window.location.href = 'index.html';
}

// --- 2. Fetch & Render Post Data ---
async function loadPostDetails() {
    const docRef = doc(db, "movies", movieId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Update Meta & Title
        document.title = `${data.title} | Filmixo Forensic Audit`;
        document.getElementById('post-title').innerText = data.title;
        document.getElementById('post-category').innerText = data.category.toUpperCase();
        document.getElementById('post-date').innerText = data.date || "OFFICIAL RELEASE";

        // Embed YouTube Trailer (Luxury Frame)
        if (data.trailerId) {
            document.getElementById('trailer-container').innerHTML = `
                <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${data.trailerId}?autoplay=1&mute=1&rel=0" 
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }

        // Render 5 Analytic Paragraphs
        const bodyContainer = document.getElementById('post-body');
        if (data.paragraphs && Array.isArray(data.paragraphs)) {
            bodyContainer.innerHTML = data.paragraphs.map(p => `<p>${p}</p>`).join('');
        }

        // Trigger View Increment & Related Content
        incrementView(movieId);
        loadRelatedAudits(data.category, movieId);
    } else {
        document.getElementById('post-body').innerHTML = "<h1>AUDIT DATA CORRUPTED OR NOT FOUND.</h1>";
    }
}

// --- 3. Load Related Category Content ---
async function loadRelatedAudits(category, currentId) {
    const q = query(
        collection(db, "movies"), 
        where("category", "==", category), 
        limit(6)
    );
    
    const querySnapshot = await getDocs(q);
    const container = document.getElementById('related-slider');
    let html = '';

    querySnapshot.forEach((doc) => {
        if (doc.id !== currentId) {
            const d = doc.data();
            html += `
                <div class="movie-card" onclick="location.href='post.html?id=${doc.id}'">
                    <img src="${d.thumbnail}" alt="${d.title}" class="card-img" loading="lazy">
                    <div class="card-info">
                        <h3 class="card-title">${d.title}</h3>
                    </div>
                </div>`;
        }
    });
    container.innerHTML = html;
}

// Initialize Logic
document.addEventListener('DOMContentLoaded', loadPostDetails);