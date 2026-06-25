/**
 * Rockable Global Scripts
 * Controls layout interactions, mobile hamburger menus, 
 * scrolling header transformations, and Dark/Light theme toggling.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Hamburger Menu ---
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when navigation link is clicked
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // --- Scroll-Activated Sticky Header ---
    const header = document.getElementById('main-header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            // Keep header sticky styled unless at the very top of home page
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                // If on secondary page, keep scrolled background styling
                const isHome = window.location.pathname.endsWith('index.html') || 
                               window.location.pathname.endsWith('/') ||
                               !window.location.pathname.includes('.html');
                if (isHome) {
                    header.classList.remove('scrolled');
                }
            }
        });
    }

    // --- Dark / Light Theme Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;

    // Check cached theme or fallback to user preferred settings
    const savedTheme = localStorage.getItem('melodix_theme') || 'dark';
    
    // Set initial theme
    setTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(nextTheme);
        });
    }

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('melodix_theme', theme);

        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
            themeIcon.parentElement.setAttribute('aria-label', theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme');
        }
    }
});
