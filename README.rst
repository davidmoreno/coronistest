Coronis Test
============


Inline javascript
-----------------

It can embed any javascript code inside the test. It acts as a single command, and it will be executed when
at that line. It is useful for example to define new custom commands that need javascript. This can be performed 
as:

javascript{
	commands['mycommand'] = function(){
		throw { text:"Always fails", may_appear_later:false }
	}
}

It is actually a shortcut for several lines of:

eval('alert("alert")')

