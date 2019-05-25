chrome.storage.sync.get( function (storage) {
  var activeTextElement = document.activeElement
  var textAreaStr = activeTextElement.value
  var params = createParams(storage)

  var replacedText = convertToImgTag(textAreaStr, params)

  if (replacedText != null) {
    activeTextElement.value = textAreaStr
  }
 })

function convertToImgTag(text, params) {
  // Extract markdown notation image
  var mdImageArray = createMarkdownImages(text, params)

  if (mdImageArray == null) { return null }

  // Replace from markdown notation to image tag
  for (const mdImage of mdImageArray) {
    text = text.replace(mdImage.mdImageText, mdImage.imageTag)
  }

  return text
}

function createMarkdownImages(text, params) {
  var markdownImageArray = []
  let results = text.match(/\!\[\S*\]\(https:\/\/user-images.githubusercontent.com\S+(jpg|jpeg|png)\)/gmi)
  if (results == null) { return null}

  for (const mdImage of results) {
    let imageURL = mdImage.match(/https:\S+(jpg|jpeg|png)/i)[0]
    let imageTag = `<img src=${imageURL} ${params}>`
    let markdownImage = new MarkdownImage(imageURL, mdImage, imageTag)
    markdownImageArray.push(markdownImage)
  }
  return markdownImageArray
}

function createParams(storage) {
  var result = ""
  if (storage.width != null && storage.width != "") {
    result += ` width=${storage.width}`
  }

  if (storage.height != null && storage.height != "") {
    result += ` height=${storage.height}`
  }

  // Initialize
  if (result == "") {
    result = " width=50%"
  }

  return result
}