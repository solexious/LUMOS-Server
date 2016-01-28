var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);


var dgram = require('dgram');
var udp = dgram.createSocket('udp4');


var UDP_PORT = 33333;
var UDP_HOST = '0.0.0.0';

server.listen(3000);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});


// UDP functions
udp.on('listening', function () {
    var address = udp.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

udp.on('message', function (message, remote) {
	// console.log(`server got: ${message} from ${remote.address}:${remote.port}`);

    var messageJSON = safelyParseJSON(message.toString());

    if(messageJSON != undefined){
	    if ((messageJSON.mac != undefined) && (messageJSON.ip != undefined) && (messageJSON.voltage != undefined)){
	      // console.log(messageJSON);
	      // Add code to emit io message
	      io.emit('chat message', messageJSON);
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