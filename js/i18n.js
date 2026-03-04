/**
 * ============================================================================
 * I18N.JS - Internationalization Engine
 * ============================================================================
 */

(function() {
  'use strict';

  // Configuration
  const DEFAULT_LANG = 'sk';
  const SUPPORTED_LANGS = ['sk', 'en', 'ru'];
  const STORAGE_KEY = 'preferred-language';

  // Current language state
  let currentLang = DEFAULT_LANG;
  let translationsLoaded = false;

  /**
   * Initialize i18n system
   */
  function init() {
    // Wait for translations to be available
    if (typeof TRANSLATIONS === 'undefined') {
      console.log('[i18n] Waiting for translations...');
      setTimeout(init, 50);
      return;
    }

    translationsLoaded = true;
    console.log('[i18n] Translations loaded:', Object.keys(TRANSLATIONS));

    // Determine initial language (URL > localStorage > default)
    const urlLang = getLanguageFromURL();
    const storedLang = localStorage.getItem(STORAGE_KEY);
    
    currentLang = urlLang || storedLang || DEFAULT_LANG;
    
    // Validate language
    if (!SUPPORTED_LANGS.includes(currentLang)) {
      currentLang = DEFAULT_LANG;
    }

    console.log('[i18n] Initial language:', currentLang);

    // Apply language
    setLanguage(currentLang, false);

    // Listen for URL changes
    window.addEventListener('popstate', () => {
      const newLang = getLanguageFromURL();
      if (newLang && newLang !== currentLang) {
        setLanguage(newLang, false);
      }
    });
  }

  /**
   * Get language from URL query parameter
   */
  function getLanguageFromURL() {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    return SUPPORTED_LANGS.includes(lang) ? lang : null;
  }

  /**
   * Set the active language
   */
  function setLanguage(lang, persist = true) {
    if (!SUPPORTED_LANGS.includes(lang)) {
      console.warn('[i18n] Unsupported language:', lang);
      return;
    }

    if (typeof TRANSLATIONS === 'undefined') {
      console.warn('[i18n] Translations not loaded yet');
      return;
    }

    // Update state
    currentLang = lang;

    // Update HTML attributes
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);

    // Update all translatable elements
    updatePageContent();

    // Update language switcher UI
    updateLanguageSwitcher();

    // Persist if needed
    if (persist) {
      localStorage.setItem(STORAGE_KEY, lang);
      
      // Update URL without reloading
      const url = new URL(window.location);
      url.searchParams.set('lang', lang);
      window.history.replaceState({}, '', url);
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('languagechange', { 
      detail: { language: lang } 
    }));

    console.log('[i18n] Language changed to:', lang);
  }

  /**
   * Update all content on the page with translations
   */
  function updatePageContent() {
    const translations = TRANSLATIONS[currentLang];
    
    if (!translations) {
      console.warn('[i18n] No translations found for:', currentLang);
      return;
    }

    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = getNestedValue(translations, key);
      
      if (translation) {
        // Check if HTML is allowed (data-i18n-html attribute)
        if (el.hasAttribute('data-i18n-html')) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      } else {
        logMissingKey(key);
      }
    });

    // Update attributes
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const attrName = el.getAttribute('data-i18n-attr');
      const key = el.getAttribute('data-i18n');
      
      if (attrName && key) {
        const translation = getNestedValue(translations, key);
        
        if (translation) {
          el.setAttribute(attrName, translation);
        } else {
          logMissingKey(key);
        }
      }
    });
  }

  /**
   * Update language switcher UI
   */
  function updateLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', btnLang === currentLang);
      btn.setAttribute('aria-pressed', btnLang === currentLang);
    });
  }

  /**
   * Get value from translations object
   * Keys are flat with dots (e.g., "nav.home")
   */
  function getNestedValue(obj, path) {
    // Direct lookup for flat keys like "nav.home"
    if (obj && obj[path] !== undefined) {
      return obj[path];
    }
    // Fallback: try nested traversal for backward compatibility
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  /**
   * Log missing translation key
   */
  function logMissingKey(key) {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    console.warn(`[i18n] Missing: lang=${currentLang}, key="${key}", page=${page}`);
  }

  /**
   * Get current language
   */
  function getCurrentLanguage() {
    return currentLang;
  }

  /**
   * Translate a specific key
   */
  function t(key, lang = null) {
    const targetLang = lang || currentLang;
    const translations = TRANSLATIONS?.[targetLang];
    
    if (!translations) return key;
    
    const value = getNestedValue(translations, key);
    return value || key;
  }

  // Expose API globally
  window.I18N = {
    init,
    setLanguage,
    getCurrentLanguage,
    t,
    SUPPORTED_LANGS,
    DEFAULT_LANG
  };

  // Global function for onclick handlers
  window.setLanguage = function(lang) {
    if (window.I18N) {
      window.I18N.setLanguage(lang);
    }
  };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
