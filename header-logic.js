// ═══════════════════════════════════════════════════════════
// header-logic.js - Header Logic
// Purpose: Header UI behavior, glow effect, scroll dynamics
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// Header Event Handlers
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// Active Glow Initialization (Automatic on Load)
// ═══════════════════════════════════════════════════════════

(function initActiveGlow() {
    const glowElement = document.querySelector('.active-glow');
    if (glowElement) {
        // Glow is already animated via CSS
        // This function exists for future enhancements
    }
})();

export { };
