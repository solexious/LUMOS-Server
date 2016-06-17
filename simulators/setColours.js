var PORT = 3001;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var message = new Buffer('{"nodes":[{"nodeID":1,"colour":"00F431"},{"nodeID":2,"colour":"FF0000"},{"nodeID":6,"colour":"00F431"}]}');

var client = dgram.createSocket('udp4');
client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + HOST +':'+ PORT);
    client.close();
});