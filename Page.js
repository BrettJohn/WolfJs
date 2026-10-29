class Page extends WolfElement {
    arrowPager(pagerEl, stepFn, defaultBool = false) {
        let pagerObj = { pagerEl, stepFn };
        if (defaultBool) {
            this.defaultPagerObj = pagerObj;
        }
        pagerEl.addEventListener('mouseenter', () => this.hoverPagerObj = pagerObj);
        pagerEl.addEventListener('mouseleave', () => this.hoverPagerObj = null);
        if (this.pagerKeyBool) {
            return;
        }
        this.pagerKeyBool = true;
        document.addEventListener('keydown', (event) => {
            let stepInt = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
            let activeObj = this.hoverPagerObj ?? this.defaultPagerObj;
            let activeEl = activeObj?.pagerEl;
            let typingBool = document.activeElement?.matches('input, textarea, select');
            if (!stepInt || !activeEl?.checkVisibility() || typingBool || this.popupArr?.length) {
                return;
            }
            event.preventDefault();
            activeObj.stepFn(stepInt);
        });
    }

    configurePage(obj) {
        super.configurePage(obj);
        document.title = obj.title;
        this.headEl = document.head;
        this.headEl.appendChild(this.link({ href: this.titleImgPathStr, rel: 'icon' }));
        this.addCssObj(this.rebootCssObj());
        this.addCssObj(this.scrollbarCssObj());
        this.headEl.appendChild(
            this.link({ href: 'https://fonts.googleapis.com/css?family=Jaldi', rel: 'stylesheet' })
        );
        this.body({ css: { ...this.fontCss, ...this.backCss }});
        window.onresize = function(event) { }; // TODO
    }

    async loadPage() {}

    loadApp() { alert('TODO'); }

    addCssObj(selectorObj) {
        let ruleArr = [];
        for (let selectorStr in selectorObj) {
            let ruleCss = selectorObj[selectorStr];
            let declarationArr = [];
            for (let keyStr in ruleCss) {
                let propertyStr = keyStr.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
                declarationArr.push(`${propertyStr}: ${ruleCss[keyStr]};`);
            }
            ruleArr.push(`${selectorStr} { ${declarationArr.join(' ')} }`);
        }
        this.addCss(ruleArr.join('\n'));
    }

    scrollbarCssObj() {
        let thumbStr = this.scrollThumbColor;
        return {
            '*': { scrollbarWidth: 'thin', scrollbarColor: `${thumbStr} transparent` },
            '::-webkit-scrollbar': { width: '8px', height: '8px' },
            '::-webkit-scrollbar-track': { background: 'transparent' },
            '::-webkit-scrollbar-thumb': { background: thumbStr, borderRadius: '8px' }
        };
    }

    // Credit: a subset of Bootstrap 4's Reboot and type scale (https://getbootstrap.com), by Mark Otto, Jacob Thornton
    // and the Bootstrap contributors, MIT licence; Reboot builds on normalize.css
    // (https://necolas.github.io/normalize.css), MIT licence.
    rebootCssObj() {
        let headingCss = { marginTop: 0, marginBottom: '.5rem', fontWeight: 500, lineHeight: 1.2 };
        return {
            '*, *::before, *::after': { boxSizing: 'border-box' },
            html: { lineHeight: 1.15, webkitTextSizeAdjust: '100%' },
            body: { margin: 0, fontWeight: 400, lineHeight: 1.5, textAlign: 'left' },
            'h1, h2, h3, h4, h5, h6': headingCss,
            h1: { fontSize: '2.5rem' }, h2: { fontSize: '2rem' }, h3: { fontSize: '1.75rem' },
            h4: { fontSize: '1.5rem' }, h5: { fontSize: '1.25rem' }, h6: { fontSize: '1rem' },
            'p, ul, ol, dl, pre': { marginTop: 0, marginBottom: '1rem' },
            'b, strong': { fontWeight: 'bolder' },
            small: { fontSize: '80%' },
            a: { textDecoration: 'none', backgroundColor: 'transparent' },
            'a:hover': { textDecoration: 'underline' },
            'pre, code': {
                fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                fontSize: '1em'
            },
            pre: { overflow: 'auto' },
            img: { verticalAlign: 'middle', borderStyle: 'none' },
            table: { borderCollapse: 'collapse' },
            th: { textAlign: 'inherit' },
            label: { display: 'inline-block', marginBottom: '.5rem' },
            'input, button, select, optgroup, textarea': {
                margin: 0,
                fontFamily: 'inherit',
                fontSize: 'inherit',
                lineHeight: 'inherit'
            },
            'button, input': { overflow: 'visible' },
            'button:not(:disabled)': { cursor: 'pointer' },
            textarea: { overflow: 'auto', resize: 'vertical' },
            hr: {
                boxSizing: 'content-box',
                height: 0,
                marginTop: '1rem',
                marginBottom: '1rem',
                border: 0,
                borderTop: '1px solid rgba(0, 0, 0, .1)'
            },
            '[hidden]': { display: 'none !important' }
        };
    }

    toast(messageStr) {
        if (!this.toastDiv) {
            this.toastDiv = this.div({
                role: 'status',
                css: {
                    position: 'fixed',
                    left: '50%',
                    bottom: '18px',
                    transform: 'translate(-50%, 20px)',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: 3000,
                    backgroundColor: this.color1,
                    color: this.color0,
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'opacity .2s, transform .2s'
                }
            });
            document.body.add(this.toastDiv);
        }
        this.toastDiv.textContent = messageStr;
        this.toastDiv.css({ opacity: 1, transform: 'translate(-50%, 0)' });
        clearTimeout(this.toastTimerInt);
        this.toastTimerInt = setTimeout(
            () => this.toastDiv.css({ opacity: 0, transform: 'translate(-50%, 20px)' }),
            3200
        );
    }

    download(fileNameStr, textStr, typeStr = 'text/plain') {
        let urlStr = URL.createObjectURL(new Blob([textStr], { type: typeStr }));
        let a = this.a({ href: urlStr, download: fileNameStr });
        document.body.add(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(urlStr), 1000);
    }

    script(obj) {
        let script = this.build('script');
        Core.objCopy(obj, script);
        script.type = 'text/javascript';
        return script;
    }

    passwordValidation(passwordStr, confirmPasswordStr) {
        this.passwordInput.classList.remove('error');
        this.confirmPasswordInput.classList.remove('error');
        let p = '';
        if (!Is.checkPassword(passwordStr)) {
            p += 'Invalid password (at least 8 characters)<br>';
            this.passwordInput.classList.add('error');
            this.confirmPasswordInput.classList.add('error');
        } else if (passwordStr !== confirmPasswordStr) {
            p += 'Passwords do not match<br>';
            this.confirmPasswordInput.classList.add('error');
        }
        return p;
    }

    usernameValidation(usernameStr) {
        let p = '';
        if (!Is.alphabetsDigits(usernameStr)) {
            p = 'Invalid username<br>';
        }
        return p;
    }

    async checkUser() {}

    rowElement() {}

    inputRow(html, inputEl, rowEl = null) {
        let rowObj = { css: { paddingBottom: '20px' } };
        let nameObj = { html, css: { ...this.inputLabelCss, paddingRight: '15px' } };
        if (!rowEl) {
            rowEl = this.rowElement()
        }
        rowEl.add(
            this.row(rowObj).
            add(this.labelCol(nameObj)).add(this.col8().add(inputEl))
        );
        return inputEl;
    }

    labelCol(obj) {
        return this.responsive(this.col4(obj), (widthInt) => ({
            textAlign: widthInt >= this.breakpointObj.md ? 'right' : 'left'
        }));
    }

    infoRow(html, infoEl, rowEl = null) {
        let nameObj = { html, css: { ...this.inputLabelCss, paddingRight: '15px' } };
        (rowEl ?? this.rowElement()).add(this.row({ css: { paddingBottom: '20px' } })
            .add(this.labelCol(nameObj)).add(this.col9().add(infoEl))
        );
        return infoEl;
    }
}
