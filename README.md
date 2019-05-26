# ImgConverter
<p align="center">
    <img src="./resource/image/thumbnail.png" alt="imgconverter" width="60%" height="60%" />
</p>


## Overview
👷ImgConverter is chrome extension that converts form image of markdown notation to img tag(`<img>`) when you upload images to issue or Pull Request on Github.

- Chrome Extensions: link

## Support Image format
- PNG (.png)
- JPEG (.jpg)


## DEMO
![demo](resource/gif/demo.gif)


## Usage
It's simple.👨‍💻
1. Upload images to issue or pull request or comment on Github
2. Tap ImgConverter icon
3. Converted img tag!!

## Options
You can set default values for width and height of `<img>` on option page.

1. Right click on ImgConverter icon and then tap [Options]
<img src=resource/image/screenshot/right_click.png width=50%>
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
If you discover a problem or have opinions, please let me know through [Github issues](https://github.com/funzin/ImgConverter/issues)💁‍♂️

## Author
funzin, nakazawa.fumito@gmail.com

## License
ImgConverter is available under the MIT license. See the [LICENSE file](https://github.com/funzin/ImgConverter/blob/master/LICENSE.md) for more info.
