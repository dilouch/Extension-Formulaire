chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if (request.action === 'fillForm') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0].id;
        
            chrome.tabs.sendMessage(tabId, {
                action: 'fillForm',
                message: request.message
            });
        });
    }
});