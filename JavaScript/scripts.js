// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Hero animations on page load
window.addEventListener('DOMContentLoaded', () => {
    // Animate cross image
    gsap.from('.cross-image', {
        duration: 1,
        scale: 0,
        rotation: 180,
        ease: 'back.out(1.7)',
        delay: 0.2
    });
    // Animate hero title
    gsap.from('.hero-title', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.6
    });

    // Animate hero subtitle
    gsap.from('.hero-subtitle', {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.8
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Animate content cards on scroll
gsap.utils.toArray('.content-card').forEach((card, index) => {
    gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            end: 'top 50%',
            toggleActions: 'play none none reverse'
        }
    });

    // Animate card image
    gsap.from(card.querySelector('.card-image'), {
        scale: 0.8,
        rotation: 5,
        duration: 0.8,
        ease: 'back.out(1.7)',
        scrollTrigger: {
            trigger: card,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
        }
    });

    // Animate card content
    gsap.from(card.querySelector('.card-content'), {
        x: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: card,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
        }
    });
});

// Button hover animations
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', function() {
        gsap.to(this, {
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out'
        });
    });

    button.addEventListener('mouseleave', function() {
        gsap.to(this, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
});

// Parallax effect for hero section
gsap.to('.hero-content', {
    y: 100,
    opacity: 0.5,
    ease: 'none',
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
    }
});

// Navbar background change on scroll
ScrollTrigger.create({
    start: 'top -80',
    end: 99999,
    toggleClass: {
        targets: '.navbar',
        className: 'scrolled'
    }
});