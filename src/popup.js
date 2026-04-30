document.addEventListener('DOMContentLoaded', () => {
    // Charger et afficher les informations sauvegardées
    chrome.storage.sync.get(['firstName', 'lastName', 'email', 'phone', 'subject', 'message'], (data) => {
        const infoBox = document.getElementById('infoBox');

        if (data.firstName || data.lastName || data.email) {
            let html = '';
            if (data.firstName || data.lastName) {
                const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
                html += `<div class="info-item"><span class="info-label">Nom:</span> ${escapeHtml(fullName)}</div>`;
            }
            if (data.email) html += `<div class="info-item"><span class="info-label">Email:</span> ${escapeHtml(data.email)}</div>`;
            if (data.phone) html += `<div class="info-item"><span class="info-label">Tél:</span> ${escapeHtml(data.phone)}</div>`;

            infoBox.innerHTML = html;
        }

        // Charger le message par défaut
        if (data.message) {
            document.getElementById('message').value = data.message;
        }
    });

    // Bouton paramètres
    document.getElementById('settingsBtn').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    // Bouton Remplir le formulaire
    document.getElementById('fillBtn').addEventListener('click', () => {
        chrome.storage.sync.get(['firstName', 'lastName', 'email', 'phone', 'subject', 'message'], (data) => {
            const additionalMessage = document.getElementById('message').value;

            const formData = {
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phone: data.phone || '',
                subject: data.subject || '',
                message: additionalMessage || data.message || ''
            };

            // Envoyer au content script
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'fillForm',
                        data: formData
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            showStatus('Erreur: La page n\'a pas répondu', 'error');
                        } else if (response && response.success) {
                            showStatus('✓ Formulaire rempli !', 'success');
                        }
                    });
                }
            });
        });
    });
});

function showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';

    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}