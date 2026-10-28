class Container extends Page {
    configurePage(obj) {
        super.configurePage(obj);
        this.containerEl = this.div({ css: { width: '100%', padding: '0 15px', margin: '0 auto' } });
        document.body.appendChild(this.containerEl);
        this.headEl = document.head;
        Core.objCopy({}, this.headEl);
        this.motionBool = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    popup(obj, widthStr = '500px', css = {}) {
        this.popupArr ??= [];
        let popupDiv = this.div({
            role: 'dialog',
            ariaModal: 'true',
            css: {
                position: 'fixed',
                inset: 0,
                zIndex: 1000 + this.popupArr.length,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                boxSizing: 'border-box',
                backdropFilter: 'blur(3px)'
            }
        });
        let popupBodyEl = this.div({
            css: {
                ...this.panelBaseCss(),
                padding: '10px',
                width: widthStr,
                maxWidth: '100%',
                maxHeight: '100%',
                overflowY: 'auto',
                boxSizing: 'border-box',
                textAlign: 'center',
                fontSize: '14px',
                backgroundColor: this.color0,
                ...css
            }
        });
        popupDiv.glow = (colorStr, swirlBool = false) => {
            let nearStr = `color-mix(in srgb, ${colorStr} 70%, transparent)`;
            let tintStr = `color-mix(in srgb, ${colorStr} 16%, transparent)`;
            Core.copyCss({ borderColor: nearStr }, popupBodyEl);
            Core.copyCss({ background: `radial-gradient(circle, ${tintStr}, rgba(0, 0, 0, 0.6) 70%)` }, popupDiv);
            this.glowEl(popupBodyEl, colorStr, swirlBool);
            return popupDiv;
        };
        popupDiv.good = () => popupDiv.glow(this.goodGlowColor);
        popupDiv.bad = () => popupDiv.glow(this.badGlowColor);
        popupDiv.info = () => popupDiv.glow(this.infoGlowColor, true);
        let defaultBtnFn = () => popupDiv.querySelector('[data-default]') ?? popupDiv.querySelector('button');
        let keyFn = (event) => {
            let popupKeyBool = ['Escape', 'Enter', 'Tab'].includes(event.key);
            if (this.popupArr.at(-1) !== popupDiv || !popupKeyBool || event.defaultPrevented) {
                return;
            }
            let targetEl = event.target;
            if (event.key === 'Tab') {
                let focusStr = 'a[tabindex="0"], a[href], button, input, select, textarea';
                let focusArr = [...popupBodyEl.querySelectorAll(focusStr)]
                    .filter((element) => !element.disabled && element.offsetParent !== null);
                let edgeEl = event.shiftKey ? focusArr[0] : focusArr.at(-1);
                if (!popupDiv.contains(targetEl) || targetEl === edgeEl || targetEl === popupBodyEl) {
                    event.preventDefault();
                    (event.shiftKey ? focusArr.at(-1) : focusArr[0])?.focus();
                }
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                popupDiv.remove();
                return;
            }
            if (!popupDiv.contains(targetEl)) {
                event.preventDefault();
                defaultBtnFn()?.click();
                return;
            }
            if (targetEl.matches('textarea') && !(event.ctrlKey || event.metaKey)) {
                return;
            }
            event.preventDefault();
            (targetEl.matches('a, button') ? targetEl : defaultBtnFn())?.click();
        };
        popupDiv.remove = () => {
            document.removeEventListener('keydown', keyFn);
            this.popupArr = this.popupArr.filter((eachDiv) => eachDiv !== popupDiv);
            HTMLElement.prototype.remove.call(popupDiv);
        };
        document.addEventListener('keydown', keyFn);
        popupDiv.addEventListener('keypress', (event) => event.stopPropagation());
        this.popupArr.push(popupDiv);
        document.body.appendChild(popupDiv.add(popupBodyEl.add(obj)));
        popupDiv.glow(this.glowColor);
        if (this.motionBool) {
            popupBodyEl.animate([
                { opacity: 0, transform: 'translateY(10px) scale(0.92)' },
                { opacity: 1, transform: 'none' }
            ], { duration: 260, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.25)' });
            popupDiv.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180 });
        }
        popupBodyEl.tabIndex = -1;
        popupDiv.querySelectorAll('a:not([href])').forEach((a) => a.tabIndex = 0);
        (
            popupDiv.querySelector('input:not([type=hidden]):not([type=file]), textarea, select')
            ?? defaultBtnFn()
            ?? popupBodyEl
        ).focus({ preventScroll: true });
        return popupDiv;
    }

    markdownPopup(fileStr, headCss = {}, paraCss = {}) {
        let closeBtn = this.button({ html: 'Close', onclick: () => popup.remove() });
        closeBtn.dataset.default = 'true';
        let paraArr = Core.fileContents(fileStr).trim().split(/\n\s*\n/);
        let titleStr = paraArr.shift();
        let bodyEl = this.div({ css: { textAlign: 'left', padding: '12px 10px' } })
            .add(this.h2({ textContent: titleStr.replace(/^# /, ''), css: headCss }));
        paraArr.forEach((paraStr) => bodyEl.add(this.p({ css: paraCss }).add(this.markdown(paraStr))));
        let popup = this.popup(bodyEl.add(closeBtn), 'min(620px, 94vw)', { padding: '18px', borderRadius: '14px' })
            .info();
        return popup;
    }

    glowEl(el, colorStr, swirlBool = false) {
        let nearStr = `color-mix(in srgb, ${colorStr} 70%, transparent)`;
        let farStr = `color-mix(in srgb, ${colorStr} 30%, transparent)`;
        let pulseArr = [
            { boxShadow: `0 0 14px 1px ${nearStr}, 0 0 48px 6px ${farStr}` },
            { boxShadow: `0 0 22px 3px ${nearStr}, 0 0 80px 14px ${farStr}` }
        ];
        let swirlArr = [...Array(13).keys()].map((stepInt) => {
            let angleFlt = stepInt * Math.PI / 6;
            let xInt = Math.round(Math.cos(angleFlt) * 12);
            let yInt = Math.round(Math.sin(angleFlt) * 12);
            return {
                boxShadow: `0 0 12px 1px ${nearStr}, ${xInt}px ${yInt}px 26px 2px ${nearStr},
                ${-2 * xInt}px ${-2 * yInt}px 70px 10px ${farStr}`
            };
        });
        let iterationsInt = this.motionBool ? Infinity : 1;
        let pulseTimingObj = {
            duration: 1600,
            iterations: iterationsInt,
            direction: 'alternate',
            easing: 'ease-in-out',
            fill: 'forwards'
        };
        let swirlTimingObj = { duration: 2400, iterations: iterationsInt, fill: 'forwards' };
        let frameArr = pulseArr;
        let timingObj = pulseTimingObj;
        if (swirlBool) {
            frameArr = swirlArr;
            timingObj = swirlTimingObj;
        }
        el.glowAnimation?.cancel();
        el.glowAnimation = el.animate(frameArr, timingObj);
    }

    confirmBtn(obj) {
        this.pCss = { backgroundColor: this.color4, color: this.color1, height: '50px' };
        obj.css = Core.objCopy(obj.css, this.pCss);
        let button = this.button(obj);
        button.dataset.default = 'true';
        button.addEventListener('mouseenter', () => this.glowEl(button, this.glowColor));
        button.addEventListener('mouseleave', () => button.glowAnimation?.cancel());
        return button;
    }

    rowElement() {
        return this.containerEl;
    }
}
