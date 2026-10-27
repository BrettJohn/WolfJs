class Diff {
    static opMatrix(oldArr, newArr) {
        let lengthMatrix = Array.from({ length: oldArr.length + 1 }, () => new Array(newArr.length + 1).fill(0));
        for (let oldInt = oldArr.length - 1; oldInt >= 0; oldInt--) {
            for (let newInt = newArr.length - 1; newInt >= 0; newInt--) {
                lengthMatrix[oldInt][newInt] = oldArr[oldInt] === newArr[newInt]
                    ? lengthMatrix[oldInt + 1][newInt + 1] + 1
                    : Math.max(lengthMatrix[oldInt + 1][newInt], lengthMatrix[oldInt][newInt + 1]);
            }
        }
        let opMatrix = [];
        let oldInt = 0;
        let newInt = 0;
        while (oldInt < oldArr.length || newInt < newArr.length) {
            if (oldInt < oldArr.length && newInt < newArr.length && oldArr[oldInt] === newArr[newInt]) {
                opMatrix.push(['same', oldArr[oldInt++], newArr[newInt++]]);
            } else if (newInt >= newArr.length
                || (oldInt < oldArr.length && lengthMatrix[oldInt + 1][newInt] >= lengthMatrix[oldInt][newInt + 1])) {
                opMatrix.push(['remove', oldArr[oldInt++], '']);
            } else {
                opMatrix.push(['add', '', newArr[newInt++]]);
            }
        }
        return opMatrix;
    }

    static lineMatrix(oldStr, newStr) {
        let lineMatrix = [];
        let removeArr = [];
        let addArr = [];
        let flushFn = () => {
            for (let indexInt = 0; indexInt < Math.max(removeArr.length, addArr.length); indexInt++) {
                let removeStr = removeArr[indexInt];
                let addStr = addArr[indexInt];
                let kindStr = removeStr === undefined ? 'add' : addStr === undefined ? 'remove' : 'change';
                lineMatrix.push([kindStr, removeStr ?? '', addStr ?? '']);
            }
            removeArr = [];
            addArr = [];
        };
        Diff.opMatrix(String(oldStr ?? '').split('\n'), String(newStr ?? '').split('\n'))
            .forEach(([kindStr, oldLineStr, newLineStr]) => {
                if (kindStr === 'remove') {
                    removeArr.push(oldLineStr);
                } else if (kindStr === 'add') {
                    addArr.push(newLineStr);
                } else {
                    flushFn();
                    lineMatrix.push(['same', oldLineStr, newLineStr]);
                }
            });
        flushFn();
        return lineMatrix;
    }
}

Page.prototype.diffCssSet = function() {
    this.diffViewCss = { border: '1px solid rgba(127, 127, 127, 0.3)', borderRadius: '8px', overflow: 'hidden',
        textAlign: 'left', fontSize: '15px', lineHeight: 1.6 };
    this.diffMonoCss = { ...this.diffViewCss, fontFamily: 'monospace', fontSize: '13px' };
    this.diffRowCss = { display: 'grid', gridTemplateColumns: '1fr 1fr' };
    this.diffCellCss = { padding: '2px 10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '1.6em',
        borderRight: '1px solid rgba(127, 127, 127, 0.3)' };
    this.diffRemoveCss = { ...this.diffCellCss, backgroundColor: 'rgba(255, 70, 70, 0.14)' };
    this.diffAddCss = { ...this.diffCellCss, backgroundColor: 'rgba(40, 200, 90, 0.14)' };
    this.diffRemoveWordCss = { backgroundColor: 'rgba(255, 70, 70, 0.45)', borderRadius: '3px' };
    this.diffAddWordCss = { backgroundColor: 'rgba(40, 200, 90, 0.45)', borderRadius: '3px' };
    this.diffFoldCss = { padding: '4px 10px', cursor: 'pointer', opacity: 0.6, fontSize: '13px',
        backgroundColor: 'rgba(127, 127, 127, 0.08)' };
};

Page.prototype.diffView = function(oldStr, newStr, monoBool = false) {
    if (!this.diffViewCss) {
        this.diffCssSet();
    }
    let viewEl = this.div({ css: monoBool ? this.diffMonoCss : this.diffViewCss });
    let cellFn = (textStr, cellCss) => this.div({ textContent: textStr, css: cellCss });
    let wordCellFn = (opMatrix, kindStr, cellCss, wordCss) => {
        let cellEl = this.div({ css: cellCss });
        opMatrix.forEach(([opStr, oldWordStr, newWordStr]) => {
            let wordStr = kindStr === 'remove' ? oldWordStr : newWordStr;
            if (opStr === 'same') {
                cellEl.add(this.text(wordStr));
            } else if (opStr === kindStr) {
                cellEl.add(this.span({ textContent: wordStr, css: wordCss }));
            }
        });
        return cellEl;
    };
    let rowFn = ([kindStr, oldLineStr, newLineStr]) => {
        let rowEl = this.div({ css: this.diffRowCss });
        if (kindStr === 'change') {
            let wordMatrix = Diff.opMatrix(oldLineStr.split(/(\s+)/), newLineStr.split(/(\s+)/));
            return rowEl.add(wordCellFn(wordMatrix, 'remove', this.diffRemoveCss, this.diffRemoveWordCss))
                .add(wordCellFn(wordMatrix, 'add', this.diffAddCss, this.diffAddWordCss));
        }
        let leftCss = kindStr === 'remove' ? this.diffRemoveCss : this.diffCellCss;
        let rightCss = kindStr === 'add' ? this.diffAddCss : this.diffCellCss;
        return rowEl.add(cellFn(oldLineStr, leftCss)).add(cellFn(newLineStr, rightCss));
    };

    let lineMatrix = Diff.lineMatrix(oldStr, newStr);
    let contextInt = 2;
    let sameArr = [];
    let flushFn = () => {
        if (sameArr.length <= 2 * contextInt + 1) {
            sameArr.forEach((lineArr) => viewEl.add(rowFn(lineArr)));
        } else {
            let hiddenArr = sameArr.slice(contextInt, -contextInt);
            sameArr.slice(0, contextInt).forEach((lineArr) => viewEl.add(rowFn(lineArr)));
            let foldEl = this.div({ textContent: `⋯ ${hiddenArr.length} unchanged lines`, css: this.diffFoldCss,
                onclick: () => foldEl.replaceWith(...hiddenArr.map(rowFn)) });
            viewEl.add(foldEl);
            sameArr.slice(-contextInt).forEach((lineArr) => viewEl.add(rowFn(lineArr)));
        }
        sameArr = [];
    };
    lineMatrix.forEach((lineArr) => {
        if (lineArr[0] === 'same') {
            sameArr.push(lineArr);
            return;
        }
        flushFn();
        viewEl.add(rowFn(lineArr));
    });
    flushFn();
    return viewEl;
};
