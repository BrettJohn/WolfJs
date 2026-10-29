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
    this.inputThemeCss = {};
    this.buttonHoverThemeCss = {};
    this.dropdownThemeCss = {};
    this.gridThemeCss = {};
    this.toggleThemeCss = {};
}