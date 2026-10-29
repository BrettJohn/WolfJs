# WolfJs

Wolf's front-end kit: builders, pages, popups, grids, toggles, uploads and maths, as plain JS classes. It needs no
Wolf backend, no bundler and no build step: each file is one global class (or prototype extensions of one), loaded
with a `<script>` tag.

The Wolf apps load it from `Core/WolfJs/` through PHP's `jsInclude`. Any other front end, such as a static page
served by nginx, lists the tags itself.

## Files

| File | What it is |
|---|---|
| `Theme.js` | Default colours and css objects, added to the page's `Base` class |
| `Entity.js`, `Core.js`, `Is.js`, `Diff.js`, `Matrix.js`, `Timer.js` | Static helpers |
| `WolfElement.js` | Builders: `div()`, `a()`, `button()`, `markdown()`, rows and columns |
| `Page.js`, `Container.js`, `Middled.js`, `MiddledController.js` | Page classes, in that order: each extends the last |
| `BackEnd.js` | `fetchApi()` and the loading overlay |
| `Grid.js`, `Dropdown.js`, `Toggle.js`, `Upload.js`, `Dock.js`, `Scene.js`, `Slider.js`, `Math.js` | Extras on `Page.prototype` |
| `Lecturer.js` | `Lecturer`: reads text aloud with a 3D face |

## Use it without PHP

Load the files in this order: `Base`, the kit's theme, your theme, the classes, then your own code. The kit calls a
global `backEnd(inputObj)` (grids, deletes), so the page defines one for its own API.

```html
<body>
<script>class Base {}</script>
<script src="wolf/Theme.js"></script>
<script>
class Theme extends Base {
    configureTheme() {
        this.defaultTheme();
        this.color2 = '#6ea8fe';
    }
}
</script>
<script src="wolf/Entity.js"></script>
<script src="wolf/Core.js"></script>
<script src="wolf/WolfElement.js"></script>
<script src="wolf/Page.js"></script>
<script src="wolf/Container.js"></script>
<script src="wolf/Middled.js"></script>
<script src="wolf/MiddledController.js"></script>
<script src="wolf/Is.js"></script>
<script src="wolf/Timer.js"></script>
<script src="wolf/BackEnd.js"></script>
<script src="wolf/Grid.js"></script>
<script>
let backendUrlStr = 'https://api.example.com/';

async function backEnd(inputObj) {
    startLoading();
    try {
        let resultObj = await fetchApi(backendUrlStr, inputObj);
        return resultObj.response;
    } finally {
        stopLoading();
    }
}

class Home extends Container {
    async loadPage() {
        this.containerEl.add(this.h1({ textContent: 'Hello from WolfJs' }));
    }
}

let pageObj = new Home;
pageObj.configurePage({ title: 'Home', colSize: 'md' });
pageObj.loadPage();
</script>
```

The default theme loads `Assets/Images/back.png` (background), `logo.png` and `main.png` (tab icon). Ship those, or
set `backCss`, `logoSrcStr` and `titleImgPathStr` in your `configureTheme()`.

Controls read their look from theme methods (`inputCss`, `buttonHoverCss`, `dropdownThemeObj`, `toggleThemeObj`,
`sliderThemeObj`, `gridThemeObj`, `gridControlCss`, `gridButtonCss`, `gridHeadCss`, `gridCellCss`). They read the
colours when a control is built, so a colour set in `configureTheme()` reaches them. Override one in your `Theme` class:
`gridHeadCss() { return { ...super.gridHeadCss(), fontSize: '18px' }; }`.

`Slider.js`: `this.slider({ min, max, step, value, css })` returns a range input with a filled track and a thumb that
glows on hover and focus. Its colours and sizes come from `sliderThemeObj`; the first slider on a page adds the rules.

`Lecturer.js` (load `Matrix.js`, `Scene.js` and `Slider.js` first) reads text aloud with a 3D face. Build it with
`lecturerObj = new Lecturer`, `lecturerObj.pageObj = this`, `lecturerObj.build()`; place `lecturerObj.panelEl` on the
page and set `lecturerObj.onShowFn` to relayout when it opens or closes. `lecturerObj.speakBtn(readElArr)` returns a
speak icon for the top-right corner of a `position: relative` holder (leave room for it); a click reads `readElArr`
with the browser's voice, highlighting each word and moving the lips. It reads block by block: headings speak slower
and lower the higher their level (a bold block counts as a small heading), and every block ends with a pause, longer
after a heading. Sliders under the face set volume and speed; they and ♀/♂ are remembered in the browser. With no
voice on the device it reads along without sound. For another voice, override `prepareVoice()`,
`speakChunk(chunkObj)`, `chunkChar(nowFlt)` and `applySliders()` in a subclass. Its look comes from `speakBtnCss`,
`spokenWordCss`, `lecturerPanelCss` and `lecturerThemeObj`.

Put the release in the folder name (`wolf/v1.0.0/`) so browsers fetch new files after an upgrade.

`Page.checkUser()` does nothing here. A front end with logins overrides it, as Wolf's own `Core/Wolf.js` does.
