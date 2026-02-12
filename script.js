// ===================================
// CONFIGURATION
// ===================================

const CONFIG = {
    typingTexts: [
        'FullStack Developer',
        'AI Engineer',
        'UI/UX Designer',
        'Problem Solver'
    ],
    typingSpeed: 100,
    deletingSpeed: 50,
    delayBetweenTexts: 2000,
    particlesCount: 100
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const lerp = (start, end, factor) => start + (end - start) * factor;

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ===================================
// CUSTOM CURSOR
// ===================================

class CustomCursor {
    constructor() {
        this.cursor = $('.cursor');
        this.follower = $('.cursor-follower');
        this.cursorPos = { x: 0, y: 0 };
        this.followerPos = { x: 0, y: 0 };
        this.mousePos = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        if (window.innerWidth <= 768) return;
        
        document.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });
        
        // Hover effects on interactive elements
        const interactiveElements = $$('a, button, .project-card, .skill-category');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.classList.add('expand');
                this.follower.classList.add('expand');
            });
            el.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('expand');
                this.follower.classList.remove('expand');
            });
        });
        
        this.animate();
    }
    
    animate() {
        // Cursor follows mouse directly
        this.cursorPos.x = lerp(this.cursorPos.x, this.mousePos.x, 0.3);
        this.cursorPos.y = lerp(this.cursorPos.y, this.mousePos.y, 0.3);
        
        // Follower lags behind
        this.followerPos.x = lerp(this.followerPos.x, this.mousePos.x, 0.15);
        this.followerPos.y = lerp(this.followerPos.y, this.mousePos.y, 0.15);
        
        this.cursor.style.left = `${this.cursorPos.x}px`;
        this.cursor.style.top = `${this.cursorPos.y}px`;
        this.follower.style.left = `${this.followerPos.x}px`;
        this.follower.style.top = `${this.followerPos.y}px`;
        
        requestAnimationFrame(() => this.animate());
    }
}

// ===================================
// PARTICLES BACKGROUND
// ===================================

class ParticlesBackground {
    constructor() {
        this.canvas = $('#particles');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', debounce(() => this.resize(), 250));
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        const particleCount = Math.min(CONFIG.particlesCount, Math.floor((this.canvas.width * this.canvas.height) / 15000));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.5 - 0.25,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around screen
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.y > this.canvas.height) particle.y = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            
            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.mouse.radius) {
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                const angle = Math.atan2(dy, dx);
                particle.x -= Math.cos(angle) * force * 2;
                particle.y -= Math.sin(angle) * force * 2;
            }
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(14, 165, 233, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        // Draw connections
        this.particles.forEach((particle, i) => {
            this.particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(14, 165, 233, ${0.1 * (1 - distance / 120)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ===================================
// TYPING EFFECT
// ===================================

class TypingEffect {
    constructor(element, texts) {
        this.element = element;
        this.texts = texts;
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        
        this.init();
    }
    
    init() {
        this.type();
    }
    
    type() {
        const currentText = this.texts[this.currentTextIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
        }
        
        let speed = this.isDeleting ? CONFIG.deletingSpeed : CONFIG.typingSpeed;
        
        if (!this.isDeleting && this.currentCharIndex === currentText.length) {
            speed = CONFIG.delayBetweenTexts;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
            speed = 500;
        }
        
        setTimeout(() => this.type(), speed);
    }
}

// ===================================
// NAVIGATION
// ===================================

class Navigation {
    constructor() {
        this.navbar = $('#navbar');
        this.navToggle = $('#nav-toggle');
        this.navMenu = $('#nav-menu');
        this.navLinks = $$('.nav-link');
        this.sections = $$('.section, .hero-section');
        
        this.init();
    }
    
    init() {
        // Scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            
            this.updateActiveLink();
        });
        
        // Mobile menu toggle
        this.navToggle.addEventListener('click', () => {
            this.navToggle.classList.toggle('active');
            this.navMenu.classList.toggle('active');
        });
        
        // Close mobile menu on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.navToggle.classList.remove('active');
                this.navMenu.classList.remove('active');
            });
        });
        
        // Smooth scroll
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = $(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    updateActiveLink() {
        let currentSection = '';
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
}

// ===================================
// MAGNETIC BUTTONS
// ===================================

class MagneticButtons {
    constructor() {
        this.buttons = $$('.magnetic-btn');
        this.init();
    }
    
    init() {
        this.buttons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translate(0, 0)';
            });
        });
    }
}

// ===================================
// ANIMATED STATS
// ===================================

class AnimatedStats {
    constructor() {
        this.stats = $$('.stat-number');
        this.animated = new Set();
        
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated.has(entry.target)) {
                    this.animateNumber(entry.target);
                    this.animated.add(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        this.stats.forEach(stat => observer.observe(stat));
    }
    
    animateNumber(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateNumber = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = target + '+';
            }
        };
        
        updateNumber();
    }
}

// ===================================
// SKILL BARS ANIMATION
// ===================================

class SkillBars {
    constructor() {
        this.skillBars = $$('.skill-progress');
        this.animated = new Set();
        
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated.has(entry.target)) {
                    const progress = entry.target.getAttribute('data-progress');
                    entry.target.style.width = `${progress}%`;
                    this.animated.add(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        this.skillBars.forEach(bar => observer.observe(bar));
    }
}

// ===================================
// TILT EFFECT
// ===================================

class TiltEffect {
    constructor() {
        this.cards = $$('[data-tilt]');
        this.init();
    }
    
    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });
    }
}

// ===================================
// TIMELINE ANIMATION
// ===================================

class TimelineAnimation {
    constructor() {
        this.timelineItems = $$('.timeline-item');
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.3 });
        
        this.timelineItems.forEach(item => observer.observe(item));
    }
}

// ===================================
// PROJECT MODAL
// ===================================

const projectData = [
    {
        title: 'AI-Powered Analytics Platform',
        description: 'Enterprise-grade analytics platform leveraging machine learning for predictive insights and automated decision-making.',
        fullDescription: 'This comprehensive analytics platform combines the power of artificial intelligence with intuitive data visualization to help businesses make data-driven decisions. The system processes millions of data points in real-time, providing actionable insights through advanced machine learning algorithms.',
        technologies: ['React', 'Python', 'TensorFlow', 'PostgreSQL', 'AWS'],
        features: [
            'Real-time data processing',
            'Predictive analytics using ML models',
            'Customizable dashboards',
            'Automated reporting',
            'API integrations'
        ],
        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&q=80',
        liveUrl: '#',
        githubUrl: '#'
    },
    {
        title: 'Internal Developer Platform',
        description: 'Built a scalable Internal Developer Platform to manage microservices, deployments, feature flags, and observability in one place.',
        fullDescription: 'A comprehensive Internal Developer Platform designed to streamline developer operations and provide visibility across environments. The platform features a responsive React dashboard, a modular backend architecture, and secure RBAC-based authentication. It centralizes microservices management, deployment workflows, feature flags, and observability tools to enhance developer productivity and operational efficiency.',
        technologies: ['React', 'Node.js', 'RBAC', 'Microservices', 'Docker'],
        features: [
            'Microservices management dashboard',
            'Automated deployment workflows',
            'Feature flag management',
            'Observability and monitoring tools',
            'RBAC-based secure authentication',
            'Environment visibility and control'
        ],
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
        liveUrl: 'https://frontend-eight-lilac-25.vercel.app',
        githubUrl: '#'
    },
    {
        title: 'DeFi Trading Platform',
        description: 'Decentralized finance platform enabling secure crypto trading with smart contract integration and real-time market data.',
        fullDescription: 'A cutting-edge decentralized finance platform that enables users to trade cryptocurrencies securely using blockchain technology. Features smart contract integration for trustless transactions.',
        technologies: ['React', 'Solidity', 'Web3.js', 'Ethereum', 'IPFS'],
        features: [
            'Wallet integration',
            'Smart contract trading',
            'Real-time market data',
            'Liquidity pools',
            'Token swapping'
        ],
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80',
        liveUrl: '#',
        githubUrl: '#'
    },
    {
        title: 'Component Design System',
        description: 'Comprehensive design system with 100+ components, full documentation, and accessibility compliance.',
        fullDescription: 'A professional design system built for enterprise applications, featuring a comprehensive component library with full documentation, accessibility compliance, and customization options.',
        technologies: ['React', 'TypeScript', 'Storybook', 'Figma', 'CSS-in-JS'],
        features: [
            '100+ reusable components',
            'Full accessibility compliance',
            'Comprehensive documentation',
            'Theme customization',
            'Figma design files'
        ],
        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&q=80',
        liveUrl: '#',
        githubUrl: '#'
    }
];

function openProjectModal(index) {
    const modal = $('#project-modal');
    const modalBody = $('#modal-body');
    const project = projectData[index];
    
    modalBody.innerHTML = `
        <img src="${project.image}" alt="${project.title}" style="width: 100%; border-radius: 12px; margin-bottom: 2rem;">
        <h2 style="font-size: 2.5rem; font-family: var(--font-primary); margin-bottom: 1rem;">${project.title}</h2>
        <p style="color: var(--color-text-secondary); font-size: 1.125rem; line-height: 1.8; margin-bottom: 2rem;">
            ${project.fullDescription}
        </p>
        
        <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--color-primary);">Technologies Used</h3>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2rem;">
            ${project.technologies.map(tech => `
                <span class="tag">${tech}</span>
            `).join('')}
        </div>
        
        <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--color-primary);">Key Features</h3>
        <ul style="color: var(--color-text-secondary); line-height: 1.8; margin-bottom: 2rem; padding-left: 1.5rem;">
            ${project.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
        
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <a href="${project.liveUrl}" class="btn btn-primary" target="_blank">
                <span>View Live</span>
                <i class="fas fa-external-link-alt"></i>
            </a>
            <a href="${project.githubUrl}" class="btn btn-secondary" target="_blank">
                <span>View Code</span>
                <i class="fab fa-github"></i>
            </a>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    const modal = $('#project-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProjectModal();
    }
});

// ===================================
// CONTACT FORM
// ===================================

class ContactForm {
    constructor() {
        this.form = $('#contact-form');
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                name: $('#name').value,
                email: $('#email').value,
                subject: $('#subject').value,
                message: $('#message').value
            };
            
            // Simulate form submission
            console.log('Form submitted:', formData);
            
            // Show success message
            alert('Thank you for your message! I\'ll get back to you soon.');
            
            // Reset form
            this.form.reset();
        });
    }
}

// ===================================
// SCROLL ANIMATIONS
// ===================================

class ScrollAnimations {
    constructor() {
        this.elements = $$('.glass-card, .about-paragraph');
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        this.elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
    }
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new CustomCursor();
    new ParticlesBackground();
    new TypingEffect($('#typing-text'), CONFIG.typingTexts);
    new Navigation();
    new MagneticButtons();
    new AnimatedStats();
    new SkillBars();
    new TiltEffect();
    new TimelineAnimation();
    new ContactForm();
    new ScrollAnimations();
    
    // Add smooth page load animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
    
    console.log('%c🚀 Portfolio Loaded Successfully!', 'color: #0EA5E9; font-size: 20px; font-weight: bold;');
    console.log('%cDesigned & Built with ❤️', 'color: #8B5CF6; font-size: 14px;');
});

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================

// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    $$('img[data-src]').forEach(img => imageObserver.observe(img));
}

// Preload critical assets
window.addEventListener('load', () => {
    const criticalImages = [
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});

// ===================================
// ACCESSIBILITY ENHANCEMENTS
// ===================================

// Skip to main content
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !e.shiftKey && document.activeElement === document.body) {
        e.preventDefault();
        $('#hero').focus();
    }
});

// Announce page changes for screen readers
const announcePageChange = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
};

// ===================================
// INITIALIZE AOS (Animate On Scroll)
// ===================================

// Initialize AOS after DOM is loaded
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
        easing: 'ease-in-out'
    });
}

// Export functions for external use
window.portfolioApp = {
    openProjectModal,
    closeProjectModal,
    announcePageChange
};
