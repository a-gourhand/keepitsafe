$(document).ready(function(){

	// Side menu animations
    $("#menuFirst").on("click",function(event){
  		console.log(sessionStorage.getItem('menuOpened'))
  		if($("nav").css("width") == "200px"){
  			$(".menuContainer p").css("opacity","0")
  			setTimeout(function(){
  				$(".menuContainer p").css("display","none")
  				$("nav").css("width","40px")
  				$("#pageBlock").css("margin-left","80px")
				
  			},200)

  			sessionStorage.setItem('menuOpened', false);
  		}
  		else{
  			$("nav").css("width","200px")
  			$("#pageBlock").css("margin-left","240px")
  			setTimeout(function(){
  				$(".menuContainer p").css("display","inline")
  				setTimeout(function(){
					$(".menuContainer p").css("opacity","1")
	  			},20)
  			},300)
  			sessionStorage.setItem('menuOpened', true);
  		}

	})


	//Tag input fields
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

	//Help Menu
	if(!sessionStorage.getItem("lastMod"))
		sessionStorage.setItem("lastMod", '')
	
	$("textarea.tooltiptext:not([disabled])").first().val(sessionStorage.getItem("lastMod"))
	$("textarea.tooltiptext:not([disabled])").first().attr("disabled","disabled")

	$("div.tooltip").on("click",function(e){
		if(e.target !== e.currentTarget) return
		if($(this).children().first().css("opacity") == 0){
			$("div.tooltipdiv").css("visibility","hidden")
			$("div.tooltipdiv").css("opacity",0)
			$(this).children().first().css("visibility","visible")
			$(this).children().first().css("opacity",1)	
		} else {
			$(this).children().first().css("visibility","hidden")
			$(this).children().first().css("opacity",0)
		}
		
	})

	$(".tooltipbtn.tooltipmod").on("click",function(){
		$("textarea.tooltiptext:not([disabled])").siblings("button").toggle()
		$("textarea.tooltiptext:not([disabled])").first().val(sessionStorage.getItem("lastMod"))
		$("textarea.tooltiptext:not([disabled])").first().attr("disabled","disabled")
		
		sessionStorage.setItem('lastMod', $(this).siblings("textarea").first().val())
		console.log("Saved :",sessionStorage.getItem('lastMod'))
		$(this).siblings("textarea").removeAttr("disabled")
		$(this).siblings("button").toggle()
		$(this).toggle()
	})

	$(".tooltipbtn.tooltipcancel").on("click",function(){
		console.log("Loaded : ",sessionStorage.getItem('lastMod'))
		$(this).siblings("textarea").first().val(sessionStorage.getItem('lastMod'))
		$(this).siblings("textarea").attr("disabled","disabled")
		$(this).siblings("button").toggle()
		$(this).toggle()
	})

	$(".tooltipbtn.tooltipvalidate").on("click",function(){
		sessionStorage.setItem('lastMod','')
		$(this).siblings("textarea").attr("disabled","disabled")
		$(this).siblings("button").toggle()
		$(this).toggle()

		$.post( "/"+window.location.pathname.split("/")[1]+"/help", { [$(this).siblings("span.helpid").first().text()] : $(this).siblings("textarea").first().val()})
		.done(function( data ) {
			alert( "Data Loaded: " + data );
		});
	})



});