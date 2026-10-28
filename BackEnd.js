let pendingRequestInt = 0;
let loadingOverlayTimerInt = null;
let loadingOverlayDiv = null;
let loadingOverlayCss = {
    position: 'fixed',
    inset: 0,
    zIndex: 2000,
    display: 'none',
    cursor: 'progress',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)'
};
let loadingSpinnerCss = {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    border: '4px solid rgba(255, 255, 255, 0.2)',
    borderTopColor: 'var(--spinner-color, #fff)'
};
let loadingSpinFrameArr = [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }];
function loadingOverlay() {
    if (loadingOverlayDiv?.isConnected) {
        return loadingOverlayDiv;
    }
    let spinnerDiv = document.createElement('div');
    Core.copyCss(loadingSpinnerCss, spinnerDiv);
    spinnerDiv.animate(loadingSpinFrameArr, { duration: 800, iterations: Infinity });
    loadingOverlayDiv = document.createElement('div');
    Core.copyCss(loadingOverlayCss, loadingOverlayDiv);
    loadingOverlayDiv.appendChild(spinnerDiv);
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
    }, 250);
}
function stopLoading() {
    if (!document.loadingOverlay || --pendingRequestInt > 0) {
        return;
    }
    clearTimeout(loadingOverlayTimerInt);
    let overlayDiv = loadingOverlay();
    overlayDiv.style.display = 'none';
}

async function fetchApi(apiUrlStr, inputObj = null) {
    return await fetch(apiUrlStr + '/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            mode: 'cors',
            Accept: 'application/json',
        },
        body: inputObj == null ? null : JSON.stringify(inputObj),
    })
    .then((responseObj) => responseObj.json())
    .then((responseObj) => {
        return { success: true, response: responseObj };
    })
    .catch((responseObj) => {
        console.log('Nothing returned ' + apiUrlStr);
        return { success: false, response: responseObj };
    });
}
