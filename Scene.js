Page.prototype.scene = function(obj) {
    let sceneObj = {
        partArr: [],
        viewArr: obj.viewArr,
        centerArr: obj.centerArr,
        radiusFlt: obj.radiusFlt,
        lightArr: Matrix.normalize(obj.lightArr ?? [-0.5, -0.7, 0.8]),
        gapInt: obj.gapInt ?? 2,
        frameInt: 0,
        meshObj: {},
        singleBool: obj.singleBool === true,
        viewInt: 0
    };
    sceneObj.canvas = this.canvas({ css: { width: '100%', height: '100%', display: 'block' } });
    sceneObj.div = this.div({
        css: {
            position: 'relative',
            width: '100%',
            aspectRatio: obj.aspectStr ?? '4 / 3',
            borderRadius: '14px',
            overflow: 'hidden',
            backgroundColor: '#0b0e15',
            backgroundImage: 'radial-gradient(circle at 50% 42%, #242c3d 0%, #121722 55%, #0b0e15 100%)',
            backgroundSize: obj.singleBool ? '100% 100%' : '50% 50%',
            ...obj.css
        }
    }).add(sceneObj.canvas);
    let chipCss = {
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: this.color1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        ...obj.labelCss
    };
    if (sceneObj.singleBool) {
        let selectorDiv = this.div({
            css: {
                position: 'absolute',
                left: '16px',
                top: '16px',
                zIndex: 4,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px'
            }
        });
        let nameArr = sceneObj.viewArr.map((viewObj) => viewObj.nameStr);
        sceneObj.chipArr = [...nameArr, ...nameArr.length > 1 ? ['All'] : []].map(
            (nameStr, i) => this.span({
                textContent: nameStr,
                onclick: () => sceneObj.setView(i),
                css: { ...chipCss, cursor: 'pointer', backgroundColor: 'rgba(8, 10, 14, 0.85)' }
            })
        );
        sceneObj.chipArr.forEach((chipEl) => selectorDiv.add(chipEl));
        sceneObj.div.add(selectorDiv);

        // View diamond
        let tipLbl = this.span({
            css: {
                ...chipCss,
                display: 'inline-block',
                marginTop: '8px',
                opacity: 0,
                transition: 'opacity .2s',
                backgroundColor: 'rgba(8, 10, 14, 0.9)',
                whiteSpace: 'nowrap'
            }
        });
        let diamondSvg = this.svg({
            attr: { viewBox: '-50 -50 100 100' },
            css: { width: '104px', height: '104px', overflow: 'visible', margin: '0 auto' }
        });
        sceneObj.diamondDiv = this.div({
            css: {
                position: 'absolute',
                left: '50%',
                top: '50%',
                zIndex: 4,
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
            }
        }).add(diamondSvg).add(this.div().add(tipLbl));
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].slice(0, sceneObj.viewArr.length).forEach(([xInt, yInt], i) => {
            let moveFn = (stepInt) => `translate(${stepInt * xInt}px, ${stepInt * yInt}px)`;
            let motionCss = { transform: moveFn(3), transition: 'transform .2s, fill .2s, stroke .2s, filter .2s' };
            let triangleEl = this.path({
                attr: { d: `M0,${46 * yInt} L${46 * xInt},0 L0,0 Z` },
                css: {
                    ...motionCss,
                    fill: 'rgba(8, 10, 14, 0.85)',
                    stroke: this.color2,
                    strokeWidth: '1.5',
                    cursor: 'pointer'
                }
            });
            let arrowEl = this.path({
                attr: {
                    d: `M${9 * xInt},${20 * yInt} L${20 * xInt},${20 * yInt}
                L${20 * xInt},${9 * yInt}`
                },
                css: {
                    ...motionCss,
                    stroke: this.color2,
                    strokeWidth: '3.5',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    pointerEvents: 'none'
                }
            });
            let hoverFn = (onBool) => {
                Core.copyCss({
                    transform: moveFn(onBool ? 10 : 3),
                    fill: onBool ? this.color2 : 'rgba(8, 10, 14, 0.85)',
                    filter: onBool ? `drop-shadow(0 0 8px ${this.color2})` : 'none'
                }, triangleEl);
                Core.copyCss({ transform: moveFn(onBool ? 10 : 3), stroke: onBool ? '#111111' : this.color2 }, arrowEl);
                tipLbl.textContent = `Switch to ${sceneObj.viewArr[i].nameStr}`;
                tipLbl.style.opacity = onBool ? 1 : 0;
            };
            triangleEl.addEventListener('mouseenter', () => hoverFn(true));
            triangleEl.addEventListener('mouseleave', () => hoverFn(false));
            triangleEl.onclick = () => {
                hoverFn(false);
                sceneObj.setView(i);
            };
            diamondSvg.add(triangleEl).add(arrowEl);
        });
        sceneObj.div.add(sceneObj.diamondDiv);
    } else {
        sceneObj.viewArr.forEach(
            (viewObj, i) => sceneObj.div.add(
                this.span({
                    textContent: viewObj.nameStr,
                    css: {
                        ...chipCss,
                        position: 'absolute',
                        left: i % 2 ? `calc(50% + ${sceneObj.gapInt + 16}px)` : '16px',
                        top: i < 2 ? '16px' : `calc(50% + ${sceneObj.gapInt + 16}px)`,
                        pointerEvents: 'none'
                    }
                })
            )
        );
    }
    sceneObj.setView = (viewInt) => {
        sceneObj.viewInt = viewInt;
        sceneObj.div.style.backgroundSize = viewInt < sceneObj.viewArr.length ? '100% 100%' : '50% 50%';
        if (sceneObj.diamondDiv) {
            sceneObj.diamondDiv.style.display = viewInt < sceneObj.viewArr.length ? 'none' : 'block';
        }
        sceneObj.chipArr.forEach(
            (chipEl, i) => Core.copyCss({
                outline: i === viewInt ? '1px solid' : 'none',
                opacity: i === viewInt ? 1 : 0.6
            }, chipEl)
        );
        sceneObj.onViewFn?.(viewInt);
        sceneObj.render();
    };

    let glObj = sceneObj.canvas.getContext('webgl', { antialias: true, premultipliedAlpha: false });
    sceneObj.glObj = glObj;
    if (Is.blank(glObj)) {
        sceneObj.div.add(this.p({ textContent: 'This browser cannot draw 3D (WebGL is off).' }));
        sceneObj.render = () => {};
        return sceneObj;
    }
    let programObj = glObj.createProgram();
    let shaderMatrix = [
        [
            glObj.VERTEX_SHADER,
            `
        attribute vec3 position;
        attribute vec3 normal;
        uniform mat4 model;
        uniform mat4 viewProjection;
        varying vec3 worldNormal;
        void main() {
            worldNormal = (model * vec4(normal, 0.0)).xyz;
            gl_Position = viewProjection * model * vec4(position, 1.0);
        }`
        ],
        [
            glObj.FRAGMENT_SHADER,
            `
        precision mediump float;
        uniform vec3 color;
        uniform vec3 light;
        uniform vec3 viewDirection;
        uniform float shine;
        uniform float flatShade;
        varying vec3 worldNormal;
        void main() {
            vec3 normal = normalize(worldNormal);
            float key = max(dot(normal, light), 0.0);
            float head = max(dot(normal, viewDirection), 0.0);
            float sky = 0.5 + 0.5 * normal.z;
            float specular = pow(max(dot(normal, normalize(light + viewDirection)), 0.0), 48.0) * shine;
            vec3 lit = color * (0.22 + 0.16 * sky + 0.5 * key + 0.3 * head) + vec3(specular);
            gl_FragColor = vec4(mix(pow(lit, vec3(0.9)), color, flatShade), 1.0);
        }`
        ]
    ];
    for (let shaderArr of shaderMatrix) {
        let shaderObj = glObj.createShader(shaderArr[0]);
        glObj.shaderSource(shaderObj, shaderArr[1]);
        glObj.compileShader(shaderObj);
        glObj.attachShader(programObj, shaderObj);
    }
    glObj.linkProgram(programObj);
    glObj.useProgram(programObj);
    sceneObj.locationObj = {
        position: glObj.getAttribLocation(programObj, 'position'),
        normal: glObj.getAttribLocation(programObj, 'normal'),
        model: glObj.getUniformLocation(programObj, 'model'),
        viewProjection: glObj.getUniformLocation(programObj, 'viewProjection'),
        color: glObj.getUniformLocation(programObj, 'color'),
        light: glObj.getUniformLocation(programObj, 'light'),
        viewDirection: glObj.getUniformLocation(programObj, 'viewDirection'),
        shine: glObj.getUniformLocation(programObj, 'shine'),
        flatShade: glObj.getUniformLocation(programObj, 'flatShade')
    };
    glObj.enableVertexAttribArray(sceneObj.locationObj.position);
    glObj.enableVertexAttribArray(sceneObj.locationObj.normal);

    let boxArr = [];
    for (let faceInt = 0; faceInt < 6; faceInt++) {
        let axisInt = Math.floor(faceInt / 2);
        let sideFlt = faceInt % 2 ? -0.5 : 0.5;
        let normalArr = [0, 0, 0];
        normalArr[axisInt] = sideFlt * 2;
        for (let cornerArr of [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]]) {
            let pointArr = [0, 0, 0];
            pointArr[axisInt] = sideFlt;
            pointArr[(axisInt + 1) % 3] = cornerArr[0] / 2;
            pointArr[(axisInt + 2) % 3] = cornerArr[1] / 2;
            boxArr.push(...pointArr, ...normalArr);
        }
    }
    let cylinderArr = [];
    let segmentInt = 32;
    for (let i = 0; i < segmentInt; i++) {
        let rimFn = (stepInt) => {
            let angleFlt = stepInt / segmentInt * Math.PI * 2;
            return [Math.cos(angleFlt) / 2, Math.sin(angleFlt) / 2];
        };
        let startArr = rimFn(i);
        let endArr = rimFn(i + 1);
        let side3dArr = [
            [startArr, -0.5],
            [endArr, -0.5],
            [endArr, 0.5],
            [startArr, -0.5],
            [endArr, 0.5],
            [startArr, 0.5]
        ];
        for (let sideArr of side3dArr) {
            let pointArr = sideArr[0];
            let zFlt = sideArr[1];
            cylinderArr.push(pointArr[0], pointArr[1], zFlt, pointArr[0] * 2, pointArr[1] * 2, 0);
        }
        for (let zFlt of [-0.5, 0.5]) {
            for (let pointArr of [[0, 0], startArr, endArr]) {
                cylinderArr.push(pointArr[0], pointArr[1], zFlt, 0, 0, zFlt * 2);
            }
        }
    }
    let vertexObj = { box: boxArr, cylinder: cylinderArr };
    for (let meshStr in vertexObj) {
        let vertexArr = vertexObj[meshStr];
        let bufferObj = glObj.createBuffer();
        glObj.bindBuffer(glObj.ARRAY_BUFFER, bufferObj);
        glObj.bufferData(glObj.ARRAY_BUFFER, new Float32Array(vertexArr), glObj.STATIC_DRAW);
        sceneObj.meshObj[meshStr] = { bufferObj, countInt: vertexArr.length / 6 };
    }

    sceneObj.group = (parentObj = null) => ({ parentObj, offsetArr: [0, 0, 0] });
    sceneObj.place = (partObj) => {
        let axisObj = { x: Matrix.rotateY(Math.PI / 2), y: Matrix.rotateX(-Math.PI / 2), z: Matrix.identity() };
        partObj.localArr = Matrix.multiply(
            Matrix.translate(...partObj.positionArr),
            Matrix.multiply(
                Matrix.rotateZ(partObj.angleFlt ?? 0),
                Matrix.multiply(axisObj[partObj.axisStr ?? 'z'], Matrix.scale(...partObj.sizeArr))
            )
        );
        sceneObj.render();
        return partObj;
    };
    sceneObj.add = (partObj) => {
        sceneObj.partArr.push(partObj);
        return sceneObj.place(partObj);
    };
    sceneObj.addLines = (partObj) => {
        let vertexArr = new Float32Array(partObj.pointArr.length * 2);
        partObj.pointArr.forEach((valueFlt, i) => vertexArr[Math.floor(i / 3) * 6 + i % 3] = valueFlt);
        for (let i = 5; i < vertexArr.length; i += 6) {
            vertexArr[i] = 1;
        }
        partObj.bufferObj = glObj.createBuffer();
        glObj.bindBuffer(glObj.ARRAY_BUFFER, partObj.bufferObj);
        glObj.bufferData(glObj.ARRAY_BUFFER, vertexArr, glObj.STATIC_DRAW);
        Object.assign(
            partObj,
            {
                meshStr: 'lines',
                countInt: partObj.pointArr.length / 3,
                splitInt: 0,
                localArr: Matrix.identity()
            }
        );
        sceneObj.partArr.push(partObj);
        sceneObj.render();
        return partObj;
    };
    sceneObj.addMesh = (partObj) => {
        partObj.bufferObj = glObj.createBuffer();
        glObj.bindBuffer(glObj.ARRAY_BUFFER, partObj.bufferObj);
        glObj.bufferData(glObj.ARRAY_BUFFER, partObj.vertexArr, glObj.STATIC_DRAW);
        let countInt = partObj.vertexArr.length / 6;
        Object.assign(partObj, { meshStr: 'mesh', countInt, localArr: Matrix.identity() });
        sceneObj.partArr.push(partObj);
        sceneObj.render();
        return partObj;
    };
    sceneObj.remove = (removeArr) => {
        removeArr.filter((partObj) => partObj.bufferObj)
            .forEach((partObj) => glObj.deleteBuffer(partObj.bufferObj));
        sceneObj.partArr = sceneObj.partArr.filter((partObj) => !removeArr.includes(partObj));
        sceneObj.render();
    };
    sceneObj.render = () => {
        if (sceneObj.frameInt) {
            return;
        }
        sceneObj.frameInt = requestAnimationFrame(() => {
            sceneObj.frameInt = 0;
            sceneObj.draw();
        });
    };
    sceneObj.draw = () => {
        let canvas = sceneObj.canvas;
        let locationObj = sceneObj.locationObj;
        canvas.width = Math.round(canvas.clientWidth * devicePixelRatio);
        canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
        let halfWidthInt = Math.floor(canvas.width / 2);
        let halfHeightInt = Math.floor(canvas.height / 2);
        let gapInt = Math.round(sceneObj.gapInt * devicePixelRatio);
        let oneBool = sceneObj.singleBool && sceneObj.viewInt < sceneObj.viewArr.length;
        let rectArr = oneBool ? [[sceneObj.viewInt, 0, 0, canvas.width, canvas.height]]
            : sceneObj.viewArr.slice(0, 4).map(
                (viewObj, i) => [
                    i,
                    i % 2 * halfWidthInt + (i % 2 ? gapInt : 0),
                    i < 2 ? halfHeightInt + gapInt : 0,
                    halfWidthInt - gapInt,
                    halfHeightInt - gapInt
                ]
            );
        let drawFn = (partObj, firstInt, countInt, colorArr, modeInt) => {
            let modelArr = partObj.localArr;
            for (let groupObj = partObj.groupObj; groupObj; groupObj = groupObj.parentObj) {
                modelArr = Matrix.multiply(Matrix.translate(...groupObj.offsetArr), modelArr);
            }
            glObj.bindBuffer(glObj.ARRAY_BUFFER, partObj.bufferObj ?? sceneObj.meshObj[partObj.meshStr].bufferObj);
            glObj.vertexAttribPointer(locationObj.position, 3, glObj.FLOAT, false, 24, 0);
            glObj.vertexAttribPointer(locationObj.normal, 3, glObj.FLOAT, false, 24, 12);
            glObj.uniformMatrix4fv(locationObj.model, false, modelArr);
            glObj.uniform3fv(locationObj.color, colorArr);
            glObj.uniform1f(locationObj.shine, partObj.shineFlt ?? 0.25);
            glObj.uniform1f(locationObj.flatShade, modeInt === glObj.LINES ? 1 : 0);
            glObj.drawArrays(modeInt, firstInt, countInt);
        };
        glObj.enable(glObj.SCISSOR_TEST);
        glObj.uniform3fv(locationObj.light, sceneObj.lightArr);
        for (let rectViewArr of rectArr) {
            let viewObj = sceneObj.viewArr[rectViewArr[0]];
            let xInt = rectViewArr[1];
            let yInt = rectViewArr[2];
            let widthInt = rectViewArr[3];
            let heightInt = rectViewArr[4];
            let radiusFlt = viewObj.radiusFlt ?? sceneObj.radiusFlt;
            let centerArr = viewObj.centerArr ?? sceneObj.centerArr;
            for (let groupObj = viewObj.groupObj; groupObj; groupObj = groupObj.parentObj) {
                centerArr = centerArr.map((valueFlt, k) => valueFlt + groupObj.offsetArr[k]);
            }
            glObj.viewport(xInt, yInt, widthInt, heightInt);
            glObj.scissor(xInt, yInt, widthInt, heightInt);
            glObj.clearColor(0, 0, 0, 0);
            glObj.clear(glObj.COLOR_BUFFER_BIT | glObj.DEPTH_BUFFER_BIT);
            let directionArr = Matrix.normalize(viewObj.eyeArr);
            glObj.uniform3fv(locationObj.viewDirection, directionArr);
            let eyeArr = directionArr.map((valueFlt, k) => centerArr[k] + valueFlt * radiusFlt * 4);
            let projectionArr = Matrix.ortho(radiusFlt * widthInt / heightInt, radiusFlt, radiusFlt, radiusFlt * 7);
            glObj.uniformMatrix4fv(
                locationObj.viewProjection,
                false,
                Matrix.multiply(projectionArr, Matrix.lookAt(eyeArr, centerArr, viewObj.upArr))
            );
            glObj.enable(glObj.DEPTH_TEST);
            sceneObj.partArr.filter((partObj) => partObj.meshStr !== 'lines').forEach(
                (partObj) => drawFn(
                    partObj,
                    0,
                    partObj.countInt ?? sceneObj.meshObj[partObj.meshStr].countInt,
                    partObj.colorArr,
                    glObj.TRIANGLES
                )
            );
            glObj.disable(glObj.DEPTH_TEST);
            sceneObj.partArr.filter((partObj) => partObj.meshStr === 'lines').forEach((partObj) => {
                if (partObj.doneColorArr) {
                    drawFn(partObj, 0, partObj.splitInt, partObj.doneColorArr, glObj.LINES);
                }
                drawFn(partObj, partObj.splitInt, partObj.countInt - partObj.splitInt, partObj.colorArr, glObj.LINES);
            });
        }
    };
    new ResizeObserver(() => sceneObj.render()).observe(sceneObj.canvas);
    if (sceneObj.singleBool) {
        sceneObj.setView(0);
    }
    return sceneObj;
};
