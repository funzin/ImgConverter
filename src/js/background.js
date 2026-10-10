chrome.action.onClicked.addListener(function (tab) {
  if (tab.id === undefined) {
    return;
  }
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [
      "src/js/markdown-image.js",
      "src/js/convert-to-img-tag.js",
    ],
  });
});
