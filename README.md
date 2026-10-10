# ImgConverter

<p align="center">
    <img src="./resource/image/thumbnail.png" alt="ImgConverter" width="60%" height="60%" />
</p>

<p align="center">
  <a href="https://github.com/funzin/ImgConverter/actions/workflows/test.yml">
    <img src="https://github.com/funzin/ImgConverter/actions/workflows/test.yml/badge.svg" alt="Tests" />
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">
    <img src="https://img.shields.io/badge/javascript-yellow.svg?style=flat" alt="JavaScript" />
  </a>
  <a href="https://chrome.google.com/webstore/detail/imgconverter-for-github/pkgimcoeodgcdfnidhgijpopkfhbcomm">
    <img src="https://img.shields.io/badge/chrome_extensions-gray.svg?style=flat" alt="Chrome extensions" />
  </a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/imgconverter/">
    <img src="https://img.shields.io/badge/firefox_addons-purple.svg?style=flat" alt="Firefox add-ons" />
  </a>
  <a href="https://chrome.google.com/webstore/detail/imgconverter-for-github/pkgimcoeodgcdfnidhgijpopkfhbcomm">
    <img src="https://img.shields.io/chrome-web-store/price/pkgimcoeodgcdfnidhgijpopkfhbcomm.svg" alt="Chrome Web Store price" />
  </a>
  <a href="https://codecov.io/gh/funzin/ImgConverter">
    <img src="https://codecov.io/gh/funzin/ImgConverter/branch/master/graph/badge.svg" alt="Codecov" />
  </a>
</p>

## Overview

ImgConverter is a browser extension that converts Markdown image syntax into HTML `<img>` tags when you click the toolbar icon. Focus a text field that contains `![alt](https://…)`, then click the icon. The extension can also apply a saved width and height so images resize consistently in GitHub issues, pull requests, and comments.

## Install

- [Chrome Web Store](https://chrome.google.com/webstore/detail/imgconverter-for-github/pkgimcoeodgcdfnidhgijpopkfhbcomm)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/imgconverter/)

## Supported formats

- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- GIF (`.gif`)

## Tested with

- GitHub
- esa
- DocBase

The extension can run on other sites too. It converts `https:` image URLs in the focused text field.

## Use

![Demo](resource/gif/demo.gif)

1. Focus a text field that contains Markdown image syntax, for example on a GitHub issue, pull request, or comment.
2. Optionally select the Markdown image text you want to convert. If you select nothing, every match in the field is converted.
3. Click the ImgConverter toolbar icon.

The matching Markdown becomes an `<img>` tag.

### Without a selection

<img src="resource/gif/not_select.gif" width="70%" alt="Convert all Markdown images in the field">

Every Markdown image in the field is converted.

### With a selection

<img src="resource/gif/select.gif" width="70%" alt="Convert only the selected Markdown image">

Only the selected text is converted.

## Set default size

You can set width and height values for converted `<img>` tags on the options page. Enter only the value, such as `200px` or `50%`. Do not type `width=` or `height=` into the fields. If both fields are empty, conversion uses `width=50%`.

1. Right-click the ImgConverter icon and click **Options** (Chrome). On Firefox, open the add-on preferences from `about:addons`.

<img src="resource/image/screenshot/right_click.png" width="50%" alt="Open Options from the toolbar icon menu">

2. Enter width and height values, then click **Save**.

<img src="resource/image/screenshot/options.png" width="50%" alt="Options page with width and height fields">

### Examples

#### Both fields empty

```
// before
![title](https://user-images.githubusercontent.com/test.png)

// after (built-in fallback)
<img src=https://user-images.githubusercontent.com/test.png width=50%>
```

#### Width only

Enter `200px` in the width field.

```
// before
![title](https://user-images.githubusercontent.com/test.png)

// after
<img src=https://user-images.githubusercontent.com/test.png width=200px>
```

#### Height only

Enter `200px` in the height field.

```
// before
![title](https://user-images.githubusercontent.com/test.png)

// after
<img src=https://user-images.githubusercontent.com/test.png height=200px>
```

#### Width and height

Enter `200px` in both fields.

```
// before
![title](https://user-images.githubusercontent.com/test.png)

// after
<img src=https://user-images.githubusercontent.com/test.png width=200px height=200px>
```

## Develop

- JavaScript
- Node.js 12.x, 14.x, or 16.x (CI)
- npm
- Karma with Jasmine

```bash
npm test
npm run debug_test
```

## Contact

If you find a problem or have feedback, open a [GitHub issue](https://github.com/funzin/ImgConverter/issues).

## Author

funzin, nakazawa.fumito@gmail.com

## License

ImgConverter is available under the MIT license. See the [LICENSE file](https://github.com/funzin/ImgConverter/blob/master/LICENSE.md) for more info.
