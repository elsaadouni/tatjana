/**
 * ============================================================================
 * CONTACT.JS - Contact Form with File Attachments
 * ============================================================================
 * 
 * BACKEND SETUP OPTIONS:
 * 
 * OPTION 1: n8n Webhook
 * --------------------
 * 1. Install n8n (https://n8n.io/)
 * 2. Create a new workflow with Webhook trigger
 * 3. Set method to POST
 * 4. Add "Respond to Webhook" node for CORS
 * 5. Add your processing nodes (email, database, etc.)
 * 6. Copy webhook URL and set it below in CONTACT_ENDPOINT
 * 
 * OPTION 2: Node/Express Server
 * -----------------------------
 * ```javascript
 * const express = require('express');
 * const multer = require('multer');
 * const cors = require('cors');
 * const path = require('path');
 * 
 * const app = express();
 * const upload = multer({ dest: 'uploads/' });
 * 
 * app.use(cors());
 * app.use(express.json());
 * app.use(express.urlencoded({ extended: true }));
 * 
 * app.post('/api/contact', upload.array('attachments', 5), (req, res) => {
 *   console.log('Form data:', req.body);
 *   console.log('Files:', req.files);
 *   // Process form and save files
 *   res.json({ success: true, message: 'Message received' });
 * });
 * 
 * app.listen(3000, () => console.log('Server running on port 3000'));
 * ```
 * ============================================================================
 */

(function() {
  'use strict';

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================
  const CONFIG = {
    // REPLACE THIS WITH YOUR ACTUAL ENDPOINT
    CONTACT_ENDPOINT: 'REPLACE_ME',
    
    // File upload settings
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxTotalSize: 25 * 1024 * 1024, // 25MB
    maxFiles: 5,
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xls', '.xlsx', '.csv']
  };

  // ==========================================================================
  // STATE
  // ==========================================================================
  let uploadedFiles = [];
  let isSubmitting = false;

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  function init() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    bindFormEvents(form);
    bindFileUpload();
  }

  // ==========================================================================
  // FORM EVENTS
  // ==========================================================================
  function bindFormEvents(form) {
    form.addEventListener('submit', handleSubmit);

    // Real-time validation
    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => clearFieldError(field));
    });
  }

  // ==========================================================================
  // FILE UPLOAD
  // ==========================================================================
  function bindFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileUpload');
    
    if (!dropZone || !fileInput) return;

    // Click to select
    dropZone.addEventListener('click', () => fileInput.click());

    // File selection
    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    });
  }

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      // Check file count
      if (uploadedFiles.length >= CONFIG.maxFiles) {
        showStatus('maxFiles');
        return;
      }

      // Check file size
      if (file.size > CONFIG.maxFileSize) {
        showStatus('fileTooLarge', file.name);
        return;
      }

      // Check total size
      const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0) + file.size;
      if (totalSize > CONFIG.maxTotalSize) {
        showStatus('totalTooLarge');
        return;
      }

      // Check file type
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      if (!CONFIG.allowedExtensions.includes(extension)) {
        showStatus('invalidType', file.name);
        return;
      }

      // Add file
      uploadedFiles.push(file);
      renderFileList();
    });
  }

  function renderFileList() {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;

    fileList.innerHTML = '';

    uploadedFiles.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      
      const fileIcon = getFileIcon(file.name);
      const fileSize = formatFileSize(file.size);
      
      fileItem.innerHTML = `
        <div class="file-item-icon">${fileIcon}</div>
        <div class="file-item-info">
          <span class="file-item-name">${escapeHtml(file.name)}</span>
          <span class="file-item-size">${fileSize}</span>
        </div>
        <button type="button" class="file-item-remove" data-index="${index}" aria-label="Remove file">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      `;
      
      fileList.appendChild(fileItem);
    });

    // Bind remove buttons
    fileList.querySelectorAll('.file-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index, 10);
        uploadedFiles.splice(index, 1);
        renderFileList();
      });
    });
  }

  function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const icons = {
      pdf: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`,
      doc: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`,
      docx: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`,
      jpg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
      jpeg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
      png: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
      xls: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>`,
      xlsx: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>`,
      csv: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>`
    };

    return icons[extension] || icons.pdf;
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // ==========================================================================
  // FORM VALIDATION
  // ==========================================================================
  function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Clear previous error
    clearFieldError(field);

    // Required check
    if (field.required && !value) {
      isValid = false;
      errorMessage = getFieldErrorMessage(field, 'required');
    }

    // Email validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = getFieldErrorMessage(field, 'email');
      }
    }

    if (!isValid) {
      showFieldError(field, errorMessage);
    }

    return isValid;
  }

  function validateForm(form) {
    const fields = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  function showFieldError(field, message) {
    field.classList.add('error');
    
    let errorEl = field.parentElement.querySelector('.field-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error';
      field.parentElement.appendChild(errorEl);
    }
    
    errorEl.textContent = message;
  }

  function clearFieldError(field) {
    field.classList.remove('error');
    const errorEl = field.parentElement.querySelector('.field-error');
    if (errorEl) {
      errorEl.remove();
    }
  }

  function getFieldErrorMessage(field, type) {
    const lang = window.I18N?.getCurrentLanguage() || 'sk';
    
    const messages = {
      sk: {
        required: 'Toto pole je povinné',
        email: 'Zadajte platný email'
      },
      en: {
        required: 'This field is required',
        email: 'Please enter a valid email'
      },
      ru: {
        required: 'Это поле обязательно',
        email: 'Введите действительный email'
      }
    };

    return messages[lang]?.[type] || messages.sk[type];
  }

  // ==========================================================================
  // FORM SUBMISSION
  // ==========================================================================
  async function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn?.innerHTML;

    // Check if endpoint is configured
    if (CONFIG.CONTACT_ENDPOINT === 'REPLACE_ME') {
      showStatus('notConfigured');
      return;
    }

    // Validate form
    if (!validateForm(form)) {
      showStatus('validationError');
      return;
    }

    // Check honeypot
    const honeypot = form.querySelector('#website');
    if (honeypot && honeypot.value) {
      return; // Spam detected
    }

    // Prevent double submission
    if (isSubmitting) return;
    isSubmitting = true;

    // Update UI
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner"></span> ${getStatusMessage('sending')}`;
    }

    try {
      // Build FormData
      const formData = new FormData(form);
      
      // Add files
      uploadedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      // Add metadata
      formData.append('page_url', window.location.href);
      formData.append('language', window.I18N?.getCurrentLanguage() || 'sk');
      formData.append('timestamp', new Date().toISOString());

      // Send request
      const response = await fetch(CONFIG.CONTACT_ENDPOINT, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        showStatus('success');
        form.reset();
        uploadedFiles = [];
        renderFileList();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('[Contact] Submission error:', error);
      showStatus('error');
    } finally {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  }

  // ==========================================================================
  // STATUS MESSAGES
  // ==========================================================================
  function showStatus(type, ...args) {
    const statusEl = document.getElementById('contactStatus');
    if (!statusEl) return;

    const message = getStatusMessage(type, ...args);
    
    statusEl.textContent = message;
    statusEl.className = 'form-status';
    
    if (type === 'success') {
      statusEl.classList.add('success');
    } else if (['error', 'validationError', 'notConfigured'].includes(type)) {
      statusEl.classList.add('error');
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = 'form-status';
    }, 5000);
  }

  function getStatusMessage(type, ...args) {
    const lang = window.I18N?.getCurrentLanguage() || 'sk';
    
    const messages = {
      sk: {
        success: 'Ďakujeme za správu! Ozveme sa vám čoskoro.',
        error: 'Chyba pri odosielaní. Skúste to znova.',
        sending: 'Odosielam...',
        validationError: 'Prosím, vyplňte všetky povinné polia správne.',
        notConfigured: 'Kontaktný formulár nie je nakonfigurovaný.',
        maxFiles: 'Maximálny počet súborov je ' + CONFIG.maxFiles,
        fileTooLarge: (name) => `Súbor "${name}" je príliš veľký.`,
        totalTooLarge: 'Celková veľkosť súborov presahuje limit.',
        invalidType: (name) => `Súbor "${name}" má nepovolený formát.`
      },
      en: {
        success: 'Thank you for your message! We will get back to you soon.',
        error: 'Error sending message. Please try again.',
        sending: 'Sending...',
        validationError: 'Please fill in all required fields correctly.',
        notConfigured: 'Contact form is not configured.',
        maxFiles: 'Maximum number of files is ' + CONFIG.maxFiles,
        fileTooLarge: (name) => `File "${name}" is too large.`,
        totalTooLarge: 'Total file size exceeds the limit.',
        invalidType: (name) => `File "${name}" has an unsupported format.`
      },
      ru: {
        success: 'Спасибо за сообщение! Мы свяжемся с вами скоро.',
        error: 'Ошибка при отправке. Попробуйте снова.',
        sending: 'Отправка...',
        validationError: 'Пожалуйста, заполните все обязательные поля правильно.',
        notConfigured: 'Контактная форма не настроена.',
        maxFiles: 'Максимальное количество файлов: ' + CONFIG.maxFiles,
        fileTooLarge: (name) => `Файл "${name}" слишком большой.`,
        totalTooLarge: 'Общий размер файлов превышает лимит.',
        invalidType: (name) => `Файл "${name}" имеет неподдерживаемый формат.`
      }
    };

    const message = messages[lang]?.[type] || messages.sk[type];
    return typeof message === 'function' ? message(...args) : message;
  }

  // ==========================================================================
  // UTILITY
  // ==========================================================================
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==========================================================================
  // EXPOSE API
  // ==========================================================================
  window.ContactForm = {
    init,
    CONFIG
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
