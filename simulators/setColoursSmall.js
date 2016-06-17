var PORT = 3002;
var HOST = '127.0.0.1';

var msgpack = require("msgpack-lite");

var dgram = require('dgram');
var message = new Buffer(msgpack.encode({"ns":[{"n":1,"c":"00F431"},{"n":2,"c":"000000"},{"n":6,"c":"00F431"}]}));

var client = dgram.createSocket('udp4');
client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + HOST +':'+ PORT);
    client.close();
});