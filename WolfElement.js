class WolfElement extends Theme {
    headEl;
    colSize;

    configurePage(obj) {
        this.configureTheme();
        Core.objCopy(obj, this);
        this.controlArr = [];
        this.breakpointObj = { sm: 576, md: 768, lg: 992, xl: 1200 };
        this.responsiveMatrix = [];
        window.addEventListener('resize', () => {
            let connectedMatrix = [];
            for (let responsiveArr of this.responsiveMatrix) {
                if (responsiveArr[0].isConnected) {
                    connectedMatrix.push(responsiveArr);
                }
            }
            this.responsiveMatrix = connectedMatrix;
            for (let responsiveArr of connectedMatrix) {
                let eachEl = responsiveArr[0];
                let eachFn = responsiveArr[1];
                eachEl.css(eachFn(window.innerWidth));
            }
        });
        this.imageUploadCountInt = 0;
        this.centerTextCss = { textAlign: 'center' };
        this.fullWidthCss = { width: '100%' };
        this.centerFullCss = { ...this.centerTextCss, ...this.fullWidthCss };
        this.ellipsesCss = {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        }
    }

    addEnterKey(fn, element = null) {
        if (element === null) {
            element = document;
        }
        element.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                fn();
            }
        });
    }

    backArrowCss() {
        return {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            flexShrink: 0,
            lineHeight: 1,
            borderRadius: '8px',
            color: this.color2,
            textDecoration: 'none',
            transition: 'transform .15s, background-color .15s, color .15s'
        };
    }

    backArrowHoverCss() {
        return {
            backgroundColor: `color-mix(in srgb, ${this.color2} 18%, transparent)`,
            color: this.color1,
            transform: 'translateX(-3px)'
        };
    }

    panelBaseCss() {
        return {
            color: this.color1,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '6px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            ...this.panelCss
        };
    }

    addCss(cssStr) {
        this.headEl.appendChild(this.style().add(document.createTextNode(cssStr)));
    }
    build(tagStr) {
        return ['svg', 'path', 'text'].includes(tagStr)
            ? document.createElementNS('http://www.w3.org/2000/svg', tagStr) : document.createElement(tagStr);
    }

    core(obj, tagStr) {
        let el = this.build(tagStr);
        if (obj.lift) {
            obj = { ...obj, css: { ...this.liftCss, ...obj.css }, hover: { ...this.liftHoverCss, ...obj.hover } };
        }
        Core.objCopy(obj, el);
        this.hover(el, obj.hover);
        return el;
    }

    hover(el, hoverCss) {
        if (Is.blank(hoverCss)) {
            return;
        }
        el.addEventListener('mouseenter', () => {
            el.hoverRestoreObj = Object.fromEntries(Object.keys(hoverCss).map((keyStr) => [keyStr, el.style[keyStr]]));
            el.css(hoverCss);
        });
        el.addEventListener('mouseleave', () => el.css(el.hoverRestoreObj ?? {}));
    }

    body(obj = {}) {
        this.bodyCss = { backgroundColor: this.color7, color: this.color0, display: 'inline' };
        obj.css = { ...this.bodyCss, ...obj.css };
        return Core.objCopy(obj, document.body);
    }

    label(obj = {}) {
        this.labelCss =  { marginBottom: '0px', color: this.color1, fontWeight: '100' };
        obj.css = { ...this.labelCss, ...obj.css };
        return this.core(obj, 'label');
    }

    input(obj = {}) {
        if (!obj.maxLength) {
            obj.maxLength = 50;
        }
        obj.css = { ...this.inputCss(), ...this.fullWidthCss, ...obj.css };
        let input = this.core(obj, 'input');
        this.controlArr.push(input);
        return input;
    }

    button(obj = {}) {
        this.buttonCss = {
            color: this.color7,
            width: '100%',
            padding: '3px',
            margin: '1px',
            height: '40px',
            background: this.color11,
            border: 'none',
            transition: '0.3s',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            borderRadius: '5px'
        };
        obj.css = { ...this.buttonCss, ...obj.css };
        if (typeof obj.hover !== 'object') {
            obj.hover = { ...this.buttonHoverCss(), ...obj.hover };
        }
        this.addCss(`button:disabled, button[disabled] { cursor:not-allowed; }`);
        let button = this.core(obj, 'button');
        this.controlArr.push(button);
        return button;
    }
    ul(obj = {}) {
        this.ulCss = { padding: '1px', margin: '1px', listStyleType: 'none' };
        obj.css = { ...this.ulCss, ...obj.css };
        return this.core(obj, 'ul');
    }
    ol(obj = {}) {
        this.ulCss = { padding: '1px', margin: '1px', listStyleType: 'none' };
        obj.css = { ...this.ulCss, ...obj.css };
        return this.core(obj, 'ol');
    }
    li(obj = {}) {
        this.liCss = { padding: '1px', margin: '1px' };
        obj.css = { ...this.liCss, ...obj.css };
        return this.core(obj, 'li');
    }
    img(obj = {}) {
        this.imgCss = { borderRadius: '0px 0px 0px 0px', padding: '1px', margin: '1px' };
        obj.css = { ...this.imgCss, ...obj.css };
        return this.core(obj, 'img');
    }
    div(obj = {}) { return this.core(obj, 'div'); }
    textarea(obj = {}) {
        this.textareaCss = { padding: '1px', margin: '1px' };
        obj.css = { ...this.textareaCss, ...obj.css };
        let textarea = this.core(obj, 'textarea');
        this.controlArr.push(textarea);
        return textarea;
    }
    h1(obj = {}) {
        this.h1Css = {
            ...this.fullWidthCss,
            ...this.centerTextCss,
            color: this.color2,
            fontWeight: 'bold',
            margin: '0 0 25px 0'
        };
        obj.css = { ...this.h1Css, ...obj.css };
        return this.core(obj, 'h1');
    }
    h3(obj = {}) {
        this.h3Css = { ...this.centerTextCss, color: this.color2, marginTop: '10px' };
        obj.css = { ...this.h3Css, ...obj.css };
        return this.core(obj, 'h3');
    }
    h4(obj = {}) { return this.core(obj, 'h4'); }
    h5(obj = {}) {
        this.h5Css = { padding: 0, margin: 0, minHeight: '10px', wordWrap: 'break-word' };
        obj.css = { ...this.h5Css, ...obj.css };
        return this.core(obj, 'h5');
    }
    hr(obj = {}) { return this.core(obj, 'hr'); }
    a(obj = {}) {
        this.aCss = { color: this.color2, cursor: 'pointer' };
        obj.css = { ...this.aCss, ...obj.css };
        return this.core(obj, 'a');
    }
    form(obj = {}) { return this.core(obj, 'form'); }
    span(obj = {}) { return this.core(obj, 'span'); }
    p(obj = {}) {
        this.pCss = { color: this.color1, fontSize: '12px' };
        obj.css = { ...this.pCss, ...obj.css };
        return this.core(obj, 'p');
    }
    style(obj = {}) { return this.core(obj, 'style'); }
    canvas(obj = {}) { return this.core(obj, 'canvas'); }
    svg(obj = {}) {
        this.svgCss = { display: 'block', fill: 'currentColor' };
        obj.css = { ...this.svgCss, ...obj.css };
        return this.core(obj, 'svg');
    }
    path(obj = {}) {
        this.pathCss = { fill: 'none', stroke: 'currentColor', strokeWidth: '1.2' };
        obj.css = { ...this.pathCss, ...obj.css };
        return this.core(obj, 'path');
    }
    icon(nameStr) {
        let eyeStr = 'M1,8 Q8,1 15,8 Q8,15 1,8 Z M10,8 A2,2 0 1,1 6,8 A2,2 0 1,1 10,8';
        let dObj = {
            search: 'M11,6.5 A4.5,4.5 0 1,1 2,6.5 A4.5,4.5 0 1,1 11,6.5 M9.7,9.7 L14.5,14.5',
            refresh: 'M13.5,8 A5.5,5.5 0 1,1 11.9,4.1 M12.4,1.4 L12,4.6 L8.8,4.2',
            eye: eyeStr,
            eyeOff: `${eyeStr} M2.5,2.5 L13.5,13.5`,
            speak: 'M2,6 L5,6 L9,3 L9,13 L5,10 L2,10 Z M11.5,5.5 Q13,8 11.5,10.5 M13.5,3.5 Q16,8 13.5,12.5'
        };
        return this.svg({
            attr: { viewBox: '0 0 16 16' },
            css: { display: 'inline-block', width: '1.2em', height: '1.2em', verticalAlign: 'middle' }
        })
            .add(
                this.path({
                    attr: { d: dObj[nameStr] },
                    css: { strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }
                })
            );
    }
    svgText(obj = {}) {
        this.svgTextCss = { textAnchor: 'middle', dominantBaseline: 'middle' };
        obj.css = { ...this.svgTextCss, ...obj.css };
        return this.core(obj, 'text');
    }
    br() { return this.build('br'); }
    table(obj = {}) { return this.core(obj, 'table'); }
    th(obj = {}) { return this.core(obj, 'th'); }
    tr(obj = {}) { return this.core(obj, 'tr'); }
    td(obj = {}) { return this.core(obj, 'td'); }
    strong(obj = {}) { return this.core(obj, 'strong'); }
    small(obj = {}) { return this.core(obj, 'small'); }
    h2(obj = {}) { return this.core(obj, 'h2'); }
    b(obj = {}) { return this.core(obj, 'b'); }
    em(obj = {}) { return this.core(obj, 'em'); }
    pre(obj = {}) { return this.core(obj, 'pre'); }
    code(obj = {}) { return this.core(obj, 'code'); }
    nav(obj = {}) { return this.core(obj, 'nav'); }
    section(obj = {}) { return this.core(obj, 'section'); }
    datalist(obj = {}) { return this.core(obj, 'datalist'); }
    option(obj = {}) { return this.core(obj, 'option'); }
    text(str) { return document.createTextNode(String(str ?? '')); }

    select(obj = {}, optionArr = []) {
        let valueStr = obj.value;
        delete obj.value;
        let select = this.core(obj, 'select');
        this.controlArr.push(select);
        for (let optionPairArr of optionArr) {
            select.add(this.option({ value: optionPairArr[0], textContent: optionPairArr[1] }));
        }
        if (valueStr !== undefined) {
            select.value = valueStr;
        }
        return select;
    }

    markdown(str, codeCss = {}, obj = {}) {
        let span = this.span(obj);
        String(str ?? '').split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/).forEach((partStr) => {
            if (/^`[^`]+`$/.test(partStr)) {
                span.add(this.code({ textContent: partStr.slice(1, -1), css: codeCss }));
            } else if (/^\*\*[^*]+\*\*$/.test(partStr)) {
                span.add(this.b({ textContent: partStr.slice(2, -2) }));
            } else if (/^\*[^*\s][^*]*\*$/.test(partStr)) {
                span.add(this.em({ textContent: partStr.slice(1, -1) }));
            } else if (partStr) {
                span.add(this.text(partStr));
            }
        });
        return span;
    }

    responsive(element, fn) {
        this.responsiveMatrix.push([element, fn]);
        element.css(fn(window.innerWidth));
        return element;
    }

    // Credit: grid and breakpoints follow Bootstrap 4 (https://getbootstrap.com), by Mark Otto, Jacob Thornton and
    // the Bootstrap contributors, MIT licence.
    row(obj = {}) {
        obj.css = { display: 'flex', flexWrap: 'wrap', margin: 0, ...obj.css };
        return this.div(obj);
    }
    centeredRow(obj = {}) {
        obj.css = { justifyContent: 'center', ...obj.css };
        return this.row(obj);
    }
    col1(obj = {}) { return this.col(obj, 1); }
    col2(obj = {}) { return this.col(obj, 2); }
    col3(obj = {}) { return this.col(obj, 3); }
    col4(obj = {}) { return this.col(obj, 4); }
    col5(obj = {}) { return this.col(obj, 5); }
    col6(obj = {}) { return this.col(obj, 6); }
    col7(obj = {}) { return this.col(obj, 7); }
    col8(obj = {}) { return this.col(obj, 8); }
    col9(obj = {}) { return this.col(obj, 9); }
    col10(obj = {}) { return this.col(obj, 10); }
    col11(obj = {}) { return this.col(obj, 11); }
    col12(obj = {}) { return this.col(obj, 12); }
    col(obj, sizeInt) {
        let col = this.build('div');
        col.css({ position: 'relative', width: '100%', margin: 0, padding: 0 });
        Core.objCopy(obj, col);
        this.hover(col, obj?.hover);
        let ownMaxWidthBool = Boolean(obj?.css?.maxWidth);
        return this.responsive(col, (widthInt) => {
            let percentStr = (widthInt >= this.breakpointObj[this.colSize] ? sizeInt / 12 * 100 : 100) + '%';
            let flexCss = { flex: `0 0 ${percentStr}` };
            return ownMaxWidthBool ? flexCss : { ...flexCss, maxWidth: percentStr };
        });
    }
    carousel(obj = {}, arr) {

    }

    link(obj) {
        let link = this.build('link');
        Core.objCopy(obj, link);
        link.type = 'text/css';
        return link;
    }
}
