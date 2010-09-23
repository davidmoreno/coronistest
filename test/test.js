/**
 * GPLv3 (C) 2010 Tuxum Secure Systems SL.
 */
ctt = { }

ctt.testname=['01-step','02-gotoerror','03-prompt']

ctt.nextTest = function(){
}

ctt.setColor = function(el, color){
	document.getElementById(el).setAttribute('style','background: '+color+';');
}

ctt.doSuite = function(){
	ctt.setColor('suiteresult','yellow')
	ctt.nextTestFinal=function(){
		ctt.setColor('suiteresult','green')
	}
	ctt.doTest(1,true)
}

/// Tests simple step on coronis test.
ctt.doTest = function(n, more){
	if (n>ctt.testname.length){
		ctt.nextTestFinal()
		return;
	}
	ctt.setColor('testresult_'+n,'yellow')
	ctt.nextTest = function(){
		ctt.setColor('testresult_'+n,'green')
		if (more)
			ctt.doTest(n+1,true)
	}
	loadIframe(ctt.testname[n-1]+'/index.html')
}


// Loads something on an iframe
loadIframe = function(html){
	document.getElementById('iframe').setAttribute('src',html)
}
