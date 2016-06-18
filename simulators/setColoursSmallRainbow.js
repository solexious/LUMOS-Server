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
		var message = new Buffer(msgpack.encode({"ns":[{"n":2,"c":colour}]}));
		client.send(message, 0, message.length, PORT, HOST);
        i++;
        if(i<255){
        	myLoop1();
        }
        else{
        	i = 0;
        	myLoop2();
        }
   }, 60)
}

function myLoop2 () {
	setTimeout(function () {
		var r = 0;
		var g = 255-i;
		var b = i;
		var colour = ("00" + r.toString(16)).substr(-2) + ("00" + g.toString(16)).substr(-2) + ("00" + b.toString(16)).substr(-2);
		var message = new Buffer(msgpack.encode({"ns":[{"n":2,"c":colour}]}));
		client.send(message, 0, message.length, PORT, HOST);
        i++;
        if(i<255){
        	myLoop2();
        }
        else{
        	i = 0;
        	myLoop3();
        }
   }, 60)
}

function myLoop3 () {
	setTimeout(function () {
		var r = i;
		var g = 0;
		var b = 255-i;
		var colour = ("00" + r.toString(16)).substr(-2) + ("00" + g.toString(16)).substr(-2) + ("00" + b.toString(16)).substr(-2);
		var message = new Buffer(msgpack.encode({"ns":[{"n":2,"c":colour}]}));
		client.send(message, 0, message.length, PORT, HOST);
        i++;
        if(i<255){
        	myLoop3();
        }
        else{
        	i = 0;
        	myLoop1();
        }
   }, 60)
}

myLoop1();