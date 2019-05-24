var resultArray = [];
var widthAndHeihgt = ""

chrome.storage.sync.get(
  function (size) {
    widthAndHeihgt = getWidthAndHeight(size)

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
    function getWidthAndHeight(storage) {
      var width = "50%"
      var height = "50%"

      var result = ""
      if (storage.width != null && storage.width != "") {

        width = $("#width").val(storage.width);
        result += ` width=${storage.width}`
      } else {
        result += ` width=${width}` 
      }
      if (storage.height != null && storage.height != "") {
        height = $("#height").val(storage.height);
        result += ` height=${storage.height}`
      }

      return result
    }
})