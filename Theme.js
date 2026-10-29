Base.prototype.defaultTheme = function() {
    this.color0 = '#000000';
    this.color1 = '#FFFFFF';
    this.color2 = '#006F00';
    this.color3 = '#FFA500';
    this.color4 = '#222233';
    this.color5 = 'orange';
    this.color6 = '#332222';
    this.color7 = '#272727';
    this.color8 = '#F8F8F8';
    this.color9 = '#E0E0E0';
    this.color10 = '#FEFEFE';
    this.color11 = '#C4C4C4';
    this.color12 = '#F7F7F7';
    this.color13 = '#9B0001';
    this.fontCss = {
        fontFamily: 'Jaldi',
        fontSize: '20px'
    };
    this.borderCss = '6px solid #CCCCCC';
    this.scrollThumbColor = 'rgba(255, 255, 255, 0.22)';
    this.liftCss = { transition: 'transform .15s, box-shadow .15s, background-color .15s' };
    this.liftHoverCss = { transform: 'translateY(-3px)', boxShadow: '0 14px 28px rgba(0, 0, 0, 0.5)' };
    this.glowColor = '#7FA8FF';
    this.goodGlowColor = '#2EE87A';
    this.badGlowColor = '#FF3B3B';
    this.infoGlowColor = '#FFFFFF';
    this.backCss = { backgroundImage: "url('Assets/Images/back.png')", backgroundSize: 'cover' };
    this.logoSrcStr = 'Assets/Images/logo.png';
    this.titleImgPathStr = 'Assets/Images/main.png';
}

Base.prototype.inputCss = function() {
    return {
        display: 'inline-block',
        margin: '0px',
        padding: '0px 0px 0px 5px',
        height: '28px',
        color: this.color7,
        background: this.color9,
        border: '0.25px solid ' + this.color2,
        boxShadow: 'inset 0px 4px 4px rgba(0, 0, 0, 0.25)',
        borderRadius: '5px'
    };
}

Base.prototype.buttonHoverCss = function() {
    return { backgroundColor: this.color2, color: this.color1 };
}

Base.prototype.dropdownThemeObj = function() {
    return {
        btnBack: this.color9,
        btnOpenBack: this.color11,
        btnColor: this.color7,
        listBack: this.color9,
        optionBack: this.color11,
        optionColor: this.color7,
        optionSelectedBorder: '1px solid ' + this.color2
    };
}

Base.prototype.toggleThemeObj = function() {
    return {
        back: 'rgba(255, 255, 255, 0.05)',
        color: 'rgba(255, 255, 255, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        selectedBack: this.color4,
        selectedColor: this.color1,
        selectedOutline: '1px dashed ' + this.color2
    };
}

Base.prototype.gridThemeObj = function() {
    return {
        controlsColor: this.color1,
        controlsBack: 'rgba(0,0,0,0.75)',
        controlsDivider: '1px solid rgba(255,255,255,0.12)',
        rowBack: 'rgba(0,0,0,0.6)',
        rowColor: this.color1,
        headBack: 'rgba(0,0,0,0.85)',
        headColor: 'rgba(255,255,255,0.75)',
        headBorder: 'none',
        radius: '6px',
        controlsRadius: '5px',
        border: '1px solid rgba(255,255,255,0.14)',
        shadow: '0 10px 30px rgba(0,0,0,0.6)',
        hoverBack: `color-mix(in srgb, ${this.color2} 25%, transparent)`,
        hoverColor: '#fff'
    };
}

Base.prototype.gridControlCss = function() {
    return { height: '34px', margin: 0 };
}

Base.prototype.gridButtonCss = function() {
    return this.gridControlCss();
}

Base.prototype.gridHeadCss = function() {
    return {
        fontSize: '16px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        padding: '14px 8px',
        borderBottom: '2px solid ' + this.color2
    };
}

Base.prototype.gridCellCss = function() {
    return { border: 'none', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '14px 8px', fontSize: '19px' };
}

Base.prototype.speakBtnCss = function() {
    return {
        position: 'absolute',
        top: '6px',
        right: '6px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        cursor: 'pointer',
        color: 'inherit',
        opacity: 0.75,
        backgroundColor: 'rgba(127, 127, 127, 0.15)'
    };
}

Base.prototype.spokenWordCss = function() {
    return { backgroundColor: 'rgba(255, 200, 60, 0.45)', borderRadius: '3px' };
}

Base.prototype.lecturerPanelCss = function() {
    return {
        boxSizing: 'border-box',
        padding: '10px',
        borderRadius: '14px',
        color: this.color1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
        transformOrigin: 'bottom right',
        transition: 'transform .25s, opacity .25s'
    };
}

Base.prototype.sliderThemeObj = function() {
    return {
        fillColor: this.glowColor,
        trackColor: 'rgba(127, 127, 127, 0.3)',
        thumbColor: '#FFFFFF',
        heightStr: '6px',
        thumbStr: '16px'
    };
}

Base.prototype.lecturerThemeObj = function() {
    return {
        skinArr: [0.86, 0.66, 0.53],
        noseArr: [0.82, 0.6, 0.48],
        eyeArr: [0.96, 0.96, 0.95],
        pupilArr: [0.14, 0.11, 0.1],
        mouthArr: [0.3, 0.07, 0.09],
        femaleObj: { hairArr: [0.36, 0.2, 0.1], lipArr: [0.8, 0.34, 0.4], shirtArr: [0.62, 0.3, 0.55] },
        maleObj: { hairArr: [0.17, 0.12, 0.1], lipArr: [0.7, 0.43, 0.4], shirtArr: [0.24, 0.32, 0.46] }
    };
}
