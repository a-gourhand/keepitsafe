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
	.map(e => new Choices(e,{
		duplicateItemsAllowed:false
	}))

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
			let values = JSON.parse(hiddenInput.value).filter(e => e!=="")
			console.log(e)
			let choicesValues = values.filter(v => v)
			e.setValue(values)
		}
	})

	getJSON("/locale",function(response){
		choicesElems.forEach(function(e){
			e.config.noChoicesText  = response.website.noChoicesText
			e.config.noResultsText  = response.website.noResultsText
			e.config.itemSelectText = response.website.itemSelectText
			e.config.loadingText 	= response.website.loadingText
		})

	})
	
	getJSON("/choices",function(response){
		choicesElems.forEach(function(e){
			let id = e.passedElement.element.attributes.key.value
			if(!response[id]) return
			let choicesToSet = response[id].map(function(respElem){
				return {value:respElem.name,label:respElem.name,customProperties:{link:respElem.link}}
			})
			e.setChoices(choicesToSet,"value","label",true)
			
		})

	})

	//Help Menu
	if(!sessionStorage.getItem("help_lastMod"))
		sessionStorage.setItem("help_lastMod", '')
	
	$("textarea.tooltiptext:not([disabled])").first().val(sessionStorage.getItem("help_lastMod"))
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
		$("textarea.tooltiptext:not([disabled])").first().val(sessionStorage.getItem("help_lastMod"))
		$("textarea.tooltiptext:not([disabled])").first().attr("disabled","disabled")
		
		sessionStorage.setItem('help_lastMod', $(this).siblings("textarea").first().val())
		console.log("Saved :",sessionStorage.getItem('help_lastMod'))
		$(this).siblings("textarea").removeAttr("disabled")
		$(this).siblings("button").toggle()
		$(this).toggle()
	})

	$(".tooltipbtn.tooltipcancel").on("click",function(){
		console.log("Loaded : ",sessionStorage.getItem('help_lastMod'))
		$(this).siblings("textarea").first().val(sessionStorage.getItem('help_lastMod'))
		$(this).siblings("textarea").attr("disabled","disabled")
		$(this).siblings("button").toggle()
		$(this).toggle()
	})

	$(".tooltipbtn.tooltipvalidate").on("click",function(){
		sessionStorage.setItem('help_lastMod','')
		$(this).siblings("textarea").attr("disabled","disabled")
		$(this).siblings("button").toggle()
		$(this).toggle()

		$.post( "/"+window.location.pathname.split("/")[1]+"/help",
				{ [$(this).siblings("span.helpid").first().text()] : $(this).siblings("textarea").first().val()}
			)
		.done(function( data ) {
			alert( "Data Loaded: " + data );
		});
	})

	//add choices

	//Observers are needed to add events to buttons only once, dynamically.
	MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

	var observer = new MutationObserver(function(mutations, observer) {
		mutations.filter(m => m.type == "childList").forEach(function(m){
			m.addedNodes.forEach(function(e){
				setChoicesEvents(e)
			})
		})
	});

	observer.observe(document.body, {
		subtree: true,
		attribute: true,
		childList: true,
		characterData: true,
		attributeOldValue: true,
		characterDataOldValue: true
	});

	if(!sessionStorage.getItem("choices_lastMod"))
		sessionStorage.setItem("choices_lastMod", '')

	function setChoicesEvents(e){
		$(e).children(".modifyChoice").on("click",function(e){
			$(this).siblings("input").each(function(i){
				$(this).attr("savedVal",$(this).val())
			})
			$(this).siblings("input").removeAttr("readonly")
			$(this).parent().children("button").toggle()
		})
	
		$(e).children(".removeChoice").on("click",function(e){
			$(this).parent().remove()
		})

		$(e).children(".validateModificationChoice").on("click",function(e){
			$(this).siblings("input").each(function(i){
				$(this).attr("savedVal","")
			})
			$(this).siblings("input").attr("readonly","readonly")
			$(this).parent().children("button").toggle()

		})

		$(e).children(".cancelModifyChoice").on("click",function(e){

			$(this).siblings("input").each(function(i){
				if(!$(this)[0].hasAttribute("savedVal")){
					$(this).parent().remove()
					return
				}
				$(this).val($(this).attr("savedVal"))
			})
			
			$(this).siblings("input").attr("readonly","readonly")
			$(this).parent().children("button").toggle()
		})
	}

	setChoicesEvents(".addedChoice")

	$(".addchoice").on("click",function(){
		
		$(this).before($("#choiceTemplate").html())

		let group = $(this).parent()
		$(this).prev().children("input").each(function(elem){
			let name = group.attr("hiddenKey")+"["+group.children(".addedChoice").length+"]["+$(this).attr("hiddenname")+"]"
			$(this).attr("name",name)
		})
	})

	$(".sentData").children("button").toggle()
	$(".sentData").children("input").attr("readonly","readonly")
	

});


//Get Json at the specified route
function getJSON(route,callback){
	$.ajax({     
		headers: {          
		  Accept: "application/json; charset=utf-8",         
		  "Content-Type": "application/json; charset=utf-8"   
		},
		url: "/"+window.location.pathname.split("/")[1]+route,
		data: "data",    
		success : (e => callback(e))
	  });
}