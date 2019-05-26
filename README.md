## Overview
ImgConverter is chrome extension that converts form image of markdown notation to img tag(`<img>`) when you upload images to issue or Pull Request on Github.

## Usage
It's simple.
1. Upload images to issue or pull request or comment on Github
2. Tap ImgConverter icon
3. Converted img tag!!

## Options
You can set default values for width and height of `<img>` on option page.

1. Right click on ImgConverter icon
2. Tap [Options]

### Example

#### No input
```
// before
![title](https://user-images.githubusercontent.com/test.png)

// after
// Default value is `width=50%`
<img src=https://user-images.githubusercontent.com/test.png, width=50%>
```


#### Input Width Only
Input `width=200px`.

```
// before
![title](https://user-images.githubusercontent.com/test.png)

// after
// Default value is `width=200px`
<img src=https://user-images.githubusercontent.com/test.png, width=200px>
```

#### Input Height Only
##### Before
Input `height=200px`
```
// before
![title](https://user-images.githubusercontent.com/test.png)

// after 
// Default value is `height=200px`
<img src=https://user-images.githubusercontent.com/test.png, height=200px>
```

#### Input Width and Height
Input `width=200px`, `height=200px`
```
// before
![title](https://user-images.githubusercontent.com/test.png)

// after 
// default value is `width=200px height=200px`
<img src=https://user-images.githubusercontent.com/test.png, width=200px height=200px>
```


## Contact
If you discover a problem or have opinions, please let me know and write issue

## Author
funzin, nakazawa.fumito@gmail.com
