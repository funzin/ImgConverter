chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript({ file: "jquery-3.4.1.min.js" }, function () {
        chrome.tabs.executeScript({
            file: "convert_image_tag.js"
        });
    })
});