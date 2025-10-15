document.addEventListener('DOMContentLoaded', () => {
    
    // ===================================================================
    // 1. LANDING PAGE DYNAMIC BEHAVIORS
    // ===================================================================
    
    const particlesContainer = document.getElementById('particles');

    /**
     * Creates and appends animated particle elements to the background.
     */
    function createParticles() {
        if (!particlesContainer) return;
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle'; // Style is in style.css
            
            // Randomize properties for a natural look
            const size = Math.random() * 100 + 50;
            particle.style.width = `${size}px`;
            particle.style.height = particle.style.width;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 20}s`;
            particle.style.animationDuration = `${Math.random() * 10 + 15}s`;
            
            particlesContainer.appendChild(particle);
        }
    }

    /**
     * Animates numbers in elements with the '.counter' class from 0 to their data-target value.
     */
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const duration = 2000; // Animation duration in ms
            let current = 0;
            const step = target / (duration / 16); // ~60fps
            
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target; // Ensure it ends on the exact target
                }
            };
            updateCounter();
        });
    }

    /**
     * Adds an 'active' class to '.reveal' elements when they scroll into the viewport.
     */
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('active');
            }
        });
    }

    // Initialize landing page features
    if (document.getElementById('landing-page')) {
        createParticles();
        setTimeout(animateCounters, 500); // Delay counter to ensure visibility
        window.addEventListener('scroll', revealOnScroll);
        revealOnScroll(); // Run once on load
    }
    
    // ===================================================================
    // 2. ONBOARDING FLOW LOGIC & PAGE TRANSITION
    // ===================================================================
    
    const landingPage = document.getElementById('landing-page');
    const mainHeader = document.getElementById('main-header');
    const onboardingFlow = document.getElementById('onboarding-flow');
    const getStartedBtn = document.getElementById('get-started-btn');

    const nextStepBtn = document.getElementById('next-step-btn');
    const prevStepBtn = document.getElementById('prev-step-btn');
    const onboardingSteps = document.querySelectorAll('.onboarding-step');
    const progressCheckmarks = document.querySelectorAll('#progress-summary .check-icon');

    const TOTAL_STEPS = onboardingSteps.length;
    let currentStep = 0;

    /**
     * Displays the specified step and hides all others. Updates navigation buttons.
     * @param {number} stepIndex - The index of the step to show.
     */
    function showStep(stepIndex) {
        // Hide all steps
        onboardingSteps.forEach(step => step.classList.add('hidden'));
        
        // Show the current step
        const activeStep = document.getElementById(`step-${stepIndex}`);
        if (activeStep) {
            activeStep.classList.remove('hidden');
            activeStep.classList.add('fade-in'); // Add animation
        }

        // Update Previous button visibility
        prevStepBtn.classList.toggle('hidden', stepIndex === 0);

        // Update Next button text
        if (stepIndex === TOTAL_STEPS - 1) {
            nextStepBtn.innerHTML = 'Générer le Brand Passport <svg class="ml-2 h-4 w-4" fill="none" ...></svg>';
        } else {
            nextStepBtn.innerHTML = 'Suivant <svg class="ml-2 h-4 w-4" fill="none" ...></svg>';
        }
    }
    
    /**
     * Updates the progress summary checkmarks based on the current step.
     * @param {number} stepIndex - The current step index.
     */
    function updateProgress(stepIndex) {
        progressCheckmarks.forEach((checkmark, index) => {
            if (index < stepIndex) {
                checkmark.classList.add('text-green-500');
                checkmark.classList.remove('text-neutral-700');
            } else {
                checkmark.classList.remove('text-green-500');
                checkmark.classList.add('text-neutral-700');
            }
        });
    }

    // Event listener for the "Get Started" button to transition to the form
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            // Hide landing page elements
            if(landingPage) landingPage.classList.add('hidden');
            if(mainHeader) mainHeader.classList.add('hidden');
            document.body.classList.remove('animated-gradient');
            document.body.classList.add('onboarding-active');
            
            // Show the onboarding flow
            if(onboardingFlow) {
                onboardingFlow.classList.remove('hidden');
                onboardingFlow.classList.add('flex');
            }
            
            // Initialize the form view
            showStep(0);
            updateProgress(0);
        });
    }
    
    // Event listeners for form navigation
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', () => {
            if (currentStep < TOTAL_STEPS - 1) {
                currentStep++;
                showStep(currentStep);
                updateProgress(currentStep);
            } else {
                // Final step action
                alert('Brand Passport généré avec succès ! 🎉');
            }
        });
    }

    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
                updateProgress(currentStep);
            }
        });
    }
});