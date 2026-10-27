class Is {
    static blank(value) {
        if (value === null || value === undefined) {
            return true;
        }
        if (typeof value === 'string') {
            return value.trim() === '';
        }
        if (Array.isArray(value)) {
            return value.length === 0;
        }
        if (Object.getPrototypeOf(value) === Object.prototype) {
            return Object.keys(value).length === 0;
        }
        return false;
    }
    static alphabets(str) {
        return str !== undefined && str !== null && str.length > 0 && /^[a-zA-Z]+$/.test(str);
    }
    static alphabetsSpaces(str) {
        return str !== undefined && str !== null && str.length > 0 && /^[a-zA-Z ]+$/.test(str);
    }
    static alphabetsDigits(str) {
        return str !== undefined && str !== null && str.length > 0 && /^[a-zA-Z0-9]+$/.test(str);
    }
    static isFloat(n) {
        return /^\d{0,2}(\.\d{0,2}){0,1}$/.exec(n);
    }
    static isInvalid(str) { // TODO
        return str.str === null || str.match(/^ *$/) !== null;
    }
    static isUnsafe(str) { // TODO obsolete after switch to alphabets function?
        return this.isInvalid(str) || str.match(/[\-=\[\]{};':"\\|,<>\/]/);
    }
    static checkPassword(passwordStr) {
        if (passwordStr.length < 8) {
            return false;
        }
        if (this.isInvalid(passwordStr)) {
            return false;
        }
        if (!passwordStr.match("[A-Z]+")) {
            return false;
        }
        if (!passwordStr.match("[a-z]+")) {
            return false;
        }
        if (!passwordStr.match("[!@#$%^&*]+")) {
            return false;
        }
        if (!passwordStr.match("[0-9]+")) {
            return false;
        }
        return true;
    }
    static checkEmail(emailStr) {
        if (!emailStr.match(/^[A-Za-z0-9\.]+@[A-Za-z0-9]+\.[A-Za-z0-9\.]+$/i)) {
            return false;
        }
        return true;
    };
    static checkCellphone() {
        return true;
    }

    static validText(inputVar) {
        if (typeof inputVar !== 'undefined') {
            return inputVar;
        }
        return '';
    }
}
