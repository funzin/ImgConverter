# Privacy policy

This is the privacy policy for the ImgConverter browser extension.

これは ImgConverter ブラウザ拡張機能のプライバシーポリシーです。

## English

### What ImgConverter handles

ImgConverter handles two kinds of data:

- The value of the focused element when you click the ImgConverter icon
- The width and height that you save on the options page

`manifest.json` requests only the `activeTab`, `storage`, and `scripting` permissions. It declares no `host_permissions`, no `content_scripts`, and no `optional_permissions`. Its content security policy for extension pages is `script-src 'self'; object-src 'self'`. That policy limits scripts and objects on extension pages to files inside the extension.

When you click the ImgConverter icon, `background.js` injects `convert-to-img-tag.js`, a file inside the extension, into the current tab with `chrome.scripting.executeScript`. No other tab receives the script.

`convert-to-img-tag.js` gets the saved width and height with `chrome.storage.sync.get`, then reads `document.activeElement.value`. A password field is included, because a password field has a value. If that value is not a string, the script does nothing. If it is a string, the script replaces each Markdown image whose URL starts with `https:` with an `<img>` tag in the same element. When the element has a selection, the script converts only the selected text. The script does not store the value.

`options.js` reads `chrome.storage.sync` when the options page loads and fills the **width** and **height** fields with the saved values. When you click **Save**, `options.js` writes `{ width, height }` from those two fields with `chrome.storage.sync.set`. The saved values are the strings that you typed, including empty strings. If the width and the height are both empty, `convert-to-img-tag.js` adds `width=50%` at conversion time. ImgConverter computes that default in the page and does not send it anywhere.

### Where that data stays

ImgConverter reads and changes the field text only on your device. `convert-to-img-tag.js` writes the replaced string back to the same field. The script does not store the field text and does not download the images.

In both Chrome and Firefox, ImgConverter stores the width and height in `chrome.storage.sync`. If you turn on browser sync, the browser can copy that data to your other signed-in browsers. ImgConverter does not send the width and height to the developer or to any server that the developer operates.

### What ImgConverter does not do

The developer does not receive the field text, the image URLs, the width, or the height. ImgConverter does not read the page address or the page title. The click handler reads only the tab id. ImgConverter has no analytics and requires no account. The code in the `src` folder makes no call to `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, or any analytics API. ImgConverter does not sell data or use it for advertising, for credit decisions, or for lending.

### How long the settings stay

The saved width and height stay in `chrome.storage.sync` until you save new values or remove ImgConverter. Each save on the options page replaces the stored strings, and a save with both fields empty stores two empty strings. When you remove ImgConverter, the browser's normal extension removal deletes the data that ImgConverter stored.

### Limited use

ImgConverter uses the field text, the width, and the height only to convert Markdown images in the focused element.

The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.

### Contact

The developer of ImgConverter is funzin. The contact address is nakazawa.fumito@gmail.com.

This policy is dated 11 October 2026.

## 日本語

### ImgConverter が扱うデータ

ImgConverter が扱うデータは次の2種類です。

- ImgConverter のアイコンをクリックしたときにフォーカスがある要素の値
- オプションページで保存した幅と高さ

`manifest.json` が要求する権限は `activeTab`、`storage`、`scripting` の3つだけです。`host_permissions`、`content_scripts`、`optional_permissions` はいずれも宣言していません。拡張機能ページのコンテンツセキュリティポリシーは `script-src 'self'; object-src 'self'` です。このポリシーにより、拡張機能ページが読み込むスクリプトとオブジェクトは拡張機能内のファイルに限られます。

ImgConverter のアイコンをクリックすると、`background.js` が `chrome.scripting.executeScript` を使い、拡張機能内のファイルである `convert-to-img-tag.js` を現在のタブに挿入します。ほかのタブには挿入しません。

`convert-to-img-tag.js` は `chrome.storage.sync.get` で保存済みの幅と高さを読み込み、`document.activeElement.value` を読み取ります。パスワード欄のように value を持つ要素も対象です。その値が文字列でない場合、スクリプトは何もしません。文字列の場合、URL が `https:` で始まる Markdown 画像を、同じ要素の中で `<img>` タグに置き換えます。要素の中でテキストを選択している場合は、選択した部分だけを変換します。この値は保存しません。

`options.js` は、オプションページを読み込んだときに `chrome.storage.sync` から保存済みの値を読み取り、**width** 欄と **height** 欄に表示します。**Save** をクリックすると、`options.js` は2つの欄の値を `{ width, height }` として `chrome.storage.sync.set` で書き込みます。保存する値は入力したとおりの文字列で、空の文字列も含みます。幅と高さがどちらも空の場合、`convert-to-img-tag.js` は変換時に `width=50%` を付けます。この既定値はページ内で計算し、どこにも送信しません。

### データの保存場所

欄の文字列の読み取りと書き換えは、端末上だけで行います。`convert-to-img-tag.js` は置き換えた文字列を同じ欄に書き戻すだけです。欄の文字列は保存せず、画像もダウンロードしません。

Chrome と Firefox のどちらでも、ImgConverter は幅と高さを `chrome.storage.sync` に保存します。ブラウザの同期を有効にしている場合、ブラウザがこのデータを、サインインしているほかのブラウザにコピーすることがあります。ImgConverter は、幅と高さを開発者にも、開発者が運営するサーバーにも送信しません。

### ImgConverter が行わないこと

開発者は、欄の文字列、画像の URL、幅、高さのいずれも受け取りません。ImgConverter はページのアドレスもページのタイトルも読み取りません。クリック時に読むのはタブの id だけです。ImgConverter にはアクセス解析がなく、アカウントも不要です。`src` フォルダのコードは、`fetch`、`XMLHttpRequest`、`navigator.sendBeacon`、アクセス解析用の API のいずれも呼び出しません。ImgConverter はデータを販売せず、広告、信用判断、融資の目的にも使用しません。

### 設定の保存期間

保存した幅と高さは、新しい値を保存するか ImgConverter を削除するまで `chrome.storage.sync` に残ります。オプションページで保存するたびに保存済みの文字列が置き換わり、両方の欄を空にして保存すると空の文字列が2つ保存されます。ImgConverter を削除すると、ブラウザの通常の拡張機能削除によって、ImgConverter が保存したデータも削除されます。

### 利用目的の限定

ImgConverter は、欄の文字列、幅、高さを、フォーカスのある要素の Markdown 画像を変換する目的だけに使用します。

Google API から受け取った情報の使用は、Limited Use の要件を含め、Chrome Web Store User Data Policy に従います。英語の原文は次のとおりです。

The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.

### 連絡先

ImgConverter の開発者は funzin です。連絡先は nakazawa.fumito@gmail.com です。

このポリシーは2026年10月11日付です。
