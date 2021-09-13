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
      text = "hogehoge<img src=https://user-images.githubusercontent.com/test0.png >\n \
              hogehoge<img src=https://img.esa.io/uploads/production/pictures/image/test1.png >"
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
      text = "hogehoge<img src=https://user-images.githubusercontent.com/test0.png >\n \
              hogehoge<img src=https://img.esa.io/uploads/production/pictures/image/test1.png >"
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
      text = "hogehoge<img src=https://user-images.githubusercontent.com/test0 >\n \
              hogehoge<img src=https://img.esa.io/uploads/production/pictures/image/test1 >"
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
          const answer = "start<img src=https://user-images.githubusercontent.com/test0.png >end"
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
          const answer = "start<img src=https://user-images.githubusercontent.com/test0.png >end"
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
          const answer = "start<img src=https://user-images.githubusercontent.com/test0.png >end"
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
          const answer = "start<img src=https://user-images.githubusercontent.com/test0.png >end"
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
        expect(markdownImage.imageTag).toEqual(`<img src=https://user-images.githubusercontent.com/test${index}.${extensions[index]} >`)
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
      let imageTag = "<img src=https://user-images.githubusercontent.com/test >"
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
        let imageTag = "<img src=https://user-images.githubusercontent.com/test1.png >"
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
          expect(markdownImage.imageTag).toEqual(`<img src=https://user-images.githubusercontent.com/test${index}.png >`)
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
          expect(markdownImage.imageTag).toEqual(`<img src=https://user-images.githubusercontent.com/test${index}.png >`)
          expect(markdownImage.mdImageText).toEqual(`![title](https://user-images.githubusercontent.com/test${index}.png)`)
        })
      })
    })
  })
})