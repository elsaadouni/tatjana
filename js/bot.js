/**
 * ============================================================================
 * BOT.JS - Help Assistant with Service Offerings
 * ============================================================================
 */

(function() {
  'use strict';

  const CONFIG = {
    storageKey: 'bot-messages',
    maxMessages: 50
  };

  let isOpen = false;
  let messages = [];
  let currentFlow = null; // Track conversation flow

  // Knowledge Base - 20 Q&A Pairs with keywords
  const KNOWLEDGE_BASE = [
    {
      id: 'pricing_basic',
      keywords: ['cena', 'cenn', 'price', 'pricing', 'cost', '€', 'euro', 'цена', 'стоимость', 'ценник', 'kolko', 'how much', 'сколько'],
      responseKey: 'bot.responses.pricing'
    },
    {
      id: 'documents',
      keywords: ['dokument', 'document', 'pas', 'list', 'certificate', 'документ', 'свидетельство', 'pasos', 'pasport'],
      responseKey: 'bot.responses.documents'
    },
    {
      id: 'turnaround',
      keywords: ['term', 'cas', 'time', 'rychlo', 'expres', 'speed', 'срок', 'время', 'быстро', 'ako dlho', 'how long', 'когда'],
      responseKey: 'bot.responses.turnaround'
    },
    {
      id: 'contact',
      keywords: ['kontakt', 'contact', 'tel', 'email', 'telefon', 'телефон', 'контакт', 'почта', 'phone', 'napisat', 'write'],
      responseKey: 'bot.responses.contact'
    },
    {
      id: 'certified_translation',
      keywords: ['certifikovany', 'uradny', 'official', 'certified', 'сертифицированный', 'заверенный', 'официальный', 'notary', 'notarsky'],
      responseKey: 'bot.responses.certified'
    },
    {
      id: 'languages',
      keywords: ['jazyk', 'language', 'slovensky', 'rusky', 'язык', 'словацкий', 'русский', 'preklad', 'translation', 'перевод'],
      responseKey: 'bot.responses.languages'
    },
    {
      id: 'interpreting',
      keywords: ['tlmocenie', 'interpreting', 'ustny', 'ustne', 'tlmocnik', 'переводчик', 'устный', 'tlmocit'],
      responseKey: 'bot.responses.interpreting'
    },
    {
      id: 'court_interpreting',
      keywords: ['sud', 'court', 'sudne', 'sudny', 'суд', 'судебный', 'sudca', 'judge'],
      responseKey: 'bot.responses.court'
    },
    {
      id: 'police',
      keywords: ['policia', 'police', 'vysluch', 'policajt', 'полиция', 'полицейский', 'допрос', 'vysetrovanie'],
      responseKey: 'bot.responses.police'
    },
    {
      id: 'payment',
      keywords: ['platba', 'payment', 'zaplatit', 'banka', 'hotovost', 'платеж', 'оплата', 'заплатить', 'card', 'karta'],
      responseKey: 'bot.responses.payment'
    },
    {
      id: 'delivery',
      keywords: ['dorucenie', 'delivery', 'posta', 'kuriér', 'email', 'доставка', 'отправка', 'pickup', 'osobne'],
      responseKey: 'bot.responses.delivery'
    },
    {
      id: 'confidentiality',
      keywords: ['dovernost', 'tajnost', 'mlcanlivost', 'confidential', 'secret', 'private', 'конфиденциальность', 'тайна', 'osobne udaje'],
      responseKey: 'bot.responses.confidentiality'
    },
    {
      id: 'registration_info',
      keywords: ['registracia', 'registration', 'cislo', 'number', 'ministerstvo', 'регистрация', 'номер', 'ministerstvo'],
      responseKey: 'bot.responses.registration'
    },
    {
      id: 'experience',
      keywords: ['skusenosti', 'experience', 'roky', 'years', 'prax', 'опыт', 'лет', 'practice', 'ako dlho'],
      responseKey: 'bot.responses.experience'
    },
    {
      id: 'business',
      keywords: ['business', 'podnikanie', 'firma', 'company', 'corporate', 'бизнес', 'фирма', 'компания', 'podnik'],
      responseKey: 'bot.responses.business'
    },
    {
      id: 'birth_certificate',
      keywords: ['rodný list', 'birth certificate', 'narodenie', 'свидетельство о рождении', 'narodny'],
      responseKey: 'bot.responses.birth_certificate'
    },
    {
      id: 'marriage_certificate',
      keywords: ['sobášny list', 'marriage certificate', 'sobas', 'manzelstvo', 'свидетельство о браке', 'свадьба'],
      responseKey: 'bot.responses.marriage_certificate'
    },
    {
      id: 'diploma',
      keywords: ['diplom', 'vysvedcenie', 'diploma', 'certificate', 'диплом', 'аттестат', 'vzdelanie', 'skola'],
      responseKey: 'bot.responses.diploma'
    },
    {
      id: 'location',
      keywords: ['kde', 'where', 'adresa', 'address', 'miesto', 'location', 'bratislava', 'город', 'где', 'адрес'],
      responseKey: 'bot.responses.location'
    },
    {
      id: 'services',
      keywords: ['sluzby', 'services', 'sluzba', 'service', 'услуги', 'услуга', 'ponuka', 'offer', 'что делаете', 'что предлагаете'],
      responseKey: null, // Special handling - show service offerings
      action: 'show_services'
    },
    {
      id: 'greeting',
      keywords: ['ahoj', 'hello', 'hi', 'dobry', 'good', 'привет', 'здравствуй', 'cau', 'nazdar', 'dobry den'],
      responseKey: 'bot.responses.greeting'
    }
  ];

  // Service offerings data
  const SERVICE_OFFERINGS = {
    translation: {
      id: 'translation',
      icon: '📄',
      titleKey: 'bot.services.translation.title',
      descKey: 'bot.services.translation.desc',
      itemsKey: 'bot.services.translation.items',
      priceFromKey: 'bot.services.translation.priceFrom'
    },
    interpreting: {
      id: 'interpreting',
      icon: '🎤',
      titleKey: 'bot.services.interpreting.title',
      descKey: 'bot.services.interpreting.desc',
      itemsKey: 'bot.services.interpreting.items',
      priceFromKey: 'bot.services.interpreting.priceFrom'
    },
    certified: {
      id: 'certified',
      icon: '✓',
      titleKey: 'bot.services.certified.title',
      descKey: 'bot.services.certified.desc',
      itemsKey: 'bot.services.certified.items',
      priceFromKey: 'bot.services.certified.priceFrom'
    },
    urgent: {
      id: 'urgent',
      icon: '⚡',
      titleKey: 'bot.services.urgent.title',
      descKey: 'bot.services.urgent.desc',
      itemsKey: 'bot.services.urgent.items',
      priceFromKey: 'bot.services.urgent.priceFrom'
    }
  };

  function init() {
    const botContainer = document.querySelector('.bot-container');
    if (!botContainer) return;

    const botPanel = botContainer.querySelector('.bot-panel');
    const botMessages = botContainer.querySelector('.bot-messages');
    const botInput = botContainer.querySelector('.bot-input');
    const botToggle = botContainer.querySelector('.bot-toggle');
    const botClose = botContainer.querySelector('.bot-close');
    const botSend = botContainer.querySelector('.bot-send');

    if (!botPanel || !botMessages || !botInput) return;

    // Load saved messages
    loadMessages();

    // Bind events
    botToggle.addEventListener('click', toggleBot);
    botClose.addEventListener('click', closeBot);
    botSend.addEventListener('click', sendMessage);
    
    botInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    document.addEventListener('click', (e) => {
      if (isOpen && !botPanel.contains(e.target) && !botToggle.contains(e.target)) {
        closeBot();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeBot();
      }
    });

    window.addEventListener('languagechange', () => {
      updateBotText();
    });

    // Show greeting if first visit
    if (messages.length === 0) {
      setTimeout(() => {
        addBotMessage(getTranslation('bot.greeting'));
        addQuickChips();
        addServiceOfferingsPrompt();
      }, 1000);
    } else {
      renderMessages();
    }
  }

  function toggleBot() {
    if (isOpen) {
      closeBot();
    } else {
      openBot();
    }
  }

  function openBot() {
    const botToggle = document.querySelector('.bot-toggle');
    const botPanel = document.querySelector('.bot-panel');
    
    isOpen = true;
    botPanel.classList.add('open');
    botPanel.setAttribute('aria-hidden', 'false');
    botToggle.setAttribute('aria-expanded', 'true');
    
    const botInput = document.querySelector('.bot-input');
    setTimeout(() => {
      if (botInput) botInput.focus();
    }, 300);

    scrollToBottom();
  }

  function closeBot() {
    const botToggle = document.querySelector('.bot-toggle');
    const botPanel = document.querySelector('.bot-panel');
    
    isOpen = false;
    botPanel.classList.remove('open');
    botPanel.setAttribute('aria-hidden', 'true');
    botToggle.setAttribute('aria-expanded', 'false');
    botToggle.focus();
  }

  function sendMessage() {
    const botInput = document.querySelector('.bot-input');
    const text = botInput.value.trim();
    if (!text) return;

    addUserMessage(text);
    botInput.value = '';

    setTimeout(() => {
      const response = generateResponse(text);
      if (response) {
        addBotMessage(response);
      }
    }, 500);
  }

  function addUserMessage(text) {
    const message = {
      id: Date.now(),
      type: 'user',
      text: escapeHtml(text),
      timestamp: new Date().toISOString()
    };
    
    messages.push(message);
    saveMessages();
    renderMessage(message);
    scrollToBottom();
  }

  function addBotMessage(text, options = {}) {
    const message = {
      id: Date.now(),
      type: 'bot',
      text: text,
      timestamp: new Date().toISOString(),
      ...options
    };
    
    messages.push(message);
    saveMessages();
    renderMessage(message);
    scrollToBottom();
  }

  function addQuickChips() {
    const botMessages = document.querySelector('.bot-messages');
    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'bot-chips';
    
    const chips = ['pricing', 'documents', 'turnaround', 'contact'];
    
    chips.forEach(chipKey => {
      const chip = document.createElement('button');
      chip.className = 'bot-chip';
      chip.textContent = getTranslation(`bot.quickChips.${chipKey}`);
      chip.addEventListener('click', () => {
        addUserMessage(chip.textContent);
        setTimeout(() => {
          const response = getTranslation(`bot.responses.${chipKey}`);
          addBotMessage(response);
          // Show additional options after response
          setTimeout(() => addServiceOfferingsPrompt(), 800);
        }, 500);
      });
      chipsContainer.appendChild(chip);
    });
    
    botMessages.appendChild(chipsContainer);
    scrollToBottom();
  }

  // New function: Add service offerings prompt
  function addServiceOfferingsPrompt() {
    const botMessages = document.querySelector('.bot-messages');
    
    const promptDiv = document.createElement('div');
    promptDiv.className = 'bot-offerings-prompt';
    
    const promptText = document.createElement('div');
    promptText.className = 'bot-offerings-text';
    promptText.textContent = getTranslation('bot.offerings.prompt');
    promptDiv.appendChild(promptText);
    
    const offeringsGrid = document.createElement('div');
    offeringsGrid.className = 'bot-offerings-grid';
    
    Object.values(SERVICE_OFFERINGS).forEach(service => {
      const card = document.createElement('button');
      card.className = 'bot-offering-card';
      card.dataset.serviceId = service.id;
      
      const icon = document.createElement('span');
      icon.className = 'bot-offering-icon';
      icon.textContent = service.icon;
      
      const title = document.createElement('span');
      title.className = 'bot-offering-title';
      title.textContent = getTranslation(service.titleKey);
      
      card.appendChild(icon);
      card.appendChild(title);
      
      card.addEventListener('click', () => {
        selectServiceOffering(service);
      });
      
      offeringsGrid.appendChild(card);
    });
    
    promptDiv.appendChild(offeringsGrid);
    botMessages.appendChild(promptDiv);
    scrollToBottom();
  }

  // Handle service offering selection
  function selectServiceOffering(service) {
    // Add user message showing selection
    const serviceTitle = getTranslation(service.titleKey);
    addUserMessage(serviceTitle);
    
    setTimeout(() => {
      // Show service details
      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'bot-service-details';
      
      const header = document.createElement('div');
      header.className = 'bot-service-header';
      header.innerHTML = `<span class="bot-service-icon">${service.icon}</span> <strong>${serviceTitle}</strong>`;
      detailsDiv.appendChild(header);
      
      const desc = document.createElement('div');
      desc.className = 'bot-service-desc';
      desc.textContent = getTranslation(service.descKey);
      detailsDiv.appendChild(desc);
      
      const items = getTranslation(service.itemsKey);
      if (items && Array.isArray(items)) {
        const itemsList = document.createElement('ul');
        itemsList.className = 'bot-service-items';
        items.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          itemsList.appendChild(li);
        });
        detailsDiv.appendChild(itemsList);
      }
      
      const price = document.createElement('div');
      price.className = 'bot-service-price';
      price.textContent = getTranslation(service.priceFromKey);
      detailsDiv.appendChild(price);
      
      addBotMessage(detailsDiv.innerHTML);
      
      // Add action buttons
      setTimeout(() => {
        addServiceActionButtons(service);
      }, 500);
    }, 500);
  }

  // Add action buttons after service selection
  function addServiceActionButtons(service) {
    const botMessages = document.querySelector('.bot-messages');
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'bot-service-actions';
    
    const getQuoteBtn = document.createElement('button');
    getQuoteBtn.className = 'bot-action-btn bot-action-primary';
    getQuoteBtn.textContent = getTranslation('bot.offerings.getQuote');
    getQuoteBtn.addEventListener('click', () => {
      addUserMessage(getTranslation('bot.offerings.getQuote'));
      setTimeout(() => {
        showContactOptions();
      }, 500);
    });
    
    const otherServicesBtn = document.createElement('button');
    otherServicesBtn.className = 'bot-action-btn bot-action-secondary';
    otherServicesBtn.textContent = getTranslation('bot.offerings.otherServices');
    otherServicesBtn.addEventListener('click', () => {
      addUserMessage(getTranslation('bot.offerings.otherServices'));
      setTimeout(() => {
        addServiceOfferingsPrompt();
      }, 500);
    });
    
    actionsDiv.appendChild(getQuoteBtn);
    actionsDiv.appendChild(otherServicesBtn);
    botMessages.appendChild(actionsDiv);
    scrollToBottom();
  }

  // Show contact options
  function showContactOptions() {
    const botMessages = document.querySelector('.bot-messages');
    
    const contactDiv = document.createElement('div');
    contactDiv.className = 'bot-contact-options';
    
    const contactText = document.createElement('div');
    contactText.textContent = getTranslation('bot.offerings.contactPrompt');
    contactDiv.appendChild(contactText);
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'bot-contact-buttons';
    
    // Phone button
    const phoneBtn = document.createElement('a');
    phoneBtn.className = 'bot-contact-btn';
    phoneBtn.href = 'tel:+421905646524';
    phoneBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> ${getTranslation('bot.offerings.call')}`;
    buttonsDiv.appendChild(phoneBtn);
    
    // Email button
    const emailBtn = document.createElement('a');
    emailBtn.className = 'bot-contact-btn';
    emailBtn.href = 'mailto:tatjana@yas.sh';
    emailBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg> ${getTranslation('bot.offerings.email')}`;
    buttonsDiv.appendChild(emailBtn);
    
    // Contact form button
    const formBtn = document.createElement('a');
    formBtn.className = 'bot-contact-btn bot-contact-btn-primary';
    formBtn.href = 'contact.html';
    formBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> ${getTranslation('bot.offerings.form')}`;
    buttonsDiv.appendChild(formBtn);
    
    contactDiv.appendChild(buttonsDiv);
    botMessages.appendChild(contactDiv);
    scrollToBottom();
  }

  function generateResponse(userText) {
    const text = userText.toLowerCase();
    
    // Check knowledge base
    for (const item of KNOWLEDGE_BASE) {
      if (item.keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        // Special handling for services
        if (item.action === 'show_services') {
          setTimeout(() => addServiceOfferingsPrompt(), 800);
          return getTranslation('bot.responses.services');
        }
        
        const response = getTranslation(item.responseKey);
        if (response && response !== item.responseKey) {
          // Add service offerings prompt after certain responses
          setTimeout(() => addServiceOfferingsPrompt(), 1000);
          return response;
        }
      }
    }

    // Default response for unknown questions
    setTimeout(() => addServiceOfferingsPrompt(), 1000);
    return getTranslation('bot.responses.default');
  }

  function renderMessage(message) {
    const botMessages = document.querySelector('.bot-messages');
    
    // Check if this is a special UI element message
    if (message.isServiceOffering) {
      addServiceOfferingsPrompt();
      return;
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `bot-message ${message.type}`;
    messageEl.dataset.messageId = message.id;
    
    const contentEl = document.createElement('div');
    contentEl.className = 'bot-message-content';
    contentEl.innerHTML = message.text;
    
    messageEl.appendChild(contentEl);
    botMessages.appendChild(messageEl);
    
    requestAnimationFrame(() => {
      messageEl.classList.add('visible');
    });
  }

  function renderMessages() {
    const botMessages = document.querySelector('.bot-messages');
    if (!botMessages) return;
    botMessages.innerHTML = '';
    messages.forEach(message => renderMessage(message));
  }

  function scrollToBottom() {
    const botMessages = document.querySelector('.bot-messages');
    if (botMessages) {
      botMessages.scrollTop = botMessages.scrollHeight;
    }
  }

  function saveMessages() {
    if (messages.length > CONFIG.maxMessages) {
      messages = messages.slice(-CONFIG.maxMessages);
    }
    
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(messages));
    } catch (e) {
      console.warn('[Bot] Failed to save messages:', e);
    }
  }

  function loadMessages() {
    try {
      const saved = localStorage.getItem(CONFIG.storageKey);
      if (saved) {
        messages = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[Bot] Failed to load messages:', e);
      messages = [];
    }
  }

  function getTranslation(key) {
    if (typeof I18N !== 'undefined' && I18N.t) {
      return I18N.t(key);
    }
    
    const lang = (typeof I18N !== 'undefined' && I18N.getCurrentLanguage) 
      ? I18N.getCurrentLanguage() 
      : 'sk';
    
    const translations = typeof TRANSLATIONS !== 'undefined' ? TRANSLATIONS[lang] : undefined;
    
    // Direct lookup for flat keys like "bot.greeting"
    if (translations && translations[key] !== undefined) {
      return translations[key];
    }
    
    // Fallback: try nested traversal
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  }

  function updateBotText() {
    const botContainer = document.querySelector('.bot-container');
    if (!botContainer) return;
    
    const titleEl = botContainer.querySelector('.bot-title');
    const subtitleEl = botContainer.querySelector('.bot-subtitle');
    const inputEl = botContainer.querySelector('.bot-input');
    const toggleLabelEl = botContainer.querySelector('.bot-label');
    
    if (titleEl) titleEl.textContent = getTranslation('bot.title');
    if (subtitleEl) subtitleEl.textContent = getTranslation('bot.subtitle');
    if (inputEl) inputEl.placeholder = getTranslation('bot.placeholder');
    if (toggleLabelEl) toggleLabelEl.textContent = getTranslation('bot.toggleLabel');
    
    // Update service offering cards if they exist
    document.querySelectorAll('.bot-offering-card').forEach(card => {
      const serviceId = card.dataset.serviceId;
      const service = SERVICE_OFFERINGS[serviceId];
      if (service) {
        const titleEl = card.querySelector('.bot-offering-title');
        if (titleEl) titleEl.textContent = getTranslation(service.titleKey);
      }
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  window.Bot = {
    open: openBot,
    close: closeBot,
    toggle: toggleBot,
    showServices: addServiceOfferingsPrompt
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
