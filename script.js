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

// Carousel functionality - One image at a time
let currentSlide = 0;
let totalImages = 14;

function updateCarousel() {
    const images = document.querySelectorAll('.project-image');
    const counter = document.getElementById('carouselCounter');
    const indicators = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!images.length) return;
    
    // Hide all images
    images.forEach(img => img.classList.remove('active'));
    
    // Show current image
    if (images[currentSlide]) {
        images[currentSlide].classList.add('active');
    }
    
    // Update counter
    counter.textContent = `${currentSlide + 1} / ${totalImages}`;
    
    // Update indicators
    indicators.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
    
    // Update buttons
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === totalImages - 1;
}

function moveCarousel(direction) {
    currentSlide += direction;
    if (currentSlide < 0) currentSlide = 0;
    if (currentSlide >= totalImages) currentSlide = totalImages - 1;
    updateCarousel();
}

function goToSlide(slideIndex) {
    if (slideIndex >= 0 && slideIndex < totalImages) {
        currentSlide = slideIndex;
        updateCarousel();
    }
}

// Initialize carousel on page load
document.addEventListener('DOMContentLoaded', function() {
    // Create indicators for all images
    const indicatorsContainer = document.getElementById('carouselIndicators');
    if (indicatorsContainer) {
        indicatorsContainer.innerHTML = '';
        for (let i = 0; i < totalImages; i++) {
            const dot = document.createElement('span');
            dot.className = 'carousel-dot';
            if (i === 0) dot.classList.add('active');
            dot.onclick = () => goToSlide(i);
            indicatorsContainer.appendChild(dot);
        }
    }
    
    // Initialize first image
    updateCarousel();
    
    // Image modal functionality
    const images = document.querySelectorAll('.project-image');
    
    images.forEach(img => {
        img.addEventListener('click', function() {
            openImageModal(this.src, this.alt);
        });
    });
    
    // Auto-slide functionality (optional)
    setInterval(() => {
        if (currentSlide < totalImages - 1) {
            moveCarousel(1);
        } else {
            currentSlide = 0;
            updateCarousel();
        }
    }, 4000); // Auto-slide every 4 seconds
});

function openImageModal(src, alt) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('imageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <img class="modal-image" src="" alt="">
                <div class="modal-caption"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .image-modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.8);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                position: relative;
                margin: 5% auto;
                width: 90%;
                max-width: 400px;
                text-align: center;
            }
            
            .modal-image {
                width: 100%;
                height: auto;
                max-height: 70vh;
                object-fit: contain;
                border-radius: 10px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            }
            
            .close-modal {
                position: absolute;
                top: -40px;
                right: 0;
                color: white;
                font-size: 30px;
                font-weight: bold;
                cursor: pointer;
                transition: color 0.3s ease;
            }
            
            .close-modal:hover {
                color: #ff6b6b;
            }
            
            .modal-caption {
                color: white;
                margin-top: 15px;
                font-size: 1.1rem;
            }
        `;
        document.head.appendChild(style);
        
        // Close modal events
        modal.querySelector('.close-modal').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Set modal content and show
    modal.querySelector('.modal-image').src = src;
    modal.querySelector('.modal-image').alt = alt;
    modal.querySelector('.modal-caption').textContent = alt;
    modal.style.display = 'block';
}

// Dynamic typing effect for hero subtitle
const subtitle = document.querySelector('.hero .subtitle');
if (subtitle) {
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
}
