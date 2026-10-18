// Function test
describe("convertToImgTag", function(){
  var text;
  var result;

  describe('when text contains markdown image', function () {
    beforeEach(function () {
      text = "hogehoge![title](https://user-images.githubusercontent.com/test0.png)\n \
              hogehoge![title](https://img.esa.io/uploads/production/pictures/image/test1.png)"
      result = convertToImgTag(text, "")
    })
    it('should return replaced text', function () {
      text = "hogehoge<img src=https://user-images.githubusercontent.com/test0.png>\n \
              hogehoge<img src=https://img.esa.io/uploads/production/pictures/image/test1.png>"
      expect(result).toEqual(text)
    })
  }) 

  describe('when image title contains space', function () {
    beforeEach(function () {
      text = "hogehoge![hello world](https://user-images.githubusercontent.com/test0.png)\n \
              hogehoge![hello world](https://img.esa.io/uploads/production/pictures/image/test1.png)"
      result = convertToImgTag(text, "")
    })
    it('should return replaced text', function () {
      text = "hogehoge<img src=https://user-images.githubusercontent.com/test0.png>\n \
              hogehoge<img src=https://img.esa.io/uploads/production/pictures/image/test1.png>"
      expect(result).toEqual(text)
    })
  }) 

  describe('when image title contains multi spaces', function () {
    beforeEach(function () {
      text = "hogehoge![Img from iOS (1)](https://user-images.githubusercontent.com/test0.png)\n \
              hogehoge![Img from iOS (2)](https://img.esa.io/uploads/production/pictures/image/test1.png)"
      result = convertToImgTag(text, "")
    })
    it('should return replaced text', function () {
      text = "hogehoge<img src=https://user-images.githubusercontent.com/test0.png>\n \
              hogehoge<img src=https://img.esa.io/uploads/production/pictures/image/test1.png>"
      expect(result).toEqual(text)
    })
  }) 

  describe('when text does not contain markdown image', function () {
    beforeEach(function () {
      text = "hogehoge\nhogehoge"
      result = convertToImgTag(text, "")
    })
    it('should return null', function () {
      expect(result).toEqual(null)
    })
  }) 

  describe('when text does not contain file extension', function () {
    beforeEach(function () {
      text = "hogehoge![title](https://user-images.githubusercontent.com/test0)\n \
              hogehoge![title](https://img.esa.io/uploads/production/pictures/image/test1)"
      result = convertToImgTag(text, "")
    })
    it('should return replaced text', function () {
      text = "hogehoge<img src=https://user-images.githubusercontent.com/test0>\n \
              hogehoge<img src=https://img.esa.io/uploads/production/pictures/image/test1>"
      expect(result).toEqual(text)
    })
  }) 
})

describe("convertOnlySelectionToImgTag", function(){
  var text;
  var result;
  var start;
  var end;

  describe('when text contains markdown image', function () {
    beforeEach(function () {
      text = "start![title](https://user-images.githubusercontent.com/test0.png)end"
    })

    describe('when markdown image text is selected', function () {
      describe('when selection range is from text start to img tag end', function () {
        beforeEach(function () {
          start = 0
          end = 66
          result = convertOnlySelectionToImgTag(text, "", start, end)
        })
        it('should return replaced text', function () {
          const answer = "start<img src=https://user-images.githubusercontent.com/test0.png>end"
          expect(result).toEqual(answer)
        })
      })

      describe('when selection range is from img tag start to img tag end', function () {
        beforeEach(function () {
          start = 5
          end = 66
          result = convertOnlySelectionToImgTag(text, "", start, end)
        })
        it('should return replaced text', function () {
          const answer = "start<img src=https://user-images.githubusercontent.com/test0.png>end"
          expect(result).toEqual(answer)
        })
      })

      describe('when selection range is from img tag start to text end', function () {
        beforeEach(function () {
          start = 5
          end = 70
          result = convertOnlySelectionToImgTag(text, "", start, end)
        })
        it('should return replaced text', function () {
          const answer = "start<img src=https://user-images.githubusercontent.com/test0.png>end"
          expect(result).toEqual(answer)
        })
      })
    })

    describe('when markdown image text is not selected', function () {
      beforeEach(function () {
        start = 0
        end = 0
        result = convertOnlySelectionToImgTag(text, "", start, end)
      })
      it('should return null', function () {
        expect(result).toEqual(null)
      })
    })
  })
})

describe('createParams', function () {
  var result;
  var storage;

  describe('when storage property is null', function () {
    beforeEach(function () {
      storage = {
        width: null,
        height: null 
      }
      result = createParams(storage)
    })
    it('should return width', function () {
      expect(result).toBe(" width=50%")
    })
  })

  describe('when storage have only width', function () {
    beforeEach(function () {
      storage = {
        width: '200px',
        height: null 
      }
      result = createParams(storage)
    })
    it('should return width', function () {
      expect(result).toBe(" width=200px")
    })

  })
  describe('when storage have only height', function () {
    beforeEach(function () {
      storage = {
        width: null,
        height: "200px" 
      }
      result = createParams(storage)
    })
    it('should return height', function () {
      expect(result).toBe(" height=200px")
    })
  })
  describe('when storage have width and height', function () {
    beforeEach(function () {
      storage = {
        width: "200px",
        height: "300px" 
      }
      result = createParams(storage)
    })
    it('should return width and height', function () {
      expect(result).toBe(" width=200px height=300px")
    })

  })
})

describe('createMarkdownImages', function () {
  var result;
  var text;

  describe('when text is empty', function () {
    beforeEach(function () {
      text = ""
      result = createMarkdownImages(text, "")
    })
    it('should return null', function () {
      expect(result).toEqual(null)
    })
  })

  describe('when text does not contain md image', function () {
      beforeEach(function () {
        text = "hogehoge"
        result = createMarkdownImages(text, "")
      })
      it('should return null ', function () {
        expect(result).toEqual(null)
      })
    })
  describe('when text contains supported extensions', function () {
    beforeEach(function () {
      text = "hogehoge![title](https://user-images.githubusercontent.com/test0.jpg)\n \
                hogehoge![title](https://user-images.githubusercontent.com/test1.png)\n \
                hogehoge![title](https://user-images.githubusercontent.com/test2.jpeg)\n \
                hogehoge![title](https://user-images.githubusercontent.com/test3.gif)"
      result = createMarkdownImages(text, "")
    })
    it('should match four md images', function () {
      let extensions = ["jpg", "png", "jpeg", "gif"]
      expect(result.length).toEqual(4)

      result.forEach((markdownImage, index) => {
        expect(markdownImage.url).toEqual(`https://user-images.githubusercontent.com/test${index}.${extensions[index]}`)
        expect(markdownImage.imageTag).toEqual(`<img src=https://user-images.githubusercontent.com/test${index}.${extensions[index]}>`)
        expect(markdownImage.mdImageText).toEqual(`![title](https://user-images.githubusercontent.com/test${index}.${extensions[index]})`)
      })
    })
  })
  describe('when text does not contain file extension', function () {
    beforeEach(function () {
      text = "hogehoge![title](https://user-images.githubusercontent.com/test)hogehoge"
      result = createMarkdownImages(text, "")
    })
    it('should match one md image ', function () {
      let markdownImage = result[0]
      let imageURL = "https://user-images.githubusercontent.com/test"
      let imageTag = "<img src=https://user-images.githubusercontent.com/test>"
      let mdImageText = "![title](https://user-images.githubusercontent.com/test)"

      expect(result.length).toEqual(1)
      expect(markdownImage.url).toEqual(imageURL)
      expect(markdownImage.imageTag).toEqual(imageTag)
      expect(markdownImage.mdImageText).toEqual(mdImageText)
    })
  })
  describe('when text contains md image', function () {
    describe('when text contains one md image', function () {
      beforeEach(function () {
        text = "hogehoge![title](https://user-images.githubusercontent.com/test1.png)hogehoge"
        result = createMarkdownImages(text, "")
      })
      it('should match one md image ', function () {
        let markdownImage = result[0]
        let imageURL = "https://user-images.githubusercontent.com/test1.png"
        let imageTag = "<img src=https://user-images.githubusercontent.com/test1.png>"
        let mdImageText = "![title](https://user-images.githubusercontent.com/test1.png)"

        expect(result.length).toEqual(1)
        expect(markdownImage.url).toEqual(imageURL)
        expect(markdownImage.imageTag).toEqual(imageTag)
        expect(markdownImage.mdImageText).toEqual(mdImageText)
      })
    })

    describe('when text contains two md images', function () {
      beforeEach(function () {
        text = "hogehoge![title](https://user-images.githubusercontent.com/test0.png)hogehoge\n \
                hogehoge![title](https://user-images.githubusercontent.com/test1.png)hogehoge"
        result = createMarkdownImages(text, "")
      })
      it('should match two md images', function () {
        expect(result.length).toEqual(2)

        result.forEach((markdownImage, index) => {
          expect(markdownImage.url).toEqual(`https://user-images.githubusercontent.com/test${index}.png`)
          expect(markdownImage.imageTag).toEqual(`<img src=https://user-images.githubusercontent.com/test${index}.png>`)
          expect(markdownImage.mdImageText).toEqual(`![title](https://user-images.githubusercontent.com/test${index}.png)`)
        })
      })
    })

    describe('when one line of text contains two md images', function () {
      beforeEach(function () {
        text = "![title](https://user-images.githubusercontent.com/test0.png)|![title](https://user-images.githubusercontent.com/test1.png)hogehoge"
        result = createMarkdownImages(text, "")
      })
      it('should match two md images', function () {
        expect(result.length).toEqual(2)

        result.forEach((markdownImage, index) => {
          expect(markdownImage.url).toEqual(`https://user-images.githubusercontent.com/test${index}.png`)
          expect(markdownImage.imageTag).toEqual(`<img src=https://user-images.githubusercontent.com/test${index}.png>`)
          expect(markdownImage.mdImageText).toEqual(`![title](https://user-images.githubusercontent.com/test${index}.png)`)
        })
      })
    })
  })
})

describe('convertToImgTag tag spacing', function () {
  const markdown = '![title](https://user-images.githubusercontent.com/test.png)'

  it('emits no space before > when params is empty', function () {
    expect(convertToImgTag(markdown, '')).toEqual(
      '<img src=https://user-images.githubusercontent.com/test.png>'
    )
  })

  it('puts one space before the default width', function () {
    const params = createParams({ width: null, height: null })
    expect(convertToImgTag(markdown, params)).toEqual(
      '<img src=https://user-images.githubusercontent.com/test.png width=50%>'
    )
  })

  it('puts one space before a saved width', function () {
    const params = createParams({ width: '200px', height: null })
    expect(convertToImgTag(markdown, params)).toEqual(
      '<img src=https://user-images.githubusercontent.com/test.png width=200px>'
    )
  })

  it('puts one space before a saved height', function () {
    const params = createParams({ width: null, height: '200px' })
    expect(convertToImgTag(markdown, params)).toEqual(
      '<img src=https://user-images.githubusercontent.com/test.png height=200px>'
    )
  })

  it('puts one space before saved width and height', function () {
    const params = createParams({ width: '200px', height: '200px' })
    expect(convertToImgTag(markdown, params)).toEqual(
      '<img src=https://user-images.githubusercontent.com/test.png width=200px height=200px>'
    )
  })
})

describe('convertToImgTag regex edge cases (characterization)', function () {
  describe('when http and https images share one line', function () {
    it('leaves the http image text and converts only the https image', function () {
      var text = '![a](http://a.com/1.png) ![b](https://b.com/2.png)'
      var result = convertToImgTag(text, '')
      expect(result).toEqual('![a](http://a.com/1.png) <img src=https://b.com/2.png>')
    })
  })

  describe('when alt contains a parenthesized https URL', function () {
    it('uses the destination URL after ](, not the alt URL', function () {
      var text = '![see (https://docs.example.com)](https://cdn.example.com/x.png)'
      var result = convertToImgTag(text, '')
      expect(result).toEqual('<img src=https://cdn.example.com/x.png>')
    })
  })

  describe('when the URL contains $&', function () {
    it('keeps $& literal in the src attribute', function () {
      var text = '![x](https://a.com/$&.png)'
      var result = convertToImgTag(text, '')
      expect(result).toEqual('<img src=https://a.com/$&.png>')
    })
  })

  describe('when the URL contains $$', function () {
    it('keeps $$ literal in the src attribute', function () {
      var text = '![x](https://a.com/$$.png)'
      var result = convertToImgTag(text, '')
      expect(result).toEqual('<img src=https://a.com/$$.png>')
    })
  })

  describe('when the URL path contains parentheses', function () {
    it('keeps the full URL through the closing ) of the markdown', function () {
      var text = '![x](https://a.com/foo(bar).png)'
      var result = convertToImgTag(text, '')
      expect(result).toEqual('<img src=https://a.com/foo(bar).png>')
    })
  })

  describe('when the URL path nests parentheses', function () {
    it('keeps the full URL through the closing ) of the markdown', function () {
      var text = '![x](https://a.com/foo(bar(baz)).png)'
      var result = convertToImgTag(text, '')
      expect(result).toEqual('<img src=https://a.com/foo(bar(baz)).png>')
    })
  })

  describe('when the destination has an unmatched opening parenthesis', function () {
    it('does not convert and does not return a truncated src', function () {
      var text = '![x](https://a.com/foo(bar.png)'
      var result = convertToImgTag(text, '')
      expect(result).toBe(null)
    })
  })
})

describe('GitHub user-attachments uploads', function () {
  const upload = '<img width="640" height="131" alt="Screenshot 2026-10-16 125850" src="https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a" />'
  const url = 'https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a'

  it('replaces the uploaded img tag with the saved size', function () {
    const params = createParams({ width: null, height: null })
    expect(convertToImgTag('before\n' + upload + '\nafter', params)).toEqual(
      'before\n<img src=' + url + ' width=50%>\nafter'
    )
  })

  it('replaces a markdown user-attachments image', function () {
    const markdown = '![grafik](' + url + ')'
    expect(convertToImgTag(markdown, ' width=50%')).toEqual(
      '<img src=' + url + ' width=50%>'
    )
  })

  it('replaces two uploaded img tags in one comment', function () {
    const second = '<img width="66" height="66" alt="飙泪笑" src="https://github.com/user-attachments/assets/74e6965a-5bd0-4a41-89fd-5d50a9f20af2" />'
    const text = upload + '\n' + second
    const params = createParams({ width: '200px', height: null })
    expect(convertToImgTag(text, params)).toEqual(
      '<img src=' + url + ' width=200px>\n<img src=https://github.com/user-attachments/assets/74e6965a-5bd0-4a41-89fd-5d50a9f20af2 width=200px>'
    )
  })

  it('leaves an img tag that already has a chosen width', function () {
    const resized = '<img src="' + url + '" width="300">'
    expect(convertToImgTag(resized, ' width=50%')).toBe(null)
  })
})

describe('quoted img attributes', function () {
  const url = 'https://user-images.githubusercontent.com/test.png'
  const markdown = '![title](' + url + ')'

  it('quotes src, alt, and the default width', function () {
    expect(convertToImgTag(markdown, createParams({ width: null, height: null }))).toEqual(
      '<img src="' + url + '" alt="title" width="50%">'
    )
  })

  it('keeps and escapes alt text from the markdown image', function () {
    expect(convertToImgTag('![say "hi" & <b>](' + url + ')', createParams({ width: '200px', height: null }))).toEqual(
      '<img src="' + url + '" alt="say &quot;hi&quot; &amp; &lt;b&gt;" width="200px">'
    )
  })

  it('keeps an empty alt', function () {
    expect(convertToImgTag('![](' + url + ')', createParams({ width: '50%', height: null }))).toEqual(
      '<img src="' + url + '" alt="" width="50%">'
    )
  })

  it('escapes ampersands and quotes in the URL', function () {
    const raw = 'https://example.com/a.png?x=1&y=2"z'
    expect(convertToImgTag('![a](' + raw + ')', createParams({ width: null, height: '10px' }))).toEqual(
      '<img src="https://example.com/a.png?x=1&amp;y=2&quot;z" alt="a" height="10px">'
    )
  })

  it('ignores a stored width that would inject an attribute', function () {
    expect(convertToImgTag(markdown, createParams({ width: '100 onerror=x', height: null }))).toEqual(
      '<img src="' + url + '" alt="title" width="50%">'
    )
  })

  it('keeps a valid height when the stored width is invalid', function () {
    expect(convertToImgTag(markdown, createParams({ width: '100 onerror=x', height: '200px' }))).toEqual(
      '<img src="' + url + '" alt="title" height="200px">'
    )
  })

  it('ignores a stored size that contains a space', function () {
    expect(convertToImgTag(markdown, createParams({ width: '100 px', height: '' }))).toEqual(
      '<img src="' + url + '" alt="title" width="50%">'
    )
  })

  it('ignores a decimal size', function () {
    expect(convertToImgTag(markdown, createParams({ width: '10.5', height: null }))).toEqual(
      '<img src="' + url + '" alt="title" width="50%">'
    )
  })

  it('quotes a saved percent and a saved pixel height', function () {
    expect(convertToImgTag(markdown, createParams({ width: '50%', height: '200px' }))).toEqual(
      '<img src="' + url + '" alt="title" width="50%" height="200px">'
    )
  })

  it('keeps a previously saved bare number', function () {
    expect(convertToImgTag(markdown, createParams({ width: '200', height: null }))).toEqual(
      '<img src="' + url + '" alt="title" width="200">'
    )
  })

  it('accepts an uppercase px suffix from stored settings', function () {
    expect(convertToImgTag(markdown, createParams({ width: '200PX', height: null }))).toEqual(
      '<img src="' + url + '" alt="title" width="200px">'
    )
  })

  it('keeps the alt from a GitHub upload tag', function () {
    const upload = '<img width="640" height="131" alt="Screenshot 2026-10-16 125850" src="https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a" />'
    expect(convertToImgTag(upload, createParams({ width: null, height: null }))).toEqual(
      '<img src="https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a" alt="Screenshot 2026-10-16 125850" width="50%">'
    )
  })

  it('keeps a GitHub alt that was written with an ampersand entity', function () {
    const upload = '<img width="640" height="131" alt="a&amp;b" src="https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a" />'
    expect(convertToImgTag(upload, createParams({ width: '50%', height: null }))).toEqual(
      '<img src="https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a" alt="a&amp;b" width="50%">'
    )
  })
})

