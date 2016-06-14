var app = require('express')();
var express = require('express');
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');


var dgram = require('dgram');
var udp = dgram.createSocket('udp4');


var UDP_PORT = 33333;
var UDP_HOST = '0.0.0.0';

server.listen(3000);

var nodeIDs = safelyParseJSON(fs.readFileSync('nodes.json', 'utf8'));

app.use('/', express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('syncRequest', function(msg){
    // Grab all entries and send them
    console.log('syncRequest received');
    socket.emit('syncResponce', nodeIDs);
  });
});


// UDP functions
udp.on('listening', function () {
    var address = udp.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

udp.on('message', function (message, remote) {
	console.log(`got:${message}`);

    var messageJSON = safelyParseJSON(message.toString());

    if(messageJSON != undefined){
	    if ((messageJSON.mac != undefined) && (messageJSON.ip != undefined) && (messageJSON.current_voltage != undefined) && (messageJSON.lowest_voltage != undefined) && (messageJSON.name != undefined) && (messageJSON.output_enabled != undefined)){
	      // console.log(messageJSON);
	      // Add code to emit io message
        messageJSON.nodeID = nodeIDs[messageJSON.name].nodeID;
        messageJSON.colour = nodeIDs[messageJSON.name].colour;
        messageJSON.enabled = nodeIDs[messageJSON.name].enabled;
        nodeIDs[messageJSON.name].online = true;
        messageJSON.online = nodeIDs[messageJSON.name].online;
        if(nodeIDs[messageJSON.name].current_voltage_data.push(messageJSON.current_voltage) > 6500){
          nodeIDs[messageJSON.name].current_voltage_data.shift();
        }
        if(nodeIDs[messageJSON.name].lowest_voltage_data.push(messageJSON.lowest_voltage) > 6500){
          nodeIDs[messageJSON.name].lowest_voltage_data.shift();
        }
	      io.emit('beat', messageJSON);
	      //io.emit('heartbeat', messageJSON);
	    }
	}

});

udp.bind(UDP_PORT, UDP_HOST);

// Helper functions
function safelyParseJSON (json) {
  // This function cannot be optimised, it's best to
  // keep it small!

  // preserve newlines, etc - use valid JSON

  json = json.replace(/\0/g, '');

  var parsed

  try {
    parsed = JSON.parse(json);
  } catch (e) {
    // Oh well, but whatever...
    console.log(e);
  }

  return parsed;; // ould be undefined!
}