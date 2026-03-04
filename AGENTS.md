# Tatjana Grigojanova Translation Services - Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Setup Instructions](#setup-instructions)
4. [Adding/Modifying Content](#addingmodifying-content)
5. [Translations (i18n)](#translations-i18n)
6. [Bot Messages](#bot-messages)
7. [Styling Guide](#styling-guide)
8. [Contact Form](#contact-form)
9. [Images & Assets](#images--assets)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

This is a multilingual (SK/EN/RU) website for professional Slovak-Russian translation and interpreting services.

**Tech Stack:**
- Pure HTML/CSS/JavaScript (no frameworks)
- Cloudflare Turnstile for CAPTCHA
- N8N webhook for form handling
- Custom i18n system

---

## File Structure

```
├── index.html          # Homepage
├── about.html          # About page
├── services.html       # Services page
├── pricing.html        # Pricing page
├── contact.html        # Contact page with form
├── css/
│   ├── theme.css      # CSS variables (colors, fonts, sizes)
│   ├── base.css       # Base styles, reset
│   ├── animations.css # Animations and transitions
│   └── components.css # UI components (buttons, cards, forms)
├── js/
│   ├── i18n.js        # Translation engine
│   ├── app.js         # Main app logic
│   ├── bot.js         # Chatbot assistant
│   └── contact.js     # Contact form file upload (legacy)
├── i18n/
│   └── translations.js # All translations (SK/EN/RU)
└── assets/
    └── images/        # Images, logos, flags
```

---

## Setup Instructions

### 1. Local Development
```bash
# Clone or download the project
cd grigojanova-site_02

# Start a local server (required for Turnstile)
python3 -m http.server 8000
# or
npx serve .

# Open in browser
http://localhost:8000
```

### 2. Required Environment
- Modern browser (Chrome, Firefox, Safari, Edge)
- Local server (files won't work with `file://` due to Turnstile)

### 3. Deployment
Upload all files to your web server. Ensure HTTPS is enabled for Turnstile.

---

## Adding/Modifying Content

### Adding a New Page

1. **Copy an existing page** (e.g., `about.html`)
2. **Update the content** inside `<main>`
3. **Update navigation** in all HTML files:
   ```html
   <nav class="nav">
     <a href="index.html">Domov</a>
     <a href="about.html">O nás</a>
     <a href="newpage.html" class="active">New Page</a>  <!-- Add this -->
   </nav>
   ```
4. **Add translations** in `i18n/translations.js`

### Modifying Text Content

**For static text:**
Edit directly in HTML files.

**For multilingual text:**
Add translation keys to `i18n/translations.js`:
```javascript
// Slovak (sk)
sk: {
  "nav.newitem": "Nová Položka",
  "newpage.title": "Názov Stránky"
}

// English (en)
en: {
  "nav.newitem": "New Item",
  "newpage.title": "Page Title"
}

// Russian (ru)
ru: {
  "nav.newitem": "Новый Элемент",
  "newpage.title": "Название Страницы"
}
```

Then use in HTML:
```html
<h1 data-i18n="newpage.title">Page Title</h1>
```

---

## Translations (i18n)

### Translation File Structure

All translations are in `/i18n/translations.js`:

```javascript
const TRANSLATIONS = {
  sk: { /* Slovak translations */ },
  en: { /* English translations */ },
  ru: { /* Russian translations */ }
};
```

### Adding New Translations

1. **Choose a key name** (use dots for nesting):
   ```
   section.element.description
   ```

2. **Add to all three languages:**
   ```javascript
   sk: {
     "services.newitem.title": "Nová Služba",
     "services.newitem.desc": "Popis služby..."
   },
   en: {
     "services.newitem.title": "New Service",
     "services.newitem.desc": "Service description..."
   },
   ru: {
     "services.newitem.title": "Новая Услуга",
     "services.newitem.desc": "Описание услуги..."
   }
   ```

3. **Use in HTML:**
   ```html
   <h3 data-i18n="services.newitem.title">New Service</h3>
   <p data-i18n="services.newitem.desc">Description...</p>
   ```

### Translation with HTML (Rich Text)

For HTML inside translations (like styled spans):
```javascript
"hero.title": "Professional <span class=\"highlight\">Slovak-Russian</span> Translation"
```

In HTML:
```html
<h1 data-i18n="hero.title" data-i18n-html>Title with HTML</h1>
```

**Important:** Add `data-i18n-html` attribute to render HTML.

---

## Bot Messages

### Bot Knowledge Base

Bot responses are defined in `/js/bot.js`:

```javascript
const KNOWLEDGE_BASE = [
  {
    id: 'pricing_basic',
    keywords: ['cena', 'price', 'цена', 'cost', '€'],
    responseKey: 'bot.responses.pricing'
  },
  // Add new entry here
];
```

### Adding New Bot Responses

1. **Add response text to translations:**
   ```javascript
   sk: {
     "bot.responses.newtopic": "Odpoveď na novú otázku..."
   },
   en: {
     "bot.responses.newtopic": "Answer to new question..."
   },
   ru: {
     "bot.responses.newtopic": "Ответ на новый вопрос..."
   }
   ```

2. **Add knowledge base entry in bot.js:**
   ```javascript
   {
     id: 'new_topic_id',
     keywords: ['keyword1', 'keyword2', 'keyword3'],  // Words that trigger this response
     responseKey: 'bot.responses.newtopic'
   }
   ```

3. **Keywords should include:**
   - Slovak variants
   - English variants
   - Russian variants
   - Related words

### Adding Service Offerings

Service cards in bot are defined in `SERVICE_OFFERINGS`:

```javascript
const SERVICE_OFFERINGS = {
  translation: {
    id: 'translation',
    icon: '📄',
    titleKey: 'bot.services.translation.title',
    descKey: 'bot.services.translation.desc',
    itemsKey: 'bot.services.translation.items',
    priceFromKey: 'bot.services.translation.priceFrom'
  }
};
```

To add a new service:
1. Add translations for title, description, items array, price
2. Create new entry in SERVICE_OFFERINGS
3. Add icon (emoji)

---

## Styling Guide

### CSS Variables (theme.css)

Colors:
```css
--primary: #00d4aa;        /* Main teal/cyan color */
--primary-light: #5eead4;  /* Lighter variant */
--primary-dark: #0d9488;   /* Darker variant */
--secondary: #7c3aed;      /* Purple accent */
--accent: #ec4899;         /* Pink accent */
```

Text sizes (adjusted):
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 0.9375rem;/* 15px - Body text */
--text-lg: 1.0625rem;  /* 17px */
--text-xl: 1.125rem;   /* 18px */
--text-2xl: 1.375rem;  /* 22px */
--text-3xl: 1.75rem;   /* 28px */
--text-4xl: 2rem;      /* 32px */
--text-5xl: 2.625rem;  /* 42px */
--text-6xl: 3.5rem;    /* 56px */
```

Spacing:
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
```

### Adding Custom Styles

1. **For global styles:** Add to `components.css`
2. **For page-specific:** Add `<style>` block in that page's HTML
3. **For animations:** Add to `animations.css`

### Common Style Patterns

Glassmorphism card:
```css
.my-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(10px);
  padding: var(--space-6);
}
```

Gradient text:
```css
.gradient-text {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## Contact Form

### Form Configuration

Webhook URL and secret are in `contact.html`:
```javascript
const WEBHOOK_URL = "https://n8n.elsaadouni.com/webhook/papki";
const WEBHOOK_SECRET = "your-secret-here";
```

### Modifying Form Fields

Form fields are in `contact.html`:
```html
<div class="form-group">
  <label for="fieldname" data-i18n="contact.form.fieldname">Label</label>
  <input type="text" id="fieldname" name="fieldname" class="form-input" required>
</div>
```

Remember to:
1. Add translations for label and placeholder
2. Add field to JavaScript form submission
3. Update N8N workflow to receive new field

### File Upload Settings

Accepted file types (in HTML):
```html
accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.csv"
```

Max sizes (shown in UI):
- 5MB per file
- 25MB total

To change limits:
1. Update UI text in translations
2. Add validation in JavaScript
3. Update server-side validation in N8N

---

## Images & Assets

### Adding Images

1. **Place image in** `assets/images/`
2. **Reference in HTML:**
   ```html
   <img src="assets/images/my-image.png" alt="Description" width="400" height="300">
   ```
3. **Always include:** width, height, and alt attributes

### Recommended Image Sizes

- **Logo**: 200x200px (displays at 44x44 or 48x48)
- **Hero image**: 800x800px
- **Profile photo**: 400x400px
- **Flag icons**: 36x24px
- **Icons**: 24x24px (SVG preferred)

### Optimizing Images

Use tools like:
- TinyPNG (for PNG/JPG)
- SVGOMG (for SVG)
- Squoosh (Google's tool)

---

## Troubleshooting

### Turnstile Error: "Cannot run in a file:// url"
**Solution:** Use a local server (`python3 -m http.server 8000`)

### Translations Not Loading
**Check:**
- Translation key exists in all three languages
- No syntax errors in `translations.js`
- Key matches exactly (case-sensitive)

### Styles Not Applying
**Check:**
- CSS file is linked in HTML `<head>`
- CSS selector is correct
- No syntax errors in CSS

### Bot Not Responding
**Check:**
- `bot.js` is loaded after `i18n.js`
- Knowledge base has valid responseKey
- Translations exist for responseKey

---

## Quick Reference

### Translation Key Naming Convention
```
page.section.element.property

Examples:
nav.home                    # Navigation
hero.title                  # Hero section
services.items.legal.title  # Nested service item
contact.form.email          # Form field
bot.responses.pricing       # Bot response
```

### HTML Data Attributes
```
data-i18n="key"         # Plain text translation
data-i18n-html          # Allow HTML in translation
data-i18n-attr="placeholder"  # Translate attribute
```

### Language Codes
- `sk` - Slovak
- `en` - English
- `ru` - Russian

### URL Language Switch
```
index.html?lang=en
contact.html?lang=ru
```

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all files are uploaded
3. Test on local server first
4. Check translations.js syntax
