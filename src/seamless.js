/**
 * @short Allows to seamless use a web page and record events and selections to create a test suite.
 */

seamless_mark=''+Math.floor(Math.random()*10000000)

/**
 * @short Gets an element as in $$$, but marks it so its never again get the same (so no duplicate clicks, for example).
 */
var s$$$ = function(selector,extraid){
	var el= $.unique($$$(selector))
	el=el.filter(function(){
		if (this['seamless_mark_'+extraid+'_'+seamless_mark])
			return false;
		this['seamless_mark_'+extraid+'_'+seamless_mark]=true
		this['seamless_mark_'+seamless_mark]=true
		return true
	})
	return el
}

var isUnique = function(selector, element){
	if (!selector)
		return selector
	try{
		var me=$$$(selector)
		if (me.length==1 && me.is(element))
			return selector
	}
	catch(e){
	}
	return false
}

var guessSelectorStackCountLimit=50
var guessSelectorScackCount=0


guessSelector = function(element){
	guessSelectorScackCount=0
	return guessSelectorRec(element)
}

/**
 * @short Given an element tries to get a unique selector to identify it, or false
 */
guessSelectorRec = function(element){
	if (guessSelectorScackCount>guessSelectorStackCountLimit)
		return ''
	guessSelectorScackCount+=1
	
	if (element.length==0 || !element[0]){
		ctestui.log("Cant guess selector for no element")
		return ''
	}
	
	if (!element[0]['seamless_mark_'+seamless_mark]){
		activateSeamless()
	}
	var beautify=function(sel){
		/// beautify it a bit
		sel=sel.replace(/\[id=(.*)\]/,'#$1')
		sel=sel.replace(/^a:contains\((.*)\)$/,'link=$1')
		return sel
	}
	
	var attrs=['id','name','class','alt','title','type']
	
	try{
		var tagname=element[0].tagName.toLowerCase()
	}
	catch(e){
		tagname=''
	}
	var selectorsNotUnique=[tagname]
	
	for (var i in attrs){
		var a=attrs[i]
		var attr=element.attr(a)
		if (attr){
			var sel=tagname+'['+a+'='+attr+']'
			if (isUnique(sel,element))
				return beautify(sel)
			selectorsNotUnique.push(sel)
		}
	}
	
	// maybe by text inside
	var txt=element.text()
	if (txt.length<64){
		var sel=tagname+':contains('+txt+')'
		if (isUnique(sel,element)){
			// Return it
			return beautify(sel)
		}
	}
	
	if (selectorsNotUnique.length>0){ // Ok, so lets see if I can get a selector from a parent, and from there make it unique.
		var el=element.parent()
		while(el.length>0){
			var psel=guessSelectorRec(el)
			if (psel){
				for (var i in selectorsNotUnique){
					var sel=psel+' '+selectorsNotUnique[i]
					if (isUnique(sel, element))
						return sel
				}
			}
			el=el.parent()
		}
	}
	
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
				if (!isUnique(selector,me))
					return
			}
			if (selector)
				ctestui.addCommand('click("'+selector+'")')
		}
		
		var elements=['a','input[type=button]','input[type=submit]','h1','h2','h3','th','td']
		var selector=[]
		for (var i in elements){
			selector.push(elements[i]+':not(:has(*))')
		}
		$.unique(s$$$(selector.join(',')),'click').click(logClick)
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
				ctestui.addCommand('checkText("'+st+'")')
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
				ctestui.addCommand('type("'+selector+'","'+me.val()+'")')
			}
		}
		
		try{
			s$$$('input:not([type=checkbox]),textarea','type').change(onchange)
		}
		catch(e){
		}
	}
	,
	check:function(){
		var onchange=function(){
			var me=$(this)
			var selector=guessSelector(me)
			if (selector){
				if (me.filter(':checked').length==1)
					ctestui.addCommand('check("'+selector+'")')
				else
					ctestui.addCommand('uncheck("'+selector+'")')
			}
		}
		
		try{
			s$$$('input[type=checkbox],label').change(onchange)
		}
		catch(e){
		}
	}
	,
	select:function(){
		var onchange=function(){
			var me=$(this)
			var selector=guessSelector(me)
			if (selector){
				var option=me.children('[value='+me.val()+']').text()
				ctestui.addCommand('select("'+selector+'","'+option+'")')
			}
		}
		
		s$$$('select').change(onchange)
	}
	,
	visualFeedback : function(){ elementUnderMouse.activate(false) }
}

activateSeamless=function(){
	$('#control').slideUp()
	$('#commandbox').slideUp()
	$('textarea').addClass('tall')
	ctestui.resize()
	
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
	ctestui.log("Recording seamless is enabled until next page load.")
	ctestui.addCommand('# seamless deactivated')
	$('#control').slideDown()
	$('#commandbox').slideDown()
	$('textarea').removeClass('tall')
	ctestui.resize()
}


predictiveInput = {
	guessCommand : function(cmd){
		var i
		var r=[]
		for (i in commands){
			if (i.substr(0,cmd.length)==cmd)
				r.push(i.substr(cmd.length))
		}
		return r
	}
	,
	guessSelector : function(str, els){
		if (!els)
			els=$$$('*')
		if (str.lenght==0)
			return []
		if (str[0]=='#'){
			return predictiveInput.guessAttr(els,'id',str.substr(1))
		}
		if (str[0]=='['){
			var v=str.substr(1).split('=')
			if (v.length==2){
				return predictiveInput.guessAttr(els,v[0],v[1])
			}
			else{
				return predictiveInput.guessAttrName(els,v[0])
			}
		}
		else{
			if (str.indexOf('#')>0){
				var p=str.indexOf('#')
				var els=$$$(str.substr(0,p))
				return predictiveInput.guessSelector(str.substr(p), els)
			}
			if (str.indexOf('.')>0){
				var p=str.indexOf('.')
				var els=$$$(str.substr(0,p))
				return predictiveInput.guessSelector(str.substr(p), els)
			}
			if (str.indexOf('[')>0){
				var p=str.indexOf('[')
				var els=$$$(str.substr(0,p))
				return predictiveInput.guessSelector(str.substr(p), els)
			}
			return predictiveInput.guessTagName(els,str)
		}
	}
	,
	guessAttrName : function(els, str){
		var r={}
		var i
		var j
		for (i=0;i<els.length;i++){
			var ats=els[i].attributes
			for (j=0;j<ats.length;j++){
				var v=ats.item(j).nodeName
				if (v.substr(0,str.length)==str)
					r[v.substr(str.length)]=true
			}
		}
		var r2=[]
		for (i in r)
			r2.push(i)
		return r2;
	}
	,
	guessAttr : function(set, attr, str){
		var els=set.filter('['+attr+']')
		
		var r={}
		var i
		for (i=0;i<els.length;i++){
			var v=$(els[i]).attr(attr)
			if (v.substr(0,str.length)==str)
				r[v.substr(str.length)]=true
		}
		var r2=[]
		for (i in r)
			r2.push(i)
		return r2;
	}
	,
	guessTagName : function(els,attrName){
		attrName=attrName.toLowerCase()
		var r={}
		var i
		for (i=0;i<els.length;i++){
			var v=els[i].tagName
			if (!(v in r) && v.substr(0,attrName.length).toLowerCase()==attrName)
				r[v]=true
		}
		var r2=[]
		for (i in r)
			r2.push(i.substr(attrName.length))
		return r2;
	}
	,
	guessNext : function(str){
		if (str.indexOf('(')>0){
			if (str.indexOf('"')>0){
				var s=str.split('"')
				if (s.length==2)
					return predictiveInput.guessSelector(s[1])
			}
			if (str.indexOf("'")>0){
				var s=str.split("'")
				if (s.length==2)
					return predictiveInput.guessSelector(s[1])
			}
		}
		else{
			return predictiveInput.guessCommand(str)
		}
		return []
	}
}
elementUnderMouse={
	last_style:undefined,
	last_element:null,

	activate : function(cancelable){
		var el=$$$('body')
		mouseup=el[0].mouseup
		if (!mouseup){
			el.mousemove(elementUnderMouse.search_selector)
			if (cancelable)
				el.click(elementUnderMouse.deactivate)
		}
		el[0].mouseup=true
	}
	,
	deactivate : function(ev){
		var el=$$$('body')
		el.unbind('mousemove',elementUnderMouse.search_selector)
		el.unbind('click',elementUnderMouse.deactivate)
		if (elementUnderMouse.last_element){
			if (!elementUnderMouse.last_style)
				elementUnderMouse.last_element.removeAttr('style')
			else
				elementUnderMouse.last_element.attr('style',elementUnderMouse.last_style)
		}
		
		if (ev){
			if ($('#activateSeamless:checked').length()==0){
				ev.preventDefault()
				var cmd=$('input#runcommand')
				cmd.val(cmd.val()+guessSelector($(ev.originalEvent.target)))
			}
		}

		el[0].mouseup=false;
		return false;
	}
	,
	search_selector : function(ev){
		element=$(ev.originalEvent.target)
		if (element.is(elementUnderMouse.last_element))
			return;
		
		if (elementUnderMouse.last_element){
			if (!elementUnderMouse.last_style)
				elementUnderMouse.last_element.removeAttr('style')
			else
				elementUnderMouse.last_element.attr('style',elementUnderMouse.last_style)
		}
		elementUnderMouse.last_element=element
		elementUnderMouse.last_style=elementUnderMouse.last_element.attr('style')
		
		//console.log(ev.originalEvent)
		//console.log(guessSelector($(ev.originalEvent.target)))
		var sel=guessSelector($(ev.originalEvent.target))
		ctestui.log(sel)
		var color
		if (sel){
			color='green'
		}
		else{
			color='red'
		}
		element.attr('style','border-radius: 2px; background: '+color+'; opacity: 0.5; color: white;')
	}

}

$(document).ready(function(){
	$('input#runcommand').keyup(function(ev){
		if (ev.keyCode<33 || ev.keyCode>123)
			return
		var v=$('input#runcommand').val()
		var g=predictiveInput.guessNext(v)
		if (g.length==1){
			$('input#runcommand').val(v+g)
			createSelection($('input#runcommand')[0],v.length, (v+g).length)
		}
		if (g.length<=0 || (g.lenght==1 && g[0]=="")){
			$('#commandhelp').hide()
		}
		else{
			var ul=$('<ul>')
			for (var i in g){
				var el=$('<li>').append(v)
				var a=$('<a>'+g[i]+'</a>)').attr('href','#'+v+g[i])
				var txt=v+g[i]
				el.append(a)
				a.click(function(){
					var v=$(this).attr('href').substr(1)
					var cmd=$('input#runcommand')
					if (cmd.val().indexOf('(')<0)
						v+='("'
					else
						v+='")'
					cmd.val(v).focus()
				})
				
				ul.append(el)
			}
			
			
			$('#commandhelp').html(ul).slideDown()
		}
	})
	$('input#search_selector').click(elementUnderMouse.activate)
})

function createSelection(field, start, end) {
		if( field.createTextRange ) {
				var selRange = field.createTextRange();
				selRange.collapse(true);
				selRange.moveStart('character', start);
				selRange.moveEnd('character', end);
				selRange.select();
		} else if( field.setSelectionRange ) {
				field.setSelectionRange(start, end);
		} else if( field.selectionStart ) {
				field.selectionStart = start;
				field.selectionEnd = end;
		}
		field.focus();
}       
