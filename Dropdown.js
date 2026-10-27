let openDropdownArr = [];
document.addEventListener('click', (event) => {
    openDropdownArr.filter((listDiv) => !listDiv.btnDiv.contains(event.target)).forEach((listDiv) => listDiv.close());
}, true);
document.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
        [...openDropdownArr].forEach((listDiv) => listDiv.close());
    }
});

Page.prototype.dropdown = function(
    obj, optionArr, onchangeFn = null, filterInObj = null, filterOutObj = null) {
    let ddObj = {};
    let triangleDownStr = ' \u25BE';
    let listBtnDiv = this.div();
    let themeObj = { btnBack: this.color9, btnOpenBack: this.color11, btnColor: this.color7,
        listBack: this.color9, optionBack: this.color11, optionColor: this.color7,
        optionSelectedBorder: '1px solid ' + this.color2, ...this.dropdownThemeCss, ...obj.themeCss };
    obj.css = Core.objCopy({
        position: 'relative',
        zIndex: 2,
        backgroundColor: themeObj.listBack,
        display: 'none',
        border: '1px solid ' + this.color4
    }, obj.css);
    let listDiv = this.centeredRow({ css: obj.css });
    listDiv.btnDiv = listBtnDiv;
    listDiv.close = () => {
        listBtn.style.border = 'none';
        listDiv.style.display = 'none';
        listBtn.style.backgroundColor = themeObj.btnBack;
        openDropdownArr = openDropdownArr.filter((openDiv) => openDiv !== listDiv);
    };

    let optionColStr = obj.stacked ? 'col12' : 'col3';
    let optionCss = obj.stacked ? { height: '34px', fontSize: '16px', textAlign: 'left', padding: '0 12px' } : {};
    let listBtn = this.button({ html: '--Select--' + triangleDownStr, css: {
            color: themeObj.btnColor,
            padding: 0,
            margin: 0,
            boxShadow: 'none',
            borderRadius: '5px',
            backgroundColor: themeObj.btnBack,
            ...themeObj.btnCss
        },
        hover: {},
        onclick: () => {
            if (listDiv.style.display !== 'none') {
                listDiv.close();
            } else {
                listBtn.style.border = '1px solid ' + this.color0;
                listDiv.style.display = 'flex';
                listBtn.style.backgroundColor = themeObj.btnOpenBack;
                openDropdownArr.push(listDiv);
            }
        }
    });
    ddObj.setOptions = () => {
        if (optionArr) {
            listDiv.innerHTML = '';
            for (let optionObj of optionArr) {
                if (typeof optionObj !== 'object') {
                    optionObj = { Id: optionObj, Name: Core.splitCamel(optionObj) };
                }
                ddObj[optionObj.Id] = optionObj.Name;
                if (!ddObj.optionObj){
                    ddObj.optionObj = optionObj;
                }
                let filterInBool = false;
                if (filterInObj) {
                    for (let keyStr in filterInObj) {
                        if (optionObj[keyStr] === filterInObj[keyStr]) {
                            filterInBool = true;
                        }
                    }
                } else {
                    filterInBool = true;
                }
                if (!filterInBool) {
                    continue;
                }
                let filterOutBool = true;
                if (filterOutObj) {
                    for (let [keyStr, value] in filterOutObj) {
                        if (optionObj[keyStr] !== value) {
                            filterOutBool = false;
                        }
                    }
                } else {
                    filterOutBool = true;
                }
                if (!filterOutBool) {
                    continue;
                }

                let sameBool = ddObj.selectedItem === optionObj.Id;
                if (sameBool) {
                    ddObj.optionObj = optionObj;
                }
                listDiv.add(this[optionColStr]({ css: { padding: 0, margin:0 }}).add(this.button({
                    textContent: optionObj.Name, css: {
                        height: '21px',
                        backgroundColor: themeObj.optionBack,
                        color: themeObj.optionColor,
                        padding: 0,
                        margin: '0 1px 0 0',
                        border: sameBool ? themeObj.optionSelectedBorder : 'none',
                        fontWeight: 'normal',
                        fontSize: '12px',
                        borderRadius: '0px',
                        ...this.ellipsesCss,
                        ...optionCss
                    },
                    hover: {
                        backgroundColor: this.color4,
                        color: this.color1
                    },
                    onclick: () => {
                        ddObj.setSelected(optionObj.Id);
                        listDiv.close();
                        listBtn.textContent = optionObj.Name + triangleDownStr;
                        if (onchangeFn != null) {
                            onchangeFn();
                        }
                    }
                })));
            }
        }
    };
    listBtnDiv.add(listBtn);
    listBtnDiv.add(listDiv);
    ddObj.setSelected = function(selectedId) {
        ddObj.selectedItem = selectedId;
        ddObj.setOptions();
        listBtn.textContent = (ddObj[selectedId] ?? '--Select--') + triangleDownStr;
    };
    ddObj.setOptions();
    ddObj.listDiv = listDiv;
    ddObj.div = listBtnDiv;
    ddObj.btn = listBtn;
    return ddObj;
};