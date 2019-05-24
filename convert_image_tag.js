var resultArray = [];
const width="200px"

var activeTextElement = document.activeElement;
var textAreaStr = activeTextElement.value
//var textAreaStr = '![haikei](https://user-images.githubusercontent.com/12893657/58318596-0d2dc700-7e53-11e9-860c-42c3cc42dc3f.jpeg) ![profile](https://user-images.githubusercontent.com/12893657/58318597-0dc65d80-7e53-11e9-8c7a-6c65e9e1b454.jpeg)'

var mdImageArray = textAreaStr.match(/\!\[\S*\]\(https:\/\/user-images.githubusercontent.com\S+(jpg|jpeg|png)\)/gm);
if (mdImageArray != null) {
  for (let index in mdImageArray) {
    let mdImage = mdImageArray[index]
    let imageURL = mdImage.match(/https:\S+(jpg|jpeg|png)/)[0];
    if (imageURL != undefined) {
      let imageTag = `<image src=${imageURL} width=${width}>`;
      resultArray.push([mdImage, imageTag])
    }
  }

  for (let index in resultArray) {
    let result = resultArray[index]
    textAreaStr = textAreaStr.replace(result[0], result[1])
  }
  activeTextElement.value = textAreaStr
}