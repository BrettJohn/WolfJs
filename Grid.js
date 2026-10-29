Page.prototype.dataGrid = async function(Operation, controllerStr, obj = {}) {
    let themeObj = this.gridThemeObj();
    let controlCss = this.gridControlCss();
    let buttonCss = this.gridButtonCss();
    let headCss = this.gridHeadCss();
    let cellCss = this.gridCellCss();
    if (!this.dataGridCssAddedBool) {
        this.dataGridCssAddedBool = true;
        this.addCss(
            `
            .data-grid-wrap { border: ${themeObj.border}; border-radius: ${themeObj.radius}; overflow-x: auto;
                box-shadow: ${themeObj.shadow}; }
            .data-grid { border-collapse: separate; border-spacing: 0; }
            .data-grid td, .data-grid th { white-space: nowrap; }
            .data-grid td { transition: background-color 0.2s, color 0.2s; }
            .data-grid tr:not(.locked) td { cursor: pointer; }
            .data-grid tr.locked td { opacity: 0.55; }
            .data-grid tr:not(.locked):hover td { background-color: ${themeObj.hoverBack};
                color: ${themeObj.hoverColor}; }
        `
        );
    }
    let controlsColor = themeObj.controlsColor;
    let controlsBackgroundColor = themeObj.controlsBack;
    let backgroundColor = themeObj.rowBack;
    let pageSelectColor = this.color2;
    let pageSelectActiveColor = this.color3;
    let headingBackgroundColor = themeObj.headBack;
    let headingColor = themeObj.headColor;

    this.dataGridCss = { ...this.fullWidthCss, padding: '0% 7% 0% 7%' };
    obj.css = { ...this.dataGridCss, ...obj.css };
    let grid = this.col12(obj);
    let resultObj = await backEnd({ Operation, Limit: 10, MinId: 0 });
    let objArr = resultObj.EntityArr;
    let totalInt = resultObj.Total;
    let optionArr = [2, 5, 10, 25, 50, 100, 500];
    let rowCss = { height: controlCss.height, display: 'flex', alignItems: 'center', justifyContent: 'center' };
    let borderRightStr = themeObj.controlsDivider;
    grid.table = this.table({ className: 'data-grid', css: { width: '100%' } });
    grid.tableWrapDiv = this.div({ className: 'data-grid-wrap' });
    let currentPageInt = 1;
    let hiddenArr = ['Id', 'EditableBool'];

    grid.styleList = (dropdown) => {
        dropdown.div.style.position = 'relative';
        dropdown.btn.css({ ...buttonCss, height: controlCss.height });
        Object.assign(
            dropdown.listDiv.style,
            {
                position: 'absolute',
                width: '100%',
                maxHeight: '320px',
                overflowY: 'auto',
                borderRadius: '5px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
            }
        );
    };

    let perPageSelect = this.dropdown({ stacked: true }, optionArr, async () => {
        await grid.setPagination(perPageSelect.selectedItem);
        await grid.callBackend(perPageSelect.selectedItem, 1)
    });
    grid.styleList(perPageSelect);
    let pageSelect = this.div({ css: { color: controlsColor, ...this.ellipsesCss, fontSize: '12px' } });
    let gapCss = { paddingRight: '6px' };
    let filterSelect = this.col4({ css: gapCss });
    grid.filterDropdown = this.dropdown({ stacked: true }, [], () => {});
    grid.styleList(grid.filterDropdown);
    filterSelect.add(grid.filterDropdown.div);
    let filterInput = this.input({ css: controlCss });
    grid.applyFilter = async () => {
        let keyStr = grid.filterDropdown.selectedItem;
        let filterArr = [];
        filterArr[keyStr] = filterInput.value.trim();
        await grid.callBackend(null, null, filterArr);
    };
    grid.add(this.row({ css: { marginBottom: '10px' } })
        .add(this.col6()
            .add(this.row()
                .add(filterSelect)
                .add(this.col4({ css: gapCss }).add(filterInput))
                .add(this.col2({ css: gapCss })
                    .add(this.button({
                        title: 'Apply filter',
                        css: buttonCss,
                        onclick: async () => { await grid.applyFilter(); }
                    })
                        .add(this.icon('search'))
                    )
                )
                .add(this.col2()
                    .add(this.button({
                        title: 'Clear filter',
                        css: buttonCss,
                        onclick: async () => {
                            filterInput.value = '';
                            await grid.callBackend(null, null, [])
                        }
                    })
                        .add(this.icon('refresh'))
                    )
                )
            )
        )
        .add(this.col6({
            css: {
                backgroundColor: controlsBackgroundColor,
                borderRadius: themeObj.controlsRadius,
                alignSelf: 'center'
            }
        })
            .add(this.row()
                .add(this.col3({
                    css: { padding: '0 0 0 5px', ...this.centerTextCss, borderRight: borderRightStr, ...rowCss }
                })
                    .add(this.label({ css: { color: controlsColor, fontSize: '12px', whiteSpace: 'nowrap' } })
                        .add(grid.totalSpan = this.span({ textContent: totalInt, css: { fontWeight: 'bold' } }))
                        .add(this.span({ textContent: ' results' }))
                    )
                )
                .add(this.col6({ css: { ...this.centerTextCss, borderRight: borderRightStr, ...rowCss } })
                    .add(pageSelect)
                )
                .add(this.col3({ css: this.centerTextCss }).add(perPageSelect.div))
            )
        )
    );

    grid.filterObj = {};
    grid.callBackend = async (Limit = null, i = null, Filter = null) => {
        if (Limit == null) {
            Limit = perPageSelect.selectedItem;
        }
        if (Filter !== null) {
            grid.filterObj = Object.assign({}, Filter);
            i = 1;
        }
        if (i == null) {
            i = currentPageInt;
        }
        let resultObj = await backEnd({ Operation, Limit, Offset: Limit * (i - 1), Filter: grid.filterObj });
        grid.setData(resultObj.EntityArr);
        currentPageInt = i;
        if (resultObj.Total !== totalInt) {
            totalInt = resultObj.Total;
            grid.totalSpan.textContent = totalInt;
            await grid.setPagination(Limit);
        }
    };

    grid.setPagination = async (perPageInt) => {
        perPageSelect.setSelected(perPageInt);
        let paginationInt = Math.ceil(totalInt / perPageInt);
        grid.lastPageInt = paginationInt;
        pageSelect.innerHTML = '';
        pageSelect.add(this.a({
            html: '&#9665',
            css: { paddingRight: '5px'},
            onclick: async () => {
                let i = currentPageInt === 1 ? paginationInt : currentPageInt - 1;
                await grid.setSelect(i);
            }
        }));

        let controlMatrix = [];
        grid.setSelect = async (i) => {
            await grid.callBackend(perPageSelect.selectedItem, i);
            for (let pageControlArr of controlMatrix) {
                let pageInt = pageControlArr[0];
                let controlEl = pageControlArr[1];
                controlEl.style.color = pageInt === currentPageInt ? pageSelectActiveColor : pageSelectColor;
            }
        };
        let firstPageInt = Math.max(1, currentPageInt - 5);
        let lastPageInt = currentPageInt + 5 > paginationInt ? paginationInt : currentPageInt + 5;
        for (let i = firstPageInt; i <= lastPageInt; i++) {
            let a = this.a({
                html: i,
                css: { paddingRight: '5px', color: pageSelectColor },
                onclick: async () => {
                    await grid.setSelect(i);
                }
            });
            controlMatrix.push([i, a]);
            pageSelect.add(a);
        }
        pageSelect.add(this.a({
            html: '&#9655',
            css: { paddingRight: '5px' },
            onclick: async () => {
                let i = currentPageInt === paginationInt ? 1 : currentPageInt + 1;
                await grid.setSelect(i);
            }
        }));
        if (paginationInt === 1) {
            pageSelect.textContent = 'All shown';
        }
    };

    document.addEventListener('keydown', (event) => {
        let pageInt = {
            ArrowLeft: currentPageInt - 1,
            ArrowRight: currentPageInt + 1,
            Home: 1,
            End: grid.lastPageInt
        }[event.key];
        let typingBool = event.target.matches('input, textarea, select');
        let dropdownBool = typeof arrOpenDropdown !== 'undefined' && arrOpenDropdown.length;
        let busyBool = event.defaultPrevented || this.popupArr?.length || typingBool || dropdownBool;
        if (!grid.isConnected || busyBool || !pageInt || pageInt > grid.lastPageInt || pageInt === currentPageInt) {
            return;
        }
        event.preventDefault();
        grid.setSelect(pageInt);
    });

    grid.selectedId = obj.selectedId;
    grid.select = (idStr) => {
        grid.selectedId = idStr;
        let selectedCss = {
            backgroundColor: `color-mix(in srgb, ${this.color2} 30%, transparent)`,
            color: this.color1
        };
        let rowObj = grid.rowObj;
        for (let rowIdStr in rowObj) {
            let tr = rowObj[rowIdStr];
            let selectedBool = rowIdStr === String(idStr);
            let cellArr = [...tr.children];
            for (let i = 0; i < cellArr.length; i++) {
                let cellCss = { backgroundColor: '', color: '', boxShadow: 'none' };
                if (selectedBool) {
                    let boxShadowStr = i ? 'none' : `inset 4px 0 0 ${this.color2}`;
                    cellCss = { ...selectedCss, boxShadow: boxShadowStr };
                }
                cellArr[i].css(cellCss);
            }
        }
    };
    grid.setData = (objArr) => {
        grid.rowObj = {};
        grid.table.remove();
        grid.table = this.table({ className: 'data-grid', css: { width: '100%' } });
        let thCss = {
            backgroundColor: headingBackgroundColor,
            color: headingColor,
            padding: '5px',
            fontWeight: 'normal',
            ...this.centerTextCss,
            border: themeObj.headBorder,
            ...headCss
        };
        let borderRadiusStr = themeObj.radius;
        let tr = this.tr({css: { width: '100%' }});
        if (!objArr || objArr.length === 0) {
            tr.add(this.th({ html: 'No results', css: thCss }));
            grid.table.add(tr);
            grid.tableWrapDiv.add(grid.table);
            return;
        }

        let firstObj = objArr[0];
        let propCountInt = 0;
        let propLengthInt = Object.keys(firstObj).length - 1;
        for (let propStr in firstObj) {
            let borderRadiusObj = {};
            if (propCountInt === 0) {
                borderRadiusObj = {
                    borderTopLeftRadius: borderRadiusStr
                };
            } else if (propCountInt === propLengthInt) {
                borderRadiusObj = {
                    borderTopRightRadius: borderRadiusStr
                };
            }
            if (!hiddenArr.includes(propStr)) {
                propCountInt++;
                tr.add(this.th({ textContent: propStr, css: { ...thCss, ...borderRadiusObj }}));
            } else {
                propLengthInt--;
            }
        }
        grid.table.add(tr);

        let numInt = 0;
        let countInt = 0;
        let selectedFilterStr = grid.filterDropdown.selectedItem;
        grid.filterDropdown = this.dropdown(
            { stacked: true },
            Object.keys(firstObj).filter((propStr) => !hiddenArr.includes(propStr)),
            () => {}
        );
        grid.styleList(grid.filterDropdown);
        if (selectedFilterStr != null) {
            grid.filterDropdown.setSelected(selectedFilterStr);
        }
        filterSelect.innerHTML = '';
        filterSelect.add(grid.filterDropdown.div);
        objArr.forEach((entityObj) => {
            let borderRadiusObj = {};
            let tr = this.tr({
                lift: entityObj.EditableBool !== false,
                css: { backgroundColor: backgroundColor, color: themeObj.rowColor, position: 'relative' }
            });
            if (entityObj.EditableBool === false) {
                tr.className = 'locked';
            } else {
                tr.onclick = () => {
                    if (!obj.rowFn) {
                        Core.goto(controllerStr + '?Id=' + entityObj.Id);
                        return;
                    }
                    grid.select(entityObj.Id);
                    obj.rowFn(entityObj);
                };
            }
            let propCountInt = 0;
            let propLengthInt = Object.keys(entityObj).length - 1;
            for (let propStr in entityObj) {
                borderRadiusObj = {};
                if (propCountInt === 0) {
                    borderRadiusObj = { borderLeft: 'none' };
                } else if (propCountInt === propLengthInt) {
                    borderRadiusObj = { borderRight: 'none' };
                }
                if (countInt === objArr.length - 1) {
                    borderRadiusObj = { ...borderRadiusObj, borderBottom: 'none' };
                    if (propCountInt === 0) {
                        borderRadiusObj = { ...borderRadiusObj, borderBottomLeftRadius: borderRadiusStr };
                    } else if (propCountInt === propLengthInt) {
                        borderRadiusObj = { ...borderRadiusObj, borderBottomRightRadius: borderRadiusStr };
                    }
                }
                if (!hiddenArr.includes(propStr)) {
                    propCountInt++;
                    let value = entityObj[propStr];

                    let td = this.td({
                        textContent: value ?? '',
                        css: {
                            padding: '8px',
                            ...this.centerTextCss,
                            border: '1px solid ' + backgroundColor,
                            ...cellCss,
                            ...borderRadiusObj
                        }
                    });
                    tr.add(td);
                } else {
                    propLengthInt--;
                }
            }
            countInt++;
            numInt++;
            grid.rowObj[entityObj.Id] = tr;
            grid.table.add(tr);
            grid.tableWrapDiv.add(grid.table);
        });
        grid.select(grid.selectedId);
    };

    await grid.setPagination(25);
    grid.setData(objArr);
    grid.tableWrapDiv.add(grid.table);
    grid.add(grid.tableWrapDiv);
    this.addEnterKey(() => grid.applyFilter());
    return grid;
}