Page.prototype.dockPanel = function(obj) {
    let panelObj = { titleStr: obj.titleStr, openBool: false };
    let openKeyStr = `Open ${location.pathname} ${panelObj.titleStr}`;
    panelObj.titleBtn = this.a({
        onclick: () => panelObj.setOpen(!panelObj.openBool),
        css: {
            display: 'block',
            fontSize: '13px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: this.color2,
            cursor: 'pointer',
            userSelect: 'none',
            textDecoration: 'none',
            ...obj.titleCss
        }
    });
    panelObj.summaryEl = this.div({
        css: {
            fontSize: '13px',
            opacity: 0.8,
            marginTop: '6px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            paddingRight: obj.hintStr ? '216px' : 0
        }
    });
    panelObj.bodyDiv = this.div({ css: { maxHeight: obj.heightStr ?? '70vh', overflowY: 'auto', marginTop: '10px' } });
    panelObj.cornerLbl = this.span({
        css: {
            position: 'absolute',
            top: '12px',
            right: '16px',
            maxWidth: '200px',
            textAlign: 'right',
            fontSize: '11px',
            lineHeight: 1.35,
            opacity: 0.6
        }
    });
    panelObj.div = this.div({
        css: {
            ...this.panelBaseCss(),
            position: 'relative',
            padding: '12px 16px',
            flex: 1,
            minWidth: 0,
            textAlign: 'left',
            backgroundColor: 'rgba(8, 10, 14, 0.95)',
            backdropFilter: 'blur(8px)',
            ...obj.css
        }
    })
        .add(panelObj.titleBtn).add(panelObj.cornerLbl).add(panelObj.summaryEl).add(panelObj.bodyDiv);
    panelObj.setOpen = (openBool) => {
        panelObj.openBool = openBool;
        sessionStorage.setItem(openKeyStr, openBool ? '1' : '0');
        panelObj.titleBtn.textContent = `${openBool ? '▾' : '▸'} ${panelObj.titleStr}`;
        panelObj.bodyDiv.style.display = openBool ? 'block' : 'none';
        panelObj.summaryEl.style.display = openBool && !obj.summaryOpenBool ? 'none' : 'block';
        if (obj.hintStr) {
            panelObj.cornerLbl.textContent = openBool ? '' : obj.hintStr;
        }
    };
    let storedStr = sessionStorage.getItem(openKeyStr);
    panelObj.setOpen(storedStr ? storedStr === '1' : Boolean(obj.openBool));
    return panelObj;
};

Page.prototype.sideNav = function(obj = {}) {
    let widthInt = obj.widthInt ?? 240;
    let railInt = 46;
    let navObj = { titleStr: obj.titleStr ?? 'Menu', openBool: false };
    let openKeyStr = `Open ${location.pathname} ${navObj.titleStr}`;
    navObj.toggleBtn = this.a({
        onclick: () => navObj.setOpen(!navObj.openBool),
        css: {
            display: 'block',
            fontSize: '22px',
            color: this.color2,
            cursor: 'pointer',
            textDecoration: 'none',
            userSelect: 'none'
        }
    });
    navObj.titleLbl = this.span({
        textContent: navObj.titleStr,
        css: { flex: 1, fontSize: '24px', fontWeight: 700, color: this.color2 }
    });
    navObj.railLbl = this.span({
        textContent: navObj.titleStr,
        onclick: () => navObj.setOpen(true),
        css: {
            display: 'block',
            writingMode: 'vertical-rl',
            fontSize: '12px',
            letterSpacing: '2px',
            marginTop: '12px',
            textTransform: 'uppercase',
            color: this.color2,
            cursor: 'pointer'
        }
    });
    navObj.backBtn = this.a({
        html: '\u2190',
        href: obj.backHrefStr ?? 'Index.php',
        title: 'Back to app',
        css: { ...this.backArrowCss(), display: obj.backHrefStr ? 'inline-flex' : 'none' },
        hover: this.backArrowHoverCss()
    });
    navObj.bodyDiv = this.div({ css: { marginTop: '10px' } });
    navObj.headDiv = this.div({ css: { display: 'flex', alignItems: 'center', gap: '6px' } })
        .add(navObj.backBtn).add(navObj.titleLbl).add(navObj.toggleBtn);
    navObj.div = this.div({
        css: {
            ...this.panelBaseCss(),
            position: 'fixed',
            top: obj.topStr ?? '58px',
            left: '16px',
            bottom: '14px',
            boxSizing: 'border-box',
            padding: '10px 12px',
            overflowY: 'auto',
            zIndex: 25,
            textAlign: 'left',
            backgroundColor: 'rgba(8, 10, 14, 0.96)',
            backdropFilter: 'blur(8px)',
            ...obj.css
        }
    })
        .add(navObj.headDiv).add(navObj.railLbl).add(navObj.bodyDiv);
    navObj.setOpen = (openBool) => {
        navObj.openBool = openBool;
        sessionStorage.setItem(openKeyStr, openBool ? '1' : '0');
        this.sideNavWidthInt = openBool ? widthInt : railInt;
        navObj.div.style.width = `${this.sideNavWidthInt}px`;
        Core.copyCss({ paddingLeft: `${this.sideNavWidthInt + 28}px` }, this.containerEl);
        if (this.dockDiv) {
            this.dockDiv.style.left = `${this.sideNavWidthInt + 28}px`;
        }
        navObj.toggleBtn.textContent = openBool ? '\u2715' : '\u2630';
        navObj.titleLbl.style.display = openBool ? 'block' : 'none';
        navObj.headDiv.style.flexDirection = openBool ? 'row' : 'column';
        Core.copyCss(
            openBool ? { fontSize: '28px', width: '42px', height: '36px', padding: '0 0 4px 0' }
                : { fontSize: '20px', width: '28px', height: '28px', padding: '0 0 3px 0' },
            navObj.backBtn
        );
        navObj.railLbl.style.display = openBool ? 'none' : 'block';
        navObj.bodyDiv.style.display = openBool ? 'block' : 'none';
        obj.onToggleFn?.(openBool);
    };
    this.containerEl.add(navObj.div);
    let storedStr = sessionStorage.getItem(openKeyStr);
    navObj.setOpen(storedStr ? storedStr === '1' : Boolean(obj.openBool));
    return navObj;
};

Page.prototype.dock = function(panelArr, css = {}) {
    let leftStr = `${this.sideNavWidthInt ? this.sideNavWidthInt + 28 : 16}px`;
    this.dockDiv = this.div({
        css: {
            position: 'fixed',
            left: leftStr,
            right: '16px',
            bottom: '14px',
            zIndex: 20,
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            ...css
        }
    });
    panelArr.forEach((panelObj) => this.dockDiv.add(panelObj.div));
    return this.dockDiv;
};
