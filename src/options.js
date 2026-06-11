/**
 * @fileoverview Script de la page de paramètres.
 * Charge les données sauvegardées dans les champs du formulaire,
 * gère la sauvegarde et la réinitialisation.
 * @module options
 */

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['firstName', 'lastName', 'email', 'phone', 'subject', 'message'], (data) => {
        if (data.firstName) document.getElementById('firstName').value = data.firstName;
        if (data.lastName) document.getElementById('lastName').value = data.lastName;
        if (data.email) document.getElementById('email').value = data.email;
        if (data.phone) document.getElementById('phone').value = data.phone;
        if (data.subject) document.getElementById('subject').value = data.subject;
        if (data.message) document.getElementById('message').value = data.message;
    });
});

/**
 * Sauvegarde les paramètres dans chrome.storage.sync au submit du formulaire.
 * Ferme la page après 1,5 seconde si la sauvegarde réussit.
 */
document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    chrome.storage.sync.set(data, () => {
        showStatus('✓ Informations enregistrées avec succès !', 'success');
        setTimeout(() => { window.close(); }, 1500);
    });
});

/**
 * Réinitialise tous les champs et supprime les données de chrome.storage.sync
 * après confirmation de l'utilisateur.
 */
document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les champs ?')) {
        document.getElementById('settingsForm').reset();
        chrome.storage.sync.remove(['firstName', 'lastName', 'email', 'phone', 'subject', 'message']);
        showStatus('Informations réinitialisées', 'success');
        setTimeout(() => { document.getElementById('status').style.display = 'none'; }, 3000);
    }
});

/**
 * Affiche un message de statut dans la page de paramètres.
 *
 * @param {string} message - Texte à afficher
 * @param {'success'|'error'} type - Type de message (détermine le style CSS)
 */
function showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
}
