// ==============================================
// MICHAEL FARRUGIA - PORTFOLIO WEBSITE
// ==============================================

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

// Mobile menu toggle functionality
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');

if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        
        // Update aria-expanded attribute for accessibility
        const isExpanded = navLinks.classList.contains('active');
        mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
        
        // Prevent body scroll when menu is open
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navLinks.contains(event.target);
        const isClickOnToggle = mobileMenuToggle.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnToggle && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });

    // Close mobile menu on escape key press
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
}

// Enhanced scroll detection for header styling
let lastScrollTop = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add/remove scrolled class for styling
    if (scrollTop > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Hide/show header on scroll (optional)
    if (scrollTop > lastScrollTop && scrollTop > 200) {
        // Scrolling down
        header.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
}, { passive: true });

// Active navigation link highlighting
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    let current = '';
    const scrollPosition = window.scrollY + 200; // Offset for better UX
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

// Throttled scroll listener for performance
let scrollTimeout;
window.addEventListener('scroll', function() {
    if (scrollTimeout) return;
    
    scrollTimeout = setTimeout(() => {
        updateActiveNavLink();
        scrollTimeout = null;
    }, 50);
}, { passive: true });

// Initialize active link on page load
document.addEventListener('DOMContentLoaded', function() {
    updateActiveNavLink();
});

// Enhanced keyboard navigation
document.addEventListener('keydown', function(event) {
    // Tab trap for mobile menu when open
    if (navLinks && navLinks.classList.contains('active')) {
        const focusableElements = navLinks.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        if (event.key === 'Tab') {
            if (event.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    event.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusable) {
                    event.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    }
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const scrollAnimationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideInUp 0.6s ease forwards';
            entry.target.classList.add('animate-in');
            
            // Stagger animation for child elements
            const children = entry.target.querySelectorAll('.feature-tag, .tech-tag, .skill-category, .contact-link');
            children.forEach((child, index) => {
                child.style.animationDelay = `${index * 0.1}s`;
                child.classList.add('animate-in');
            });
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const elementsToAnimate = document.querySelectorAll('.project-card, .skill-category, .contact-content');
    elementsToAnimate.forEach(element => {
        scrollAnimationObserver.observe(element);
    });
});

// Enhanced project card interactions
document.querySelectorAll('.project-card').forEach(card => {
    // Click interaction with scale effect
    card.addEventListener('click', function(event) {
        // Don't trigger if clicking on interactive elements
        if (event.target.matches('button, a, .carousel-btn, .carousel-dot')) {
            return;
        }
        
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'translateY(-10px)';
        }, 150);
    });
    
    // Enhanced hover effects for better UX
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
        
        // Subtle icon animation
        const icon = this.querySelector('.project-icon');
        if (icon) {
            icon.style.transform = 'rotate(5deg) scale(1.1)';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        
        // Reset icon
        const icon = this.querySelector('.project-icon');
        if (icon) {
            icon.style.transform = 'rotate(0deg) scale(1)';
        }
    });
    
    // Keyboard accessibility for project cards
    card.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.click();
        }
    });
});

// Performance optimization: Preload critical images
function preloadCriticalImages() {
    const criticalImages = [
        'assets/mobile_app_1.jpg',
        'assets/mobile_app_2.jpg',
        'assets/mobile_app_3.jpg'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// Error handling for missing images
function handleImageErrors() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Create a placeholder div with gradient background
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.style.cssText = `
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, #667eea, #764ba2);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 0.9rem;
                text-align: center;
                border-radius: 12px;
            `;
            placeholder.textContent = 'Image not available';
            
            // Replace the image with placeholder
            this.parentNode.replaceChild(placeholder, this);
        });
    });
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    preloadCriticalImages();
    handleImageErrors();
    
    // Add loading states
    document.body.classList.add('js-loaded');
    
    // Initialize ARIA labels and roles for dynamic content
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', `Project ${index + 1}: ${card.querySelector('h3').textContent}`);
    });
});

// Carousel functionality - One image at a time
let currentSlide = 0;
let totalImages = 14;
let autoSlideInterval;
let isAutoSlideActive = true;

function updateCarousel() {
    const images = document.querySelectorAll('.project-image');
    const counter = document.getElementById('carouselCounter');
    const indicators = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!images.length) return;
    
    // Hide all images with smooth transition
    images.forEach((img, index) => {
        img.classList.remove('active');
        if (index === currentSlide) {
            setTimeout(() => {
                img.classList.add('active');
            }, 50);
        }
    });
    
    // Update counter
    if (counter) {
        counter.textContent = `${currentSlide + 1} / ${totalImages}`;
    }
    
    // Update indicators
    indicators.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
        dot.setAttribute('aria-pressed', index === currentSlide);
    });
    
    // Update navigation buttons
    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalImages - 1;
        
        // Update ARIA labels
        prevBtn.setAttribute('aria-label', `Previous image (${currentSlide} of ${totalImages})`);
        nextBtn.setAttribute('aria-label', `Next image (${currentSlide + 2} of ${totalImages})`);
    }
    
    // Announce to screen readers
    const announcement = `Showing image ${currentSlide + 1} of ${totalImages}`;
    announceToScreenReader(announcement);
}

function moveCarousel(direction) {
    // Stop auto-slide when user interacts
    pauseAutoSlide();
    
    const newSlide = currentSlide + direction;
    if (newSlide >= 0 && newSlide < totalImages) {
        currentSlide = newSlide;
        updateCarousel();
    }
    
    // Resume auto-slide after interaction
    setTimeout(resumeAutoSlide, 5000);
}

function goToSlide(slideIndex) {
    if (slideIndex >= 0 && slideIndex < totalImages && slideIndex !== currentSlide) {
        pauseAutoSlide();
        currentSlide = slideIndex;
        updateCarousel();
        setTimeout(resumeAutoSlide, 5000);
    }
}

function pauseAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
    isAutoSlideActive = false;
}

function resumeAutoSlide() {
    if (!isAutoSlideActive) {
        startAutoSlide();
    }
}

function startAutoSlide() {
    isAutoSlideActive = true;
    autoSlideInterval = setInterval(() => {
        if (currentSlide < totalImages - 1) {
            currentSlide++;
        } else {
            currentSlide = 0;
        }
        updateCarousel();
    }, 4000);
}

// Keyboard navigation for carousel
function handleCarouselKeyboard(event) {
    switch(event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            moveCarousel(-1);
            break;
        case 'ArrowRight':
            event.preventDefault();
            moveCarousel(1);
            break;
        case 'Home':
            event.preventDefault();
            goToSlide(0);
            break;
        case 'End':
            event.preventDefault();
            goToSlide(totalImages - 1);
            break;
    }
}

// Touch/swipe support for carousel
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

function handleCarouselTouch() {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) return;
    
    carouselTrack.addEventListener('touchstart', function(event) {
        touchStartX = event.changedTouches[0].screenX;
        touchStartY = event.changedTouches[0].screenY;
        pauseAutoSlide();
    }, { passive: true });
    
    carouselTrack.addEventListener('touchend', function(event) {
        touchEndX = event.changedTouches[0].screenX;
        touchEndY = event.changedTouches[0].screenY;
        handleSwipeGesture();
        setTimeout(resumeAutoSlide, 3000);
    }, { passive: true });
}

function handleSwipeGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50;
    
    // Only process horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
            // Swipe right (previous)
            moveCarousel(-1);
        } else {
            // Swipe left (next)
            moveCarousel(1);
        }
    }
}

// Initialize carousel on page load
function initializeCarousel() {
    // Create indicators for all images
    const indicatorsContainer = document.getElementById('carouselIndicators');
    if (indicatorsContainer) {
        indicatorsContainer.innerHTML = '';
        for (let i = 0; i < totalImages; i++) {
            const dot = document.createElement('span');
            dot.className = 'carousel-dot';
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Go to image ${i + 1}`);
            dot.setAttribute('aria-pressed', i === 0);
            dot.setAttribute('tabindex', '0');
            if (i === 0) dot.classList.add('active');
            
            // Click handler
            dot.onclick = () => goToSlide(i);
            
            // Keyboard handler
            dot.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    goToSlide(i);
                }
            });
            
            indicatorsContainer.appendChild(dot);
        }
    }
    
    // Initialize first image
    updateCarousel();
    
    // Add keyboard navigation to carousel container
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('keydown', handleCarouselKeyboard);
        carouselContainer.setAttribute('tabindex', '0');
        carouselContainer.setAttribute('role', 'region');
        carouselContainer.setAttribute('aria-label', 'Image carousel');
    }
    
    // Initialize touch support
    handleCarouselTouch();
    
    // Start auto-slide
    startAutoSlide();
    
    // Pause auto-slide when carousel is not visible
    const carouselObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                resumeAutoSlide();
            } else {
                pauseAutoSlide();
            }
        });
    });
    
    if (carouselContainer) {
        carouselObserver.observe(carouselContainer);
    }
}

// Image modal functionality
function openImageModal(src, alt) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('imageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'image-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modalTitle');
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal" aria-label="Close image modal">&times;</button>
                <img class="modal-image" src="" alt="" id="modalImage">
                <div class="modal-caption" id="modalTitle"></div>
                <div class="modal-controls">
                    <button class="modal-prev" aria-label="Previous image">‹</button>
                    <button class="modal-next" aria-label="Next image">›</button>
                </div>
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
                background-color: rgba(0,0,0,0.9);
                backdrop-filter: blur(5px);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .image-modal.show {
                opacity: 1;
            }
            
            .modal-content {
                position: relative;
                margin: 2% auto;
                width: 90%;
                max-width: 800px;
                text-align: center;
                height: 90vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            
            .modal-image {
                max-width: 100%;
                max-height: 80vh;
                object-fit: contain;
                border-radius: 10px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                transition: transform 0.3s ease;
            }
            
            .close-modal {
                position: absolute;
                top: -50px;
                right: 0;
                color: white;
                font-size: 40px;
                font-weight: bold;
                cursor: pointer;
                background: none;
                border: none;
                transition: color 0.3s ease, transform 0.2s ease;
                z-index: 1001;
                padding: 10px;
            }
            
            .close-modal:hover {
                color: #ff6b6b;
                transform: scale(1.1);
            }
            
            .modal-caption {
                color: white;
                margin-top: 20px;
                font-size: 1.1rem;
                font-weight: 500;
            }
            
            .modal-controls {
                position: absolute;
                top: 50%;
                width: 100%;
                display: flex;
                justify-content: space-between;
                padding: 0 20px;
                pointer-events: none;
            }
            
            .modal-prev, .modal-next {
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.3);
                color: white;
                font-size: 24px;
                padding: 15px 20px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                pointer-events: auto;
            }
            
            .modal-prev:hover, .modal-next:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }
            
            @media (max-width: 768px) {
                .modal-content {
                    margin: 5% auto;
                    width: 95%;
                    height: 85vh;
                }
                
                .close-modal {
                    top: -40px;
                    font-size: 30px;
                }
                
                .modal-prev, .modal-next {
                    font-size: 20px;
                    padding: 12px 15px;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Modal event handlers
        const closeBtn = modal.querySelector('.close-modal');
        const modalPrev = modal.querySelector('.modal-prev');
        const modalNext = modal.querySelector('.modal-next');
        
        closeBtn.addEventListener('click', closeImageModal);
        
        modalPrev.addEventListener('click', function() {
            if (currentSlide > 0) {
                currentSlide--;
                updateModalImage();
            }
        });
        
        modalNext.addEventListener('click', function() {
            if (currentSlide < totalImages - 1) {
                currentSlide++;
                updateModalImage();
            }
        });
        
        // Close on outside click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal();
            }
        });
        
        // Keyboard navigation in modal
        modal.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'Escape':
                    closeImageModal();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    modalPrev.click();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    modalNext.click();
                    break;
            }
        });
    }
    
    // Set modal content and show
    const modalImage = modal.querySelector('.modal-image');
    const modalCaption = modal.querySelector('.modal-caption');
    
    modalImage.src = src;
    modalImage.alt = alt;
    modalCaption.textContent = alt;
    
    // Show modal with animation
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Focus management
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.focus();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Pause carousel auto-slide
    pauseAutoSlide();
}

function updateModalImage() {
    const modal = document.getElementById('imageModal');
    if (!modal) return;
    
    const images = document.querySelectorAll('.project-image');
    if (images[currentSlide]) {
        const modalImage = modal.querySelector('.modal-image');
        const modalCaption = modal.querySelector('.modal-caption');
        
        modalImage.src = images[currentSlide].src;
        modalImage.alt = images[currentSlide].alt;
        modalCaption.textContent = images[currentSlide].alt;
    }
    
    // Update navigation buttons
    const modalPrev = modal.querySelector('.modal-prev');
    const modalNext = modal.querySelector('.modal-next');
    
    modalPrev.disabled = currentSlide === 0;
    modalNext.disabled = currentSlide === totalImages - 1;
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Resume carousel auto-slide
        setTimeout(resumeAutoSlide, 1000);
    }
}

// Dynamic typing effect for hero subtitle
function initDynamicTyping() {
    const subtitle = document.querySelector('.hero .subtitle');
    if (!subtitle) return;
    
    const typingTexts = [
        'Crafting Digital Experiences That Matter',
        'Building Tomorrow\'s Applications Today',
        'Turning Ideas Into Reality',
        'Creating Seamless User Experiences',
        'Developing Innovative Solutions'
    ];
    
    let currentTextIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isTypingComplete = false;
    
    function typeWriter() {
        const currentText = typingTexts[currentTextIndex];
        
        if (isDeleting) {
            subtitle.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            subtitle.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        // Add cursor effect
        subtitle.style.borderRight = '2px solid #feca57';
        
        if (!isDeleting && charIndex === currentText.length) {
            // Pause at end of text
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

// Utility function for screen reader announcements
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Initialize all carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeCarousel();
    initDynamicTyping();
    
    // Add click handlers to project images for modal
    const images = document.querySelectorAll('.project-image');
    images.forEach((img, index) => {
        img.addEventListener('click', function() {
            currentSlide = index;
            openImageModal(this.src, this.alt);
        });
        
        // Add keyboard support for images
        img.setAttribute('tabindex', '0');
        img.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                currentSlide = index;
                openImageModal(this.src, this.alt);
            }
        });
    });
});

// Lazy loading for images with intersection observer
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Add loading shimmer effect
                    img.style.background = 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%)';
                    img.style.backgroundSize = '200% 100%';
                    img.style.animation = 'shimmer 1.5s infinite';
                    
                    // Load the image
                    img.src = img.dataset.src || img.src;
                    
                    img.addEventListener('load', function() {
                        // Remove shimmer effect
                        img.style.background = '';
                        img.style.animation = '';
                        img.classList.add('loaded');
                    });
                    
                    img.addEventListener('error', function() {
                        // Handle image load error
                        this.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
                        this.style.display = 'flex';
                        this.style.alignItems = 'center';
                        this.style.justifyContent = 'center';
                        this.style.color = 'white';
                        this.style.fontSize = '0.8rem';
                        this.style.textAlign = 'center';
                        this.alt = 'Image not available';
                    });
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    }
}

// Performance monitoring and optimization
function initPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', function() {
        if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            console.log(`Portfolio loaded in ${loadTime}ms`);
            
            // Log performance metrics for debugging
            console.log('Performance Metrics:', {
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime,
                firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime
            });
        }
    });
    
    // Monitor memory usage (if available)
    if ('memory' in performance) {
        setInterval(() => {
            const memory = performance.memory;
            if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                console.warn('High memory usage detected');
            }
        }, 30000);
    }
}

// Browser compatibility and feature detection
function initBrowserCompatibility() {
    // Detect browser capabilities
    const features = {
        intersectionObserver: 'IntersectionObserver' in window,
        webp: false,
        avif: false,
        modernCSS: CSS.supports('backdrop-filter', 'blur(10px)'),
        touchEvents: 'ontouchstart' in window,
        localStorage: typeof Storage !== 'undefined'
    };
    
    // Test WebP support
    const webpTest = new Image();
    webpTest.onload = webpTest.onerror = function() {
        features.webp = webpTest.height === 2;
        document.documentElement.classList.toggle('webp-support', features.webp);
    };
    webpTest.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    
    // Add feature classes to document
    Object.keys(features).forEach(feature => {
        if (features[feature]) {
            document.documentElement.classList.add(`has-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
        }
    });
    
    // Polyfill for older browsers
    if (!features.intersectionObserver) {
        // Simple polyfill for IntersectionObserver
        window.IntersectionObserver = function(callback) {
            this.observe = function(element) {
                setInterval(() => {
                    const rect = element.getBoundingClientRect();
                    const isIntersecting = rect.top < window.innerHeight && rect.bottom > 0;
                    callback([{ target: element, isIntersecting }]);
                }, 100);
            };
            this.unobserve = function() {};
        };
    }
}

// Advanced scroll effects and parallax
function initAdvancedScrollEffects() {
    let ticking = false;
    
    function updateScrollEffects() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        // Parallax effect for floating shapes
        const shapes = document.querySelectorAll('.floating-shapes');
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrollTop * speed);
            shape.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
        
        // Progressive blur effect for background
        const bgAnimation = document.querySelector('.bg-animation');
        if (bgAnimation) {
            const blurAmount = Math.min(scrollTop / 500, 1) * 5;
            bgAnimation.style.filter = `blur(${blurAmount}px)`;
        }
        
        // Scale hero content on scroll
        const heroContent = document.querySelector('.hero .container');
        if (heroContent && scrollTop < windowHeight) {
            const scale = 1 - (scrollTop / windowHeight) * 0.1;
            const opacity = 1 - (scrollTop / windowHeight) * 0.5;
            heroContent.style.transform = `scale(${scale})`;
            heroContent.style.opacity = opacity;
        }
        
        ticking = false;
    }
    
    function requestScrollUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
}

// Theme and color scheme detection
function initThemeDetection() {
    // Detect user's color scheme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    function updateTheme() {
        document.documentElement.classList.toggle('dark-theme', prefersDark.matches);
        document.documentElement.classList.toggle('high-contrast', prefersHighContrast.matches);
        document.documentElement.classList.toggle('reduced-motion', prefersReducedMotion.matches);
        
        // Adjust animations based on motion preference
        if (prefersReducedMotion.matches) {
            pauseAutoSlide();
            document.documentElement.style.setProperty('--transition-normal', '0.01ms');
            document.documentElement.style.setProperty('--transition-fast', '0.01ms');
            document.documentElement.style.setProperty('--transition-slow', '0.01ms');
        }
    }
    
    // Initial theme detection
    updateTheme();
    
    // Listen for changes
    prefersDark.addEventListener('change', updateTheme);
    prefersHighContrast.addEventListener('change', updateTheme);
    prefersReducedMotion.addEventListener('change', updateTheme);
}

// Form validation and contact interactions
function initContactInteractions() {
    const contactLinks = document.querySelectorAll('.contact-link');
    
    contactLinks.forEach(link => {
        // Add ripple effect on click
        link.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: radial-gradient(circle, rgba(255,107,107,0.3) 0%, transparent 70%);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
        
        // Track contact interactions for analytics
        link.addEventListener('click', function() {
            const contactType = this.href.split(':')[0];
            console.log(`Contact interaction: ${contactType}`);
            
            // You can add analytics tracking here
            if (typeof gtag !== undefined) {
                gtag('event', 'contact_click', {
                    'contact_method': contactType,
                    'contact_label': this.textContent.trim()
                });
            }
        });
    });
}

// Service Worker registration for PWA features
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful');
                })
                .catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
}

// Console styling and developer message
function initConsoleMessage() {
    const styles = {
        title: 'font-size: 24px; color: #ff6b6b; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);',
        subtitle: 'font-size: 16px; color: #667eea; font-weight: 500;',
        info: 'font-size: 12px; color: #764ba2;',
        link: 'font-size: 14px; color: #feca57; font-weight: bold;'
    };
    
    console.log('%c🚀 Hello there, fellow developer!', styles.title);
    console.log('%cWelcome to Michael Farrugia\'s Portfolio', styles.subtitle);
    console.log('%cBuilt with modern web technologies and lots of ☕', styles.info);
    console.log('%c🔗 Check out the code: https://github.com/MalteseHKR', styles.link);
    console.log('%c💼 Interested in collaboration? Let\'s connect!', styles.info);
    
    // Add some easter eggs for curious developers
    window.konami = function() {
        document.body.style.animation = 'rainbow 2s infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
        console.log('%c🎉 Konami Code activated! You found the easter egg!', 'font-size: 18px; color: #ff6b6b;');
    };
    
    // Simple konami code detection
    let konamiSequence = [];
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    
    document.addEventListener('keydown', function(e) {
        konamiSequence.push(e.keyCode);
        if (konamiSequence.length > konamiCode.length) {
            konamiSequence.shift();
        }
        if (konamiSequence.join(',') === konamiCode.join(',')) {
            window.konami();
            konamiSequence = [];
        }
    });
}

// Error handling and graceful degradation
function initErrorHandling() {
    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        
        // Graceful degradation for critical features
        if (e.error && e.error.message) {
            const errorMsg = e.error.message.toLowerCase();
            
            if (errorMsg.includes('carousel') || errorMsg.includes('slide')) {
                // Fallback for carousel errors
                const images = document.querySelectorAll('.project-image');
                images.forEach(img => img.style.display = 'block');
                pauseAutoSlide();
            }
            
            if (errorMsg.includes('intersection')) {
                // Fallback for intersection observer errors
                document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                    img.src = img.dataset.src || img.src;
                });
            }
        }
    });
    
    // Promise rejection handler
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        e.preventDefault(); // Prevent browser's default handling
    });
}

// Final initialization and setup
function initializePortfolio() {
    // Add CSS animations keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
        
        .loaded {
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize all features
    initLazyLoading();
    initPerformanceMonitoring();
    initBrowserCompatibility();
    initAdvancedScrollEffects();
    initThemeDetection();
    initContactInteractions();
    initServiceWorker();
    initErrorHandling();
    initConsoleMessage();
    
    // Final setup
    document.body.classList.add('portfolio-loaded');
    
    // Smooth reveal animation for the entire page
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in';
    
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
    
    // Dispatch custom event for any additional scripts
    const portfolioLoadedEvent = new CustomEvent('portfolioLoaded', {
        detail: { timestamp: Date.now() }
    });
    document.dispatchEvent(portfolioLoadedEvent);
    
    console.log('🎨 Portfolio initialization complete!');
}

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortfolio);
} else {
    initializePortfolio();
}

// Export functions for potential external use
window.PortfolioAPI = {
    moveCarousel,
    goToSlide,
    pauseAutoSlide,
    resumeAutoSlide,
    openImageModal,
    closeImageModal,
    announceToScreenReader
};

// Cleanup function for SPA navigation (if needed)
window.cleanupPortfolio = function() {
    pauseAutoSlide();
    
    // Remove event listeners
    const events = ['scroll', 'resize', 'click', 'keydown'];
    events.forEach(event => {
        document.removeEventListener(event, () => {});
        window.removeEventListener(event, () => {});
    });
    
    // Clear intervals and timeouts
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
};

// Development helpers (only in development)
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    window.devMode = true;
    
    // Add development helpers
    window.toggleCarousel = () => {
        if (isAutoSlideActive) {
            pauseAutoSlide();
            console.log('Carousel paused');
        } else {
            resumeAutoSlide();
            console.log('Carousel resumed');
        }
    };
    
    window.carouselStatus = () => {
        console.log({
            currentSlide,
            totalImages,
            isAutoSlideActive,
            autoSlideInterval: !!autoSlideInterval
        });
    };
    
    console.log('🔧 Development mode active. Try window.toggleCarousel() or window.carouselStatus()');
}