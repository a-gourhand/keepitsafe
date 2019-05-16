$(document).ready(function(){

    $("#menuFirst").on("click",function(event){
  		console.log(sessionStorage.getItem('menuOpened'))
  		if($("nav").css("width") == "160px"){
  			$(".menuContainer p").css("opacity","0")
  			setTimeout(function(){
  				$(".menuContainer p").css("display","none")
  				$("nav").css("width","40px")
  				$("#pageBlock").css("margin-left","80px")
				
  			},200)

  			sessionStorage.setItem('menuOpened', false);
  		}
  		else{
  			$("nav").css("width","160px")
  			$("#pageBlock").css("margin-left","200px")
  			setTimeout(function(){
  				$(".menuContainer p").css("display","inline")
  				setTimeout(function(){
					$(".menuContainer p").css("opacity","1")
	  			},20)
  			},300)
  			sessionStorage.setItem('menuOpened', true);
  		}

	})

	$(document).on("keypress", ":input:not(textarea)", function(event) {
		return event.keyCode != 13;
	});

	$(document).on("keypress", ":not(select)", function(event) {
		return event.keyCode != 13;
	});
	  
	var choicesElems = Array.from(document.querySelectorAll('[id^=tag-]'))
							.map(e => new Choices(e))


	choicesElems.forEach(function(e){
		let node = e.passedElement.element
		let hiddenInput = $('input[id=\"'+node.id.replace("tag","hidden")+'\"]')[0]

		node.addEventListener('change', function(event) {
			hiddenInput.value = JSON.stringify(e.getValue(true))
			if(hiddenInput.value == "[]") hiddenInput.value = ""
			console.log("changed")
		}, false);
		
		if(hiddenInput.value != "" && hiddenInput.value != "[]"){
			e.removeActiveItems()
			e.setValue(JSON.parse(hiddenInput.value).filter(e => e!==""))
		}
	})


});