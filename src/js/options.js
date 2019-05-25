$(function () {
  $("#save").click(function () {
    let width = $("#width").val();
    let height = $("#height").val();
    let size = {
      width: width,
      height: height,
    }
    chrome.storage.sync.set(size);
  });

  chrome.storage.sync.get(
    function (size) {
      $("#width").val(size.width);
      $("#height").val(size.height);
    }
  )
});