var resultArray = [];
var widthAndHeihgt = "";

var activeTextElement = document.activeElement;
var textAreaStr = activeTextElement.value

var mdImageArray = textAreaStr.match(/\!\[\S*\]\(https:\/\/user-images.githubusercontent.com\S+(jpg|jpeg|png)\)/gmi);
if (mdImageArray != null) {
  for (let index in mdImageArray) {
    let mdImage = mdImageArray[index]
    let imageURL = mdImage.match(/https:\S+(jpg|jpeg|png)/i)[0];

    // Convert image tag
    if (imageURL != undefined) {
      let imageTag = `<image src=${imageURL} ${widthAndHeihgt}>`;
      resultArray.push([mdImage, imageTag])
    }
  }

  // Replace
  for (let index in resultArray) {
    let result = resultArray[index]
    textAreaStr = textAreaStr.replace(result[0], result[1])
  }
  activeTextElement.value = textAreaStr
}

$(document).ready(function () {
  widthAndHeihgt = getWidthAndHeight()

  function getWidthAndHeight() {
    var width = "50%"
    var height = "50%"

    var result = ""
    if (localStorage["width"]) {
      width = $("#width").val(localStorage["width"]);
      result += ` widht=${width}`
    }
    if (localStorage["height"]) {
      height = $("#height").val(localStorage["height"]);
      result += ` height=${height}`
    }

    return result
  }
})