class Page extends Element {
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
        this.headEl.appendChild(this.link(
            { href: 'https://fonts.googleapis.com/css?family=Jaldi', rel: 'stylesheet' }
        ));
        this.body({ css: { ...this.fontCss, ...this.backCss }});
        window.onresize = function(event) { }; // TODO
    }

    async loadPage() {}

    loadApp() { alert('TODO'); }

    addCssObj(selectorObj) {
        let ruleFn = (css) => Object.entries(css)
            .map(([keyStr, value]) => `${keyStr.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${value};`).join(' ');
        this.addCss(Object.entries(selectorObj).map(([selectorStr, css]) => `${selectorStr} { ${ruleFn(css)} }`)
            .join('\n'));
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
            'pre, code': { fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                fontSize: '1em' },
            pre: { overflow: 'auto' },
            img: { verticalAlign: 'middle', borderStyle: 'none' },
            table: { borderCollapse: 'collapse' },
            th: { textAlign: 'inherit' },
            label: { display: 'inline-block', marginBottom: '.5rem' },
            'input, button, select, optgroup, textarea': { margin: 0, fontFamily: 'inherit', fontSize: 'inherit',
                lineHeight: 'inherit' },
            'button, input': { overflow: 'visible' },
            'button:not(:disabled)': { cursor: 'pointer' },
            textarea: { overflow: 'auto', resize: 'vertical' },
            hr: { boxSizing: 'content-box', height: 0, marginTop: '1rem', marginBottom: '1rem', border: 0,
                borderTop: '1px solid rgba(0, 0, 0, .1)' },
            '[hidden]': { display: 'none !important' }
        };
    }

    toast(messageStr) {
        if (!this.toastDiv) {
            this.toastDiv = this.div({ role: 'status', css: { position: 'fixed', left: '50%', bottom: '18px',
                transform: 'translate(-50%, 20px)', opacity: 0, pointerEvents: 'none', zIndex: 3000,
                backgroundColor: this.color1, color: this.color0, padding: '8px 14px', borderRadius: '8px',
                fontSize: '14px', transition: 'opacity .2s, transform .2s' } });
            document.body.add(this.toastDiv);
        }
        this.toastDiv.textContent = messageStr;
        Core.copyCss({ opacity: 1, transform: 'translate(-50%, 0)' }, this.toastDiv);
        clearTimeout(this.toastTimerInt);
        this.toastTimerInt = setTimeout(() => Core.copyCss({ opacity: 0, transform: 'translate(-50%, 20px)' },
            this.toastDiv), 3200);
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

    async checkUser() {
        window.Username = '';
        let resultObj = await backEnd({ Operation: 'getUsername' });
        let usernameStr = resultObj.Username;
        if (this.usernameValidation(usernameStr) !== '') {
            Core.goto('Login.php');
        } else {
            window.Username = usernameStr;
            let resultObj = await backEnd({ Operation: 'validateAccount' });
            if (resultObj.validateResult === 'Success') {
                this.userRoleStr = resultObj.userRole;
                this.coreRoleStr = resultObj.coreRole;
                this.vettedBool = resultObj.vettedBool;
                this.ownerObj = resultObj.owner;
            } else if (resultObj.validateResult === 'Pending') {
                this.showPending();

                await new Promise(() => {});
            } else {
                Core.goto('Login.php');
            }
        }
    }

    showPending() {
        document.body.innerHTML = '';
        let textCss = { fontSize: '20px', margin: '0 0 12px 0' };
        let logoutBtn = this.a({ html: 'Log out', css: { fontSize: '18px' }, onclick: async () => {
            await backEnd({ Operation: 'logoutAccount' });
            Core.goto('Login.php');
        } });
        let panel = this.div({ css: { ...this.panelBaseCss(), maxWidth: '560px', margin: '0 auto',
            padding: '40px 30px' } })
            .add(this.h1({ html: 'Waiting for approval' }))
            .add(this.p({ textContent: `Your ${document.appName} membership is waiting for an admin to approve it.`,
                css: textCss }))
            .add(this.p({ textContent: 'Your username is', css: { ...textCss, margin: '24px 0 4px 0' } }))
            .add(this.p({ textContent: window.Username,
                css: { fontSize: '32px', fontWeight: 'bold', letterSpacing: '2px', margin: '0 0 28px 0' } }))
            .add(logoutBtn)
            .add(this.p({ css: { margin: '28px 0 0 0' } }).add(this.a({ html: 'Delete my account',
                css: { fontSize: '14px', color: this.color13 }, onclick: () => this.askDeleteAccount() })));
        document.body.appendChild(this.div({ css: { ...this.centerTextCss, color: this.color1, padding: '12% 16px' } })
            .add(panel));
    }

    async checkAdmin() {
       await this.checkUser();
        if (!this.isAdmin()) {
            Core.goto('Index.php');
        }
    }
    isAdmin() {
        let adminBool = ['Admin', 'Owner'].includes(this.userRoleStr) && this.vettedBool;
        return adminBool || this.isCoreAdmin();
    }
    isAppOwner() {
        return this.userRoleStr === 'Owner' && this.vettedBool;
    }
    isCoreAdmin() {
        return this.coreRoleStr === 'Admin' && this.vettedBool;
    }
    isOwner() {
        return Boolean(this.ownerObj?.OwnerBool);
    }

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
            textAlign: widthInt >= this.breakpointObj.md ? 'right' : 'left' }));
    }

    infoRow(html, infoEl, rowEl = null) {
        let nameObj = { html, css: { ...this.inputLabelCss, paddingRight: '15px' } };
        (rowEl ?? this.rowElement()).add(this.row({ css: { paddingBottom: '20px' } })
            .add(this.labelCol(nameObj)).add(this.col9().add(infoEl)));
        return infoEl;
    }
}
