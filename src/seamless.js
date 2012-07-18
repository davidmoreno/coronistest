/**
 * @short Allows to seamless use a web page and record events and selections to create a test suite.
 */

/**
 * @short Given an element tries to get a unique selector to identify it, or false
 */
guessSelector = function(element){
	var isUnique = function(selector){
		if (!sel)
			return sel
		console.log(sel)
		try{
			var me=$$$(selector)
			if (me.length==1 && me.is(element))
				return selector
		}
		catch(e){
		}
		console.log("No")
		return false
	}
	
	var attrs=['id','name','class','alt','title']
	
	var tagname=element[0].tagName.toLowerCase()
	
	for (var i in attrs){
		var a=attrs[i]
		var sel=tagname+'['+a+'='+element.attr(a)+']'
		if (isUnique(sel))
			return sel
	}
	
	// maybe by text inside
	var sel=tagname+':contains('+element.text()+')'
	if (isUnique(sel))
		return sel
	
	
	console.log("Fail")
	return false;
}

/**
 * @All elements here are called at each page load.
 */
seamless = {
	click:function(){
		var logClick=function(e){
			var me=$(this)
			var selector=guessSelector(me)
			if (!selector){
				selector='link='+me.text()
			}
			if (selector)
				$('#runhistory pre').append('click("'+selector+'")\n')
		}
		
		var elements=['a','input[type=button]','input[type=submit]']
		for (var i in elements){
			try{
				$$$(elements[i]).click(logClick)
			}
			catch(e){
			}
		}
	}
	,
	selection:function(){
		/// By using tips from http://mark.koli.ch/2009/09/use-javascript-and-jquery-to-get-user-selected-text.html
		var getSelection = function(){
			var t = '';
			var w=window.frames[0]
			if(w.getSelection){
				t = w.getSelection();
			}else if(w.document.getSelection){
				t = w.document.getSelection();
			}else if(w.document.selection){
				t = w.document.selection.createRange().text;
			}
			return t.toString();
		}
		var mouseup = function(){
			var st = getSelection();
			if(st!=''){
				$('#runhistory pre').append('checkText("'+st+'")\n')
			}
		}
		
		$(window.frames[0]).bind("mouseup", mouseup);
	}
	,
	type:function(){
		var onchange=function(){
			var me=$(this)
			var selector=guessSelector(me)
			if (selector){
				$('#runhistory pre').append('type("'+selector+'","'+$(me).val()+'")\n')
			}
		}
		
		try{
			$$$('input').change(onchange)
		}
		catch(e){
		}
	}
}

activateSeamless=function(){
	$('#control').slideUp()
	$('#commandbox').slideUp()
	
	ctestui.log("Load seamlesses.")
	for (var s in seamless){
		ctestui.log("Apply seamless: "+s)
		try{
			seamless[s]()
		}
		catch(e){
			ctestui.log("There was an error activating seamless: "+s)
		}
	}
}

deactivateSeamless=function(){
	alert("Recording seamless is enabled until next page load.")
	
	$('#control').slideDown()
	$('#commandbox').slideDown()
}