document.addEventListener('DOMContentLoaded', () => {
    // Charger les données sauvegardées
    chrome.storage.sync.get(['firstName', 'lastName', 'email', 'phone', 'subject', 'message'], (data) => {
        if (data.firstName) document.getElementById('firstName').value = data.firstName;
        if (data.lastName) document.getElementById('lastName').value = data.lastName;
        if (data.email) document.getElementById('email').value = data.email;
        if (data.phone) document.getElementById('phone').value = data.phone;
        if (data.subject) document.getElementById('subject').value = data.subject;
        if (data.message) document.getElementById('message').value = data.message;
    });
});

// Sauvegarder les paramètres
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
        setTimeout(() => {
            window.close();
        }, 1500);
    });
});

// Réinitialiser les champs
document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les champs ?')) {
        document.getElementById('settingsForm').reset();
        chrome.storage.sync.remove(['firstName', 'lastName', 'email', 'phone', 'subject', 'message']);
        showStatus('Informations réinitialisées', 'success');
        setTimeout(() => {
            document.getElementById('status').style.display = 'none';
        }, 3000);
    }
});

function showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
}
