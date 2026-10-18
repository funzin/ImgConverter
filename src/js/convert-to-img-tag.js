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

function parseSize(raw) {
  if (raw == null) return null
  var text = String(raw).trim()
  var match = /^(\d+)(px|%)?$/i.exec(text)
  if (!match) return null
  return match[1] + (match[2] ? match[2].toLowerCase() : "")
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function decodeAttr(value) {
  return String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
}

function asSize(params) {
  if (params == null || params === "") return { width: null, height: null }
  return {
    width: params.width || null,
    height: params.height || null,
  }
}

function imageTag(url, alt, size) {
  var attrs = [
    'src="' + escapeAttr(url) + '"',
    'alt="' + escapeAttr(alt) + '"',
  ]
  if (size.width) attrs.push('width="' + size.width + '"')
  if (size.height) attrs.push('height="' + size.height + '"')
  return "<img " + attrs.join(" ") + ">"
}

function createMarkdownImages(text, params) {
  const markdownImageArray = []
  const size = asSize(params)

  function pushImage(url, sourceText, alt) {
    markdownImageArray.push({
      url: url,
      mdImageText: sourceText,
      imageTag: imageTag(url, alt, size),
    })
  }

  const markdownImagePattern = /!\[(?<alt>(?:(?!\]\().)*)\]\((?<url>https:(?:[^\s()]|\((?:[^\s()]|\([^\s()]*\))*\))+)\)/gi
  for (const match of text.matchAll(markdownImagePattern)) {
    pushImage(match.groups.url, match[0], match.groups.alt)
  }

  const githubUploadPattern = /<img width="\d+" height="\d+" alt="(?<alt>[^"]*)" src="(?<url>https:\/\/github\.com\/user-attachments\/assets\/[0-9a-fA-F-]+)" \/>/gi
  for (const match of text.matchAll(githubUploadPattern)) {
    pushImage(match.groups.url, match[0], decodeAttr(match.groups.alt))
  }

  if (markdownImageArray.length == 0) { return null }
  return markdownImageArray
}

function createParams(storage) {
  var width = parseSize(storage.width)
  var height = parseSize(storage.height)
  if (width == null && height == null) {
    width = "50%"
  }
  return { width: width, height: height }
}
