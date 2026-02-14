// ═══════════════════════════════════════════════════════════
// footer-bundle.js - Footer Bundle
// Purpose: Inject footer structure into placeholder
// ═══════════════════════════════════════════════════════════

const footerHTML = `
<footer id="main-footer">
    <div class="footer-content">
        <div class="footer-grid">
            <div class="footer-brand">
                <div class="footer-logo">
                    <div class="logo-icon">
                        <i class="fa-video-slash" style="color:white; font-size: 18px;"></i>
                    </div>
                    <div class="logo-text">
                        <h1>FILMIXO</h1>
                        <p>Cinema Intelligence Platform</p>
                    </div>
                </div>
                <p class="footer-description">
                    Forensic film analysis that exposes industry secrets, technical breakdowns, and narrative entropy. 
                    Where cinematic truth meets intelligence-grade reporting.
                </p>
            </div>

            <div>
                <h5 class="footer-section-title">INTELLIGENCE</h5>
                <div class="footer-links">
                    <a href="#" class="footer-link">Forensic Analysis</a>
                    <a href="#" class="footer-link">Technical Breakdown</a>
                    <a href="#" class="footer-link">Industry Secrets</a>
                    <a href="#" class="footer-link">Archive</a>
                </div>
            </div>

            <div>
                <h5 class="footer-section-title">PLATFORM</h5>
                <div class="footer-links">
                    <a href="about.html" class="footer-link">About Us</a>
                    <a href="contact.html" class="footer-link">Contact</a>
                    <a href="privacy.html" class="footer-link">Privacy Policy</a>
                    <a href="terms.html" class="footer-link">Terms of Service</a>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <p>© 2026 FILMIXO. All intelligence proprietary.</p>
            <p class="footer-mono">FORENSIC CINEMA REPORTING SINCE 2024</p>
        </div>
    </div>
</footer>
`;

function injectFooter() {
    const placeholder = document.getElementById('footer-placeholder');
    if (placeholder) {
        placeholder.innerHTML = footerHTML;
    } else {
        // If no placeholder, append to body
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            mainContainer.insertAdjacentHTML('beforeend', footerHTML);
        }
    }
}

// Auto-inject on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
} else {
    injectFooter();
}

export { injectFooter, footerHTML };
