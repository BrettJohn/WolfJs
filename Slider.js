Page.prototype.slider = function(obj) {
    let sliderCssBool = this.sliderCssBool;

    if (!sliderCssBool) {
        this.addCssObj(this.sliderCssObj());
        this.sliderCssBool = true;
    }
    let slider = this.core({ type: 'range', ...obj }, 'input');
    slider.dataset.slider = 'true';
    let paintFn = () => {
        let minFlt = Number(slider.min);
        let maxFlt = Number(slider.max);
        let valueFlt = Number(slider.value);
        let fillFlt = (valueFlt - minFlt) / (maxFlt - minFlt) * 100;
        slider.style.setProperty('--fill', `${fillFlt}%`);
    };
    slider.addEventListener('input', paintFn);
    paintFn();
    return slider;
};

Page.prototype.sliderCssObj = function() {
    let themeObj = this.sliderThemeObj();
    let fillColor = themeObj.fillColor;
    let trackColor = themeObj.trackColor;
    let thumbColor = themeObj.thumbColor;
    let heightStr = themeObj.heightStr;
    let thumbStr = themeObj.thumbStr;

    let ringStr = `0 0 0 3px color-mix(in srgb, ${fillColor} 35%, transparent)`;
    let glowStr = `0 0 12px ${fillColor}`;
    let thumbCss = {
        width: thumbStr,
        height: thumbStr,
        borderRadius: '50%',
        border: 'none',
        background: thumbColor,
        boxShadow: ringStr,
        transition: 'transform .15s, box-shadow .15s'
    };
    let hoverCss = { transform: 'scale(1.2)', boxShadow: `${ringStr}, ${glowStr}` };
    return {
        'input[data-slider]': {
            appearance: 'none',
            height: heightStr,
            margin: '8px 0',
            borderRadius: heightStr,
            outline: 'none',
            cursor: 'pointer',
            background: `linear-gradient(to right, ${fillColor} var(--fill), ${trackColor} var(--fill))`
        },
        'input[data-slider]::-webkit-slider-thumb': { ...thumbCss, appearance: 'none' },
        'input[data-slider]::-moz-range-thumb': thumbCss,
        'input[data-slider]:hover::-webkit-slider-thumb': hoverCss,
        'input[data-slider]:focus-visible::-webkit-slider-thumb': hoverCss,
        'input[data-slider]:hover::-moz-range-thumb': hoverCss,
        'input[data-slider]:focus-visible::-moz-range-thumb': hoverCss
    };
};
