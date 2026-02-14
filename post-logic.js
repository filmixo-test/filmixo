// ═══════════════════════════════════════════════════════════
// post-logic.js - Post Private Intelligence
// Purpose: Post-specific SEO, rendering, download logic
// ═══════════════════════════════════════════════════════════

import { db } from './engine.js';
import { timeAgo, formatCount } from './utils.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// ═══════════════════════════════════════════════════════════
// Configuration & State
// ═══════════════════════════════════════════════════════════

const CONFIG = { 
    GLOBAL_VIDEO_LINK: "https://prototypesorting.com/x0tq9pfa?key=5eaa0857eb30fd0efb62daca7ba27aec" 
};

const STAY_TIME = 5000; 
let timeElements = [];

const getPostId = () => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const idFromPath = pathSegments[pathSegments.length - 1];
    const idFromQuery = new URLSearchParams(window.location.search).get('id');
    return (pathSegments.includes('post') && idFromPath !== 'post') ? idFromPath : idFromQuery;
};

const postId = getPostId();

// ═══════════════════════════════════════════════════════════
// Premium SEO Generation
// ═══════════════════════════════════════════════════════════

const generatePremiumSEO = (post) => {
    if (!post) return;

    const getCleanMovieName = (title) => {
        let clean = title.split(/[,.\-|:_\(\)\[\]]|\bfull\b|\bdownload\b|\b202\d\b|\b1080p\b|\b720p\b/i)[0];
        return clean.trim();
    };

    const getSeed = (id) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    };

    const seed = getSeed(post.id);
    const movieName = getCleanMovieName(post.title);
    const fullTitle = `${post.title} | Official Review & Download - FILMIXO`;
    const rawDesc = post.paragraphs && post.paragraphs[0] ? post.paragraphs[0] : "Explore detailed production insights, VFX analysis, and technical movie reviews on FILMIXO.";
    const cleanDesc = rawDesc.substring(0, 160).replace(/["]/g, '') + "...";
    const formattedDate = post.uploadTime ? (post.uploadTime.includes('T') ? post.uploadTime : `${post.uploadTime}T09:00:00+06:00`) : new Date().toISOString();
    
    const randomRating = (4.6 + (seed % 5) / 10).toFixed(1);
    const randomVotes = Math.floor((seed % (2500000 - 500000 + 1)) + 500000);

    document.title = fullTitle;

    const metaTags = {
        "description": cleanDesc,
        "og:title": fullTitle,
        "og:description": cleanDesc,
        "og:image": post.mediaImage,
        "og:url": window.location.href,
        "twitter:card": "summary_large_image",
        "twitter:title": fullTitle,
        "twitter:description": cleanDesc,
        "twitter:image": post.mediaImage
    };

    Object.entries(metaTags).forEach(([name, content]) => {
        let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        if (!el) {
            el = document.createElement('meta');
            if (name.includes('og:') || name.includes('twitter:')) el.setAttribute('property', name);
            else el.setAttribute('name', name);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    });

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;

    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
        robots = document.createElement('meta');
        robots.name = "robots";
        document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'index, follow, max-image-preview:large');
        
    const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Movie",
                "@id": window.location.href + "#movie",
                "name": movieName,
                "image": [post.mediaImage],
                "description": rawDesc,
                "dateCreated": formattedDate,
                "datePublished": formattedDate,
                "dateModified": new Date().toISOString(),
                "director": { "@type": "Person", "name": `${movieName} Production Team` },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": randomRating,
                    "bestRating": "5",
                    "ratingCount": randomVotes.toString()
                }
            },
            {
                "@type": "VideoObject",
                "name": `${movieName} Official Trailer & Review`,
                "description": `Detailed visual analysis and official trailer preview of ${movieName}.`,
                "thumbnailUrl": [post.mediaImage],
                "uploadDate": formattedDate,
                "contentUrl": CONFIG.GLOBAL_VIDEO_LINK,
                "embedUrl": post.youtubeEmbed ? post.youtubeEmbed.split('src="')[1]?.split('"')[0] : CONFIG.GLOBAL_VIDEO_LINK,
                "potentialAction": {
                    "@type": "SeekAction",
                    "target": (post.youtubeEmbed ? post.youtubeEmbed.split('src="')[1]?.split('"')[0] : CONFIG.GLOBAL_VIDEO_LINK) + "={seek_to_second_number}",
                    "startOffset-input": "required name=seek_to_second_number"
                }
            },
            {
                "@type": "Review",
                "itemReviewed": { 
                    "@type": "Movie", 
                    "name": movieName, 
                    "image": post.mediaImage,
                    "@id": window.location.href + "#movie"
                },
                "reviewBody": rawDesc,
                "reviewRating": { "@type": "Rating", "ratingValue": randomRating, "bestRating": "5" },
                "author": { "@type": "Organization", "name": "FILMIXO Expert Panel" },
                "publisher": {
                    "@type": "Organization",
                    "name": "FILMIXO",
                    "logo": { "@type": "ImageObject", "url": "https://filmixo.vercel.app/thumbel/filmixo (1).jpg" }
                }
            }
        ]
    };

    let schemaScript = document.getElementById('dynamic-schema');
    if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'dynamic-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schemaData); 
};

// ═══════════════════════════════════════════════════════════
// Ad Injection Logic
// ═══════════════════════════════════════════════════════════

function injectAd(tid, cid) {
    const t = document.getElementById(tid), c = document.getElementById(cid);
    if (!t || !c) return;
    requestAnimationFrame(() => {
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%'; 
        iframe.style.height = '1px'; 
        iframe.style.border = 'none'; 
        iframe.scrolling = 'no';
        c.appendChild(iframe);
        const doc = iframe.contentWindow.document;
        doc.open(); 
        doc.write(`<html><body style="margin:0;display:flex;justify-content:center;">${t.innerHTML}<script>function rs(){const h=document.body.scrollHeight; if(h>10 && window.frameElement){const frame=window.frameElement; frame.style.height=h+'px'; const parent=frame.parentElement; parent.style.height=h+'px'; parent.style.marginTop='4px'; parent.style.marginBottom='4px';}} window.onload=rs; setInterval(rs,600);<\/script></body></html>`); 
        doc.close();
    });
}

// ═══════════════════════════════════════════════════════════
// Download Logic
// ═══════════════════════════════════════════════════════════

const checkTaskStatus = () => {
    const savedTask = sessionStorage.getItem('pendingDownloadTask');
    if (!savedTask) return;

    const task = JSON.parse(savedTask);
    const timeSpent = Date.now() - task.blurTime;

    if (timeSpent >= STAY_TIME) {
        let map = JSON.parse(localStorage.getItem(task.key)) || {};
        map[task.id] = task.type;
        localStorage.setItem(task.key, JSON.stringify(map));
    }
    sessionStorage.removeItem('pendingDownloadTask');
};

window.handleDownloadClick = (btnId, pId, ad1, ad2) => {
    const key = `map_${pId}`;
    let map = JSON.parse(localStorage.getItem(key)) || {};
    
    if (map[btnId]) {
        if (map[btnId] === 'ad1') location.href = ad1;
        else if (map[btnId] === 'ad2') location.href = ad2;
        return;
    }

    let assignedCount = Object.keys(map).length;
    if (assignedCount < 2) {
        const taskType = (assignedCount === 0) ? 'ad1' : 'ad2';
        const adLink = (assignedCount === 0) ? ad1 : ad2;
        const taskData = { id: btnId, type: taskType, key: key, blurTime: Date.now() };
        sessionStorage.setItem('pendingDownloadTask', JSON.stringify(taskData));
        location.href = adLink;
    } else {
        localStorage.removeItem(key);
        location.href = `/download?id=${pId}`;
    }
};

// ═══════════════════════════════════════════════════════════
// Post Rendering
// ═══════════════════════════════════════════════════════════

function renderPost(post) {  
    const sk = document.getElementById('skeleton-loader'); 
    if(sk) sk.remove();
    const paras = post.paragraphs || [];        
    let body = "";
    paras.forEach((p, i) => {
        if (i < paras.length - 1) {
            body += `<p class="article-para">${p}</p>`;
            if(i === 0) body += `<div id="ad-box-p1" class="ad-box"></div>`;
            if(i === 1) body += `<div class="dual-ad-wrapper"><div id="ad-box-p2-l" class="ad-box"></div><div id="ad-box-p2-r" class="ad-box"></div></div>`;
            if(i === 2) body += `<div id="ad-box-mid" class="ad-box"></div>`;
        }
    });

    const grads = ["linear-gradient(180deg, #D32F2F 0%, #B71C1C 100%)", "linear-gradient(180deg, #1976D2 0%, #0D47A1 100%)", "linear-gradient(180deg, #388E3C 0%, #1B5E20 100%)"];       

    document.getElementById('post-details-container').innerHTML = `
                   
      <div id="ad-box-top" class="ad-box"></div>
           <div class="video-container" onclick="handleVideoClick()">
           <img src="${post.mediaImage}" alt="Watch ${post.title} Movie Online" decoding="sync" fetchpriority="high" id="main-img">
            <div class="play-btn-center"></div><div class="main-video-spinner" id="main-spinner"></div>
             <div class="video-controls">
                <span>${post.videoDuration}</span>
                <div class="v-divider"></div>
                <svg width="22" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; display: inline-block;"><path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.02C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/></svg>
                
                <div class="prog-bg"><div class="prog-fill"></div></div>
                <span class="hd-badge">HD</span>
            </div>
        </div>
        <div class="content-body">
            <h1 class="article-title">${post.title}</h1>
            <div id="ad-box-title" class="ad-box"></div>
            ${body}
            ${post.youtubeEmbed ? `<div class="youtube-embed-wrapper" style="display:block;">${post.youtubeEmbed.replace('<iframe', '<iframe loading="lazy"')}</div>` : ''} <div id="ad-box-video" class="ad-box"></div> 
            <p class="article-para">${paras[paras.length-1] || ''}</p>
            <div class="download-title-text">🔰 Access High-Definition Sources Below 🔰</div>
                <div class="download-buttons-container">
                <div role="button" aria-label="Download 1080p Full HD" onclick="handleDownloadClick('b1','${post.id}','${post.adLink1}','${post.adLink2}')" class="download-btn-v2" style="background:${grads[0]}"><span class="btn-text-main">[ M-1080 ]</span></div>
               <div role="button" aria-label="Download 720p HD Ready" onclick="handleDownloadClick('b2','${post.id}','${post.adLink1}','${post.adLink2}')" class="download-btn-v2" style="background:${grads[1]}"><span class="btn-text-main">[ M-720 ]</span></div>
            <div role="button" aria-label="Download 360p Mobile" onclick="handleDownloadClick('b3','${post.id}','${post.adLink1}','${post.adLink2}')" class="download-btn-v2" style="background:${grads[2]}"><span class="btn-text-main">[ M-360 ]</span></div>
            </div>
             <div class="stats-section">
                <div class="view-stat" style="display: flex; align-items: center;">
                    <svg viewBox="0 0 512 512" style="width:20px;height:20px;margin-right:3px;fill:#1da1f2;vertical-align:middle;">
                        <path d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"/>
                    </svg> 
                    <span class="signature-name">Ashiqur</span>
                </div>
                <div class="love-btn">🕵️</div>
                <div class="share-icons">
                    <div class="share-icon" role="button" aria-label="Share on Facebook" style="background:#1877f2" onclick="sh('fb')"><svg viewBox="0 0 320 512" style="width:10px;height:12px;fill:white;"><path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14V299.3H80z"/></svg></div>
                    <div class="share-icon" role="button" aria-label="Share on Messenger" style="background:#0084ff" onclick="sh('msg')"><svg viewBox="0 0 512 512" style="width:12px;height:12px;fill:white;"><path d="M256.55 8C116.52 8 8 110.34 8 248.57c0 72.3 29.71 134.78 78.07 177.94 8.35 7.51 6.63 11.86 8.05 58.23 1.15 37.6 15 31.7 31.31 23.08l41.68-22.06c13.1-4 27.31-7.1 41.52-8.05l41.52 1.42C396.58 489.13 504 386.79 504 248.57 504 110.34 396.58 8 256.55 8zm131.81 190.15l-69.74 110.3c-11.86 18.41-36.85 21.72-52.54 6.64l-53.53-51.11-105.74 51.11c-15.14 7.5-31.22-9.53-22.7-23.77l69.74-110.3c11.86-18.41 36.85-21.72 52.54-6.64l53.53 51.11 105.74-51.11c15.14-7.51 31.22 9.51 22.7 23.77z"/></svg></div>
                    <div class="share-icon" role="button" aria-label="Share on WhatsApp" style="background:#25d366" onclick="sh('wa')"><svg viewBox="0 0 448 512" style="width:12px;height:12px;fill:white;"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18s-8.8-2.8-12.4 2.8-14.2 18-17.4 21.7-6.5 4.2-12 1.4c-5.5-2.8-23.2-8.5-44.3-27.3-16.4-14.6-27.4-32.7-30.7-38.2s-.4-8.5 2.4-11.2c2.5-2.6 5.5-6.4 8.2-9.6s3.7-5.5 5.5-9.1.9-6.9-.5-9.6-12.4-29.9-17-40.9c-4.5-10.8-9.1-9.3-12.4-9.5-3.2-.2-6.9-.2-10.5-.2s-9.6 1.3-14.6 6.9-19.2 18.7-19.2 45.6 19.6 53 22.3 56.7c2.8 3.7 38.5 58.8 93.4 82.5 13.1 5.7 23.3 9.1 31.3 11.6 13.1 4.2 25.1 3.6 34.6 2.1 10.6-1.5 32.8-13.4 37.4-26.4s4.6-24.1 3.2-26.4-5.5-3.7-11-6.5z"/></svg></div>
                    <div class="share-icon" role="button" aria-label="Share on Twitter" style="background:#1da1f2" onclick="sh('tw')"><svg viewBox="0 0 512 512" style="width:12px;height:12px;fill:white;"><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-77.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.319 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/></svg></div>
                    <div class="share-icon" role="button" aria-label="Share on Telegram" style="background:#0088cc" onclick="sh('tg')"><svg viewBox="0 0 496 512" style="width:12px;height:12px;fill:white;"><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm121.8 169.9l-40.7 191.8c-3 13.6-11.1 16.9-22.4 10.5l-62-45.7-29.9 28.8c-3.3 3.3-6.1 6.1-12.5 6.1l4.4-63.1 114.9-103.8c5-4.4-1.1-6.9-7.7-2.5l-142 89.4-61.2-19.1c-13.3-4.2-13.6-13.3 2.8-19.7l239.1-92.2c11.1-4 20.8 2.7 17.2 19.5z"/></svg></div> 
                </div>
            </div>
        </div>`;

    requestAnimationFrame(() => {
        injectAd('ad-src-top', 'ad-box-top');
        injectAd('ad-src-title', 'ad-box-title');
        injectAd('ad-src-p1', 'ad-box-p1');
        injectAd('ad-src-p2', 'ad-box-p2-l');
        injectAd('ad-src-p2', 'ad-box-p2-r');
        injectAd('ad-src-mid', 'ad-box-mid');
        injectAd('ad-src-video', 'ad-box-video');
    });

    const img = document.getElementById('main-img');
    img.onload = () => { 
        if(img.naturalWidth/img.naturalHeight < 1.2) img.closest('.video-container').classList.add('auto-fit'); 
    };
    
    const timeSlot = document.getElementById('status-time-slot'); 
    if (timeSlot) {
        timeSlot.innerHTML = `<svg viewBox="0 0 512 512" style="width:12px;height:12px;fill:var(--acc);margin-right:5px;vertical-align:middle;"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8L334 337.7c-3.9 5.3-11.4 6.5-16.2 2.7z"/></svg><span style="color:var(--acc);font-weight:900;">${timeAgo(post.uploadTime)}</span>`;
        timeElements = [{ el: timeSlot.querySelector('span'), date: post.uploadTime }];
    }
}

// ═══════════════════════════════════════════════════════════
// Init & Process Logic
// ═══════════════════════════════════════════════════════════

async function init() {
    if (!postId) { window.location.href = '/'; return; }
    
    const cachedData = sessionStorage.getItem('current_post_data');
    
    if (cachedData) {
        try {
            const post = JSON.parse(cachedData);
            if (post.id === postId || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === postId) {
                processPost(post);
                return;
            }
        } catch (e) { console.error("Cache parse error"); }
    }
    
    const docRef = doc(db, "posts", postId);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            processPost(docSnap.data());
        } else {
            window.location.href = '/movie/index.html';
        }
    } catch (e) {
        console.error(e);
        document.getElementById('app-wrapper').classList.add('loaded');
    }
}

function processPost(post) {
    const preloader = new Image();
    preloader.src = post.mediaImage;
    renderPost(post);
    generatePremiumSEO(post);
    document.getElementById('app-wrapper').classList.add('loaded');
    restoreScroll();
    setTimeout(() => {
        setInterval(() => {
            timeElements.forEach(i => i.el.innerText = timeAgo(i.date));
        }, 60000);
    }, 2000);
}

function setupFirebase(id) {
    console.log("Post loaded: " + id);
}

window.handleVideoClick = () => {
    document.querySelector('.video-container').classList.add('is-loading');
    setTimeout(() => { location.href = CONFIG.GLOBAL_VIDEO_LINK; }, 100);
};

window.onbeforeunload = () => { 
    if(postId) sessionStorage.setItem(`sp_${postId}`, window.scrollY); 
};

function restoreScroll() { 
    const s = sessionStorage.getItem(`sp_${postId}`); 
    if(s) setTimeout(() => window.scrollTo(0, parseInt(s)), 150); 
}

window.addEventListener('pageshow', () => { 
    checkTaskStatus();
    const c = document.querySelector('.video-container'); 
    if(c) c.classList.remove('is-loading'); 
});

window.onfocus = checkTaskStatus;
window.addEventListener('load', checkTaskStatus);

// ═══════════════════════════════════════════════════════════
// Initialize Post Page
// ═══════════════════════════════════════════════════════════

init();

export { init, processPost, generatePremiumSEO, renderPost };
