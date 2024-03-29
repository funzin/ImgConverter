# ImgConverter
<p align="center">
    <img src="./resource/image/thumbnail.png" alt="imgconverter" width="60%" height="60%" />
</p>

<p align="center">
  <a href=https://github.com/funzin/ImgConverter/actions/workflows/test.yml>
    <img src=https://github.com/funzin/ImgConverter/actions/workflows/test.yml/badge.svg />
  </a>
  <a href=https://developer.mozilla.org/ja/docs/Web/JavaScript>
    <img src="http://img.shields.io/badge/javascript-yellow.svg?style=flat" alt="Language" />
  </a>
  <a href=https://chrome.google.com/webstore/detail/imgconverter-for-github/pkgimcoeodgcdfnidhgijpopkfhbcomm>
    <img src="http://img.shields.io/badge/chrome extensions-gray.svg?style=flat" />
  </a>
  <a href=https://addons.mozilla.org/en-US/firefox/addon/imgconverter/>
    <img src="http://img.shields.io/badge/firefox_addons-purple.svg?style=flat" />
  </a>
  <a href=https://chrome.google.com/webstore/detail/imgconverter-for-github/pkgimcoeodgcdfnidhgijpopkfhbcomm>
    <img src=https://img.shields.io/chrome-web-store/price/pkgimcoeodgcdfnidhgijpopkfhbcomm.svg />
  </a>
  <a href=https://codecov.io/gh/funzin/ImgConverter>
    <img src=https://codecov.io/gh/funzin/ImgConverter/branch/master/graph/badge.svg />
  </a>
</p>

## Overview
ImgConverter is browser extension that converts form image of markdown notation to img tag(`<img>`) when you upload images

## Browser Extension
- Chrome Extensions: [ImgConverter](https://chrome.google.com/webstore/detail/imgconverter-for-github/pkgimcoeodgcdfnidhgijpopkfhbcomm)
- Firefox ADD-ONS: [ImgConverter](https://addons.mozilla.org/en-US/firefox/addon/imgconverter/)

## Support image format
- PNG (.png)
- JPEG (.jpg)
- GIF (.gif)

## Environment
- Javascript
- node(v12.1.0)
- npm(v6.9.0)
- karma(jasmine)

## Confirmed services
- Github
- esa
- Docbase

etc.

## DEMO
![demo](resource/gif/demo.gif)


## Usage
It's simple.👨‍💻
1. Upload images to issue or pull request or comment on Github
2. Select markdown image text(Optional)
3. Tap ImgConverter icon
4. **Converted `<img>`!!**

## GIF
### Not select text
<img src=resource/gif/not_select.gif width=70%>
Text is changed.

### Select text
<img src=resource/gif/select.gif width=70%>
**Selected text** is only changed.

## Options
You can set default values for width and height of `<img>` on option page.

1. Right click on ImgConverter icon and then tap `[Options]`
<img src=resource/image/screenshot/right_click.png width=50%>
<br>
2. Show options page
<img src=resource/image/screenshot/options.png width=50%>

### Example
#### No input
```
// before
![title](https://user-images.githubusercontent.com/test.png)

// after
// Default value is `width=50%`
<img src=https://user-images.githubusercontent.com/test.png width=50%>
```


#### Input only width 
Input `width=200px`.

```
// before
![title](https://user-images.githubusercontent.com/test.png)

// after
// Default value is `width=200px`
<img src=https://user-images.githubusercontent.com/test.png width=200px>
```

#### Input only height
Input `height=200px`
```
// before
![title](https://user-images.githubusercontent.com/test.png)

// after 
// Default value is `height=200px`
<img src=https://user-images.githubusercontent.com/test.png height=200px>
```

#### Input width and height
Input `width=200px`, `height=200px`
```
// before
![title](https://user-images.githubusercontent.com/test.png)

// after 
// default value is `width=200px height=200px`
<img src=https://user-images.githubusercontent.com/test.png width=200px height=200px>
```


## Contact
If you discover problem or have opinions, please let me know through [Github issues](https://github.com/funzin/ImgConverter/issues)💁‍♂️

## Author
funzin, nakazawa.fumito@gmail.com

## License
ImgConverter is available under the MIT license. See the [LICENSE file](https://github.com/funzin/ImgConverter/blob/master/LICENSE.md) for more info.
