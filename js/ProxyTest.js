function ProxyTest() {}
(function(){
	"use strict";
	Object.defineProperty(ProxyTest,"create",{
		writable:false,configurable:false,enumerable:true,
		value: function(o,tests) {
			var test = Object.create(ProxyTest.prototype,{
				target: {
					writable:false, configurable: false, enumerable:false,
					value: o
				}
			});
			
			Object.getOwnPropertyNames(tests).forEach(function(name){
				Object.defineProperty(
					test,name,Object.getOwnPropertyDescriptor(tests,name)
				);
			});
			
			var handler = {
				"getOwnPropertyDescriptor": function(name) {
					var desc = Object.getOwnPropertyDescriptor(o, name);
					if (desc !== undefined) { desc.configurable = true; }
					return desc;
				},
				"getPropertyDescriptor": function(name) {
					var desc = Object.getPropertyDescriptor(o, name);
					if (desc !== undefined) { desc.configurable = true; }
					return desc;
				},
				"getOwnPropertyNames": function() {
					return Object.getOwnPropertyNames(o);
				},
				"getPropertyNames": function() {
					return Object.getPropertyNames(o);
				},
				"defineProperty": function(name, desc) {
					Object.defineProperty(o, name, desc);
				},
				"delete": function(name) { return delete o[name]; },
				"fix": function() {
					if (Object.isFrozen(o)) {
						var result = {};
						Object.getOwnPropertyNames(o).forEach(function(name) {
							result[name] = Object.getOwnPropertyDescriptor(o, name);
						});
						return result;
					}
					return undefined;
				},
				"has": function(name) { return name in o; },
				"hasOwn": function(name) { return ({}).hasOwnProperty.call(o, name); },
				"get": function(receiver, name) {
					var testMethod = ["test",name.substr(1)].join(name.substr(0,1).toUpperCase());
					
					if (typeof test[testMethod]==="function"){
						
						return function() {
							console.timeStamp();
							var result = o[name].apply(this,arguments);
							var argv = [result];
							
							for ( var i = 0 , t = arguments.length ; i < t ; ++i ) {
								argv.push(arguments[i]);
							}
							
							try {
								test[testMethod].apply(test,argv);
								console.info(testMethod + " success.");
							} catch ( e ) {
								console.error( testMethod + " fail:",e);
							}
							
							
							return result;
						};
					}
					
					return o[name];
				},
				"set": function(receiver, name, val) {
					o[name] = val;
					return true;
				},
				"enumerate": function() {
					var result = [];
					for (var name in o) { result.push(name); };
					return result;
				},
				"keys": function() { return Object.keys(o); }
			};
			
			return Proxy.create( handler , Object.getPrototypeOf( o ) );
		}
	});

	Object.defineProperties(ProxyTest.prototype,{
		assert: {
			writable:false,configurable:false,enumerable:true,
			value: function(assertion,message) {
				if (!assertion) throw (message||"");
			}
		},
		assertEquals: {
			writable:false,configurable:false,enumerable:true,
			value: function(expected,actual,message) {
				this.assert(expected==actual,message);
			}
		},
		assertObjectHasProperty: {
			writable:false,configurable:false,enumerable:true,
			value: function(property,object,message) {
				this.assert( Object.getOwnPropertyNames(object).indexOf(property) >= 0 , message);
			}
		}
	});
}());