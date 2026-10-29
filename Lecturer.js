class Lecturer {
    pageObj;
    sceneObj;
    themeObj;
    panelEl;
    genderLink;
    wordOnCss;
    wordOffCss = { backgroundColor: 'transparent' };
    femaleBool = true;
    glBool;
    visibleBool;
    loopBool;
    runInt = 0;
    volumeFlt = 1;
    rateFlt = 1;
    wordInt = -1;
    wordMsFlt;
    wordSpanArr;
    wordStartArr;
    chunkArr;
    browserVoiceObj;
    pitchFlt = 1;
    chunkObj;
    boundaryBool;
    silentBool;
    mouthObj;
    lowerLipObj;
    blinkPartArr;
    lastOpenFlt = -1;
    lastBlinkBool;
    onShowFn = () => {};
    frameFn = (nowFlt) => this.frame(nowFlt);

    build() {
        let pageObj = this.pageObj;

        speechSynthesis.cancel();
        speechSynthesis.getVoices();
        this.themeObj = pageObj.lecturerThemeObj();
        this.wordOnCss = pageObj.spokenWordCss();
        this.sceneObj = pageObj.scene({
            singleBool: true,
            radiusFlt: 1.45,
            centerArr: [0, 0, -0.4],
            gapInt: 0,
            aspectStr: '4 / 5',
            viewArr: [{ nameStr: 'Lecturer', eyeArr: [0, -1, 0.1], upArr: [0, 0, 1] }]
        });
        let sceneObj = this.sceneObj;
        let chipArr = sceneObj.chipArr;
        let glObj = sceneObj.glObj;
        let sceneDiv = sceneObj.div;
        chipArr[0].hide();
        this.glBool = !Is.blank(glObj);

        // Settings
        let volumeStr = localStorage.getItem('LecturerVolume');
        let rateStr = localStorage.getItem('LecturerRate');
        let femaleStr = localStorage.getItem('LecturerFemale');
        if (!Is.blank(volumeStr)) {
            this.volumeFlt = Number(volumeStr);
        }
        if (!Is.blank(rateStr)) {
            this.rateFlt = Number(rateStr);
        }
        if (!Is.blank(femaleStr)) {
            this.femaleBool = femaleStr === 'true';
        }
        let volumeFlt = this.volumeFlt;
        let rateFlt = this.rateFlt;

        // Panel
        let linkCss = { cursor: 'pointer', padding: '2px 0 2px 8px', fontSize: '15px', lineHeight: 1.4 };
        let genderCss = { ...linkCss, fontSize: '20px', lineHeight: 1 };
        this.genderLink = pageObj.a({ role: 'button', tabIndex: 0, css: genderCss });
        let genderLink = this.genderLink;
        let stopLink = pageObj.a({ role: 'button', tabIndex: 0, title: 'Stop', textContent: '■', css: linkCss });
        let closeLink = pageObj.a({ role: 'button', tabIndex: 0, title: 'Close', textContent: '×', css: linkCss });
        genderLink.onclick = () => {
            let femaleBool = !this.femaleBool;
            this.femaleBool = femaleBool;
            localStorage.setItem('LecturerFemale', String(femaleBool));
            this.paintGender();
            this.buildFace();
        };
        stopLink.onclick = () => this.stop();
        closeLink.onclick = () => this.hide();
        for (let linkEl of [genderLink, stopLink, closeLink]) {
            linkEl.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    linkEl.click();
                }
            });
        }
        this.paintGender();
        let headEl = pageObj.div({ css: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' } })
            .add(pageObj.div({ textContent: 'Lecturer', css: { flex: 1, fontWeight: 700 } }))
            .add(closeLink);

        // Sliders
        let sliderRowCss = { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '13px' };
        let sliderLblCss = { width: '50px', opacity: 0.8 };
        let sliderCss = { flex: 1, minWidth: 0 };
        let volumeInput = pageObj.slider({ min: 0, max: 1, step: 0.05, value: volumeFlt, css: sliderCss });
        let rateInput = pageObj.slider({ min: 0.5, max: 2, step: 0.1, value: rateFlt, css: sliderCss });
        let rateLblCss = { width: '32px', textAlign: 'right' };
        let rateLblStr = rateFlt.toFixed(1);
        let rateLbl = pageObj.span({ textContent: `${rateLblStr}×`, css: rateLblCss });
        volumeInput.ariaLabel = 'Volume';
        rateInput.ariaLabel = 'Speed';
        volumeInput.oninput = () => {
            this.volumeFlt = Number(volumeInput.value);
            localStorage.setItem('LecturerVolume', volumeInput.value);
            this.applySliders();
        };
        rateInput.oninput = () => {
            let pickedRateFlt = Number(rateInput.value);
            this.rateFlt = pickedRateFlt;
            localStorage.setItem('LecturerRate', rateInput.value);
            let pickedRateStr = pickedRateFlt.toFixed(1);
            rateLbl.textContent = `${pickedRateStr}×`;
            this.applySliders();
        };
        let volumeRowEl = pageObj.div({ css: sliderRowCss })
            .add(pageObj.span({ textContent: 'Volume', css: sliderLblCss }))
            .add(volumeInput)
            .add(genderLink);
        let rateRowEl = pageObj.div({ css: sliderRowCss })
            .add(pageObj.span({ textContent: 'Speed', css: sliderLblCss }))
            .add(rateInput)
            .add(rateLbl)
            .add(stopLink);
        this.panelEl = pageObj.div({ css: pageObj.lecturerPanelCss() })
            .add(headEl)
            .add(sceneDiv)
            .add(volumeRowEl)
            .add(rateRowEl)
            .hide();
        this.buildFace();
    }

    applySliders() {
    }

    paintGender() {
        let genderLink = this.genderLink;
        let femaleBool = this.femaleBool;

        genderLink.textContent = femaleBool ? '♀' : '♂';
        genderLink.title = femaleBool ? 'Female: switch to a male lecturer' : 'Male: switch to a female lecturer';
    }

    buildFace() {
        let sceneObj = this.sceneObj;
        let themeObj = this.themeObj;
        let femaleBool = this.femaleBool;
        let glBool = this.glBool;

        if (!glBool) {
            return;
        }
        let genderObj = femaleBool ? themeObj.femaleObj : themeObj.maleObj;
        let skinArr = themeObj.skinArr;
        let noseArr = themeObj.noseArr;
        let eyeArr = themeObj.eyeArr;
        let pupilArr = themeObj.pupilArr;
        let mouthArr = themeObj.mouthArr;
        let hairArr = genderObj.hairArr;
        let lipArr = genderObj.lipArr;
        let shirtArr = genderObj.shirtArr;
        let browFlt = femaleBool ? 0.05 : 0.08;
        let partArr = [
            { meshStr: 'sphere', positionArr: [0, 0, 0], sizeArr: [1.5, 1.62, 1.95], colorArr: skinArr },
            { meshStr: 'cylinder', positionArr: [0, 0.1, -1.15], sizeArr: [0.62, 0.62, 0.7], colorArr: skinArr },
            { meshStr: 'sphere', positionArr: [0, 0.15, -1.95], sizeArr: [2.7, 1.3, 1.3], colorArr: shirtArr },
            { meshStr: 'sphere', positionArr: [0, 0.1, 0.45], sizeArr: [1.58, 1.7, 1.4], colorArr: hairArr }
        ];
        if (femaleBool) {
            partArr.push({
                meshStr: 'sphere',
                positionArr: [0, 0.3, -0.35],
                sizeArr: [1.75, 1.3, 2.2],
                colorArr: hairArr
            });
        }
        partArr.push({
            meshStr: 'sphere',
            positionArr: [0, -0.82, -0.05],
            sizeArr: [0.2, 0.26, 0.36],
            colorArr: noseArr
        });
        let blinkPartArr = [];
        for (let sideFlt of [-0.3, 0.3]) {
            let earObj = {
                meshStr: 'sphere',
                positionArr: [sideFlt * 2.47, 0.05, 0.02],
                sizeArr: [0.2, 0.3, 0.42],
                colorArr: skinArr
            };
            let browObj = {
                meshStr: 'box',
                positionArr: [sideFlt, -0.68, 0.42],
                sizeArr: [0.32, 0.06, browFlt],
                colorArr: hairArr
            };
            let eyeObj = {
                meshStr: 'sphere',
                positionArr: [sideFlt, -0.68, 0.2],
                sizeArr: [0.3, 0.14, 0.2],
                colorArr: eyeArr
            };
            let pupilObj = {
                meshStr: 'sphere',
                positionArr: [sideFlt, -0.74, 0.2],
                sizeArr: [0.14, 0.06, 0.14],
                colorArr: pupilArr
            };
            partArr.push(earObj, browObj, eyeObj, pupilObj);
            blinkPartArr.push(eyeObj, pupilObj);
        }
        let mouthObj = {
            meshStr: 'sphere',
            positionArr: [0, -0.75, -0.435],
            sizeArr: [0.34, 0.06, 0.02],
            colorArr: mouthArr
        };
        let upperLipObj = {
            meshStr: 'sphere',
            positionArr: [0, -0.76, -0.4],
            sizeArr: [0.42, 0.12, 0.09],
            colorArr: lipArr
        };
        let lowerLipObj = {
            meshStr: 'sphere',
            positionArr: [0, -0.74, -0.47],
            sizeArr: [0.4, 0.12, 0.1],
            colorArr: lipArr
        };
        partArr.push(mouthObj, upperLipObj, lowerLipObj);
        sceneObj.remove(sceneObj.partArr);
        for (let partObj of partArr) {
            partObj.shineFlt = 0.12;
            partObj.basePositionArr = partObj.positionArr;
            partObj.baseSizeArr = partObj.sizeArr;
            sceneObj.add(partObj);
        }
        this.blinkPartArr = blinkPartArr;
        this.mouthObj = mouthObj;
        this.lowerLipObj = lowerLipObj;
        this.lastOpenFlt = -1;
        this.lastBlinkBool = false;
    }

    // Words
    markWord(charInt) {
        let wordSpanArr = this.wordSpanArr;
        let wordStartArr = this.wordStartArr;
        let wordInt = this.wordInt;
        let wordOnCss = this.wordOnCss;
        let wordOffCss = this.wordOffCss;

        let nextInt = 0;
        for (let i = 0; i < wordStartArr.length && wordStartArr[i] <= charInt; i++) {
            nextInt = i;
        }
        if (nextInt === wordInt) {
            return;
        }
        let wordSpan = wordSpanArr[nextInt];
        if (!wordSpan.isConnected) {
            this.stop();
            return;
        }
        if (wordInt >= 0) {
            wordSpanArr[wordInt].css(wordOffCss);
        }
        wordSpan.css(wordOnCss);
        wordSpan.scrollIntoView({ block: 'nearest' });
        this.wordInt = nextInt;
        this.wordMsFlt = performance.now();
    }

    finish() {
        let wordSpanArr = this.wordSpanArr;
        let wordInt = this.wordInt;
        let wordOffCss = this.wordOffCss;

        if (wordInt >= 0) {
            wordSpanArr[wordInt].css(wordOffCss);
        }
        this.wordInt = -1;
        this.chunkObj = null;
        this.silentBool = false;
    }

    stop() {
        this.runInt++;
        speechSynthesis.cancel();
        this.finish();
    }

    readSilently(startInt) {
        let pageObj = this.pageObj;
        let wordStartArr = this.wordStartArr;
        let wordSpanArr = this.wordSpanArr;

        let lastInt = wordSpanArr.length - 1;
        let lastSpan = wordSpanArr[lastInt];
        let lastStr = lastSpan.textContent;
        let endInt = wordStartArr[lastInt] + lastStr.length;
        speechSynthesis.cancel();
        this.silentBool = true;
        this.boundaryBool = false;
        this.chunkObj = { startInt: startInt, endInt: endInt, startMsFlt: performance.now(), rateFlt: this.rateFlt };
        pageObj.toast('No voice on this device: reading along without sound.');
    }

    // Speech
    async speak(readElArr) {
        let pageObj = this.pageObj;

        this.stop();
        this.show();
        let wordSpanArr = [];
        for (let readEl of readElArr) {
            let readWordSpanArr = readEl.wordSpanArr;
            if (!readWordSpanArr) {
                readWordSpanArr = [];
                readEl.wordSpanArr = readWordSpanArr;
                let walker = document.createTreeWalker(readEl, NodeFilter.SHOW_TEXT);
                let textNodeArr = [];
                for (let textNode = walker.nextNode(); textNode; textNode = walker.nextNode()) {
                    textNodeArr.push(textNode);
                }
                for (let textNode of textNodeArr) {
                    let blockEl = textNode.parentElement;
                    for (; blockEl !== readEl; blockEl = blockEl.parentElement) {
                        let displayStr = getComputedStyle(blockEl).display;
                        if (!displayStr.startsWith('inline')) {
                            break;
                        }
                    }
                    let fragment = document.createDocumentFragment();
                    let textStr = textNode.textContent;
                    for (let partStr of textStr.split(/(\s+)/)) {
                        if (Is.blank(partStr)) {
                            fragment.append(partStr);
                            continue;
                        }
                        let wordSpan = pageObj.span({ textContent: partStr });
                        wordSpan.blockEl = blockEl;
                        readWordSpanArr.push(wordSpan);
                        fragment.append(wordSpan);
                    }
                    textNode.replaceWith(fragment);
                }
            }
            for (let wordSpan of readWordSpanArr) {
                wordSpanArr.push(wordSpan);
            }
        }
        if (!wordSpanArr.length) {
            return;
        }

        // Chunks
        let spokenSymbolObj = this.spokenSymbolObj();
        let spokenUnitObj = this.spokenUnitObj();
        let wordStartArr = [];
        let chunkArr = [];
        let chunkObj = null;
        let lastBlockEl = null;
        let emphasisInt = 0;
        let totalInt = 0;
        let pauseNextBool = false;
        for (let i = 0; i < wordSpanArr.length; i++) {
            let wordSpan = wordSpanArr[i];
            let nextSpan = wordSpanArr[i + 1];
            let prevSpan = wordSpanArr[i - 1];
            let wordStr = wordSpan.textContent;
            let nextStr = nextSpan ? nextSpan.textContent : '';
            let prevStr = prevSpan ? prevSpan.textContent : '';
            let blockEl = wordSpan.blockEl;
            if (blockEl !== lastBlockEl) {
                let lastChunkObj = chunkArr[chunkArr.length - 1];
                if (lastChunkObj) {
                    lastChunkObj.pauseMsFlt = 250 + 300 * emphasisInt;
                }
                let tagStr = blockEl.tagName;
                let weightInt = Number(getComputedStyle(blockEl).fontWeight);
                emphasisInt = weightInt >= 600 ? 1 : 0;
                if (/^H[1-6]$/.test(tagStr)) {
                    emphasisInt = Math.max(1, 4 - Number(tagStr[1]));
                }
                chunkObj = null;
                lastBlockEl = blockEl;
            }
            let separatorBool = /^[·•|–—]$/.test(wordStr);
            let spokenStr = separatorBool ? '' : wordStr;
            let unitMatchArr = /^([\d.,]*\d)?(.+?)([.,;:!?)]*)$/.exec(wordStr);
            let numberStr = unitMatchArr[1];
            let unitKeyStr = unitMatchArr[2];
            let unitPairArr = spokenUnitObj[unitKeyStr];
            let countStr = numberStr || prevStr;
            let attachedLetterBool = !Is.blank(numberStr) && unitKeyStr.length < 2;
            if (unitPairArr && !attachedLetterBool && /\d$/.test(countStr)) {
                let oneBool = /(^|[^\d.,])1$/.test(countStr);
                let unitStr = oneBool ? unitPairArr[0] : unitPairArr[1];
                let tailStr = unitMatchArr[3];
                spokenStr = numberStr ? `${numberStr} ${unitStr}${tailStr}` : `${unitStr}${tailStr}`;
            }
            let letterPluralArr = /^([B-HJ-TV-Z]|[A-Z][A-Za-z]*[A-Z])s([.,;:!?)]*)$/.exec(spokenStr);
            if (letterPluralArr) {
                spokenStr = `${letterPluralArr[1]}'s${letterPluralArr[2]}`;
            }
            let pauseBool = false;
            for (let symbolStr in spokenSymbolObj) {
                let sayStr = spokenSymbolObj[symbolStr];
                if (wordStr.includes(symbolStr) && sayStr.endsWith(',')) {
                    pauseBool = true;
                }
                spokenStr = spokenStr.replaceAll(symbolStr, sayStr);
            }
            spokenStr = spokenStr.trim();
            if (/^A[.)]$/.test(spokenStr) || spokenStr === 'A' && /^(is|was|and|or)\b/i.test(nextStr)) {
                spokenStr = 'A,';
            }
            if (chunkObj && (separatorBool || pauseBool || pauseNextBool)) {
                chunkObj.pauseMsFlt = 300;
                chunkObj = null;
            }
            pauseNextBool = pauseBool;
            if (Is.blank(spokenStr)) {
                wordStartArr.push(totalInt);
                continue;
            }
            if (!chunkObj) {
                chunkObj = { startInt: totalInt, textStr: '', emphasisInt: emphasisInt, pauseMsFlt: 0 };
                chunkArr.push(chunkObj);
            }
            wordStartArr.push(totalInt);
            chunkObj.textStr += `${spokenStr} `;
            totalInt += spokenStr.length + 1;
            let chunkStr = chunkObj.textStr;
            if (/[.!?:;]$/.test(wordStr) || chunkStr.length > 180) {
                chunkObj = null;
            }
        }
        this.wordSpanArr = wordSpanArr;
        this.wordStartArr = wordStartArr;
        this.chunkArr = chunkArr;
        this.boundaryBool = false;
        await this.speakChunks();
    }

    spokenUnitObj() {
        return {
            mm: ['millimetre', 'millimetres'],
            cm: ['centimetre', 'centimetres'],
            m: ['metre', 'metres'],
            km: ['kilometre', 'kilometres'],
            'cm²': ['square centimetre', 'square centimetres'],
            'm²': ['square metre', 'square metres'],
            'km²': ['square kilometre', 'square kilometres'],
            'cm³': ['cubic centimetre', 'cubic centimetres'],
            'm³': ['cubic metre', 'cubic metres'],
            mg: ['milligram', 'milligrams'],
            g: ['gram', 'grams'],
            kg: ['kilogram', 'kilograms'],
            ml: ['millilitre', 'millilitres'],
            l: ['litre', 'litres'],
            L: ['litre', 'litres'],
            s: ['second', 'seconds'],
            min: ['minute', 'minutes'],
            h: ['hour', 'hours'],
            'km/h': ['kilometre per hour', 'kilometres per hour'],
            'm/s': ['metre per second', 'metres per second'],
            'm/s²': ['metre per second squared', 'metres per second squared'],
            '°C': ['degree Celsius', 'degrees Celsius'],
            '°F': ['degree Fahrenheit', 'degrees Fahrenheit'],
            W: ['watt', 'watts'],
            kW: ['kilowatt', 'kilowatts'],
            kWh: ['kilowatt hour', 'kilowatt hours'],
            V: ['volt', 'volts'],
            Hz: ['hertz', 'hertz'],
            N: ['newton', 'newtons'],
            J: ['joule', 'joules'],
            kPa: ['kilopascal', 'kilopascals']
        };
    }

    spokenSymbolObj() {
        return {
            '✓': 'right,',
            '✔': 'right,',
            '✗': 'wrong,',
            '✘': 'wrong,',
            '→': ' to ',
            '←': '',
            '○': '',
            '●': '',
            '…': '',
            '²': ' squared',
            '³': ' cubed',
            '⁻¹': ' inverse'
        };
    }

    async speakChunks() {
        let chunkArr = this.chunkArr;
        let runInt = this.runInt;

        let readyBool = await this.prepareVoice();
        let liveRunInt = this.runInt;
        if (runInt !== liveRunInt) {
            return;
        }
        if (!readyBool) {
            this.readSilently(0);
            return;
        }
        for (let chunkObj of chunkArr) {
            let spokenBool = await this.speakChunk(chunkObj);
            liveRunInt = this.runInt;
            if (runInt !== liveRunInt) {
                return;
            }
            if (!spokenBool) {
                this.readSilently(chunkObj.startInt);
                return;
            }
            this.chunkObj = null;
            let rateFlt = this.rateFlt;
            let pauseMsFlt = chunkObj.pauseMsFlt / rateFlt;
            await new Promise((resolve) => setTimeout(resolve, pauseMsFlt));
            liveRunInt = this.runInt;
            if (runInt !== liveRunInt) {
                return;
            }
        }
        this.finish();
    }

    async prepareVoice() {
        let femaleBool = this.femaleBool;

        let voiceArr = speechSynthesis.getVoices();
        if (!voiceArr.length) {
            await new Promise((resolve) => {
                speechSynthesis.addEventListener('voiceschanged', resolve, { once: true });
                setTimeout(resolve, 700);
            });
            voiceArr = speechSynthesis.getVoices();
        }
        if (!voiceArr.length) {
            return false;
        }
        let englishArr = [];
        for (let voiceObj of voiceArr) {
            let langStr = voiceObj.lang;
            if (langStr.startsWith('en')) {
                englishArr.push(voiceObj);
            }
        }
        if (!englishArr.length) {
            englishArr = voiceArr;
        }
        let genderRegex = femaleBool
            ? /female|woman|zira|aria|jenny|samantha|victoria|karen|moira|tessa|fiona|susan|hazel|libby|sonia/i
            : /\bmale|\bman\b|david|mark|guy|daniel|alex|fred|george|ryan|thomas|oliver/i;
        let genderVoiceObj = null;
        for (let voiceObj of englishArr) {
            let nameStr = voiceObj.name;
            if (!genderVoiceObj && genderRegex.test(nameStr)) {
                genderVoiceObj = voiceObj;
            }
        }
        this.pitchFlt = 1;
        if (!genderVoiceObj) {
            genderVoiceObj = englishArr[0];
            this.pitchFlt = femaleBool ? 1.3 : 0.8;
        }
        this.browserVoiceObj = genderVoiceObj;
        return true;
    }

    chunkRate(chunkObj) {
        let rateFlt = this.rateFlt;

        let emphasisInt = chunkObj.emphasisInt;
        return rateFlt * (1 - 0.08 * emphasisInt);
    }

    speakChunk(chunkObj) {
        let browserVoiceObj = this.browserVoiceObj;
        let pitchFlt = this.pitchFlt;
        let volumeFlt = this.volumeFlt;
        let runInt = this.runInt;

        let startInt = chunkObj.startInt;
        let emphasisInt = chunkObj.emphasisInt;
        let utterance = new SpeechSynthesisUtterance(chunkObj.textStr);
        utterance.voice = browserVoiceObj;
        utterance.pitch = pitchFlt * (1 - 0.05 * emphasisInt);
        utterance.volume = volumeFlt;
        utterance.rate = this.chunkRate(chunkObj);
        chunkObj.rateFlt = utterance.rate;
        utterance.onstart = () => {
            let liveRunInt = this.runInt;
            if (runInt !== liveRunInt) {
                return;
            }
            chunkObj.startMsFlt = performance.now();
            this.chunkObj = chunkObj;
            this.markWord(startInt);
        };
        utterance.onboundary = (event) => {
            let liveRunInt = this.runInt;
            let boundaryStr = event.name;
            if (runInt !== liveRunInt || boundaryStr !== 'word') {
                return;
            }
            this.boundaryBool = true;
            this.markWord(startInt + event.charIndex);
        };
        return new Promise((resolve) => {
            utterance.onend = () => resolve(true);
            utterance.onerror = (event) => {
                let errorStr = event.error;
                resolve(errorStr === 'interrupted' || errorStr === 'canceled');
            };
            speechSynthesis.speak(utterance);
        });
    }

    speakBtn(readElArr) {
        let pageObj = this.pageObj;

        let speakBtn = pageObj.a({
            role: 'button',
            tabIndex: 0,
            title: 'Read aloud',
            ariaLabel: 'Read aloud',
            css: pageObj.speakBtnCss(),
            onclick: () => this.speak(readElArr)
        }).add(pageObj.icon('speak'));
        speakBtn.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                speakBtn.click();
            }
        });
        return speakBtn;
    }

    // Animation
    chunkChar(nowFlt) {
        let chunkObj = this.chunkObj;

        let startInt = chunkObj.startInt;
        let startMsFlt = chunkObj.startMsFlt;
        let rateFlt = chunkObj.rateFlt;
        return startInt + (nowFlt - startMsFlt) * 0.015 * rateFlt;
    }

    frame(nowFlt) {
        let sceneObj = this.sceneObj;
        let chunkObj = this.chunkObj;
        let visibleBool = this.visibleBool;
        let boundaryBool = this.boundaryBool;
        let silentBool = this.silentBool;
        let glBool = this.glBool;
        let lastOpenFlt = this.lastOpenFlt;
        let lastBlinkBool = this.lastBlinkBool;

        if (!visibleBool) {
            this.loopBool = false;
            return;
        }
        if (chunkObj && !boundaryBool) {
            let endInt = chunkObj.endInt;
            let charInt = this.chunkChar(nowFlt);
            if (silentBool && charInt >= endInt) {
                this.finish();
            } else {
                this.markWord(charInt);
            }
        }
        let liveChunkObj = this.chunkObj;
        let wordMsFlt = this.wordMsFlt;
        let speakingBool = !Is.blank(liveChunkObj);
        let wordSecondsFlt = (nowFlt - wordMsFlt) / 1000;
        let openFlt = speakingBool ? Math.round((0.5 - 0.5 * Math.cos(wordSecondsFlt * Math.PI * 8)) * 10) / 10 : 0;
        let blinkBool = nowFlt % 4200 < 130;
        if (glBool && openFlt !== lastOpenFlt) {
            let mouthObj = this.mouthObj;
            let lowerLipObj = this.lowerLipObj;
            let mouthPositionArr = mouthObj.basePositionArr;
            let mouthSizeArr = mouthObj.baseSizeArr;
            let lipPositionArr = lowerLipObj.basePositionArr;
            mouthObj.positionArr = [mouthPositionArr[0], mouthPositionArr[1], mouthPositionArr[2] - openFlt * 0.05];
            mouthObj.sizeArr = [mouthSizeArr[0], mouthSizeArr[1], mouthSizeArr[2] + openFlt * 0.12];
            lowerLipObj.positionArr = [lipPositionArr[0], lipPositionArr[1], lipPositionArr[2] - openFlt * 0.1];
            sceneObj.place(mouthObj);
            sceneObj.place(lowerLipObj);
            this.lastOpenFlt = openFlt;
        }
        if (glBool && blinkBool !== lastBlinkBool) {
            for (let partObj of this.blinkPartArr) {
                let sizeArr = partObj.baseSizeArr;
                partObj.sizeArr = [sizeArr[0], sizeArr[1], sizeArr[2] * (blinkBool ? 0.1 : 1)];
                sceneObj.place(partObj);
            }
            this.lastBlinkBool = blinkBool;
        }
        requestAnimationFrame(this.frameFn);
    }

    show() {
        let panelEl = this.panelEl;
        let visibleBool = this.visibleBool;
        let loopBool = this.loopBool;

        if (visibleBool) {
            return;
        }
        this.visibleBool = true;
        panelEl.css({ transform: 'scale(0.2)', opacity: 0 }).show();
        this.onShowFn();
        requestAnimationFrame(() => requestAnimationFrame(() => panelEl.css({ transform: 'scale(1)', opacity: 1 })));
        if (!loopBool) {
            this.loopBool = true;
            requestAnimationFrame(this.frameFn);
        }
    }

    hide() {
        let panelEl = this.panelEl;

        this.stop();
        this.visibleBool = false;
        panelEl.hide();
        this.onShowFn();
    }
}
