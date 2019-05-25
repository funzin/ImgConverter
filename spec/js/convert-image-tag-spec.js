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

describe('extractMdImageArray', function () {
  var result;
  var text;

  describe('when text is empty', function () {
    beforeEach(function () {
      text = ""
      result = extractMdImageArray(text)
    })
    it('should return null', function () {
      expect(result).toEqual(null)
    })
  })

  describe('when text does not contain md image', function () {
      beforeEach(function () {
        text = "hogehoge"
        result = extractMdImageArray(text)
      })
      it('should return null ', function () {
        expect(result).toEqual(null)
      })
    })
  describe('when text contains only different extension', function () {
      beforeEach(function () {
        text = "hogehoge![title](https://user-images.githubusercontent.com/test.mp3)hogehoge"
        result = extractMdImageArray(text)
      })
      it('should return null ', function () {
        expect(result).toEqual(null)
      })
    })
  describe('when text contains md image', function () {
    describe('when text contains one md image', function () {
      beforeEach(function () {
        text = "hogehoge![title](https://user-images.githubusercontent.com/test.png)hogehoge"
        result = extractMdImageArray(text)
      })
      it('should match one md image ', function () {
        expect(result.length).toEqual(1)
        expect(result[0]).toEqual("![title](https://user-images.githubusercontent.com/test.png)")
      })
    })
    describe('when text contains two md images', function () {
      beforeEach(function () {
        text = "hogehoge![title](https://user-images.githubusercontent.com/test.png)hogehoge\n \
                hogehoge![title](https://user-images.githubusercontent.com/test2.png)hogehoge"
        result = extractMdImageArray(text)
      })
      it('should match two md images', function () {
        expect(result.length).toEqual(2)
        expect(result[0]).toEqual("![title](https://user-images.githubusercontent.com/test.png)")
        expect(result[1]).toEqual("![title](https://user-images.githubusercontent.com/test2.png)")
      })
    })
  })
})
/*
- markdownのやつらを取り出せるか
  - 含まれないとき
  - 拡張子違うとき
  - 正しいとき
    - 1個取れるか
    - 複数取れるか
- URLを取り出せるか(保留)
- imgタグになっているか
  - imgタグになっているか
- 置換が成功しているか
  - 成功例
  - 失敗例
 */