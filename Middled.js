class Middled extends Container {
    configurePage(obj) {
        super.configurePage(obj);
        this.inputLabelCss = { padding: '1px 5px 3px 3px', color: this.color1 };
        this.mainLinkRowCss = { marginBottom: '20px', paddingTop: '10px' };
        this.topRow = this.row({ css: { height: '24px' }});
        this.containerEl.add(this.topRow);
        let middledCss =  { ...this.panelBaseCss(), margin: '0 0 0 0', padding: '4%', maxWidth: '700px' };
        this.middledCol = this.col12({ css: middledCss });
        this.containerEl.add(this.centeredRow().add(this.middledCol));
        this.addEnterKey(() => this.complete());
        document.addEventListener('keydown', (event) => {
            let dropdownOpenBool = typeof openDropdownArr !== 'undefined' && openDropdownArr.length;
            if (event.key === 'Escape' && !event.defaultPrevented && !this.popupArr?.length && !dropdownOpenBool) {
                Core.goto(this.doneUrl?.() ?? 'Index.php');
            }
        });
    }

    cornerBackLink(hrefStr, titleStr) {
        let backLink = this.a({
            html: '\u2190',
            href: hrefStr,
            title: titleStr,
            ariaLabel: titleStr,
            css: {
                ...this.backArrowCss(),
                position: 'absolute',
                top: '12px',
                left: '12px',
                width: '36px',
                height: '36px',
                fontSize: '22px'
            },
            hover: this.backArrowHoverCss()
        });
        backLink.dataset.back = 'true';
        let middledCol = this.middledCol;
        Core.copyCss({ position: 'relative' }, middledCol);
        middledCol.add(backLink);
    }

    rowElement() {
        return this.middledCol;
    }

    btnRow(elArr, css = {}) {
        let midCol = this.col6();
        elArr.forEach((el) => midCol.add(el));
        return this.row({ css }).add(this.col3()).add(midCol).add(this.col3());
    }

    backToAppRow() {
        let a = this.a({ href: 'Index.php', html: 'Back To App' });
        a.dataset.back = 'true';
        return this.centeredRow().add(a);
    }
}
