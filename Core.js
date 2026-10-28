class Core {
    static goto(urlStr, windowObj = window) {
        windowObj.location.href = urlStr;
    }
    static objCopy(fromObj, toObj) {
        if (!fromObj) {
            fromObj = {};
        }
        if (!toObj) {
            toObj = {};
        }
        for (let propStr in fromObj) {
            if (propStr !== 'css') {
                toObj[propStr] = fromObj[propStr];
            }
        }
        toObj['add'] = function (childEl) {
            toObj.appendChild(childEl);
            return toObj;
        };
        if (fromObj['html']) {
            toObj['innerHTML'] = toObj['html'];
            Object.defineProperty(toObj, 'html', { value: toObj['innerHTML'] });
        }
        if (fromObj['css']) {
            Core.copyCss(fromObj['css'], toObj);
        }
        let attrObj = fromObj['attr'] ?? {};
        for (let keyStr in attrObj) {
            toObj.setAttribute(keyStr, attrObj[keyStr]);
        }
        return toObj;
    }
    static findObj(objArr, value, attributeStr = 'Id') {
        let returnObj = {};
        objArr.forEach((obj) => {
            if (obj[attributeStr] === value) {
                returnObj = obj;
            }
        });
        return returnObj;
    }
    static loadScript(srcStr) {
        Core.scriptPromiseObj ??= {};
        Core.scriptPromiseObj[srcStr] ??= new Promise(
            (resolveFn, rejectFn) => document.head.append(
                Object.assign(
                    document.createElement('script'),
                    { src: srcStr, onload: resolveFn, onerror: rejectFn }
                )
            )
        );
        return Core.scriptPromiseObj[srcStr];
    }
    static copyCss(css, toEl) {
        for (let propStr in css) {
            toEl.style[propStr] = css[propStr];
        }
    }
    static splitCamel(s, separatorStr = ' ') {
        return s.toString().replace(/(?<!^)([A-Z])/g, `${separatorStr}$1`);
    }
    static removeCss(css, toEl) {
        for (let propStr in css) {
            toEl.style[propStr] = null;
        }
    }
    static defaultArray(inputArr) {
        if (!Array.isArray(inputArr)) {
            return [];
        }
        return inputArr;
    }
    static readFile(input) {
        if (!input.files.length) {
            return null;
        }
        return new Promise((resolve) => {
            const readerObj = new FileReader;
            readerObj.readAsDataURL(input.files[0]);
            readerObj.onload = (e) => {
                return resolve(e.target.result);
            };
        }).then(function(resultStr) {
            return resultStr;
        });
    }
    static fileContents(urlStr) {
        let httpRequestObj = new XMLHttpRequest;
        httpRequestObj.open('GET', urlStr, false);
        httpRequestObj.send();
        return httpRequestObj.responseText;
    }
    static getUrlParam(nameStr) {
        let urlObj = new URL(window.location.href);
        return urlObj.searchParams.get(nameStr);
    }
    static defaultObjectToStrings(obj) {
        for (let propStr in obj) {
            obj[propStr] = obj[propStr] ? obj[propStr] : '';
        }
    }

    static isBlankObject(obj) {
        return Object.keys(obj).length === 0;
    }

    static arrayIncludesByAttribute(objArr, value, attributeStr = 'Id') {
        return !this.isBlankObject(this.findObj(objArr, value, attributeStr));
    }
}

window.Element.prototype.css = function(cssObj) {
    Core.copyCss(cssObj, this);
    return this;
};

window.Element.prototype.show = function(displayStr) {
    if (!Is.blank(displayStr)) {
        this.style.display = displayStr;
    } else if (this.style.display === 'none') {
        this.style.display = this.shownDisplayStr ?? '';
    }
    return this;
};

window.Element.prototype.hide = function() {
    if (this.style.display !== 'none') {
        this.shownDisplayStr = this.style.display;
    }
    this.style.display = 'none';
    return this;
};
