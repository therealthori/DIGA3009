// Initialize GSAP animations on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeAnimations();
    initializeScrollAnimations();
});

// Initial page load animations
function initializeAnimations() {
    // Header animations
    gsap.from('.about-title', {
        duration: 1,
        y: -50,
        opacity: 0,
        ease: 'power3.out'
    });

    gsap.from('.about-subtitle', {
        duration: 1,
        y: -30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.2
    });

    // Animate first content section
    gsap.from('.content-section:first-of-type', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.4
    });
}

// Scroll-triggered animations
function initializeScrollAnimations() {
    // Animate content sections on scroll
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach((section, index) => {
        if (index > 0) { // Skip first one as it's animated on load
            gsap.from(section, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                },
                duration: 0.8,
                y: 50,
                opacity: 0,
                ease: 'power2.out'
            });
        }
    });

    // Animate creator section
    gsap.from('.creator-card', {
        scrollTrigger: {
            trigger: '.creator-section',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        duration: 1,
        scale: 0.9,
        opacity: 0,
        ease: 'back.out(1.7)'
    });
}

// Add smooth scroll behavior for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add hover effects to social links
const socialLinks = document.querySelectorAll('.social-link');
socialLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
        gsap.to(this, {
            scale: 1.15,
            duration: 0.3,
            ease: 'back.out(1.7)'
        });
    });

    link.addEventListener('mouseleave', function() {
        gsap.to(this, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
});