Page.prototype.camera = function(obj = {}) {
    let cameraObj = { tagStr: obj.tagStr ?? '', liveBool: false, kindStr: '' };
    let lapseSecondsInt = obj.lapseSecondsInt ?? 5;
    let btnCss = { height: '32px', fontSize: '13px', width: 'auto', padding: '0 12px', margin: '3px' };
    cameraObj.videoEl = this.video({
        autoplay: true,
        muted: true,
        playsInline: true,
        css: {
            display: 'block',
            width: '100%',
            maxHeight: obj.heightStr ?? '40vh',
            backgroundColor: '#000000',
            borderRadius: '6px'
        }
    });
    cameraObj.deviceSelect = this.select({
        onchange: () => cameraObj.start(),
        css: { ...this.inputCss(), height: '32px', margin: '3px', fontSize: '13px', maxWidth: '220px' }
    });
    cameraObj.liveBtn = this.button({
        onclick: () => cameraObj.liveBool ? cameraObj.stop() : cameraObj.start(),
        css: btnCss
    });
    cameraObj.photoBtn = this.button({ textContent: 'Photo', onclick: () => cameraObj.photo(), css: btnCss });
    cameraObj.recordBtn = this.button({
        onclick: () => cameraObj.kindStr ? cameraObj.finish() : cameraObj.record(0),
        css: btnCss
    });
    cameraObj.lapseBtn = this.button({
        onclick: () => cameraObj.kindStr ? cameraObj.finish() : cameraObj.record(lapseSecondsInt),
        css: btnCss
    });
    cameraObj.statusLbl = this.span({ css: { fontSize: '12px', opacity: 0.8, margin: '0 6px' } });
    cameraObj.div = this.div()
        .add(cameraObj.videoEl)
        .add(this.div({ css: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginTop: '6px' } })
            .add(cameraObj.deviceSelect)
            .add(cameraObj.liveBtn)
            .add(cameraObj.photoBtn)
            .add(cameraObj.recordBtn)
            .add(cameraObj.lapseBtn)
            .add(cameraObj.statusLbl)
        );

    cameraObj.setStatus = (statusStr) => {
        cameraObj.statusLbl.textContent = statusStr;
        cameraObj.onStatusFn?.(statusStr);
    };

    cameraObj.refresh = () => {
        let liveBool = cameraObj.liveBool;
        let kindStr = cameraObj.kindStr;
        cameraObj.liveBtn.textContent = liveBool ? 'Stop camera' : 'Start camera';
        cameraObj.recordBtn.textContent = kindStr === 'Video' ? '■ Stop recording' : '● Record';
        cameraObj.lapseBtn.textContent = kindStr === 'TimeLapse' ? '■ Stop time-lapse'
            : `Time-lapse (1 frame / ${lapseSecondsInt} s)`;
        [
            [cameraObj.deviceSelect, !kindStr],
            [cameraObj.liveBtn, !kindStr],
            [cameraObj.photoBtn, liveBool],
            [cameraObj.recordBtn, liveBool && kindStr !== 'TimeLapse'],
            [cameraObj.lapseBtn, liveBool && kindStr !== 'Video']
        ].forEach(([controlEl, enabledBool]) => {
            controlEl.disabled = !enabledBool;
            controlEl.style.opacity = enabledBool ? '1' : '0.45';
        });
    };

    cameraObj.start = async () => {
        cameraObj.stop();
        if (!navigator.mediaDevices) {
            cameraObj.setStatus('The camera needs https or localhost.');
            return;
        }
        let deviceIdStr = cameraObj.deviceSelect.value;
        let videoObj = {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            deviceId: deviceIdStr ? { exact: deviceIdStr } : undefined
        };
        try {
            cameraObj.streamObj = await navigator.mediaDevices.getUserMedia({ video: videoObj });
        } catch (errorObj) {
            cameraObj.setStatus(`No camera: ${errorObj.message}`);
            return;
        }
        let trackObj = cameraObj.streamObj.getVideoTracks()[0];
        trackObj.onended = () => cameraObj.stop();
        cameraObj.videoEl.srcObject = cameraObj.streamObj;
        cameraObj.liveBool = true;
        let deviceArr = (await navigator.mediaDevices.enumerateDevices())
            .filter((deviceObj) => deviceObj.kind === 'videoinput');
        cameraObj.deviceSelect.replaceChildren(...deviceArr.map((deviceObj) => this.option({
            value: deviceObj.deviceId,
            textContent: deviceObj.label || 'Camera'
        })));
        let settingsObj = trackObj.getSettings();
        cameraObj.deviceSelect.value = settingsObj.deviceId;
        cameraObj.setStatus(`Live, ${settingsObj.width} × ${settingsObj.height}`);
        cameraObj.refresh();
    };

    cameraObj.stop = () => {
        cameraObj.streamObj?.getTracks().forEach((trackObj) => trackObj.stop());
        cameraObj.videoEl.srcObject = null;
        if (cameraObj.liveBool) {
            cameraObj.setStatus('Off');
        }
        cameraObj.liveBool = false;
        cameraObj.refresh();
    };

    cameraObj.photo = () => {
        let videoEl = cameraObj.videoEl;
        let canvas = this.canvas({ width: videoEl.videoWidth, height: videoEl.videoHeight });
        canvas.getContext('2d').drawImage(videoEl, 0, 0);
        canvas.toBlob((blobObj) => cameraObj.save(blobObj, 'Photo'), 'image/jpeg', 0.9);
    };

    cameraObj.record = (secondsInt) => {
        let pieceArr = [];
        let recorderObj = new MediaRecorder(cameraObj.streamObj);
        let kindStr = secondsInt ? 'TimeLapse' : 'Video';
        let startMsInt = Date.now();
        let frameInt = 1;
        let pauseFn = () => setTimeout(() => {
            if (recorderObj.state === 'recording') {
                recorderObj.pause();
            }
        }, 50);
        recorderObj.ondataavailable = (eventObj) => pieceArr.push(eventObj.data);
        cameraObj.savedPromise = new Promise((resolveFn) => recorderObj.onstop = async () => {
            clearInterval(cameraObj.frameTimerInt);
            clearInterval(cameraObj.clockTimerInt);
            cameraObj.kindStr = '';
            cameraObj.refresh();
            await cameraObj.save(new Blob(pieceArr, { type: recorderObj.mimeType }), kindStr);
            resolveFn();
        });
        cameraObj.recorderObj = recorderObj;
        cameraObj.kindStr = kindStr;
        recorderObj.start();
        if (secondsInt) {
            pauseFn();
            cameraObj.frameTimerInt = setInterval(() => {
                recorderObj.resume();
                frameInt++;
                pauseFn();
            }, secondsInt * 1000);
        }
        cameraObj.clockTimerInt = setInterval(() => {
            let clockStr = new Date(Date.now() - startMsInt).toISOString().slice(11, 19);
            cameraObj.setStatus(secondsInt ? `Time-lapse ${clockStr}, ${frameInt} frames` : `Recording ${clockStr}`);
        }, 1000);
        cameraObj.refresh();
    };

    cameraObj.finish = () => {
        cameraObj.recorderObj.stop();
        return cameraObj.savedPromise;
    };

    cameraObj.save = async (blobObj, kindStr) => {
        let stampStr = (new Date).toLocaleString('sv-SE').replaceAll(':', '-');
        let extensionStr = blobObj.type.startsWith('image') ? 'jpg' : 'webm';
        let captureObj = {
            blobObj,
            kindStr,
            tagStr: cameraObj.tagStr,
            nameStr: `${kindStr} ${stampStr}.${extensionStr}`
        };
        cameraObj.setStatus(`Saving ${captureObj.nameStr}…`);
        let savedBool = await this.saveCapture(captureObj);
        cameraObj.setStatus(savedBool ? `Saved ${captureObj.nameStr}` : `Not saved: ${captureObj.nameStr}`);
        if (savedBool) {
            cameraObj.onSavedFn?.(captureObj);
        }
    };

    cameraObj.refresh();
    cameraObj.setStatus('Off');
    return cameraObj;
};

Page.prototype.saveCapture = async function(captureObj) {
    let blobObj = captureObj.blobObj;
    this.download(captureObj.nameStr, blobObj, blobObj.type);
    return true;
};
