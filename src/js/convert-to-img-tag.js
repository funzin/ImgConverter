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
    // Assigning value skips the editor's input handler, so React reverts
    // the conversion on preview. insertText is an undoable edit.
    activeTextElement.focus()
    activeTextElement.select()
    document.execCommand('insertText', false, replacedText)
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
    replacedText = replacedText.replace(mdImage.mdImageText, () => mdImage.imageTag)
  }

  return replacedText
}

function createMarkdownImages(text, params) {
  const markdownImageArray = []

  function pushImage(url, sourceText) {
    markdownImageArray.push({
      url: url,
      mdImageText: sourceText,
      imageTag: `<img src=${url}${params}>`,
    })
  }

  const markdownImagePattern = /!\[(?:(?!\]\().)*\]\((?<url>https:(?:[^\s()]|\((?:[^\s()]|\([^\s()]*\))*\))+)\)/gi
  for (const match of text.matchAll(markdownImagePattern)) {
    pushImage(match.groups.url, match[0])
  }

  // GitHub's upload tag. Pixel width and height, then alt, then the asset URL.
  const githubUploadPattern = /<img width="\d+" height="\d+" alt="[^"]*" src="(?<url>https:\/\/github\.com\/user-attachments\/assets\/[0-9a-fA-F-]+)" \/>/gi
  for (const match of text.matchAll(githubUploadPattern)) {
    pushImage(match.groups.url, match[0])
  }

  if (markdownImageArray.length == 0) { return null }
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
