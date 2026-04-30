console.log('[FormFill] ✓ Content script chargé sur:', window.location.href);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillForm') {
        const data = request.data;
        console.log('[FormFill] Données reçues:', data);

        let filledCount = 0;

        // Remplir le champ de prénom
        if (data.firstName) {
            filledCount += fillField(
                ['input[name*="first"]', 'input[name*="prenom"]', 'input[id*="first"]', 'input[id*="prenom"]', 'input[placeholder*="prénom"]', 'input[placeholder*="first"]', 'input[aria-label*="prénom"]', 'input[aria-label*="first"]'],
                data.firstName,
                'prénom'
            );
        }

        // Remplir le champ de nom
        if (data.lastName) {
            filledCount += fillField(
                ['input[name*="last"]', 'input[name*="nom"]', 'input[id*="last"]', 'input[id*="nom"]', 'input[placeholder*="nom"]', 'input[placeholder*="last"]', 'input[aria-label*="nom"]', 'input[aria-label*="last"]'],
                data.lastName,
                'nom'
            );
        }

        // Remplir le champ d'email
        if (data.email) {
            filledCount += fillField(
                ['input[type="email"]', 'input[name*="email"]', 'input[name*="mail"]', 'input[id*="email"]', 'input[placeholder*="email"]', 'input[placeholder*="mail"]', 'input[aria-label*="email"]'],
                data.email,
                'email'
            );
        }

        // Remplir le champ de téléphone
        if (data.phone) {
            filledCount += fillField(
                ['input[type="tel"]', 'input[name*="phone"]', 'input[name*="tel"]', 'input[name*="telephone"]', 'input[id*="phone"]', 'input[placeholder*="téléphone"]', 'input[placeholder*="phone"]', 'input[aria-label*="téléphone"]'],
                data.phone,
                'téléphone'
            );
        }

        // Remplir le champ de sujet
        if (data.subject) {
            filledCount += fillField(
                ['input[name*="subject"]', 'input[name*="sujet"]', 'input[id*="subject"]', 'input[placeholder*="sujet"]', 'input[placeholder*="subject"]', 'input[aria-label*="sujet"]'],
                data.subject,
                'sujet'
            );
        }

        // Remplir le champ de message
        if (data.message) {
            filledCount += fillField(
                ['textarea', 'textarea[name*="message"]', 'textarea[name*="comment"]', 'input[type="text"][name*="message"]', 'textarea[placeholder*="message"]', 'textarea[aria-label*="message"]'],
                data.message,
                'message'
            );
        }

        console.log(`[FormFill] ${filledCount} champ(s) rempli(s)`);

        if (filledCount > 0) {
            sendResponse({ success: true, filled: filledCount });
        } else {
            console.warn('[FormFill] Aucun champ trouvé sur cette page');
            sendResponse({ success: false });
        }
    }
});

function fillField(selectors, value, fieldType) {
    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`[FormFill] Testant "${selector}" pour ${fieldType} → ${elements.length} élément(s)`);

        for (const element of elements) {
            // Vérifier que le champ n'est pas désactivé ou caché
            if (element.offsetParent === null || element.disabled) {
                console.log(`[FormFill] Champ ignoré (caché ou désactivé)`);
                continue;
            }

            // Vérifier si le champ est vide
            if (element.value === '') {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                element.dispatchEvent(new Event('blur', { bubbles: true }));
                console.log(`[FormFill] ✓ Champ ${fieldType} rempli`);
                return 1;
            } else {
                console.log(`[FormFill] Champ ignoré (déjà rempli: "${element.value.substring(0, 20)}")`);
            }
        }
    }

    // Si aucun champ trouvé par les sélecteurs, chercher par la valeur du label
    console.log(`[FormFill] Recherche alternative pour: ${fieldType}`);
    const allInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');

    for (const input of allInputs) {
        if (input.value === '' && !input.disabled && input.offsetParent !== null) {
            const label = findLabel(input);
            console.log(`[FormFill] Input trouvé: "${label}"`);

            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new Event('blur', { bubbles: true }));
            console.log(`[FormFill] ✓ Champ ${fieldType} rempli (recherche alternative)`);
            return 1;
        }
    }

    console.warn(`[FormFill] Aucun champ vide trouvé pour ${fieldType}`);
    return 0;
}

function findLabel(input) {
    // Chercher le label associé via l'attribut "for"
    if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) return label.textContent;
    }

    // Chercher le label parent
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.textContent;

    // Utiliser le placeholder
    if (input.placeholder) return input.placeholder;

    return input.name || input.id || 'Champ inconnu';
}