// ═══════════════════════════════════════════════════════════
// utils.js - Universal Shared Helpers
// Purpose: Reusable helper functions for both pages
// ═══════════════════════════════════════════════════════════

export function formatCount(c) {
    if (!c || c === 0) return "0";
    if (c >= 1e9) return (c / 1e9).toFixed(1).replace('.0', '') + 'B';
    if (c >= 1e6) return (c / 1e6).toFixed(1).replace('.0', '') + 'M';
    if (c >= 1e3) return (c / 1e3).toFixed(1).replace('.0', '') + 'K';
    return c.toString();
}

export function formatDate(d) {
    if (!d || !d.toDate) return "";
    const date = d.toDate();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

export function timeAgo(uploadTime) {
    if (!uploadTime) return "";
    const now = Date.now();
    const postDate = uploadTime.toDate ? uploadTime.toDate().getTime() : new Date(uploadTime).getTime();
    const diffMs = now - postDate;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    
    if (diffYear > 0) return `${diffYear}y ago`;
    if (diffMonth > 0) return `${diffMonth}mo ago`;
    if (diffWeek > 0) return `${diffWeek}w ago`;
    if (diffDay > 0) return `${diffDay}d ago`;
    if (diffHour > 0) return `${diffHour}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return "Just now";
}

export function runIdle(fn) {
    if ("requestIdleCallback" in window) {
        requestIdleCallback(fn);
    } else {
        setTimeout(fn, 1);
    }
}

export function sh(p) {
    const title = document.querySelector('.article-title')?.innerText || document.title || "Check this out";
    const url = location.href;
    const fullText = encodeURIComponent(title + "\n\n" + url);
    const encodedUrl = encodeURIComponent(url);
    
    let l = '';
    if(p==='fb') l = `https://fb.com/sharer/sharer.php?u=${encodedUrl}`;
    else if(p==='wa') l = `https://wa.me/?text=${fullText}`;
    else if(p==='msg') l = `fb-messenger://share/?link=${encodedUrl}`;
    else if(p==='tw') l = `https://twitter.com/intent/tweet?text=${fullText}`;
    else if(p==='tg') l = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(title)}`;
    window.open(l, '_blank');
}
