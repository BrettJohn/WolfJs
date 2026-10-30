Container.prototype.choice = function(optionMatrix, valueStr = '') {
    let cardCss = this.choiceCss();
    let dotCss = this.choiceDotCss();

    let chosenCardCss = { ...cardCss, ...this.choiceOnCss() };
    let chosenDotCss = { ...dotCss, ...this.choiceDotOnCss() };
    let choiceEl = this.div({ role: 'radiogroup', css: this.choiceListCss() });
    let cardArr = choiceEl.cardArr = [];
    choiceEl.glowColor = '';
    choiceEl.chosenStr = '';
    Object.defineProperty(choiceEl, 'value', {
        get: () => choiceEl.chosenStr,
        set: (chosenStr) => choiceEl.onChoose(chosenStr)
    });
    choiceEl.pick = (pickedStr) => {
        let glowColor = choiceEl.glowColor;

        choiceEl.chosenStr = pickedStr;
        for (let cardEl of cardArr) {
            let dotEl = cardEl.dotEl;
            let chosenBool = cardEl.valueStr === pickedStr;
            cardEl.ariaChecked = String(chosenBool);
            cardEl.css(chosenBool ? chosenCardCss : cardCss);
            dotEl.css(chosenBool ? chosenDotCss : dotCss);
            if (chosenBool && !Is.blank(glowColor)) {
                this.glowEl(cardEl, glowColor);
            } else {
                cardEl.glowAnimation?.cancel();
            }
        }
    };
    choiceEl.onChoose = (chosenStr) => choiceEl.pick(chosenStr);
    choiceEl.glowing = (colorStr) => {
        choiceEl.glowColor = colorStr;
        return choiceEl;
    };
    choiceEl.lettered = () => {
        for (let cardEl of cardArr) {
            let dotEl = cardEl.dotEl;
            let letterStr = cardEl.valueStr;
            dotEl.after(this.span({ textContent: `${letterStr}.`, css: { fontWeight: 700 } }));
        }
        return choiceEl;
    };
    for (let [optionStr, textStr] of optionMatrix) {
        let dotEl = this.span({ css: dotCss });
        let cardEl = this.a({ role: 'radio', tabIndex: 0, css: cardCss })
            .add(dotEl)
            .add(this.span({ textContent: textStr }));
        cardEl.valueStr = optionStr;
        cardEl.dotEl = dotEl;
        cardEl.onclick = () => choiceEl.onChoose(optionStr);
        cardEl.addEventListener('keydown', (event) => {
            if (['Enter', ' '].includes(event.key)) {
                event.preventDefault();
                choiceEl.onChoose(optionStr);
            }
        });
        cardArr.push(cardEl);
        choiceEl.add(cardEl);
    }
    choiceEl.pick(valueStr);
    return choiceEl;
};
