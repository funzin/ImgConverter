chrome.browserAction.onClicked.addListener(function (tab) {
    executeScripts(null, [ 
        { file: "src/js/jquery-3.4.1.min.js" }, 
        { file: "src/js/markdown-image.js" },
        { file: "src/js/convert-image-tag.js" }
    ])
});

function executeScripts(tabId, injectDetailsArray) {
    function createCallback(tabId, injectDetails, innerCallback) {
        return function () {
            chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
        };
    }

    var callback = null;

    for (var i = injectDetailsArray.length - 1; i >= 0; --i)
        callback = createCallback(tabId, injectDetailsArray[i], callback);

    if (callback !== null)
        callback();   // execute outermost function
}