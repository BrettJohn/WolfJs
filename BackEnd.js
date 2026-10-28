let pendingRequestInt = 0;
let loadingOverlayTimerInt = null;
let loadingOverlayDiv = null;
function loadingOverlay() {
    if (loadingOverlayDiv?.isConnected) {
        return loadingOverlayDiv;
    }
    let style = document.createElement('style');
    style.textContent = `
        #loadingOverlay { position: fixed; inset: 0; z-index: 2000; display: none; cursor: progress;
            align-items: center; justify-content: center; background: transparent; }
        #loadingOverlay.slow { background: rgba(0, 0, 0, 0.35); }
        #loadingOverlay div { width: 42px; height: 42px; border-radius: 50%; visibility: hidden;
            border: 4px solid rgba(255, 255, 255, 0.2); border-top-color: var(--spinner-color, #fff);
            animation: loadingSpin 0.8s linear infinite; }
        #loadingOverlay.slow div { visibility: visible; }
        @keyframes loadingSpin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
    loadingOverlayDiv = document.createElement('div');
    loadingOverlayDiv.id = 'loadingOverlay';
    loadingOverlayDiv.appendChild(document.createElement('div'));
    document.body.appendChild(loadingOverlayDiv);
    return loadingOverlayDiv;
}
document.addEventListener('click', (event) => {
    if (pendingRequestInt > 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}, true);
function startLoading() {
    if (!document.loadingOverlay || pendingRequestInt++ > 0) {
        return;
    }
    loadingOverlayTimerInt = setTimeout(() => {
        let overlayDiv = loadingOverlay();
        overlayDiv.style.display = 'flex';
        overlayDiv.classList.add('slow');
    }, 250);
}
function stopLoading() {
    if (!document.loadingOverlay || --pendingRequestInt > 0) {
        return;
    }
    clearTimeout(loadingOverlayTimerInt);
    loadingOverlay().classList.remove('slow');
    loadingOverlay().style.display = 'none';
}

async function fetchApi(apiUrlStr, inputObj = null) {
    return await fetch(
        apiUrlStr + '/',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                mode: 'cors',
                Accept: 'application/json',
            },
            body: inputObj == null ? null : JSON.stringify(inputObj),
        }
    )
    .then((responseObj) => responseObj.json())
    .then((responseObj) => {
        return { success: true, response: responseObj };
    })
    .catch((responseObj) => {
        console.log('Nothing returned ' + apiUrlStr);
        return { success: false, response: responseObj };
    });
}
