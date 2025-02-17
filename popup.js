const paymentHTML = `
<div id="payment-container" class="premium-upgrade">
    <h3>Unlock Premium Goose</h3>
    <p>Get additional behaviors and cosmetics for your desktop companion!</p>
    <ul>
        <li>🎩 Fancy hats and accessories</li>
        <li>🏃‍♂️ New animations and movements</li>
        <li>🎵 Honk sound effects</li>
    </ul>
    <button id="paymentButton" class="premium-button">
        <span class="button-content">
            <span class="price">$2</span>
            <span class="text">Unlock Premium</span>
        </span>
    </button>
</div>
`;

// Insert the payment HTML into your popup
// document.body.insertAdjacentHTML('beforeend', paymentHTML);

// Payment integration logic
// let paymentButton = document.getElementById('paymentButton');
// let premiumFeatures = {
//     enabled: false,
//     cosmetics: ['topHat', 'bowtie', 'monocle'],
//     behaviors: ['dance', 'spin', 'waddle'],
//     sounds: ['honk1', 'honk2', 'honk3']
// };

// const extPay = ExtPay('annoying-goose'); 

// Check payment status when popup opens
// extPay.getUser().then(user => {
//     if (user.paid) {
//         enablePremiumFeatures();
//     } else {
//         setupPaymentButton();
//     }
// }).catch(err => {
//     console.error('Failed to load payment status:', err);
//     paymentButton.classList.add('disabled');
// });

// function setupPaymentButton() {
//     paymentButton.addEventListener('click', () => {
//         extPay.openPaymentPage();
//     });

//     // Listen for successful payments
//     extPay.onPaymentSuccess(user => {
//         enablePremiumFeatures();
//     });
// }

// function enablePremiumFeatures() {
//     premiumFeatures.enabled = true;
    
//     // Update UI
//     paymentButton.innerHTML = '<span class="button-content">✨ Premium Unlocked!</span>';
//     paymentButton.classList.add('unlocked');
//     paymentButton.disabled = true;

//     // Save premium status to storage
//     chrome.storage.local.set({ premiumEnabled: true }, () => {
//         // Notify content script about premium status
//         chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//             chrome.tabs.sendMessage(tabs[0].id, {
//                 command: "enablePremium",
//                 features: premiumFeatures
//             });
//         });
//     });
// }



document.getElementById('startButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, {command: "startGoose"});
        chrome.storage.local.set({ [`gooseActive_${tabId}`]: true }, () => {
            document.getElementById('stopButton').disabled = false;
            document.getElementById('startButton').disabled = true;
            window.close();
        });
    });
});

document.getElementById('stopButton').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, {command: "stopGoose"});
        chrome.storage.local.set({ [`gooseActive_${tabId}`]: false }, () => {
            document.getElementById('stopButton').disabled = true;
            document.getElementById('startButton').disabled = false;
            window.close();
        });
    });
});

document.getElementById('toggleStateSwapper').addEventListener('change', (event) => {
    const enabled = event.target.checked;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tabId = tabs[0].id;
        chrome.storage.local.set({ [`stateSwapperEnabled_${tabId}`]: enabled }, () => {
            chrome.tabs.sendMessage(tabId, { command: "toggleStateSwapper", enabled: enabled });
        });
    });
});

// When popup opens, check the goose state and state swapper state
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id;
    chrome.storage.local.get([
        `gooseActive_${tabId}`,
        // `stateSwapperEnabled_${tabId}`,
        'premiumEnabled'
    ], (result) => {
        if (result[`gooseActive_${tabId}`]) {
            document.getElementById('stopButton').disabled = false;
            document.getElementById('startButton').disabled = true;
        } else {
            document.getElementById('stopButton').disabled = true;
            document.getElementById('startButton').disabled = false;
        }
        document.getElementById('toggleStateSwapper').checked = result[`stateSwapperEnabled_${tabId}`];

        // if (result.premiumEnabled) {
        //     enablePremiumFeatures();
        // }
    });
});