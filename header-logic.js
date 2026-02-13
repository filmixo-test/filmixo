
// Filmixo Header & Navigation Intelligence
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const glowDot = document.querySelector('.glow-dot');
    const searchBtn = document.getElementById('search-trigger-btn');

    // --- 1. Header Scroll Dynamics ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(5, 5, 5, 0.95)';
            header.style.padding = '10px 5%';
        } else {
            header.style.background = 'rgba(5, 5, 5, 0.85)';
            header.style.padding = '12px 5%';
        }
    });

    // --- 2. Glowing Green Dot Intelligence ---
    // এটি ল্যাবের স্ট্যাটাস 'Active' সিগন্যাল হিসেবে পালস রেট নিয়ন্ত্রণ করে
    const setLabStatus = (isActive) => {
        if (isActive) {
            glowDot.style.background = 'var(--glowing-green)';
            glowDot.style.boxShadow = '0 0 15px var(--glowing-green)';
        } else {
            glowDot.style.background = '#ff4444';
            glowDot.style.boxShadow = '0 0 10px #ff4444';
        }
    };

    // --- 3. Search Interaction ---
    searchBtn.addEventListener('click', () => {
        // ফিউচার ক্যাটাগরি বা সার্চ ওভারলে কল করার জন্য
        const query = prompt("ENTER SEARCH PARAMETERS:");
        if (query) {
            window.location.href = `category.html?search=${encodeURIComponent(query)}`;
        }
    });

    // --- 4. Lab Connectivity Simulation ---
    // এটি ন্যানো-সেকেন্ড গ্যাপে পালস সিগন্যাল আপডেট করে লাক্সারিয়াস ফিল দেয়
    setInterval(() => {
        glowDot.style.opacity = Math.random() * (1 - 0.7) + 0.7;
    }, 1500);
});