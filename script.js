// Particle system
function createParticles() {
    const container = document.getElementById('particles');
    // A null check is good practice in case the element doesn't exist
    if (!container) return;

    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 100 + 50 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        container.appendChild(particle);
    }
}

// Counter animation
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        if (isNaN(target)) return; // Skip if data-target is not a number

        const duration = 2000;
        let start = 0;
        const stepTime = 16; // roughly 60fps
        const totalSteps = duration / stepTime;
        const step = target / totalSteps;
        
        const updateCounter = () => {
            start += step;
            if (start < target) {
                counter.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Scroll reveal
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    const windowHeight = window.innerHeight;

    reveals.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        
        // Add a buffer so the element reveals a bit after it enters the viewport
        if (elementTop < windowHeight - 100) {
            element.classList.add('active');
        }
    });
}

// Smooth scroll for navigation links
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Parallax effect for floating elements
function parallaxEffect(e) {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    document.querySelectorAll('.float-animation').forEach((el, index) => {
        const speed = (index + 1) * -15; // Invert direction for a more natural feel
        // Use translate3d for better performance
        el.style.transform = `translate3d(${x * speed}px, ${y * speed}px, 0)`;
    });
}

// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    animateCounters();
    revealOnScroll(); // Run once on load
    smoothScroll();

    // Attach event listeners
    window.addEventListener('scroll', revealOnScroll);
    window.addEventListener('mousemove', parallaxEffect);
});