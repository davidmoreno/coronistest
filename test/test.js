/**
 * GPLv3 (C) 2010 Tuxum Secure Systems SL.
 */
ctt = { }

ctt.nextTest = function(){
}

ctt.setColor = function(el, color){
	document.getElementById(el).setAttribute('style','background: '+color+';');
}

ctt.doSuite = function(){
	ctt.setColor('suiteresult','yellow')
	ctt.nextTest=function(){
		ctt.setColor('suiteresult','green')
	}
	ctt.doTest1()
}

/// Tests simple step on coronis test.
ctt.doTest1 = function(){
	ctt.setColor('testresult_1','yellow')
	setTimeout(function(){
		ctt.setColor('testresult_1','green')
			ctt.nextTest()
		}, 1000);
}
