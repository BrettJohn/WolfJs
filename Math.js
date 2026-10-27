// Credit: TeX notation, Donald E. Knuth (TeX 1978, The TeXbook 1984).
// Credit: layout approach from KaTeX by Emily Eisenberg, Sophie Alpert and Khan Academy (MIT licence), katex.org.
// Credit: no KaTeX code is used; this typesets only the TeX subset in laws.md, with Wolf builders.
Page.prototype.math = function(texStr) {
    let tokenArr = texStr.match(/\\[a-zA-Z]+|\\.|[{}^_&]|\s+|./g) ?? [];
    let indexInt = 0;
    let symbolObj = { pi: 'π', theta: 'θ', sigma: 'σ', rho: 'ρ', nu: 'ν', mu: 'μ', varepsilon: 'ε', gamma: 'γ',
        delta: 'δ', Delta: 'Δ', Lambda: 'Λ', Psi: 'Ψ', hbar: 'ℏ', nabla: '∇', partial: '∂', infty: '∞',
        cdot: '·', times: '×', geq: '≥', propto: '∝', mid: '∣', Sigma: 'Σ' };
    let spaceObj = { '\\,': '0.17em', '\\ ': '0.33em', '\\qquad': '2em', '\\!': '-0.17em' };
    let peekFn = () => {
        while (/^\s+$/.test(tokenArr[indexInt] ?? '')) {
            indexInt++;
        }
        return tokenArr[indexInt];
    };
    let rawGroupFn = () => {
        peekFn();
        indexInt++;
        let textStr = '';
        while (indexInt < tokenArr.length && tokenArr[indexInt] !== '}') {
            textStr += tokenArr[indexInt++];
        }
        indexInt++;
        return textStr;
    };
    let listFn = (stopArr) => {
        let nodeArr = [];
        while (indexInt < tokenArr.length && !stopArr.includes(peekFn())) {
            let nodeObj = atomFn();
            while (['^', '_'].includes(peekFn())) {
                nodeObj = { kindStr: 'script', baseObj: nodeObj, ...nodeObj.kindStr === 'script' ? nodeObj : {} };
                nodeObj[tokenArr[indexInt++] === '^' ? 'supObj' : 'subObj'] = atomFn();
            }
            nodeArr.push(nodeObj);
        }
        return { kindStr: 'list', nodeArr };
    };
    let atomFn = () => {
        let tokenStr = peekFn();
        indexInt++;
        if (tokenStr === '{') {
            let groupObj = listFn(['}']);
            indexInt++;
            return groupObj;
        }
        if (tokenStr === '\\frac' || tokenStr === '\\tfrac') {
            return { kindStr: 'frac', smallBool: tokenStr === '\\tfrac', topObj: atomFn(), bottomObj: atomFn() };
        }
        if (tokenStr === '\\mathbf') {
            let bodyObj = atomFn();
            (bodyObj.nodeArr ?? [bodyObj]).filter((childObj) => childObj.kindStr === 'variable')
                .forEach((childObj) => childObj.kindStr = 'bold');
            return bodyObj;
        }
        if (tokenStr === '\\hat' || tokenStr === '\\dot') {
            let bodyObj = atomFn();
            let letterStr = bodyObj.textStr ?? bodyObj.nodeArr.map((childObj) => childObj.textStr).join('');
            return { kindStr: 'variable', textStr: letterStr + (tokenStr === '\\hat' ? '\u0302' : '\u0307') };
        }
        if (tokenStr === '\\sqrt') {
            return { kindStr: 'sqrt', bodyObj: atomFn() };
        }
        if (tokenStr === '\\text') {
            return { kindStr: 'text', textStr: rawGroupFn() };
        }
        if (tokenStr === '\\left' || tokenStr === '\\right') {
            let delimiterStr = tokenArr[indexInt++];
            return { kindStr: 'delimiter', textStr: delimiterStr === '.' ? '' : delimiterStr };
        }
        if (tokenStr === '\\begin') {
            rawGroupFn();
            let rowMatrix = [[]];
            while (indexInt < tokenArr.length && peekFn() !== '\\end') {
                rowMatrix.at(-1).push(listFn(['&', '\\\\', '\\end']));
                let separatorStr = peekFn();
                if (separatorStr === '&') {
                    indexInt++;
                } else if (separatorStr === '\\\\') {
                    indexInt++;
                    rowMatrix.push([]);
                }
            }
            indexInt++;
            rawGroupFn();
            return { kindStr: 'aligned', rowMatrix };
        }
        if (tokenStr === '\\sum' || tokenStr === '\\int') {
            return { kindStr: 'operator', textStr: tokenStr === '\\sum' ? '∑' : '∫', stackBool: tokenStr === '\\sum' };
        }
        if (tokenStr in spaceObj) {
            return { kindStr: 'space', widthStr: spaceObj[tokenStr] };
        }
        if (['\\sin', '\\cos', '\\tan', '\\csc', '\\sec', '\\cot', '\\ln', '\\log'].includes(tokenStr)) {
            return { kindStr: 'function', textStr: tokenStr.slice(1) };
        }
        let textStr = symbolObj[tokenStr?.slice(1)] ?? (tokenStr === '-' ? '−' : tokenStr);
        let kindStr = /^[a-zA-Zα-ω]$/.test(textStr) ? 'variable' : /^[=+−<>≥∝×·∣]$/.test(textStr) ? 'binary'
            : 'upright';
        return { kindStr, textStr };
    };
    let rootObj = listFn([]);
    let renderFn = (nodeObj, previousKindStr = '') => {
        let kindStr = nodeObj.kindStr;
        if (kindStr === 'list') {
            let listEl = this.span();
            let lastKindStr = '';
            nodeObj.nodeArr.forEach((childObj) => {
                listEl.add(renderFn(childObj, lastKindStr));
                lastKindStr = childObj.kindStr;
            });
            return listEl;
        }
        if (kindStr === 'variable') {
            return this.span({ textContent: nodeObj.textStr, css: { fontStyle: 'italic' } });
        }
        if (kindStr === 'binary') {
            let unaryBool = ['', 'binary', 'delimiter'].includes(previousKindStr) && nodeObj.textStr === '−';
            return this.span({ textContent: nodeObj.textStr, css: { margin: unaryBool ? 0 : '0 0.22em' } });
        }
        if (kindStr === 'upright' || kindStr === 'delimiter') {
            let tallBool = kindStr === 'delimiter' && rootObj.nodeArr.some((childObj) => childObj.kindStr === 'frac');
            return this.span({ textContent: nodeObj.textStr, css: tallBool ? { fontSize: '1.5em', lineHeight: 1,
                verticalAlign: 'middle' } : {} });
        }
        if (kindStr === 'function') {
            return this.span({ textContent: nodeObj.textStr, css: { marginLeft: previousKindStr ? '0.17em' : 0,
                marginRight: '0.12em' } });
        }
        if (kindStr === 'text') {
            return this.span({ textContent: nodeObj.textStr, css: { fontStyle: 'normal' } });
        }
        if (kindStr === 'space') {
            return this.span({ css: { display: 'inline-block', width: nodeObj.widthStr } });
        }
        if (kindStr === 'bold') {
            return this.span({ textContent: nodeObj.textStr, css: { fontWeight: 'bold' } });
        }
        if (kindStr === 'sqrt') {
            return this.span({ css: { whiteSpace: 'nowrap' } }).add(this.span({ textContent: '√' }))
                .add(this.span({ css: { borderTop: '1px solid currentColor', paddingLeft: '0.1em' } })
                    .add(renderFn(nodeObj.bodyObj)));
        }
        if (kindStr === 'frac') {
            return this.span({ css: { display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                verticalAlign: 'middle', margin: '0 0.12em', fontSize: nodeObj.smallBool ? '0.7em' : '0.9em',
                lineHeight: 1.15 } })
                .add(this.span({ css: { padding: '0 0.15em' } }).add(renderFn(nodeObj.topObj)))
                .add(this.span({ css: { padding: '0 0.15em', borderTop: '1px solid currentColor', alignSelf: 'stretch',
                    textAlign: 'center' } }).add(renderFn(nodeObj.bottomObj)));
        }
        if (kindStr === 'operator') {
            return this.span({ textContent: nodeObj.textStr, css: { fontSize: '1.5em', lineHeight: 1,
                verticalAlign: 'middle' } });
        }
        if (kindStr === 'aligned') {
            let gridEl = this.span({ css: { display: 'inline-grid', columnGap: '0.3em', rowGap: '0.5em',
                alignItems: 'center', gridTemplateColumns: `repeat(${nodeObj.rowMatrix[0].length}, auto)` } });
            nodeObj.rowMatrix.forEach((cellArr) => cellArr.forEach((cellObj, i) => gridEl.add(this.span({ css: {
                justifySelf: i % 2 ? 'start' : 'end', paddingLeft: i && i % 2 === 0 ? '1.5em' : 0 } })
                .add(renderFn(cellObj)))));
            return gridEl;
        }
        let baseObj = nodeObj.baseObj;
        let scriptCss = { fontSize: '0.7em', lineHeight: 1 };
        if (baseObj.kindStr === 'operator' && baseObj.stackBool) {
            return this.span({ css: { display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                verticalAlign: 'middle', margin: '0 0.15em' } })
                .add(this.span({ css: scriptCss }).add(renderFn(nodeObj.supObj ?? { kindStr: 'list', nodeArr: [] })))
                .add(renderFn(baseObj))
                .add(this.span({ css: scriptCss }).add(renderFn(nodeObj.subObj ?? { kindStr: 'list', nodeArr: [] })));
        }
        let stackEl = this.span({ css: { display: 'inline-flex', flexDirection: 'column', verticalAlign: 'middle',
            marginLeft: '0.05em' } });
        if (nodeObj.supObj && nodeObj.subObj) {
            stackEl.add(this.span({ css: scriptCss }).add(renderFn(nodeObj.supObj)))
                .add(this.span({ css: scriptCss }).add(renderFn(nodeObj.subObj)));
        } else {
            Core.copyCss({ display: 'inline-block', verticalAlign: nodeObj.supObj ? '0.55em' : '-0.3em', ...scriptCss },
                stackEl);
            stackEl.add(renderFn(nodeObj.supObj ?? nodeObj.subObj));
        }
        let gapBool = ['operator', 'function'].includes(baseObj.kindStr);
        let baseEl = renderFn(baseObj, previousKindStr);
        baseEl.style.marginRight = 0;
        let wrapCss = { whiteSpace: 'nowrap', marginRight: gapBool ? '0.17em' : 0 };
        return this.span({ css: wrapCss }).add(baseEl).add(stackEl);
    };
    return this.span({ css: { fontFamily: "'Noto Serif', 'Cambria Math', 'Times New Roman', serif",
        fontSize: '1.25em' } }).add(renderFn(rootObj));
};

Page.prototype.figure = function(nameStr, boldArr) {
    let dashCss = { strokeDasharray: '4 3' };
    let hiddenCss = { ...dashCss, opacity: 0.35 };
    let smallCss = { fontSize: '12px', fontStyle: 'normal' };
    let thickCss = { strokeWidth: '3.5' };
    let arrowFn = (x1Flt, y1Flt, x2Flt, y2Flt) => {
        let lengthFlt = Math.hypot(x2Flt - x1Flt, y2Flt - y1Flt);
        let xUnitFlt = (x2Flt - x1Flt) / lengthFlt;
        let yUnitFlt = (y2Flt - y1Flt) / lengthFlt;
        let pointFn = (backFlt, sideFlt) => `${(x2Flt - xUnitFlt * backFlt - yUnitFlt * sideFlt).toFixed(1)},${
            (y2Flt - yUnitFlt * backFlt + xUnitFlt * sideFlt).toFixed(1)}`;
        return `M${x1Flt},${y1Flt} L${x2Flt},${y2Flt} M${pointFn(7, 4)} L${x2Flt},${y2Flt} L${pointFn(7, -4)}`;
    };
    let figureObj = {
        right: { sideMatrix: [['a', 'M20,95 H175', 97, 108], ['o', 'M175,95 V20', 187, 57],
            ['h', 'M20,95 L175,20', 92, 46]],
            markStr: 'M163,95 V83 H175 M44,95 A24,24 0 0 0 41.6,84.5', labelMatrix: [['θ', 56, 87]] },
        isosceles: { sideMatrix: [['s', 'M30,100 L100,15', 57, 53], ['s', 'M170,100 L100,15', 143, 53],
            ['b', 'M30,100 H170', 100, 111], ['h', 'M100,15 V100', 108, 62, dashCss]],
            markStr: 'M108,100 V92 H100 M48,100 A18,18 0 0 0 41.4,86.1 M152,100 A18,18 0 0 1 158.6,86.1',
            labelMatrix: [['θ', 56, 89], ['θ', 144, 89]] },
        equilateral: { sideMatrix: [['s', 'M45,104 L100,8.7', 63, 52], ['s', 'M155,104 L100,8.7', 137, 52],
            ['s', 'M45,104 H155', 100, 114], ['h', 'M100,8.7 V104', 107, 62, dashCss]],
            markStr: 'M108,104 V96 H100 M61,104 A16,16 0 0 0 53,90.1',
            labelMatrix: [['60°', 72, 97, smallCss]] },
        pyramid: { sideMatrix: [['b', 'M25,100 H125', 75, 111], ['', 'M125,100 L175,72'],
            ['', 'M75,72 L25,100', 0, 0, hiddenCss],
            ['', 'M75,72 H175', 0, 0, hiddenCss], ['', 'M100,12 L25,100'], ['', 'M100,12 L125,100'],
            ['', 'M100,12 L175,72'], ['', 'M100,12 L75,72', 0, 0, hiddenCss], ['h', 'M100,12 V86', 108, 56, dashCss],
            ['s', 'M100,12 L75,100', 78, 62, dashCss]], markStr: '', labelMatrix: [] },
        section: { sideMatrix: [['', 'M45,80 L100,10 L155,80 Z'], ['', 'M5,80 H29 M58.5,80 H195'],
            ['', 'M39.5,80 H160.5 V84.4 H39.5 Z'], ['', 'M52,80 L100,19 L148,80', 0, 0, dashCss],
            ['', 'M83,84.4 V112 H117 V84.4'], ['', 'M86.3,86.6 H113.8 V108.6 H86.3 Z'],
            ['', 'M29,80 L86.3,108.6 M58.5,80 L86.3,93.9']], markStr: '',
            labelMatrix: [['casing', 150, 40, smallCss], ['core', 100, 62, smallCss], ['chamber', 145, 104, smallCss],
                ['passage', 24, 100, smallCss], ['raft', 175, 92, smallCss]] },
        platform: { sideMatrix: [['', 'M5,108 H195'], ['', 'M45,108 L91.7,48.6 H108.3 L155,108'],
            ['', 'M91.7,48.6 L100,38 L108.3,48.6', 0, 0, hiddenCss], ['', 'M91.7,48.6 V37.6 H108.3'],
            ['', 'M108.3,48.6 L182.6,108 M108.3,37.6 L182.6,97'],
            ['', 'M100,32.8 A2,2 0 1 0 100,28.8 A2,2 0 1 0 100,32.8'],
            ['', 'M100,32.8 V41.5 L97,48.6 M100,41.5 L103,48.6 M96,36 H104']],
            markStr: '', labelMatrix: [['platform', 60, 40, smallCss], ['stair', 180, 80, smallCss]] },
        block: { sideMatrix: [['', 'M20,102 V70 H33.6 V63.6 H46.4 V70 H73.6 V63.6 H86.4 V70 H100 V102 Z'],
            ['', 'M100,102 V70 H113.6 V63.6 H126.4 V70 H153.6 V63.6 H166.4 V70 H180 V102 Z'],
            ['', `M60,70 H72.8 V62.8 H87.2 V70 H112.8 V62.8 H127.2 V70 H140 V38
                H126.4 V31.6 H113.6 V38 H86.4 V31.6 H73.6 V38 H60 Z`]], markStr: '',
            labelMatrix: [['nub', 40, 58, smallCss], ['socket', 162, 50, smallCss],
                ['500 × 250 × 200 mm', 100, 116, smallCss]] },
        steps: { sideMatrix: [
            ['b', 'M20,105 V85 H40 V65 H60 V45 H80 V25 H120 V45 H140 V65 H160 V85 H180 V105 Z', 100, 114],
            ['', 'M20,105 L100,25 L180,105', 0, 0, hiddenCss]], markStr: '',
            labelMatrix: [['h/n', 191, 95, smallCss]] },
        inertia: { sideMatrix: [['', 'M10,100 H190'], ['m', 'M75,62 H125 V100 H75 Z', 100, 83],
            ['F', arrowFn(75, 81, 35, 81), 50, 71], ['F', arrowFn(125, 81, 165, 81), 150, 71]], markStr: '',
            labelMatrix: [['ΣF = 0, so v stays the same', 100, 40, smallCss]] },
        force: { sideMatrix: [['', 'M10,100 H190'], ['m', 'M80,62 H130 V100 H80 Z', 105, 83],
            ['F', arrowFn(25, 81, 78, 81), 48, 71], ['a', arrowFn(85, 48, 140, 48), 112, 37, dashCss]], markStr: '',
            labelMatrix: [] },
        pair: { sideMatrix: [['', 'M10,100 H190'], ['A', 'M40,64 H100 V100 H40 Z', 70, 84],
            ['B', 'M100,56 H160 V100 H100 Z', 130, 80], ['F', arrowFn(104, 40, 148, 40), 126, 29],
            ['−F', arrowFn(96, 40, 52, 40), 74, 29]], markStr: '', labelMatrix: [] },
        squares: { sideMatrix: [['', 'M80,76 H120 V46 Z'], ['', 'M80,76 V116 H120 V76'], ['', 'M120,76 H150 V46 H120'],
            ['', 'M80,76 L50,36 L90,6 L120,46']], markStr: 'M112,76 V68 H120',
            labelMatrix: [['a²', 100, 98], ['b²', 135, 61], ['c²', 85, 41]] },
        circle: { sideMatrix: [['', 'M44,62 H156 M100,8 V116', 0, 0, hiddenCss],
            ['', 'M148,62 A48,48 0 1 1 52,62 A48,48 0 1 1 148,62'], ['1', 'M100,62 L136.8,31.1', 112, 40],
            ['', 'M100,62 H136.8'], ['', 'M136.8,62 V31.1']], markStr: 'M114,62 A14,14 0 0 0 110.7,53',
            labelMatrix: [['θ', 122, 56], ['cos θ', 118, 73, smallCss], ['sin θ', 162, 47, smallCss]] },
        cosines: { sideMatrix: [['b', 'M40,100 H165', 102, 112], ['a', 'M40,100 L110,25', 66, 57],
            ['c', 'M165,100 L110,25', 146, 57]], markStr: 'M58,100 A18,18 0 0 0 52.3,86.8',
            labelMatrix: [['γ', 65, 91]] },
        lever: { sideMatrix: [['', 'M20,96 H180', 0, 0, thickCss], ['', 'M100,98 L93,110 H107 Z'],
            ['F₁', arrowFn(40, 58, 40, 92), 40, 49], ['F₂', arrowFn(150, 70, 150, 92), 150, 61],
            ['d₁', 'M40,116 H100', 70, 107, dashCss], ['d₂', 'M100,116 H150', 125, 107, dashCss]], markStr: '',
            labelMatrix: [] },
        buoyancy: { sideMatrix: [['', 'M10,30 V110 H190 V30'], ['', 'M10,52 H190', 0, 0, dashCss],
            ['', 'M80,36 H120 V76 H80 Z'], ['W', arrowFn(100, 6, 100, 34), 112, 15],
            ['F', arrowFn(100, 106, 100, 78), 112, 98]], markStr: '', labelMatrix: [['water', 42, 66, smallCss]] },
        spring: { sideMatrix: [['', 'M20,30 V100', 0, 0, thickCss],
            ['', 'M20,65 H35 L42,55 L52,75 L62,55 L72,75 L82,55 L92,75 L99,65 H110'], ['', 'M110,50 H140 V80 H110 Z'],
            ['F', arrowFn(140, 65, 182, 65), 162, 55], ['x', 'M110,96 H140 M110,90 V102 M140,90 V102', 125, 110]],
            markStr: '', labelMatrix: [] },
        cantilever: { sideMatrix: [['', 'M30,20 V110', 0, 0, thickCss], ['', 'M30,50 H170'],
            ['', 'M30,50 Q110,52 170,72', 0, 0, dashCss], ['F', arrowFn(170, 10, 170, 46), 182, 22],
            ['L', 'M30,96 H170 M30,90 V102 M170,90 V102', 100, 108], ['δ', 'M184,50 V72', 193, 61]],
            markStr: '', labelMatrix: [] },
        snell: { sideMatrix: [['', 'M10,60 H190'], ['', 'M100,10 V110', 0, 0, dashCss], ['', 'M45,12 L100,60'],
            ['', 'M100,60 L128,110']], markStr: '',
            labelMatrix: [['θ₁', 90, 34], ['θ₂', 111, 90], ['n₁', 28, 46, smallCss], ['n₂', 28, 76, smallCss]] },
        circuit: { sideMatrix: [['', 'M40,30 H70 M130,30 H160 V90 H110 M90,90 H40 V30'],
            ['R', 'M70,30 L75,22 L85,38 L95,22 L105,38 L115,22 L125,38 L130,30', 100, 11],
            ['V', 'M90,80 V100 M110,84 V96', 100, 112], ['I', arrowFn(160, 48, 160, 72), 172, 60]],
            markStr: '', labelMatrix: [] }
    };
    let { sideMatrix, markStr, labelMatrix } = figureObj[nameStr];
    let svgEl = this.svg({ attr: { viewBox: '0 0 200 120' }, css: { margin: '0 auto', width: '200px', fontSize: '17px',
        fontFamily: "'Noto Serif', 'Cambria Math', 'Times New Roman', serif", fontStyle: 'italic' } });

    // Sides
    sideMatrix.forEach(([sideStr, dStr, xInt, yInt, lineCss = {}]) => {
        let fadeBool = boldArr.length > 0 && !boldArr.includes(sideStr);
        let opacityFlt = fadeBool ? 0.35 : 1;
        let widthStr = !boldArr.length ? '2' : fadeBool ? '1.2' : '3.5';
        svgEl.add(this.path({ attr: { d: dStr }, css: { strokeWidth: widthStr, opacity: opacityFlt,
            ...lineCss } }));
        if (sideStr) {
            svgEl.add(this.svgText({ attr: { x: xInt, y: yInt }, textContent: sideStr,
                css: { opacity: opacityFlt } }));
        }
    });

    // Marks and labels
    svgEl.add(this.path({ attr: { d: markStr } }));
    labelMatrix.forEach(([labelStr, xInt, yInt, labelCss = {}]) => svgEl.add(this.svgText({ attr: { x: xInt, y: yInt },
        textContent: labelStr, css: labelCss })));
    return svgEl;
};

Page.prototype.paragraph = function(paragraphStr) {
    let paragraphEl = this.p({ css: { fontSize: '14px', margin: '4px 0 8px 0', lineHeight: 1.4 } });
    if (/^\$\$[\s\S]*\$\$$/.test(paragraphStr)) {
        Core.copyCss({ textAlign: 'center', margin: '10px 0' }, paragraphEl);
        paragraphEl.add(this.math(paragraphStr.slice(2, -2)));
    } else if (paragraphStr.startsWith('△')) {
        let [, nameStr, ...boldArr] = paragraphStr.split(' ');
        paragraphEl.add(this.figure(nameStr, boldArr));
    } else {
        paragraphEl.add(this.markdown(paragraphStr));
    }
    return paragraphEl;
};
