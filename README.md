# ImgConverter

<p align="center">
    <img src="./resource/image/thumbnail.png" alt="ImgConverter" width="60%" height="60%" />
</p>

<p align="center">
  <a href="https://github.com/funzin/ImgConverter/actions/workflows/test.yml">
    <img src="https://github.com/funzin/ImgConverter/actions/workflows/test.yml/badge.svg" alt="Tests" />
  </a>
  <a href="https://chromewebstore.google.com/detail/imgconverter/pkgimcoeodgcdfnidhgijpopkfhbcomm">
    <img src="https://img.shields.io/badge/chrome_extensions-gray.svg?style=flat" alt="Chrome Web Store" />
  </a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/imgconverter/">
    <img src="https://img.shields.io/badge/firefox_addons-purple.svg?style=flat" alt="Firefox Add-ons" />
  </a>
  <a href="https://codecov.io/gh/funzin/ImgConverter">
    <img src="https://codecov.io/gh/funzin/ImgConverter/branch/master/graph/badge.svg" alt="Codecov" />
  </a>
</p>

ImgConverter is a Chrome and Firefox extension that converts Markdown images to HTML `<img>` tags with one click. Markdown image syntax has no way to set the image size, but an `<img>` tag has `width` and `height` attributes. ImgConverter adds the width and height you save on the options page, or `width="50%"` if you save neither.

## Convert Markdown images

1. Install ImgConverter from the [Chrome Web Store](https://chromewebstore.google.com/detail/imgconverter/pkgimcoeodgcdfnidhgijpopkfhbcomm) or [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/imgconverter/).
2. Click in a text field that contains a Markdown image, such as `![title](https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a)`. GitHub also inserts an upload as `<img width="640" height="131" alt="Screenshot 2026-10-16 125850" src="https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a" />`. ImgConverter converts that tag too.
3. Click the ImgConverter icon in the browser toolbar. If you do not see the icon, open the Extensions menu from the puzzle icon.

ImgConverter replaces each Markdown image in the field, and each GitHub upload tag, with an `<img>` tag.

<img src="resource/gif/not_select.gif" width="70%" alt="All Markdown images in the field become img tags">

To convert only some images, select their full Markdown text before you click the icon. ImgConverter leaves the rest of the field unchanged.

<img src="resource/gif/select.gif" width="70%" alt="Only the selected Markdown images become img tags">

## Set the width and height

1. Right-click the ImgConverter icon and click **Options**. In Firefox, open the ImgConverter options from `about:addons` instead.

<img src="resource/image/screenshot/right_click.png" width="50%" alt="Options in the ImgConverter right-click menu">

2. Enter a value in the **width** field, the **height** field, or both. Use digits, optionally followed by `px` or `%`, such as `200px` or `50%`.
3. Click **Save**. If a value is not that shape, ImgConverter does not save. The text you typed stays in the field, and the previous width and height stay saved.

ImgConverter uses the saved values for each new `<img>` tag. To return to `width="50%"`, clear both fields and click **Save**.

## Conversion rules

ImgConverter converts a Markdown image only when its URL starts with `https:`. It copies the URL and the alt text into a quoted `<img>` tag. A GitHub upload tag, `<img width="640" height="131" alt="Screenshot 2026-10-16 125850" src="https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a" />`, becomes the same kind of tag. ImgConverter keeps that tag's alt text and replaces its pixel size with the saved width and height.

The size attributes depend on the saved width and height. Each row shows what `![title](https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a)` becomes.

| Saved width | Saved height | Result |
| --- | --- | --- |
| Empty | Empty | `<img src="https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a" alt="title" width="50%">` |
| `200px` | Empty | `<img src="https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a" alt="title" width="200px">` |
| Empty | `200px` | `<img src="https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a" alt="title" height="200px">` |
| `200px` | `200px` | `<img src="https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a" alt="title" width="200px" height="200px">` |

## Tested formats and sites

ImgConverter does not check the file type. These image formats are tested:

- PNG
- JPEG
- GIF

ImgConverter is not limited to specific sites. These sites are tested:

- GitHub
- esa
- DocBase

## Develop

- TypeScript (`strict`). esbuild writes the classic scripts in `src/js`
- Node.js 24.x (CI)
- npm
- Node's built-in test runner, plus Playwright for the React editor and script injection specs

```bash
npm run typecheck
npm test
npm run lint
npm run debug_test
npm run package
```

## Release a version

Push a tag `vX.Y.Z` whose numbers match `version` in `manifest.json` and `package.json`. The release workflow runs the tests, builds `dist/ImgConverter-X.Y.Z.zip`, and attaches that zip to a GitHub Release named ImgConverter X.Y.Z.

`npm run package` compiles the TypeScript, then builds the same zip. The zip contains `manifest.json`, the files under `src/html`, the compiled scripts under `src/js`, and the files under `resource/image/icons`.

## Report a problem

To report a bug or suggest a change, open an issue in [GitHub Issues](https://github.com/funzin/ImgConverter/issues).

## Privacy

ImgConverter keeps the saved width and height in browser sync storage and reads the focused element's value only on your device. See the [privacy policy](https://github.com/funzin/ImgConverter/blob/master/PRIVACY.md).

## Author

funzin, nakazawa.fumito@gmail.com

## License

ImgConverter is available under the MIT license. See the [LICENSE file](https://github.com/funzin/ImgConverter/blob/master/LICENSE.md).
