chrome.storage.sync.get(
  function (storage) {
    var resultArray = []
    var params = _createParams(storage)
    var activeTextElement = document.activeElement
    var textAreaStr = activeTextElement.value

    // Extract markdown notation image
    var mdImageArray = exractMdImageArray(textAreaStr)

    if (mdImageArray != null) {
      for (let index in mdImageArray) {
        let mdImage = mdImageArray[index]
        let imageURL = mdImage.match(/https:\S+(jpg|jpeg|png)/i)[0]

        // Convert image tag
        if (imageURL != undefined) {
          let imageTag = `<img src=${imageURL} ${params}>`
          resultArray.push([mdImage, imageTag])
        }
      }

      // Replace from markdown notation to image tag
      for (let index in resultArray) {
        let result = resultArray[index]
        textAreaStr = textAreaStr.replace(result[0], result[1])
      }
      activeTextElement.value = textAreaStr
    }
  })

function extractMdImageArray(text) {
  return text.match(/\!\[\S*\]\(https:\/\/user-images.githubusercontent.com\S+(jpg|jpeg|png)\)/gmi)
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