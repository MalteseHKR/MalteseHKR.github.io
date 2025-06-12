// Smooth scrolling for navigation links
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

// Add scroll effect to project cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideInUp 0.6s ease forwards';
        }
    });
}, observerOptions);

// Observe all project cards
document.querySelectorAll('.project-card, .skill-category').forEach(card => {
    observer.observe(card);
});

// Add click interaction to project cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'translateY(-10px)';
        }, 150);
    });
});

// Dynamic typing effect for hero subtitle
const subtitle = document.querySelector('.hero .subtitle');
const originalText = subtitle.textContent;
const typingTexts = [
    'Crafting Digital Experiences That Matter',
    'Building Tomorrow\'s Applications Today',
    'Turning Ideas Into Reality',
    'Creating Seamless User Experiences'
];

let currentTextIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
    const currentText = typingTexts[currentTextIndex];
    
    if (isDeleting) {
        subtitle.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        subtitle.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }
    
    if (!isDeleting && charIndex === currentText.length) {
        setTimeout(() => isDeleting = true, 2000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        currentTextIndex = (currentTextIndex + 1) % typingTexts.length;
    }
    
    const typingSpeed = isDeleting ? 50 : 100;
    setTimeout(typeWriter, typingSpeed);
}

// Start typing effect after initial load
setTimeout(() => {
    typeWriter();
}, 2000);