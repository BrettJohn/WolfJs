// Credit: TeX notation, Donald E. Knuth (TeX 1978, The TeXbook 1984).
// Credit: layout approach from KaTeX by Emily Eisenberg, Sophie Alpert and Khan Academy (MIT licence), katex.org.
// Credit: no KaTeX code is used; this typesets only the TeX subset in laws.md, with Wolf builders.
Page.prototype.math = function(texStr) {
    let tokenArr = texStr.match(/\\[a-zA-Z]+|\\.|[{}^_&]|\s+|./g) ?? [];
    let indexInt = 0;
    let symbolObj = {
        pi: 'π',
        theta: 'θ',
        sigma: 'σ',
        rho: 'ρ',
        nu: 'ν',
        mu: 'μ',
        varepsilon: 'ε',
        gamma: 'γ',
        delta: 'δ',
        Delta: 'Δ',
        Lambda: 'Λ',
        Psi: 'Ψ',
        hbar: 'ℏ',
        nabla: '∇',
        partial: '∂',
        infty: '∞',
        cdot: '·',
        times: '×',
        geq: '≥',
        propto: '∝',
        mid: '∣',
        Sigma: 'Σ'
    };
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
            return this.span({
                textContent: nodeObj.textStr,
                css: tallBool ? { fontSize: '1.5em', lineHeight: 1, verticalAlign: 'middle' } : {}
            });
        }
        if (kindStr === 'function') {
            return this.span({
                textContent: nodeObj.textStr,
                css: { marginLeft: previousKindStr ? '0.17em' : 0, marginRight: '0.12em' }
            });
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
                    .add(renderFn(nodeObj.bodyObj))
                );
        }
        if (kindStr === 'frac') {
            return this.span({
                css: {
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    verticalAlign: 'middle',
                    margin: '0 0.12em',
                    fontSize: nodeObj.smallBool ? '0.7em' : '0.9em',
                    lineHeight: 1.15
                }
            })
                .add(this.span({ css: { padding: '0 0.15em' } }).add(renderFn(nodeObj.topObj)))
                .add(this.span({
                    css: {
                        padding: '0 0.15em',
                        borderTop: '1px solid currentColor',
                        alignSelf: 'stretch',
                        textAlign: 'center'
                    }
                })
                    .add(renderFn(nodeObj.bottomObj))
                );
        }
        if (kindStr === 'operator') {
            return this.span({
                textContent: nodeObj.textStr,
                css: { fontSize: '1.5em', lineHeight: 1, verticalAlign: 'middle' }
            });
        }
        if (kindStr === 'aligned') {
            let gridEl = this.span({
                css: {
                    display: 'inline-grid',
                    columnGap: '0.3em',
                    rowGap: '0.5em',
                    alignItems: 'center',
                    gridTemplateColumns: `repeat(${nodeObj.rowMatrix[0].length}, auto)`
                }
            });
            nodeObj.rowMatrix.forEach(
                (cellArr) => cellArr.forEach(
                    (cellObj, i) => gridEl.add(
                        this.span({
                            css: {
                                justifySelf: i % 2 ? 'start' : 'end',
                                paddingLeft: i && i % 2 === 0 ? '1.5em' : 0
                            }
                        }).add(renderFn(cellObj))
                    )
                )
            );
            return gridEl;
        }
        let baseObj = nodeObj.baseObj;
        let scriptCss = { fontSize: '0.7em', lineHeight: 1 };
        if (baseObj.kindStr === 'operator' && baseObj.stackBool) {
            return this.span({
                css: {
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    verticalAlign: 'middle',
                    margin: '0 0.15em'
                }
            })
                .add(this.span({ css: scriptCss }).add(renderFn(nodeObj.supObj ?? { kindStr: 'list', nodeArr: [] })))
                .add(renderFn(baseObj))
                .add(this.span({ css: scriptCss }).add(renderFn(nodeObj.subObj ?? { kindStr: 'list', nodeArr: [] })));
        }
        let stackEl = this.span({
            css: { display: 'inline-flex', flexDirection: 'column', verticalAlign: 'middle', marginLeft: '0.05em' }
        });
        if (nodeObj.supObj && nodeObj.subObj) {
            stackEl.add(this.span({ css: scriptCss }).add(renderFn(nodeObj.supObj)))
                .add(this.span({ css: scriptCss }).add(renderFn(nodeObj.subObj)));
        } else {
            Core.copyCss(
                { display: 'inline-block', verticalAlign: nodeObj.supObj ? '0.55em' : '-0.3em', ...scriptCss },
                stackEl
            );
            stackEl.add(renderFn(nodeObj.supObj ?? nodeObj.subObj));
        }
        let gapBool = ['operator', 'function'].includes(baseObj.kindStr);
        let baseEl = renderFn(baseObj, previousKindStr);
        baseEl.style.marginRight = 0;
        let wrapCss = { whiteSpace: 'nowrap', marginRight: gapBool ? '0.17em' : 0 };
        return this.span({ css: wrapCss }).add(baseEl).add(stackEl);
    };
    return this.span({
        css: { fontFamily: "'Noto Serif', 'Cambria Math', 'Times New Roman', serif", fontSize: '1.25em' }
    }).add(renderFn(rootObj));
};

Page.prototype.figure = function(nameStr, boldArr) {
    let dashCss = { strokeDasharray: '4 3' };
    let hiddenCss = { strokeDasharray: '4 3', opacity: 0.35 };
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
        right: {
            sideArr: [
                { sideStr: 'a', dStr: 'M20,95 H175', xInt: 97, yInt: 108 },
                { sideStr: 'o', dStr: 'M175,95 V20', xInt: 187, yInt: 57 },
                { sideStr: 'h', dStr: 'M20,95 L175,20', xInt: 92, yInt: 46 }
            ],
            markStr: 'M163,95 V83 H175 M44,95 A24,24 0 0 0 41.6,84.5',
            labelArr: [{ labelStr: 'θ', xInt: 56, yInt: 87 }]
        },
        isosceles: {
            sideArr: [
                { sideStr: 's', dStr: 'M30,100 L100,15', xInt: 57, yInt: 53 },
                { sideStr: 's', dStr: 'M170,100 L100,15', xInt: 143, yInt: 53 },
                { sideStr: 'b', dStr: 'M30,100 H170', xInt: 100, yInt: 111 },
                { sideStr: 'h', dStr: 'M100,15 V100', xInt: 108, yInt: 62, lineCss: dashCss }
            ],
            markStr: 'M108,100 V92 H100 M48,100 A18,18 0 0 0 41.4,86.1 M152,100 A18,18 0 0 1 158.6,86.1',
            labelArr: [{ labelStr: 'θ', xInt: 56, yInt: 89 }, { labelStr: 'θ', xInt: 144, yInt: 89 }]
        },
        equilateral: {
            sideArr: [
                { sideStr: 's', dStr: 'M45,104 L100,8.7', xInt: 63, yInt: 52 },
                { sideStr: 's', dStr: 'M155,104 L100,8.7', xInt: 137, yInt: 52 },
                { sideStr: 's', dStr: 'M45,104 H155', xInt: 100, yInt: 114 },
                { sideStr: 'h', dStr: 'M100,8.7 V104', xInt: 107, yInt: 62, lineCss: dashCss }
            ],
            markStr: 'M108,104 V96 H100 M61,104 A16,16 0 0 0 53,90.1',
            labelArr: [{ labelStr: '60°', xInt: 72, yInt: 97, labelCss: smallCss }]
        },
        pyramid: {
            sideArr: [
                { sideStr: 'b', dStr: 'M25,100 H125', xInt: 75, yInt: 111 },
                { dStr: 'M125,100 L175,72' },
                { dStr: 'M75,72 L25,100', lineCss: hiddenCss },
                { dStr: 'M75,72 H175', lineCss: hiddenCss },
                { dStr: 'M100,12 L25,100' },
                { dStr: 'M100,12 L125,100' },
                { dStr: 'M100,12 L175,72' },
                { dStr: 'M100,12 L75,72', lineCss: hiddenCss },
                { sideStr: 'h', dStr: 'M100,12 V86', xInt: 108, yInt: 56, lineCss: dashCss },
                { sideStr: 's', dStr: 'M100,12 L75,100', xInt: 78, yInt: 62, lineCss: dashCss }
            ]
        },
        section: {
            sideArr: [
                { dStr: 'M45,80 L100,10 L155,80 Z' },
                { dStr: 'M5,80 H29 M58.5,80 H195' },
                { dStr: 'M39.5,80 H160.5 V84.4 H39.5 Z' },
                { dStr: 'M52,80 L100,19 L148,80', lineCss: dashCss },
                { dStr: 'M83,84.4 V112 H117 V84.4' },
                { dStr: 'M86.3,86.6 H113.8 V108.6 H86.3 Z' },
                { dStr: 'M29,80 L86.3,108.6 M58.5,80 L86.3,93.9' }
            ],
            labelArr: [
                { labelStr: 'casing', xInt: 150, yInt: 40, labelCss: smallCss },
                { labelStr: 'core', xInt: 100, yInt: 62, labelCss: smallCss },
                { labelStr: 'chamber', xInt: 145, yInt: 104, labelCss: smallCss },
                { labelStr: 'passage', xInt: 24, yInt: 100, labelCss: smallCss },
                { labelStr: 'raft', xInt: 175, yInt: 92, labelCss: smallCss }
            ]
        },
        platform: {
            sideArr: [
                { dStr: 'M5,108 H195' },
                { dStr: 'M45,108 L91.7,48.6 H108.3 L155,108' },
                { dStr: 'M91.7,48.6 L100,38 L108.3,48.6', lineCss: hiddenCss },
                { dStr: 'M91.7,48.6 V37.6 H108.3' },
                { dStr: 'M108.3,48.6 L182.6,108 M108.3,37.6 L182.6,97' },
                { dStr: 'M100,32.8 A2,2 0 1 0 100,28.8 A2,2 0 1 0 100,32.8' },
                { dStr: 'M100,32.8 V41.5 L97,48.6 M100,41.5 L103,48.6 M96,36 H104' }
            ],
            labelArr: [
                { labelStr: 'platform', xInt: 60, yInt: 40, labelCss: smallCss },
                { labelStr: 'stair', xInt: 180, yInt: 80, labelCss: smallCss }
            ]
        },
        block: {
            sideArr: [
                { dStr: 'M20,102 V70 H33.6 V63.6 H46.4 V70 H73.6 V63.6 H86.4 V70 H100 V102 Z' },
                { dStr: 'M100,102 V70 H113.6 V63.6 H126.4 V70 H153.6 V63.6 H166.4 V70 H180 V102 Z' },
                {
                    dStr: `M60,70 H72.8 V62.8 H87.2 V70 H112.8 V62.8 H127.2 V70 H140 V38
                    H126.4 V31.6 H113.6 V38 H86.4 V31.6 H73.6 V38 H60 Z`
                }
            ],
            labelArr: [
                { labelStr: 'nub', xInt: 40, yInt: 58, labelCss: smallCss },
                { labelStr: 'socket', xInt: 162, yInt: 50, labelCss: smallCss },
                { labelStr: '500 × 250 × 200 mm', xInt: 100, yInt: 116, labelCss: smallCss }
            ]
        },
        steps: {
            sideArr: [
                {
                    sideStr: 'b',
                    dStr: 'M20,105 V85 H40 V65 H60 V45 H80 V25 H120 V45 H140 V65 H160 V85 H180 V105 Z',
                    xInt: 100,
                    yInt: 114
                },
                { dStr: 'M20,105 L100,25 L180,105', lineCss: hiddenCss }
            ],
            labelArr: [{ labelStr: 'h/n', xInt: 191, yInt: 95, labelCss: smallCss }]
        },
        inertia: {
            sideArr: [
                { dStr: 'M10,100 H190' },
                { sideStr: 'm', dStr: 'M75,62 H125 V100 H75 Z', xInt: 100, yInt: 83 },
                { sideStr: 'F', dStr: arrowFn(75, 81, 35, 81), xInt: 50, yInt: 71 },
                { sideStr: 'F', dStr: arrowFn(125, 81, 165, 81), xInt: 150, yInt: 71 }
            ],
            labelArr: [{ labelStr: 'ΣF = 0, so v stays the same', xInt: 100, yInt: 40, labelCss: smallCss }]
        },
        force: {
            sideArr: [
                { dStr: 'M10,100 H190' },
                { sideStr: 'm', dStr: 'M80,62 H130 V100 H80 Z', xInt: 105, yInt: 83 },
                { sideStr: 'F', dStr: arrowFn(25, 81, 78, 81), xInt: 48, yInt: 71 },
                { sideStr: 'a', dStr: arrowFn(85, 48, 140, 48), xInt: 112, yInt: 37, lineCss: dashCss }
            ]
        },
        pair: {
            sideArr: [
                { dStr: 'M10,100 H190' },
                { sideStr: 'A', dStr: 'M40,64 H100 V100 H40 Z', xInt: 70, yInt: 84 },
                { sideStr: 'B', dStr: 'M100,56 H160 V100 H100 Z', xInt: 130, yInt: 80 },
                { sideStr: 'F', dStr: arrowFn(104, 40, 148, 40), xInt: 126, yInt: 29 },
                { sideStr: '−F', dStr: arrowFn(96, 40, 52, 40), xInt: 74, yInt: 29 }
            ]
        },
        squares: {
            sideArr: [
                { dStr: 'M80,76 H120 V46 Z' },
                { dStr: 'M80,76 V116 H120 V76' },
                { dStr: 'M120,76 H150 V46 H120' },
                { dStr: 'M80,76 L50,36 L90,6 L120,46' }
            ],
            markStr: 'M112,76 V68 H120',
            labelArr: [
                { labelStr: 'a²', xInt: 100, yInt: 98 },
                { labelStr: 'b²', xInt: 135, yInt: 61 },
                { labelStr: 'c²', xInt: 85, yInt: 41 }
            ]
        },
        circle: {
            sideArr: [
                { dStr: 'M44,62 H156 M100,8 V116', lineCss: hiddenCss },
                { dStr: 'M148,62 A48,48 0 1 1 52,62 A48,48 0 1 1 148,62' },
                { sideStr: '1', dStr: 'M100,62 L136.8,31.1', xInt: 112, yInt: 40 },
                { dStr: 'M100,62 H136.8' },
                { dStr: 'M136.8,62 V31.1' }
            ],
            markStr: 'M114,62 A14,14 0 0 0 110.7,53',
            labelArr: [
                { labelStr: 'θ', xInt: 122, yInt: 56 },
                { labelStr: 'cos θ', xInt: 118, yInt: 73, labelCss: smallCss },
                { labelStr: 'sin θ', xInt: 162, yInt: 47, labelCss: smallCss }
            ]
        },
        cosines: {
            sideArr: [
                { sideStr: 'b', dStr: 'M40,100 H165', xInt: 102, yInt: 112 },
                { sideStr: 'a', dStr: 'M40,100 L110,25', xInt: 66, yInt: 57 },
                { sideStr: 'c', dStr: 'M165,100 L110,25', xInt: 146, yInt: 57 }
            ],
            markStr: 'M58,100 A18,18 0 0 0 52.3,86.8',
            labelArr: [{ labelStr: 'γ', xInt: 65, yInt: 91 }]
        },
        lever: {
            sideArr: [
                { dStr: 'M20,96 H180', lineCss: thickCss },
                { dStr: 'M100,98 L93,110 H107 Z' },
                { sideStr: 'F₁', dStr: arrowFn(40, 58, 40, 92), xInt: 40, yInt: 49 },
                { sideStr: 'F₂', dStr: arrowFn(150, 70, 150, 92), xInt: 150, yInt: 61 },
                { sideStr: 'd₁', dStr: 'M40,116 H100', xInt: 70, yInt: 107, lineCss: dashCss },
                { sideStr: 'd₂', dStr: 'M100,116 H150', xInt: 125, yInt: 107, lineCss: dashCss }
            ]
        },
        buoyancy: {
            sideArr: [
                { dStr: 'M10,30 V110 H190 V30' },
                { dStr: 'M10,52 H190', lineCss: dashCss },
                { dStr: 'M80,36 H120 V76 H80 Z' },
                { sideStr: 'W', dStr: arrowFn(100, 6, 100, 34), xInt: 112, yInt: 15 },
                { sideStr: 'F', dStr: arrowFn(100, 106, 100, 78), xInt: 112, yInt: 98 }
            ],
            labelArr: [{ labelStr: 'water', xInt: 42, yInt: 66, labelCss: smallCss }]
        },
        spring: {
            sideArr: [
                { dStr: 'M20,30 V100', lineCss: thickCss },
                { dStr: 'M20,65 H35 L42,55 L52,75 L62,55 L72,75 L82,55 L92,75 L99,65 H110' },
                { dStr: 'M110,50 H140 V80 H110 Z' },
                { sideStr: 'F', dStr: arrowFn(140, 65, 182, 65), xInt: 162, yInt: 55 },
                { sideStr: 'x', dStr: 'M110,96 H140 M110,90 V102 M140,90 V102', xInt: 125, yInt: 110 }
            ]
        },
        cantilever: {
            sideArr: [
                { dStr: 'M30,20 V110', lineCss: thickCss },
                { dStr: 'M30,50 H170' },
                { dStr: 'M30,50 Q110,52 170,72', lineCss: dashCss },
                { sideStr: 'F', dStr: arrowFn(170, 10, 170, 46), xInt: 182, yInt: 22 },
                { sideStr: 'L', dStr: 'M30,96 H170 M30,90 V102 M170,90 V102', xInt: 100, yInt: 108 },
                { sideStr: 'δ', dStr: 'M184,50 V72', xInt: 193, yInt: 61 }
            ]
        },
        snell: {
            sideArr: [
                { dStr: 'M10,60 H190' },
                { dStr: 'M100,10 V110', lineCss: dashCss },
                { dStr: 'M45,12 L100,60' },
                { dStr: 'M100,60 L128,110' }
            ],
            labelArr: [
                { labelStr: 'θ₁', xInt: 90, yInt: 34 },
                { labelStr: 'θ₂', xInt: 111, yInt: 90 },
                { labelStr: 'n₁', xInt: 28, yInt: 46, labelCss: smallCss },
                { labelStr: 'n₂', xInt: 28, yInt: 76, labelCss: smallCss }
            ]
        },
        circuit: {
            sideArr: [
                { dStr: 'M40,30 H70 M130,30 H160 V90 H110 M90,90 H40 V30' },
                {
                    sideStr: 'R',
                    dStr: 'M70,30 L75,22 L85,38 L95,22 L105,38 L115,22 L125,38 L130,30',
                    xInt: 100,
                    yInt: 11
                },
                { sideStr: 'V', dStr: 'M90,80 V100 M110,84 V96', xInt: 100, yInt: 112 },
                { sideStr: 'I', dStr: arrowFn(160, 48, 160, 72), xInt: 172, yInt: 60 }
            ]
        }
    };
    let shapeObj = figureObj[nameStr];
    let svgEl = this.svg({
        attr: { viewBox: '0 0 200 120' },
        css: {
            margin: '0 auto',
            width: '200px',
            fontSize: '17px',
            fontFamily: "'Noto Serif', 'Cambria Math', 'Times New Roman', serif",
            fontStyle: 'italic'
        }
    });
    for (let sideObj of shapeObj.sideArr) {
        let sideStr = sideObj.sideStr;
        let fadeBool = boldArr.length > 0 && !boldArr.includes(sideStr);
        let opacityFlt = fadeBool ? 0.35 : 1;
        let widthStr = '2';
        if (boldArr.length) {
            widthStr = fadeBool ? '1.2' : '3.5';
        }
        let pathEl = this.path({
            attr: { d: sideObj.dStr },
            css: { strokeWidth: widthStr, opacity: opacityFlt }
        });
        Core.copyCss(sideObj.lineCss, pathEl);
        svgEl.add(pathEl);
        if (sideStr) {
            svgEl.add(this.svgText({
                attr: { x: sideObj.xInt, y: sideObj.yInt },
                textContent: sideStr,
                css: { opacity: opacityFlt }
            }));
        }
    }
    if (shapeObj.markStr) {
        svgEl.add(this.path({ attr: { d: shapeObj.markStr } }));
    }
    if (shapeObj.labelArr) {
        for (let labelObj of shapeObj.labelArr) {
            svgEl.add(this.svgText({
                attr: { x: labelObj.xInt, y: labelObj.yInt },
                textContent: labelObj.labelStr,
                css: labelObj.labelCss
            }));
        }
    }
    return svgEl;
};

Page.prototype.paragraph = function(paragraphStr) {
    let paragraphEl = this.p({ css: { fontSize: '14px', margin: '4px 0 8px 0', lineHeight: 1.4 } });
    if (/^\$\$[\s\S]*\$\$$/.test(paragraphStr)) {
        Core.copyCss({ textAlign: 'center', margin: '10px 0' }, paragraphEl);
        paragraphEl.add(this.math(paragraphStr.slice(2, -2)));
    } else if (paragraphStr.startsWith('△')) {
        let wordArr = paragraphStr.split(' ');
        paragraphEl.add(this.figure(wordArr[1], wordArr.slice(2)));
    } else {
        paragraphEl.add(this.markdown(paragraphStr));
    }
    return paragraphEl;
};
