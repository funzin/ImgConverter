$(function(){
  $("#save").click(function () {
    localStorage["width"] = $("#width").val();
    localStorage["height"] = $("#height").val();
  });

  // configure width and height
  if (localStorage["width"]) {
    $("#width").val(localStorage["width"]);
  }
  if (localStorage["height"]) {
    $("#height").val(localStorage["height"]);
  }
  
});