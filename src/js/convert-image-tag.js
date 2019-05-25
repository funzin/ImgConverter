chrome.storage.sync.get(
  function (storage) {
    var resultArray = []
    var params = createParams(storage)
    var activeTextElement = document.activeElement
    var textAreaStr = activeTextElement.value

    // Extract markdown notation image
    var mdImageArray = createMarkdownImages(textAreaStr, params)

    if (mdImageArray != null) {
      // Replace from markdown notation to image tag
      for (let mdImage of mdImageArray) {
        textAreaStr = textAreaStr.replace(mdImage.mdImageText, mdImage.imageTag)
      }
      activeTextElement.value = textAreaStr
    }
  })

function createMarkdownImages(text, params) {
  var markdownImageArray = []
  let results = text.match(/\!\[\S*\]\(https:\/\/user-images.githubusercontent.com\S+(jpg|jpeg|png)\)/gmi)
  if (results == null) { return null}

  for (let markdownImage of results) {
    let imageURL = markdownImage.match(/https:\S+(jpg|jpeg|png)/i)[0]
    let imageTag = `<img src=${imageURL} ${params}>`
    markdownImageArray.push(new MarkdownImage(imageURL, markdownImage, imageTag))
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