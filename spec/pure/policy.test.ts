import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { convertEditorText } from "../../src/pure/convert"
import { decideSave } from "../../src/pure/css-size"

const markdown = "![title](https://user-images.githubusercontent.com/test.png)"

describe("size policy without chrome", () => {
  it("saves a blank pair", () => {
    assert.deepEqual(decideSave("  ", ""), { save: true, width: "", height: "" })
  })

  it("rejects one invalid field", () => {
    assert.deepEqual(decideSave("nope", "200px"), { save: false, invalid: ["width"] })
  })

  it("converts a blank stored pair to width 50%", () => {
    assert.equal(
      convertEditorText(markdown, { width: "", height: "" }, null),
      '<img src="https://user-images.githubusercontent.com/test.png" alt="title" width="50%">',
    )
  })

  it("keeps a valid height when the width is illegal", () => {
    assert.equal(
      convertEditorText(markdown, { width: "nope", height: "200px" }, null),
      '<img src="https://user-images.githubusercontent.com/test.png" alt="title" height="200px">',
    )
  })
})
