// ═══════════════════════════════════════════════════════════
// category-logic.js - Category Private Intelligence
// Purpose: Category-specific logic, filtering posts by category
// ═══════════════════════════════════════════════════════════

import { db } from './engine.js';
import { formatCount, formatDate, runIdle } from './utils.js';
import { collection, query, where, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// ═══════════════════════════════════════════════════════════
// Configuration & State
// ═══════════════════════════════════════════════════════════

const CONFIG = { 
    INITIAL_LOAD: 12, 
    BATCH_SIZE: 12,
    CONTACT_EMAIL: "contact@secretbinodon.com" 
};

let allPosts = [];
let isFetching = false;
let currentCategory = "";

// ═══════════════════════════════════════════════════════════
// Get Category from URL
// ═══════════════════════════════════════════════════════════

function getCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('cat') || 'all';
}

// ═══════════════════════════════════════════════════════════
// Category List (6 categories)
// ═══════════════════════════════════════════════════════════

const CATEGORIES = {
    'action': 'Action',
    'comedy': 'Comedy',
    'drama': 'Drama',
    'thriller': 'Thriller',
    'horror': 'Horror',
    'romance': 'Romance'
};

// ═══════════════════════════════════════════════════════════
// Load Category Posts
// ═══════════════════════════════════════════════════════════

async function loadCategoryPosts() {
    if (isFetching) return;
    isFetching = true;
    
    const container = document.getElementById('feed-container');
    const categoryTitle = document.getElementById('category-title');
    
    currentCategory = getCategoryFromURL();
    
    // Update title
    const categoryName = CATEGORIES[currentCategory] || 'All Posts';
    if (categoryTitle) {
        categoryTitle.textContent = categoryName;
    }
    
    // Update page title
    document.title = `${categoryName} - FILMIXO`;
    
    try {
        container.innerHTML = '<div id="shimmer-loader-block"></div>';
        allPosts = [];
        
        // Query Firestore for category posts
        let q;
        if (currentCategory === 'all' || !CATEGORIES[currentCategory]) {
            // All posts
            q = query(
                collection(db, "posts"),
                orderBy("uploadTime", "desc"),
                limit(CONFIG.INITIAL_LOAD)
            );
        } else {
            // Specific category
            q = query(
                collection(db, "posts"),
                where("category", "==", currentCategory),
                orderBy("uploadTime", "desc"),
                limit(CONFIG.INITIAL_LOAD)
            );
        }
        
        const snapshot = await getDocs(q);
        
        container.innerHTML = '';
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div style="grid-column: span 2; text-align: center; padding: 60px 20px; color: var(--g);">
                    <i class="fa-video-slash" style="font-size: 48px; margin-bottom: 20px; display: block;"></i>
                    <h3 style="font-size: 24px; margin-bottom: 10px; color: var(--acc);">No Posts Found</h3>
                    <p style="font-size: 16px;">No movies in "${categoryName}" category yet.</p>
                </div>
            `;
            isFetching = false;
            return;
        }
        
        const fragment = document.createDocumentFragment();
        
        snapshot.forEach(doc => {
            const post = { ...doc.data(), id: doc.id };
            allPosts.push(post);
            fragment.appendChild(renderPostCard(post));
        });
        
        requestAnimationFrame(() => {
            container.appendChild(fragment);
            runIdle(() => {
                generateCategorySEO(categoryName, allPosts.length);
            });
        });
        
        isFetching = false;
        
        const shimmer = document.getElementById('shimmer-loader-block');
        if (shimmer) {
            shimmer.style.opacity = '0';
            setTimeout(() => shimmer.remove(), 400);
        }
        
    } catch (e) {
        console.error("Error loading category:", e);
        container.innerHTML = `
            <div style="grid-column: span 2; text-align: center; padding: 60px 20px; color: var(--g);">
                <h3 style="font-size: 24px; margin-bottom: 10px; color: #ff0000;">Error Loading Posts</h3>
                <p style="font-size: 16px;">Please try again later.</p>
            </div>
        `;
        isFetching = false;
    }
}

// ═══════════════════════════════════════════════════════════
// Post Card Rendering (Same as home-logic.js)
// ═══════════════════════════════════════════════════════════

function renderPostCard(post) {
    const card = document.createElement('div'); 
    card.className = 'post-card visible'; 
    card.dataset.id = post.id;
    const excerpt = post.paragraphs && post.paragraphs[0] ? post.paragraphs[0] : "";
    card.innerHTML = `<div class="media-container" onclick="openPost('${post.id}')"><img src="${post.mediaImage}" alt="${post.title}" loading="lazy" onload="this.classList.add('loaded')"></div><div class="card-content"><div class="text-area" onclick="openPost('${post.id}')"><div class="title-box"><div class="post-title">${post.title}</div></div><div class="excerpt-box"><div class="post-excerpt">${excerpt}</div></div></div><div class="card-footer-info"><div class="view-group"><i class="fa-circle-user"></i><span>Ashiqur</span></div><div class="love-group">${formatDate(post.uploadTime)}</div></div></div>`;
    return card;
}

// ═══════════════════════════════════════════════════════════
// Category SEO Generation
// ═══════════════════════════════════════════════════════════

const generateCategorySEO = (categoryName, total) => {
    const topMovies = allPosts && allPosts.length > 0 
        ? allPosts.slice(0, 3).map(p => p.title.split(/[:\-\|,\.\?\!]/)[0].trim()).join(", ")
        : "Latest Cinema";
    
    const titleVariations = [
        `${categoryName} Movies - FILMIXO | Expert Analysis & HD Downloads`,
        `FILMIXO | ${categoryName} Cinema Analysis & Reviews 🕵️`,
        `${categoryName} Films - Professional Insights | FILMIXO`,
        `Explore ${categoryName} Movies on FILMIXO | HD Quality`,
    ];

    const descVariations = [
        `Discover ${total}+ ${categoryName} movies on FILMIXO. Expert analysis, HD downloads, and professional reviews of ${topMovies} and more.`,
        `FILMIXO's ${categoryName} collection features ${total}+ films. Deep analysis of ${topMovies} with technical breakdowns and insights.`,
        `Explore our ${categoryName} archive: ${total}+ movies analyzed. From ${topMovies} to hidden gems, find your next watch.`
    ];

    const tIndex = Math.floor(Math.random() * titleVariations.length);
    const dIndex = Math.floor(Math.random() * descVariations.length);

    const selectedTitle = titleVariations[tIndex];
    const selectedDesc = descVariations[dIndex];
    
    document.title = selectedTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", selectedDesc);
    
    const keywordTag = document.querySelector('meta[name="keywords"]');
    if (keywordTag) {
        keywordTag.setAttribute("content", `${categoryName} movies, ${categoryName} films, movie analysis, filmixo, hd downloads, ${topMovies}`);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);

    const syncMeta = (query, attr, content) => { 
        let tag = document.querySelector(query); 
        if (!tag) { 
            tag = document.createElement('meta'); 
            let key = query.includes('property') ? 'property' : 'name';
            let val = query.match(/"([^"]+)"/)[1];
            tag.setAttribute(key, val);
            document.head.appendChild(tag); 
        } 
        tag.setAttribute(attr, content); 
    };

    syncMeta('meta[property="og:title"]', "content", selectedTitle);
    syncMeta('meta[property="og:description"]', "content", selectedDesc);
    syncMeta('meta[property="og:url"]', "content", window.location.href);
    syncMeta('meta[name="twitter:title"]', "content", selectedTitle);
    syncMeta('meta[name="twitter:description"]', "content", selectedDesc);

    const schemaData = { 
        "@context": "https://schema.org", 
        "@type": "CollectionPage",
        "name": `${categoryName} Movies - FILMIXO`,
        "description": selectedDesc,
        "url": window.location.href,
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": total,
            "itemListOrder": "https://schema.org/ItemListOrderDescending"
        }
    };
    
    let schemaScript = document.getElementById('category-schema');
    if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'category-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schemaData);
};

// ═══════════════════════════════════════════════════════════
// Global Window Functions
// ═══════════════════════════════════════════════════════════

window.openPost = (id) => {
    sessionStorage.setItem('category_scroll', window.scrollY);
    sessionStorage.setItem('category_posts', JSON.stringify(allPosts));
    const targetPost = allPosts.find(p => p.id === id);
    if (targetPost) sessionStorage.setItem('current_post_data', JSON.stringify(targetPost));
    window.location.href = `/post/${id}`;
};

window.sendEmail = () => {
    const email = CONFIG.CONTACT_EMAIL;
    window.location.href = `mailto:${email}?subject=Inquiry from Filmixo User&body=Hello Filmixo Team,`;
};

window.shareProfile = () => {
    const categoryName = CATEGORIES[currentCategory] || 'FILMIXO';
    const shareData = {
        title: `${categoryName} - FILMIXO`,
        text: `Check out ${categoryName} movies on FILMIXO - Expert analysis and HD downloads!`,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).catch(console.error);
    } else {
        navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard! 📋");
    }
};

// ═══════════════════════════════════════════════════════════
// Initialize Category Page
// ═══════════════════════════════════════════════════════════

window.addEventListener('load', () => {
    loadCategoryPosts();
});

// Update total count
async function updateTotalCount() {
    try {
        const statsRef = doc(db, "total_collection", "global_stats");
        const snap = await getDoc(statsRef);
        if (snap.exists()) {
            const data = snap.data();
            const countEl = document.getElementById('total-videos-count');
            const totalPosts = data.total_posts || 0;
            if (countEl) {
                countEl.innerText = formatCount(totalPosts);
                countEl.style.opacity = "1";
            }
        }
    } catch (error) {
        console.warn("Stats fetch error:", error);
    }
}

// Import doc and getDoc
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
window.addEventListener('load', updateTotalCount);

export { loadCategoryPosts, CATEGORIES };
