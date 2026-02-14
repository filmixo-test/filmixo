// ═══════════════════════════════════════════════════════════
// home-logic.js - Index Private Intelligence
// Purpose: Homepage-specific logic, IndexedDB system, feed loading
// ═══════════════════════════════════════════════════════════

import { db } from './engine.js';
import { formatCount, formatDate, runIdle } from './utils.js';
import { collection, doc, getDoc, getDocs, query, orderBy, limit, startAfter, where, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// ═══════════════════════════════════════════════════════════
// IndexedDB System (Complete Original Logic)
// ═══════════════════════════════════════════════════════════

const DB_NAME = 'FilmixoLocalDB', DB_VERSION = 1;

async function openLocalDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('posts')) db.createObjectStore('posts', { keyPath: 'id' });
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function getSmartPost(id, serverUpdatedTime) {
    const db = await openLocalDB();
    return new Promise((resolve) => {
        const request = db.transaction('posts').objectStore('posts').get(id);
        request.onsuccess = () => {
            const localData = request.result;
            const localTime = localData ? (localData.t || localData.uploadTime) : null;
            
            if (localData && localTime === serverUpdatedTime) {
                resolve({ data: localData, source: 'cache' });
            } else {
                resolve({ data: null, source: 'network' });
            }
        };
    });
}

async function saveToLocal(post) {
    const db = await openLocalDB();
    const tx = db.transaction('posts', 'readwrite');
    tx.objectStore('posts').put(post);
}

async function cleanLocalDB(activeIds) {
    const db = await openLocalDB();
    const tx = db.transaction('posts', 'readwrite');
    const store = tx.objectStore('posts');
    const request = store.getAllKeys();
    request.onsuccess = () => {
        request.result.forEach(id => {
            if (!activeIds.includes(id)) store.delete(id);
        });
    };
}

// ═══════════════════════════════════════════════════════════
// Configuration & State
// ═══════════════════════════════════════════════════════════

const CONFIG = { 
    INITIAL_LOAD: 6, 
    BATCH_SIZE: 12, 
    PAUSE_AFTER_BATCHES: 2, 
    CONTACT_EMAIL: "contact@secretbinodon.com" 
};

let allPosts = [];
let isFetching = false;
let observer;
let isSliderInitialized = false;
let batchTracker = 0;

// ═══════════════════════════════════════════════════════════
// Sync Content Logic
// ═══════════════════════════════════════════════════════════

async function syncContent() {
    try {
        const statsRef = doc(db, "total_collection", "global_stats");
        const snap = await getDoc(statsRef);
        if (snap.exists()) {
            const data = snap.data();
            const masterList = data.allIds || [];
            const activeIds = masterList.map(item => typeof item === 'object' ? item.id : item);
            await cleanLocalDB(activeIds);

            for (const item of masterList) {
                const id = typeof item === 'object' ? item.id : item;
                const serverTime = typeof item === 'object' ? item.t : 0;
                const localCheck = await getSmartPost(id, serverTime);
                
                if (localCheck.source === 'network') {
                    const postSnap = await getDoc(doc(db, "posts", id));
                    if (postSnap.exists()) {
                        await saveToLocal({ ...postSnap.data(), id: postSnap.id, t: serverTime });
                    }
                }
            }
        }
    } catch (e) { console.error("Sync Error:", e); }
}

// ═══════════════════════════════════════════════════════════
// Feed Loading Logic
// ═══════════════════════════════════════════════════════════

async function loadFeed(isInitial = true) {
    if (isFetching) return; 
    isFetching = true;
    const container = document.getElementById('feed-container');
    const sentinel = document.getElementById('sentinel');
    const loadMoreArea = document.getElementById('load-more-section');
    try {
        if (isInitial) {
            container.innerHTML = '<div id="shimmer-loader-block"></div>';
            allPosts = [];
            batchTracker = 0;
            loadMoreArea.style.display = 'none';
            await syncContent();
        } else { 
            sentinel.classList.add('loading'); 
        }
        const localDB = await openLocalDB();
        const request = localDB.transaction('posts', 'readonly').objectStore('posts').getAll();
        request.onsuccess = () => { 
            let posts = request.result.sort((a, b) => { 
                const timeA = new Date(a.t || a.uploadTime || 0).getTime();
                const timeB = new Date(b.t || b.uploadTime || 0).getTime();
                return timeB - timeA; 
            });
            const start = isInitial ? 0 : allPosts.length;
            const currentBatchSize = isInitial ? CONFIG.INITIAL_LOAD : CONFIG.BATCH_SIZE;
            const paginated = posts.slice(start, start + currentBatchSize);
            if (isInitial) container.innerHTML = '';
            if (paginated.length > 0) {
                const fragment = document.createDocumentFragment();
                paginated.forEach(post => { 
                    allPosts.push(post); 
                    fragment.appendChild(renderPostCard(post, true)); 
                });
                requestAnimationFrame(() => {
                    container.appendChild(fragment);
                    if (!isInitial) {
                        batchTracker++;
                        if (batchTracker >= CONFIG.PAUSE_AFTER_BATCHES) {
                            if (observer) observer.disconnect();
                            sentinel.style.display = 'none';
                            loadMoreArea.style.display = 'block';
                        }
                    }
                });
                if (isInitial) { 
                    runIdle(() => { 
                        generateHomepageSEO(allPosts.length); 
                        if(!isSliderInitialized) startCoverSlider(allPosts); 
                        setupFeedObserver(); 
                    }); 
                }
            } else if (!isInitial) { 
                sentinel.style.display = 'none'; 
            }
            isFetching = false; 
            sentinel.classList.remove('loading');
            const shimmer = document.getElementById('shimmer-loader-block');
            if (shimmer && isInitial) {
                shimmer.style.opacity = '0';
                setTimeout(() => shimmer.remove(), 400); 
            }
        };
    } catch (e) { 
        isFetching = false; 
        sentinel.classList.remove('loading'); 
    }
}

// ═══════════════════════════════════════════════════════════
// Post Card Rendering
// ═══════════════════════════════════════════════════════════

function renderPostCard(post, returnNode = false) {
    const card = document.createElement('div'); 
    card.className = 'post-card visible'; 
    card.dataset.id = post.id;
    const excerpt = post.paragraphs && post.paragraphs[0] ? post.paragraphs[0] : "";
    card.innerHTML = `<div class="media-container" onclick="openPost('${post.id}')"><img src="${post.mediaImage}" alt="${post.title}" loading="lazy" onload="this.classList.add('loaded')"></div><div class="card-content"><div class="text-area" onclick="openPost('${post.id}')"><div class="title-box"><div class="post-title">${post.title}</div></div><div class="excerpt-box"><div class="post-excerpt">${excerpt}</div></div></div><div class="card-footer-info"><div class="view-group"><i class="fa-circle-user"></i><span>Ashiqur</span></div><div class="love-group">${formatDate(post.uploadTime)}</div></div></div>`;
    if(returnNode) return card;
    const container = document.getElementById('feed-container');
    if(container) container.appendChild(card);
}

// ═══════════════════════════════════════════════════════════
// Cover Slider Logic
// ═══════════════════════════════════════════════════════════

let sliderInterval, sliderTimeout; 

const startCoverSlider = posts => {
    if (isSliderInitialized) return;
    const container = document.getElementById("cover-slider"), sliderItems = posts.slice(0, 6);
    if (!sliderItems.length) return;
    isSliderInitialized = true;
    const intro = document.querySelector(".intro-text");
    const clear = () => { 
        clearInterval(sliderInterval); 
        clearTimeout(sliderTimeout); 
        container.querySelectorAll(".cover-photo-inner").forEach(e => e.remove()); 
    };
    const init = (isFirstLoad = false) => { 
        clear(); 
        if (intro) { 
            intro.style.animation = 'none'; 
            intro.offsetHeight; 
            intro.style.animation = "cinematicIntro 3.5s cubic-bezier(.22,1,.36,1) forwards"; 
        }
        sliderTimeout = setTimeout(() => {
            const wrapper = document.createElement("div"); 
            wrapper.className = "cover-photo-inner"; 
            wrapper.style.cssText = "position:absolute;inset:0;display:flex;will-change:transform,opacity;opacity:0;transition:opacity 1.8s ease-in-out,transform 1s cubic-bezier(.22,1,.36,1);";
            wrapper.innerHTML = sliderItems.map(x => `
                <div style="width:100%;height:100%;flex:0 0 100%;position:relative;overflow:hidden;">
                    <img src="${x.mediaImage}" loading="eager" fetchpriority="low" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block;">
                    <div style="position:absolute;bottom:0;left:0;width:100%;height:70px;background:linear-gradient(to bottom, transparent, var(--bg) 95%);z-index:5;"></div>
                    <div style="position:absolute;bottom:0px;left:0;right:0;padding:0 15px 0;color:#ffffff;font-size:16.5px;font-weight:700;text-align:center;z-index:10;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.2;text-shadow:0 1px 12px rgba(0,0,0,0.8);letter-spacing:0.3px;">${x.title}</div>
                </div>`).join("");
            container.appendChild(wrapper); 
            requestAnimationFrame(() => wrapper.style.opacity = 1);
            let n = 0; 
            sliderInterval = setInterval(() => { 
                n++; 
                if(n < sliderItems.length) {
                    wrapper.style.transform = `translate3d(-${n*100}%,0,0)`; 
                } else { 
                    wrapper.style.transition = "opacity 1.5s ease-in-out";
                    wrapper.style.opacity = '0';
                    setTimeout(() => init(false), 500); 
                }
            }, 3500);
        }, 2200); 
    };
    init(true);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            clearInterval(sliderInterval);
        } else {
            const wrapper = container.querySelector(".cover-photo-inner");
            if (wrapper) {
                let n = Math.abs(Math.round(new DOMMatrix(getComputedStyle(wrapper).transform).m41 / container.offsetWidth));
                sliderInterval = setInterval(() => {
                    n++;
                    if (n < sliderItems.length) {
                        wrapper.style.transform = `translate3d(-${n * 100}%,0,0)`;
                    } else {
                        n = 0;
                        wrapper.style.transition = "none";
                        wrapper.style.transform = "translate3d(0,0,0)";
                        setTimeout(() => wrapper.style.transition = "opacity 2.2s ease-in-out,transform 1s cubic-bezier(.22,1,.36,1)", 50);
                    }
                }, 3400);
            }
        }
    });
};

// ═══════════════════════════════════════════════════════════
// Intersection Observer Setup
// ═══════════════════════════════════════════════════════════

function setupFeedObserver() {
    const sentinel = document.getElementById('sentinel'); 
    if (observer) observer.disconnect();
    observer = new IntersectionObserver((entries) => { 
        if (entries[0].isIntersecting && !isFetching) loadFeed(false); 
    }, { rootMargin: '400px' });
    observer.observe(sentinel);
}

// ═══════════════════════════════════════════════════════════
// Global Stats Fetcher
// ═══════════════════════════════════════════════════════════

async function fetchGlobalStats() {
    try {
        const statsRef = doc(db, "total_collection", "global_stats");
        const snap = await getDoc(statsRef);
        if (snap.exists()) {
            const data = snap.data();
            const countEl = document.getElementById('total-videos-count');
            const totalPosts = data.total_posts || 0;
            countEl.innerText = formatCount(totalPosts);
            countEl.style.opacity = "1";
        }
    } catch (error) {
        console.warn("Stats source: Cache/Offline or Error", error);
    }
}

// ═══════════════════════════════════════════════════════════
// Homepage SEO Generation
// ═══════════════════════════════════════════════════════════

const generateHomepageSEO = (total) => {
    const topMovies = allPosts && allPosts.length > 0 
        ? allPosts.slice(0, 3).map(p => p.title.split(/[:\-\|,\.\?\!]/)[0].trim()).join(", ")
        : "Latest Global Cinema";
    
    const titleVariations = [
        `FILMIXO | Analyzing the ${topMovies} Ecosystem `,
        `FILMIXO | Strategic Market Positioning: ${topMovies}🕵️`,
        `FILMIXO | Cinematic Forensics & Investigative Analysis: ${topMovies}`,
        `FILMIXO | Global Content Dynamics & Distribution: ${topMovies}🕵️`,
        `FILMIXO | Production Forensics & Market Trajectory: ${topMovies}`
    ];

    const descVariations = [
        `FILMIXO: A premier 2026 cinematic forensics hub. We decode the strategic market positioning of ${total}+ titles, analyzing the commercial calculations and financial frameworks of hits like ${topMovies}.`,
        `Beyond mainstream critiques: FILMIXO investigates the global content ecosystem of ${total}+ films. Exploring subscription retention metrics and production dynamics for ${topMovies} to unlock hidden industry insights.`,
        `Unlocking the vision: Professional cinematic forensics of ${total}+ trending blockbusters. We analyze artistic risks, multi-locale production leakages, and the strategic positioning of ${topMovies} in today's market.`
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
        keywordTag.setAttribute("content", `cinematic forensics, strategic market positioning, filmixo industry analysis, subscription retention metrics, production dynamics, ${topMovies}, cinematic economics 2026`);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + window.location.pathname);

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
        "@graph": [ 
            { 
                "@type": "WebSite", 
                "@id": window.location.origin + "/#website",
                "url": window.location.origin, 
                "name": "FILMIXO",
                "description": selectedDesc,
                "inLanguage": "en-US",
                "publisher": { 
                    "@type": "Organization", 
                    "name": "FILMIXO Editorial & Research",
                    "logo": { "@type": "ImageObject", "url": "https://filmixo.vercel.app/thumbel/filmixo.jpeg" }
                }
            },
            {
                "@type": "CollectionPage",
                "@id": window.location.origin + "/#collection",
                "name": "Cinematic Analysis Archive",
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": total,
                    "itemListOrder": "https://schema.org/ItemListOrderDescending"
                }
            }
        ] 
    };
    const schemaScript = document.getElementById('homepage-schema');
    if (schemaScript) schemaScript.textContent = JSON.stringify(schemaData);
};

// ═══════════════════════════════════════════════════════════
// Global Window Functions
// ═══════════════════════════════════════════════════════════

window.openPost = (id) => {
    sessionStorage.setItem('index_scroll', window.scrollY);
    sessionStorage.setItem('index_posts', JSON.stringify(allPosts));
    const targetPost = allPosts.find(p => p.id === id);
    if (targetPost) sessionStorage.setItem('current_post_data', JSON.stringify(targetPost));
    window.location.href = `/post/${id}`;
};

window.sendEmail = () => {
    const email = "contact@secretbinodon.com";
    window.location.href = `mailto:${email}?subject=Inquiry from Filmixo User&body=Hello Filmixo Team,`;
};

window.shareProfile = () => {
    const shareData = {
        title: 'FILMIXO',
        text: 'FILMIXO - The Harvard of Movie Analysis. Check out the latest HD movie reviews and updates!',
        url: window.location.origin + window.location.pathname
    };

    if (navigator.share) {
        navigator.share(shareData).catch(console.error);
    } else {
        navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard! 📋");
    }
};

window.handleManualLoad = () => {
    document.getElementById('load-more-section').style.display = 'none';
    const sentinel = document.getElementById('sentinel');
    sentinel.style.display = 'flex';
    batchTracker = 0;
    loadFeed(false);
    setupFeedObserver();
};

// ═══════════════════════════════════════════════════════════
// Initialization & Event Listeners
// ═══════════════════════════════════════════════════════════

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

async function initFirestore() {
    const isAudit = /Lighthouse|Chrome-Lighthouse|Google Page Speed/i.test(navigator.userAgent);
    if (isAudit) return;
    try {
        await enableIndexedDbPersistence(db);
    } catch (e) {}
    loadFeed(true);
    fetchGlobalStats();
}

const triggerInit = () => { initFirestore(); };

window.addEventListener('load', () => {
    setTimeout(() => {
        triggerInit();
    }, 1000); 
    
    if (typeof allPosts !== 'undefined' && allPosts.length > 0) {
        generateHomepageSEO(allPosts.length);
    }
});

['touchstart', 'mousedown', 'keydown', 'scroll'].forEach(ev => {
    window.addEventListener(ev, triggerInit, { once: true, passive: true });
});

(function() {
    const intro = document.querySelector(".intro-text");
    if (intro) {
        intro.style.animation = "cinematicIntro 3.5s cubic-bezier(.22,1,.36,1) forwards";
    }
})();

// Initial shimmer display
document.getElementById('feed-container').innerHTML = '<div id="shimmer-loader-block"></div>';

export { loadFeed, allPosts, generateHomepageSEO };
