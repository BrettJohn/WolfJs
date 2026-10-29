Page.prototype.toggle = function(obj, optionArr, onchangeFn = null) {
    let defaultThemeObj = { ...this.toggleThemeObj(), ...obj.themeCss };
    let toggleObj = { selectedItem: null, btnArr: [] };
    toggleObj.div = this.row({ css: { flexWrap: 'nowrap', ...obj.css } });
    let lastInt = optionArr.length - 1;
    optionArr.forEach((optionObj, i) => {
        let radiusStr = '0';
        if (i === 0) {
            radiusStr = '5px 0 0 5px';
        } else if (i === lastInt) {
            radiusStr = '0 5px 5px 0';
        }
        let btn = this.button({
            html: optionObj.Name,
            hover: {},
            disabled: obj.disabled === true,
            css: {
                height: '32px',
                padding: '0 10px',
                margin: 0,
                boxShadow: 'none',
                borderRadius: radiusStr,
                ...obj.btnCss
            },
            onclick: () => {
                toggleObj.setSelected(optionObj.Id);
                if (onchangeFn != null) {
                    onchangeFn(optionObj.Id);
                }
            }
        });
        btn.optionId = optionObj.Id;
        btn.optionThemeObj = { ...defaultThemeObj, ...optionObj.themeCss };
        toggleObj.btnArr.push(btn);
        toggleObj.div.add(this.col({ css: { padding: 0 } }, Math.floor(12 / optionArr.length)).add(btn));
    });
    toggleObj.setSelected = (selectedId) => {
        toggleObj.selectedItem = selectedId;
        toggleObj.btnArr.forEach((btn) => {
            let selectedBool = btn.optionId === selectedId;
            let themeObj = btn.optionThemeObj;
            btn.style.background = selectedBool ? themeObj.selectedBack : themeObj.back;
            btn.style.color = selectedBool ? themeObj.selectedColor : themeObj.color;
            btn.style.fontWeight = selectedBool ? 'bold' : 'normal';
            btn.style.border = selectedBool ? '1px solid transparent' : themeObj.border;
            btn.style.outline = selectedBool ? themeObj.selectedOutline : 'none';
            btn.style.outlineOffset = '3px';
            btn.style.position = 'relative';
            btn.style.zIndex = selectedBool ? '1' : '0';
            btn.style.opacity = btn.disabled ? '0.6' : '1';
        });
    };
    toggleObj.setSelected(null);
    return toggleObj;
};
