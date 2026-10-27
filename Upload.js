Page.prototype.imageUpload = function imageUpload(nameStr, html = Core.splitCamel(nameStr, '\n'), maxSideInt = 800) {
    this.addCss(`input[type="file"] { display: none !important; }`);
    let div = this.div({ css: this.centerTextCss });
    let idStr = 'file-upload' + this.imageUploadCountInt;
    let label = this.label({ for: idStr, html,
        css: { display: 'block', color: this.color2, cursor: 'pointer', padding: '4px', whiteSpace: 'pre-line',
            border: '1px dashed ' + this.color2, borderRadius: '5px' },
        hover: { textDecoration: 'underline', color: this.color3 }
    });
    div.add(label);
    let img = this.img({ css: { maxWidth: '100%', maxHeight: '180px', marginTop: '8px', borderRadius: '5px' } });
    img.style.display = 'none';

    img.addEventListener('load', () => img.style.display = '');
    div.add(img);
    let input = this.input({ type: 'file', id: idStr, onchange: async () => {
        let srcStr = await Core.readFile(input);

        if (srcStr.startsWith('data:image/gif')) {
            img.src = srcStr;
            return;
        }
        let reducedImg = new Image;
        let canvas = this.canvas();

        reducedImg.onload = function() {
            let ratioFlt = Math.min(1, maxSideInt / Math.max(reducedImg.width, reducedImg.height));
            canvas.width = Math.round(reducedImg.width * ratioFlt);
            canvas.height = Math.round(reducedImg.height * ratioFlt);
            let ctxObj = canvas.getContext('2d');
            ctxObj.drawImage(reducedImg, 0, 0, canvas.width, canvas.height);
            let newSrcStr = canvas.toDataURL('image/webp', 0.85);

            if (!newSrcStr.startsWith('data:image/webp')) {
                let alphaArr = ctxObj.getImageData(0, 0, canvas.width, canvas.height).data;
                let transparentBool = false;
                for (let i = 3; i < alphaArr.length && !transparentBool; i += 4) {
                    transparentBool = alphaArr[i] < 255;
                }
                newSrcStr = transparentBool ? newSrcStr : canvas.toDataURL('image/jpeg', 0.85);
            }
            let acceptedBool = /^data:image\/(png|jpeg|webp);/.test(srcStr);
            img.src = acceptedBool && srcStr.length <= newSrcStr.length ? srcStr : newSrcStr;
        };
        reducedImg.src = srcStr;
    }});
    this.imageUploadCountInt++;
    label.add(input);
    return { div, input, img };
}