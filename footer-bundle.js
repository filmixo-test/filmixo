
// Filmixo Lab Dynamic Footer & Authority Engine
document.addEventListener('DOMContentLoaded', () => {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    const footerHTML = `
    <footer style="background: #080808; border-top: 1px solid rgba(212,175,55,0.1); padding: 60px 5% 30px; margin-top: 50px; color: #888;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-bottom: 40px;">
            
            <!-- Column 1: Brand & Intel -->
            <div>
                <h2 style="color: var(--accent-gold); font-size: 24px; margin-bottom: 15px; letter-spacing: 2px;">FILMIXO</h2>
                <p style="font-size: 14px; line-height: 1.8; text-align: justify;">
                    Filmixo operates as a Cinematic Forensic Lab, dedicated to the deconstruction of narrative entropy and the analysis of speculative horror assets. We separate myth from material reality through disciplined authorial throughlines.
                </p>
            </div>

            <!-- Column 2: Archives & Access -->
            <div>
                <h3 style="color: #eee; font-size: 16px; margin-bottom: 20px; text-transform: uppercase;">Lab Access</h3>
                <ul style="list-style: none; font-size: 14px;">
                    <li style="margin-bottom: 10px;"><a href="index.html" style="color: inherit; text-decoration: none; transition: 0.3s;" onmouseover="this.style.color='var(--accent-gold)'" onmouseout="this.style.color='inherit'">Central Hub</a></li>
                    <li style="margin-bottom: 10px;"><a href="category.html?cat=Speculative%20Assets" style="color: inherit; text-decoration: none; transition: 0.3s;" onmouseover="this.style.color='var(--accent-gold)'" onmouseout="this.style.color='inherit'">Asset Archives</a></li>
                    <li style="margin-bottom: 10px;"><a href="#" style="color: inherit; text-decoration: none;">Privacy Protocol</a></li>
                    <li style="margin-bottom: 10px;"><a href="#" style="color: inherit; text-decoration: none;">Terms of Forensic Audit</a></li>
                </ul>
            </div>

            <!-- Column 3: Neuro-Link CTA (Mail) -->
            <div>
                <h3 style="color: #eee; font-size: 16px; margin-bottom: 20px; text-transform: uppercase;">Join The Lab</h3>
                <p style="font-size: 13px; margin-bottom: 15px;">Receive high-definition access to curated post-apocalyptic discourse.</p>
                <a href="mailto:official@filmixo.com?subject=Lab Access Request" 
                   style="display: inline-block; padding: 12px 25px; border: 1px solid var(--accent-gold); color: var(--accent-gold); text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 2px; transition: all 0.4s;"
                   onmouseover="this.style.background='var(--accent-gold)'; this.style.color='#000';"
                   onmouseout="this.style.background='transparent'; this.style.color='var(--accent-gold)';">
                   SYNCHRONIZE EMAIL
                </a>
            </div>
        </div>

        <!-- Final Copyright & Signal Status -->
        <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} FILMIXO OFFICIAL. ALL RIGHTS RESERVED.</p>
            <div style="display: flex; align-items: center; gap: 15px;">
                <span>STATUS: <span style="color: var(--glowing-green);">ONLINE</span></span>
            </div>
        </div>
    </footer>`;

    footerPlaceholder.innerHTML = footerHTML;
});