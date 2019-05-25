describe('createParams', function () {
  var result;
  var storage;

  describe('when storage property is null', function () {
    beforeEach(function () {
      let storage = {
        width: null,
        height: null 
      }
      result = createParams(storage)
    })
    it('should return " width=50%"', function () {
      expect(result).toBe(" width=50%")
    })
  })

  describe('when storage have only width', function () {
    beforeEach(function () {
      let storage = {
        width: '200px',
        height: null 
      }
      result = createParams(storage)
    })
    it('should return " width=200px"', function () {
      expect(result).toBe(" width=200px")
    })

  })
  describe('when storage have only height', function () {
    beforeEach(function () {
      let storage = {
        width: null,
        height: "200px" 
      }
      result = createParams(storage)
    })
    it('should return " height=200px"', function () {
      expect(result).toBe(" height=200px")
    })
  })
  describe('when storage have width and height', function () {
    beforeEach(function () {
      let storage = {
        width: "200px",
        height: "300px" 
      }
      result = createParams(storage)
    })
    it('should return " width=200px height=300px"', function () {
      expect(result).toBe(" width=200px height=300px")
    })

  })
});

/*
- createParams
  - storageがnullのとき
  - width飲みある時
  - heightのみあるとき
  - 両方ある時

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