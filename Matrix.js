class Matrix {
    static identity() {
        return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }

    static multiply(leftArr, rightArr) {
        let resultArr = new Float32Array(16);
        for (let columnInt = 0; columnInt < 4; columnInt++) {
            for (let rowInt = 0; rowInt < 4; rowInt++) {
                let sumFlt = 0;
                for (let k = 0; k < 4; k++) {
                    sumFlt += leftArr[k * 4 + rowInt] * rightArr[columnInt * 4 + k];
                }
                resultArr[columnInt * 4 + rowInt] = sumFlt;
            }
        }
        return resultArr;
    }

    static translate(xFlt, yFlt, zFlt) {
        let resultArr = Matrix.identity();
        resultArr.set([xFlt, yFlt, zFlt], 12);
        return resultArr;
    }

    static scale(xFlt, yFlt, zFlt) {
        return new Float32Array([xFlt, 0, 0, 0, 0, yFlt, 0, 0, 0, 0, zFlt, 0, 0, 0, 0, 1]);
    }

    static rotateX(angleFlt) {
        let cosFlt = Math.cos(angleFlt);
        let sinFlt = Math.sin(angleFlt);
        return new Float32Array([1, 0, 0, 0, 0, cosFlt, sinFlt, 0, 0, -sinFlt, cosFlt, 0, 0, 0, 0, 1]);
    }

    static rotateY(angleFlt) {
        let cosFlt = Math.cos(angleFlt);
        let sinFlt = Math.sin(angleFlt);
        return new Float32Array([cosFlt, 0, -sinFlt, 0, 0, 1, 0, 0, sinFlt, 0, cosFlt, 0, 0, 0, 0, 1]);
    }

    static rotateZ(angleFlt) {
        let cosFlt = Math.cos(angleFlt);
        let sinFlt = Math.sin(angleFlt);
        return new Float32Array([cosFlt, sinFlt, 0, 0, -sinFlt, cosFlt, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }

    static ortho(halfWidthFlt, halfHeightFlt, nearFlt, farFlt) {
        let depthFlt = farFlt - nearFlt;
        return new Float32Array([
            1 / halfWidthFlt, 0, 0, 0,
            0, 1 / halfHeightFlt, 0, 0,
            0, 0, -2 / depthFlt, 0,
            0, 0, -(farFlt + nearFlt) / depthFlt, 1
        ]);
    }

    static lookAt(eyeArr, targetArr, upArr) {
        let zArr = Matrix.normalize(eyeArr.map((valueFlt, i) => valueFlt - targetArr[i]));
        let xArr = Matrix.normalize(Matrix.cross(upArr, zArr));
        let yArr = Matrix.cross(zArr, xArr);
        let dotFn = (axisArr) => -axisArr.reduce((sumFlt, valueFlt, i) => sumFlt + valueFlt * eyeArr[i], 0);
        return new Float32Array([
            xArr[0], yArr[0], zArr[0], 0,
            xArr[1], yArr[1], zArr[1], 0,
            xArr[2], yArr[2], zArr[2], 0,
            dotFn(xArr), dotFn(yArr), dotFn(zArr), 1
        ]);
    }

    static cross(leftArr, rightArr) {
        return [
            leftArr[1] * rightArr[2] - leftArr[2] * rightArr[1],
            leftArr[2] * rightArr[0] - leftArr[0] * rightArr[2],
            leftArr[0] * rightArr[1] - leftArr[1] * rightArr[0]
        ];
    }

    static normalize(vectorArr) {
        let lengthFlt = Math.hypot(...vectorArr) || 1;
        return vectorArr.map((valueFlt) => valueFlt / lengthFlt);
    }
}
