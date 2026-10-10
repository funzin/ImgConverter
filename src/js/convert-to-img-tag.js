chrome.storage.sync.get( function (storage) {
  var activeTextElement = document.activeElement
  var textAreaStr = activeTextElement.value
  
  if (textAreaStr == undefined) { return }
  var params = createParams(storage)

  var replacedText
  if (isTextSelected(activeTextElement)) {
    var start = activeTextElement.selectionStart;
    var end = activeTextElement.selectionEnd;
    replacedText = convertOnlySelectionToImgTag(textAreaStr, params, start, end)
  } else {
    replacedText = convertToImgTag(textAreaStr, params)
  }

  if (replacedText != null) {
    activeTextElement.value = replacedText
  }
 })

 function isTextSelected(activeTextElement) {
   return activeTextElement.selectionStart !== activeTextElement.selectionEnd
 }


function convertOnlySelectionToImgTag(text, params, start, end) {
  const selectedText = text.substring(start, end)
  const imgTagText = convertToImgTag(selectedText, params)
  if (imgTagText == null) {
    return null
  }
  return text.substring(0, start) + imgTagText + text.substring(end)
}

function convertToImgTag(text, params) {
  let replacedText = text
  const mdImageArray = createMarkdownImages(text, params)

  if (mdImageArray == null) { return null }

  for (const mdImage of mdImageArray) {
    replacedText = replacedText.replace(mdImage.mdImageText, mdImage.imageTag)
  }

  return replacedText
}

function createMarkdownImages(text, params) {
  const results = text.match(/\!\[.*?\]\(https:\S+?\)/gmi)
  if (results == null) { return null }

  const markdownImageArray = []
  for (const mdImageText of results) {
    const imageURL = mdImageText.match(/\((https:\S+)\)/i)[1]
    markdownImageArray.push({
      url: imageURL,
      mdImageText: mdImageText,
      imageTag: `<img src=${imageURL} ${params}>`,
    })
  }
  return markdownImageArray
}

function createParams(storage) {
  let result = ""
  if (storage.width != null && storage.width != "") {
    result += ` width=${storage.width}`
  }

  if (storage.height != null && storage.height != "") {
    result += ` height=${storage.height}`
  }

  if (result == "") {
    result = " width=50%"
  }

  return result
}
