var resultArray = [];
var width="200px"

var activeTextElement = document.activeElement;
var textAreaStr = activeTextElement.value

var mdImageArray = textAreaStr.match(/\!\[\S*\]\(https:\/\/user-images.githubusercontent.com\S+(jpg|jpeg|png)\)/gmi);
if (mdImageArray != null) {
  for (let index in mdImageArray) {
    let mdImage = mdImageArray[index]
    let imageURL = mdImage.match(/https:\S+(jpg|jpeg|png)/i)[0];

    // Convert image tag
    if (imageURL != undefined) {
      let imageTag = `<image src=${imageURL} width=${width}>`;
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