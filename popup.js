const extpay = ExtPay('annoying-goose'); 

document.getElementById('premiumButton').addEventListener('click', function(evt) {
    evt.preventDefault();
    extpay.openPaymentPage();
})

document.getElementById('loginButton').addEventListener('click', function(evt) {
    evt.preventDefault();
    extpay.openLoginPage();
})

extpay.getUser().then(user => {
    if (user.paid) {
        // User has premium - hide payment UI, show coffee container
        document.getElementById('premiumContainer').style.display = 'none';
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('coffeeContainer').style.display = 'block';
        
        // Show unlocked buttons
        document.getElementById('hatsButton').style.display = 'block';
        document.getElementById('hatsButtonLocked').style.display = 'none';
        document.getElementById('statesButton').style.display = 'block';
        document.getElementById('statesButtonLocked').style.display = 'none';
        document.getElementById('layEggButton').style.display = 'block';
        document.getElementById('layEggButtonLocked').style.display = 'none';
    } else {
        // User doesn't have premium - show payment UI
        document.getElementById('premiumContainer').style.display = 'block';
        document.getElementById('loginContainer').style.display = 'block';
        document.getElementById('coffeeContainer').style.display = 'none';
        
        // Show locked buttons
        document.getElementById('hatsButton').style.display = 'none';
        document.getElementById('hatsButtonLocked').style.display = 'block';
        document.getElementById('statesButton').style.display = 'block'; // enable states button, even for free users
        document.getElementById('statesButtonLocked').style.display = 'none';
        document.getElementById('layEggButton').style.display = 'none';
        document.getElementById('layEggButtonLocked').style.display = 'block';
    }
}).catch(err => {
    // Show payment UI on error
    document.getElementById('premiumContainer').style.display = 'block';
    document.getElementById('loginContainer').style.display = 'block';
})

extpay.onPaid.addListener(() => {

    //? do we need to do anything, RIGHT when the user pays?
});

document.getElementById('startButton').addEventListener('click', () => {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tabId = tabs[0].id;
        browser.tabs.sendMessage(tabId, {command: "startGoose"});
        browser.storage.local.set({ [`gooseActive_${tabId}`]: true }, () => {
            document.getElementById('stopButton').disabled = false;
            document.getElementById('startButton').disabled = true;
            document.getElementById('hatsButton').disabled = false;
            document.getElementById('statesButton').disabled = false;
            window.close();
        });
    });
});

document.getElementById('stopButton').addEventListener('click', () => {
    browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tabId = tabs[0].id;
        browser.tabs.sendMessage(tabId, {command: "stopGoose"});
        browser.storage.local.set({ [`gooseActive_${tabId}`]: false }, () => {
            document.getElementById('stopButton').disabled = true;
            document.getElementById('startButton').disabled = false;
            document.getElementById('hatsButton').disabled = true;
            document.getElementById('statesButton').disabled = true;
            window.close();
        });
    });
});


                        
// When popup opens, check the goose state and state swapper state
browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id;
    const url = tabs[0].url;

    // List of blocked URLs
    const blockedURLs = [
        'about://', 
        'chrome-error://',
        'chrome://', 
        'edge://',
        'brave://',
        'opera://',
        'vivaldi://',
        'https://chromewebstore.google.com/',
    ];

    const isBlocked = blockedURLs.some(blocked => url.startsWith(blocked));

    if (isBlocked) {
        alert('Sorry, the goose cannot be activated on this page :(');
        document.getElementById('startButton').disabled = true;
        document.getElementById('stopButton').disabled = true;
        document.getElementById('hatsButton').disabled = true;
        document.getElementById('statesButton').disabled = true;
    } else {
        // Check if goose is actually running by sending a message
        browser.tabs.sendMessage(tabId, { command: "checkGooseStatus" }, (response) => {
            if (browser.runtime.lastError || !response || !response.isActive) {
                // Goose is not running, reset storage and UI
                browser.storage.local.set({ [`gooseActive_${tabId}`]: false }, () => {
                    setInactiveState();
                });
            } else {
                // Goose is running, set active state
                setActiveState();
            }
            
            // Set toggle state regardless
            browser.storage.local.get([`stateSwapperEnabled_${tabId}`], (result) => {
                const toggleButton = document.getElementById('statesButton');
                if (result[`stateSwapperEnabled_${tabId}`]) {
                    toggleButton.classList.add('checked');
                } else {
                    toggleButton.classList.remove('checked');
                }
            });
        });
    }
});

function setActiveState() {
    document.getElementById('stopButton').disabled = false;
    document.getElementById('startButton').disabled = true;
    document.getElementById('hatsButton').disabled = false;
    document.getElementById('statesButton').disabled = false;
}

function setInactiveState() {
    document.getElementById('stopButton').disabled = true;
    document.getElementById('startButton').disabled = false;
    document.getElementById('hatsButton').disabled = true;
    document.getElementById('statesButton').disabled = true;
}

document.getElementById('hatsButton').addEventListener('click', () => {
    const panel = document.getElementById('hatsPanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        document.getElementById('statesPanel').style.display = 'none';
    } else {
        panel.style.display = 'none';
    }
});

// Hat selection handlers
document.querySelectorAll('.hat-square-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const hatType = parseInt(event.currentTarget.dataset.hat);
        browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tabId = tabs[0].id;
            browser.tabs.sendMessage(tabId, { command: "changeHat", hatType: hatType });
        });
        // Hide panel after selection
        document.getElementById('hatsPanel').style.display = 'none';
    });

    //? Leave this in or take it out?
    // button.addEventListener('mouseover', (event) => {
    //     const hatType = parseInt(event.currentTarget.dataset.hat);
    //     browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //         const tabId = tabs[0].id;
    //         browser.tabs.sendMessage(tabId, { command: "changeHat", hatType: hatType });
    //     });
    // });
});

document.getElementById('statesButton').addEventListener('click', () => {
    const panel = document.getElementById('statesPanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        document.getElementById('hatsPanel').style.display = 'none';
    } else {
        panel.style.display = 'none';
    }
});

// State selection handlers
document.querySelectorAll('.state-square-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const stateName = event.currentTarget.dataset.state;
        if (stateName == "NONE") return;
        
        browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tabId = tabs[0].id;
            browser.tabs.sendMessage(tabId, { command: "changeState", stateName: stateName });
        });
        // Hide panel after selection
        document.getElementById('statesPanel').style.display = 'none';
    });
});

// Locked button handlers
document.getElementById('hatsButtonLocked').addEventListener('click', () => {
    ASSET_MGR.playAudio(UI_SFX.CLINK1);
});
document.getElementById('statesButtonLocked').addEventListener('click', () => {
    ASSET_MGR.playAudio(UI_SFX.CLINK1);
});
