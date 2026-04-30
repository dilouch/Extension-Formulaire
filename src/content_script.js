console.log('[FormFill] ✓ Content script chargé sur:', window.location.href);

// Listener popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillForm') {
        const filled = doFill(request.data);
        sendResponse(filled > 0 ? { success: true, filled } : { success: false });
    }
});

// Logique principale
function doFill(data) {
    console.log('[FormFill] Données reçues:', data);
    let filledCount = 0;

    // NOM
    filledCount += fillNameFields(data);

    // EMAIL
    if (data.email) {
        filledCount += fillField([
            'input[type="email"]',
            'input[name="email"]', 'input[name="your-email"]',
            'input[name*="email"]', 'input[name*="mail"]',
            'input[id*="email"]', 'input[id*="mail"]',
            'input[placeholder*="email"]', 'input[placeholder*="mail"]', 'input[placeholder*="e-mail"]',
            'input[aria-label*="email"]', 'input[aria-label*="mail"]',
        ], data.email, 'email');
    }

    // TÉLÉPHONE
    if (data.phone) {
        filledCount += fillField([
            'input[type="tel"]',
            'input[name="your-phone"]',
            'input[name*="phone"]', 'input[name*="tel"]', 'input[name*="telephone"]', 'input[name*="mobile"]',
            'input[id*="phone"]', 'input[id*="tel"]', 'input[id*="telephone"]',
            'input[placeholder*="téléphone"]', 'input[placeholder*="telephone"]',
            'input[placeholder*="phone"]', 'input[placeholder*="mobile"]',
            'input[aria-label*="téléphone"]', 'input[aria-label*="phone"]',
        ], data.phone, 'téléphone');
        filledCount += fillByLabel(
            ['téléphone', 'telephone', 'phone', 'mobile', 'portable'],
            data.phone, 'téléphone (label)',
            ['input[type="text"]', 'input[type="tel"]', 'input:not([type])']
        );
    }

    // SUJET
    if (data.subject) {
        filledCount += fillField([
            'input[name="objet"]', 'input[name="your-subject"]',
            'input[name*="subject"]', 'input[name*="sujet"]', 'input[name*="objet"]',
            'input[id*="subject"]', 'input[id*="sujet"]', 'input[id*="objet"]',
            'input[placeholder*="sujet"]', 'input[placeholder*="subject"]', 'input[placeholder*="objet"]',
            'input[aria-label*="sujet"]', 'input[aria-label*="subject"]', 'input[aria-label*="objet"]',
        ], data.subject, 'sujet');
        filledCount += fillByLabel(
            ['sujet', 'subject', 'objet'],
            data.subject, 'sujet (label)',
            ['input[type="text"]', 'input:not([type])']
        );
    }

    // MESSAGE
    if (data.message) {
        filledCount += fillField([
            'textarea[name="message"]', 'textarea[name="your-message"]',
            'textarea[name*="message"]', 'textarea[name*="comment"]', 'textarea[name*="msg"]',
            'textarea[id*="message"]', 'textarea[id*="comment"]',
            'textarea[placeholder*="message"]', 'textarea[placeholder*="votre message"]',
            'textarea[aria-label*="message"]',
            'textarea',
        ], data.message, 'message');
    }

    console.log(`[FormFill] ${filledCount} champ(s) rempli(s)`);

    if (filledCount > 0) {
        checkConsentBoxes();
        setTimeout(() => {
            const submitBtn = findSubmitButton();
            if (submitBtn) {
                submitBtn.click();
                console.log('[FormFill] ✓ Bouton envoi cliqué');
            }
        }, 5000);
    }

    return filledCount;
}

// Noms
function fillNameFields(data) {
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ');
    if (!fullName) return 0;

    if (fillField(['input[name="your-name"]'], fullName, 'nom CF7') > 0) return 1;

    if (fillField([
        'input[name*="fullname"]', 'input[name*="full_name"]', 'input[name*="full-name"]',
        'input[id*="fullname"]', 'input[id*="full_name"]',
        'input[placeholder*="nom complet"]', 'input[placeholder*="full name"]',
    ], fullName, 'nom complet') > 0) return 1;

    const firstBySel = fillField([
        'input[name="firstname"]', 'input[name="first_name"]', 'input[name="first-name"]', 'input[name="prenom"]',
        'input[name*="firstname"]', 'input[name*="first_name"]', 'input[name*="prenom"]',
        'input[id*="firstname"]', 'input[id*="first_name"]', 'input[id*="prenom"]',
    ], data.firstName || fullName, 'prénom attr') > 0;

    const lastBySel = fillField([
        'input[name="lastname"]', 'input[name="last_name"]', 'input[name="last-name"]', 'input[name="surname"]',
        'input[name*="lastname"]', 'input[name*="last_name"]', 'input[name*="surname"]',
        'input[id*="lastname"]', 'input[id*="last_name"]', 'input[id*="surname"]',
    ], data.lastName || fullName, 'nom famille attr') > 0;

    if (firstBySel || lastBySel) return (firstBySel ? 1 : 0) + (lastBySel ? 1 : 0);

    const hasPrenomField = hasFieldWithLabel(['prénom', 'prenom', 'first name', 'given name']);

    if (hasPrenomField) {
        let count = 0;
        count += fillByLabel(['prénom', 'prenom', 'first name', 'given name'], data.firstName || fullName, 'prénom label', ['input[type="text"]', 'input:not([type])']);
        count += fillByLabel(['nom de famille', 'last name', 'surname', 'nom', 'name'], data.lastName || fullName, 'nom famille label', ['input[type="text"]', 'input:not([type])']);
        if (count > 0) return count;
    }

    return fillByLabel(['votre nom', 'nom', 'name', 'your name'], fullName, 'nom complet label', ['input[type="text"]', 'input:not([type])']);
}

// Helpers
function hasFieldWithLabel(keywords) {
    const inputs = document.querySelectorAll('input[type="text"], input:not([type])');
    for (const input of inputs) {
        if (!isVisible(input)) continue;
        if (keywords.some(kw => getFieldLabel(input).toLowerCase().includes(kw))) return true;
    }
    return false;
}

function setFieldValue(element, value) {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
}

function isVisible(element) {
    return element.offsetParent !== null && !element.disabled;
}

function fillField(selectors, value, fieldType) {
    for (const selector of selectors) {
        let elements;
        try { elements = document.querySelectorAll(selector); } catch (e) { continue; }
        for (const element of elements) {
            if (!isVisible(element) || element.value !== '') continue;
            setFieldValue(element, value);
            console.log(`[FormFill] ✓ ${fieldType} rempli via "${selector}"`);
            return 1;
        }
    }
    return 0;
}

function fillByLabel(keywords, value, fieldType, selectors) {
    const seen = new Set();
    for (const sel of selectors) {
        let elements;
        try { elements = document.querySelectorAll(sel); } catch (e) { continue; }
        for (const input of elements) {
            if (seen.has(input)) continue;
            seen.add(input);
            if (!isVisible(input) || input.value !== '') continue;
            const labelText = getFieldLabel(input).toLowerCase();
            if (!keywords.some(kw => labelText.includes(kw))) continue;
            setFieldValue(input, value);
            console.log(`[FormFill] ✓ ${fieldType} rempli via label "${labelText}"`);
            return 1;
        }
    }
    return 0;
}

function checkConsentBoxes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    for (const box of checkboxes) {
        if (box.checked || !isVisible(box)) continue;
        const label = getFieldLabel(box).toLowerCase();
        const isConsent = ['accepte', 'accept', 'conditions', 'cgv', 'cgu', 'politique', 'privacy', 'rgpd', 'gdpr', 'consent'].some(kw => label.includes(kw));
        if (isConsent) {
            box.checked = true;
            box.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`[FormFill] ✓ Checkbox cochée: "${label}"`);
        }
    }
}

function findSubmitButton() {
    const selectors = [
        'input[type="submit"]',
        'button[type="submit"]',
        'button[name*="submit"]',
        'input[value*="envoyer" i]',
        'input[value*="send" i]',
        'button',
    ];
    for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && isVisible(el)) return el;
    }
    return null;
}

function getFieldLabel(input) {
    if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) return label.textContent.trim();
    }
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.textContent.trim();
    if (input.placeholder) return input.placeholder;
    if (input.getAttribute('aria-label')) return input.getAttribute('aria-label');
    return input.name || input.id || '';
}
