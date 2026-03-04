/**
 * ============================================================================
 * APP.JS - Main Application Logic
 * ============================================================================
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    themeStorageKey: 'preferred-theme',
    defaultTheme: 'light'
  };

  // State
  let isMobileMenuOpen = false;
  let currentTheme = CONFIG.defaultTheme;

  /**
   * Initialize everything
   */
  function init() {
    console.log('[App] Initializing...');
    
    // Show intro loader first (if on index page)
    initIntroLoader();
    
    initTheme();
    initNavigation();
    initMobileMenu();
    initHeaderScroll();
    initSmoothScroll();
    initMagneticButtons();
    initCardTilt();
    
    // For pages without loader, init animations immediately
    if (!document.getElementById('introLoader')) {
      document.documentElement.classList.add('js-loaded');
      initScrollAnimations();
      initStatsCounter();
    }
    
    console.log('[App] Initialized successfully');
  }
  
  /**
   * INTRO LOADER - Only for index page
   */
  function initIntroLoader() {
    const loader = document.getElementById('introLoader');
    if (!loader) return; // Skip if no loader (other pages)
    
    // Add loading class to body
    document.body.classList.add('loading');
    
    // Hide loader after animation completes
    const hideLoader = () => {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
      
      // Mark JS as loaded and init animations
      document.documentElement.classList.add('js-loaded');
      
      // Initialize scroll animations after loader hides
      setTimeout(() => {
        initScrollAnimations();
        initStatsCounter();
        // Remove loader from DOM after transition
        setTimeout(() => {
          loader.remove();
        }, 600);
      }, 100);
    };
    
    // Wait for progress animation to complete (2.5s) + small delay
    setTimeout(hideLoader, 2800);
    
    // Also hide if page takes too long to load
    window.addEventListener('load', () => {
      if (!loader.classList.contains('hidden')) {
        setTimeout(hideLoader, 500);
      }
    });
  }

  /**
   * THEME MANAGEMENT
   */
  function initTheme() {
    const savedTheme = localStorage.getItem(CONFIG.themeStorageKey);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    currentTheme = savedTheme || (systemPrefersDark ? 'dark' : CONFIG.defaultTheme);
    
    applyTheme(currentTheme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(CONFIG.themeStorageKey)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', 
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
    
    console.log('[App] Theme applied:', theme);
  }

  function toggleTheme() {
    console.log('[App] Toggling theme...');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem(CONFIG.themeStorageKey, newTheme);
  }

  /**
   * NAVIGATION
   */
  function initNavigation() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav a, .mobile-nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /**
   * MOBILE MENU
   */
  function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuBackdrop = document.querySelector('.mobile-menu-backdrop');

    if (!menuToggle || !mobileMenu) return;

    menuToggle.addEventListener('click', toggleMobileMenu);
    
    if (mobileMenuBackdrop) {
      mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
    }

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    });
  }

  function toggleMobileMenu() {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  function openMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuBackdrop = document.querySelector('.mobile-menu-backdrop');

    isMobileMenuOpen = true;
    
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    
    if (mobileMenuBackdrop) {
      mobileMenuBackdrop.classList.add('open');
    }
    
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    
    const firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuBackdrop = document.querySelector('.mobile-menu-backdrop');

    isMobileMenuOpen = false;
    
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    
    if (mobileMenuBackdrop) {
      mobileMenuBackdrop.classList.remove('open');
    }
    
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    menuToggle.focus();
  }

  /**
   * SCROLL ANIMATIONS
   */
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    
    if (!animatedElements.length) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      animatedElements.forEach(el => {
        el.classList.add('active');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  }

  /**
   * HEADER SCROLL EFFECT
   */
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    let ticking = false;

    function updateHeader() {
      const scrollY = window.scrollY;
      
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * SMOOTH SCROLL
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        e.preventDefault();
        
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        history.pushState(null, null, targetId);
      });
    });
  }

  /**
   * MAGNETIC BUTTONS
   */
  function initMagneticButtons() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /**
   * CARD TILT EFFECT
   */
  function initCardTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.setProperty('--rotateX', `${rotateX}deg`);
        card.style.setProperty('--rotateY', `${rotateY}deg`);
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rotateX', '0deg');
        card.style.setProperty('--rotateY', '0deg');
      });
    });
  }

  /**
   * STATS COUNTER
   */
  function initStatsCounter() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-counter'), 10);
    const duration = 2000;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * target);
      
      element.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target.toLocaleString();
      }
    }
    
    requestAnimationFrame(update);
  }

  // Expose functions globally
  window.toggleTheme = toggleTheme;
  window.openMobileMenu = openMobileMenu;
  window.closeMobileMenu = closeMobileMenu;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
