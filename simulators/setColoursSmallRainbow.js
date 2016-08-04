var PORT = 3002;
var HOST = '127.0.0.1';

var msgpack = require("msgpack-lite");

var dgram = require('dgram');
var client = dgram.createSocket('udp4');

var i = 0;

function myLoop1 () {
	setTimeout(function () {
		var r = 255-i;
		var g = i;
		var b = 0;
		var colour = ("00" + r.toString(16)).substr(-2) + ("00" + g.toString(16)).substr(-2) + ("00" + b.toString(16)).substr(-2);
		var message = new Buffer(msgpack.encode({"ns":[{"n":1,"c":colour},{"n":2,"c":colour},{"n":3,"c":colour},{"n":4,"c":colour},{"n":5,"c":colour},{"n":6,"c":colour},{"n":7,"c":colour},{"n":8,"c":colour},{"n":9,"c":colour},{"n":10,"c":colour},{"n":11,"c":colour},{"n":12,"c":colour},{"n":13,"c":colour},{"n":14,"c":colour},{"n":15,"c":colour},{"n":16,"c":colour},{"n":17,"c":colour},{"n":18,"c":colour},{"n":19,"c":colour},{"n":20,"c":colour},{"n":21,"c":colour},{"n":22,"c":colour},{"n":23,"c":colour},{"n":24,"c":colour},{"n":25,"c":colour},{"n":26,"c":colour},{"n":27,"c":colour},{"n":28,"c":colour},{"n":29,"c":colour},{"n":30,"c":colour},{"n":31,"c":colour},{"n":32,"c":colour},{"n":33,"c":colour},{"n":34,"c":colour},{"n":35,"c":colour},{"n":36,"c":colour},{"n":37,"c":colour},{"n":38,"c":colour},{"n":39,"c":colour},{"n":40,"c":colour},{"n":41,"c":colour},{"n":42,"c":colour},{"n":43,"c":colour},{"n":44,"c":colour},{"n":45,"c":colour},{"n":46,"c":colour},{"n":47,"c":colour},{"n":48,"c":colour},{"n":49,"c":colour},{"n":50,"c":colour}]}));
		client.send(message, 0, message.length, PORT, HOST);
        i++;
        if(i<255){
        	myLoop1();
        }
        else{
        	i = 0;
        	myLoop2();
        }
   }, 33);
}

function myLoop2 () {
	setTimeout(function () {
		var r = 0;
		var g = 255-i;
		var b = i;
		var colour = ("00" + r.toString(16)).substr(-2) + ("00" + g.toString(16)).substr(-2) + ("00" + b.toString(16)).substr(-2);
		var message = new Buffer(msgpack.encode({"ns":[{"n":1,"c":colour},{"n":2,"c":colour},{"n":3,"c":colour},{"n":4,"c":colour},{"n":5,"c":colour},{"n":6,"c":colour},{"n":7,"c":colour},{"n":8,"c":colour},{"n":9,"c":colour},{"n":10,"c":colour},{"n":11,"c":colour},{"n":12,"c":colour},{"n":13,"c":colour},{"n":14,"c":colour},{"n":15,"c":colour},{"n":16,"c":colour},{"n":17,"c":colour},{"n":18,"c":colour},{"n":19,"c":colour},{"n":20,"c":colour},{"n":21,"c":colour},{"n":22,"c":colour},{"n":23,"c":colour},{"n":24,"c":colour},{"n":25,"c":colour},{"n":26,"c":colour},{"n":27,"c":colour},{"n":28,"c":colour},{"n":29,"c":colour},{"n":30,"c":colour},{"n":31,"c":colour},{"n":32,"c":colour},{"n":33,"c":colour},{"n":34,"c":colour},{"n":35,"c":colour},{"n":36,"c":colour},{"n":37,"c":colour},{"n":38,"c":colour},{"n":39,"c":colour},{"n":40,"c":colour},{"n":41,"c":colour},{"n":42,"c":colour},{"n":43,"c":colour},{"n":44,"c":colour},{"n":45,"c":colour},{"n":46,"c":colour},{"n":47,"c":colour},{"n":48,"c":colour},{"n":49,"c":colour},{"n":50,"c":colour}]}));
		client.send(message, 0, message.length, PORT, HOST);
        i++;
        if(i<255){
        	myLoop2();
        }
        else{
        	i = 0;
        	myLoop3();
        }
   }, 33);
}

function myLoop3 () {
	setTimeout(function () {
		var r = i;
		var g = 0;
		var b = 255-i;
		var colour = ("00" + r.toString(16)).substr(-2) + ("00" + g.toString(16)).substr(-2) + ("00" + b.toString(16)).substr(-2);
		var message = new Buffer(msgpack.encode({"ns":[{"n":1,"c":colour},{"n":2,"c":colour},{"n":3,"c":colour},{"n":4,"c":colour},{"n":5,"c":colour},{"n":6,"c":colour},{"n":7,"c":colour},{"n":8,"c":colour},{"n":9,"c":colour},{"n":10,"c":colour},{"n":11,"c":colour},{"n":12,"c":colour},{"n":13,"c":colour},{"n":14,"c":colour},{"n":15,"c":colour},{"n":16,"c":colour},{"n":17,"c":colour},{"n":18,"c":colour},{"n":19,"c":colour},{"n":20,"c":colour},{"n":21,"c":colour},{"n":22,"c":colour},{"n":23,"c":colour},{"n":24,"c":colour},{"n":25,"c":colour},{"n":26,"c":colour},{"n":27,"c":colour},{"n":28,"c":colour},{"n":29,"c":colour},{"n":30,"c":colour},{"n":31,"c":colour},{"n":32,"c":colour},{"n":33,"c":colour},{"n":34,"c":colour},{"n":35,"c":colour},{"n":36,"c":colour},{"n":37,"c":colour},{"n":38,"c":colour},{"n":39,"c":colour},{"n":40,"c":colour},{"n":41,"c":colour},{"n":42,"c":colour},{"n":43,"c":colour},{"n":44,"c":colour},{"n":45,"c":colour},{"n":46,"c":colour},{"n":47,"c":colour},{"n":48,"c":colour},{"n":49,"c":colour},{"n":50,"c":colour}]}));
		client.send(message, 0, message.length, PORT, HOST);
        i++;
        if(i<255){
        	myLoop3();
        }
        else{
        	i = 0;
        	myLoop1();
        }
   }, 33);
}

myLoop1();