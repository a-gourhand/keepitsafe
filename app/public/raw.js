if(sessionStorage.getItem('menuOpened')=="true"){
  $("nav").css("transition","width 0s ease")
  $("#pageBlock").css("transition","margin-left 0s ease")
  $(".menuContainer p").css("transition","opacity 0s ease")

  $("nav").css("width","200px")
  $("#pageBlock").css("margin-left","240px")
  $(".menuContainer p").css("display","inline")
  $(".menuContainer p").css("opacity","1")

  setTimeout(function(){
    $(".menuContainer p").css("transition","opacity 0.3s ease")
    $("nav").css("transition","width 0.3s ease")
    $("#pageBlock").css("transition","margin-left 0.3s ease")
  },4)
}
