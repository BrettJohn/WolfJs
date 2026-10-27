class Entity {
    static fill(entityObj, obj) {
        for (let keyStr of Object.keys(entityObj)) {
            let value = obj?.[keyStr];
            if (value !== undefined && value !== null) {
                entityObj[keyStr] = typeof entityObj[keyStr] === 'number' ? Number(value) : String(value);
            }
        }
    }

    fields() {
        return Object.fromEntries(this.constructor.FIELD_ARR.map((keyStr) => [keyStr, this[keyStr]]));
    }
}
