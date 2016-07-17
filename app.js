var app = require('express')();
var express = require('express');
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var bodyParser = require('body-parser');
var Artnet = require('artnet');
var ping = require ("net-ping");
var _ = require('lodash');

var msgpack = require("msgpack-lite");

var dgram = require('dgram');
var udpBeat = dgram.createSocket('udp4');
var udpSetColourLong = dgram.createSocket('udp4');
var udpSetColourShort = dgram.createSocket('udp4');

var options = {
    networkProtocol: ping.NetworkProtocol.IPv4,
    retries: 0,
    timeout: 2000,
    ttl: 128
};
var pingSession = ping.createSession();


var UDP_BEAT_PORT = 33333;
var UDP_BEAT_HOST = '0.0.0.0';
var UDP_COLOUR_LONG_PORT = 3001;
var UDP_COLOUR_LONG_HOST = '0.0.0.0';
var UDP_COLOUR_SHORT_PORT = 3002;
var UDP_COLOUR_SHORT_HOST = '0.0.0.0';

server.listen(3000);

var nodefile = safelyParseJSON(fs.readFileSync('nodes.json', 'utf8'));
var nodes = nodefile.nodes;
var nodeIDs = safelyParseJSON(fs.readFileSync('nodeIDs.json', 'utf8'));
var timeouts = [];
var artnetInstances = [];

(function(){
  nodes.forEach(function(cur, i){
    artnetInstances[nodes[i].nodeID - 1] = Artnet({host:"0.0.0.0",refresh:1000,minPackageLength:3,maxPackageLength:10,enabled:false,frameDelay:30});
    artnetInstances[nodes[i].nodeID - 1].set([0,0,0]);
  });
})();

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.route('/nodes')
  .get(function(req, res, next){
    res.type('application/json');

    var jsonNodes = {};
    jsonNodes.nodes = [];
    nodes.forEach(function(cur, i) {
        jsonNodes.nodes.push({"nodeID" : nodes[i].nodeID, "battery" : nodes[i].battery, "online" : nodes[i].online, "enabled" : nodes[i].enabled, "colour" : nodes[i].colour});
    });

    res.send(JSON.stringify(jsonNodes, null, 2));
  })
  .put(function(req, res, next){
    // Itterate over array of nodes and set colours in main array
    var responce = {"nodes" : []};

    if(req.body.nodes !== undefined){
      rec.body.nodes.forEach(function(cur, i) {
        // Do we have an id?
        if(req.body.nodes[i].nodeID !== undefined){
          // Is it a number?
          if(typeof req.body.nodes[i].nodeID == "number"){
            // Do we have a colour?
            if(req.body.nodes[i].colour !== undefined){
              // Is it a valid colour?
              if(req.body.nodes[i].colour.match(/^(?:[0-9a-fA-F]{3}){1,2}$/)){
                // We got totally valid data, now check we have that node
                if(nodes[req.body.nodes[i].nodeID] !== undefined){
                  // It exists! Update the colour
                  nodes[req.body.nodes[i].nodeID - 1].colour = req.body.nodes[i].colour;
                  responce.nodes.push({"nodeID":req.body.nodes[i].nodeID,"result":"success"});
                  if(nodes[req.body.nodes[i].nodeID - 1].enabled === true){
                    artnetInstances[req.body.nodes[i].nodeID - 1].set([parseInt(req.body.nodes[i].colour[0] + req.body.nodes[i].colour[1], 16),parseInt(req.body.nodes[i].colour[2] + req.body.nodes[i].colour[3], 16),parseInt(req.body.nodes[i].colour[4] + req.body.nodes[i].colour[5], 16)]);
                  }
                }
                else{
                  responce.nodes.push({"nodeID":req.body.nodes[i].nodeID,"result":"nodeID not found"});
                }
              }
              else{
                responce.nodes.push({"nodeID":req.body.nodes[i].nodeID,"result":"invalid colour"});
              }
            }
            else{
              responce.nodes.push({"nodeID":req.body.nodes[i].nodeID,"result":"missing colour"});
            }
          }
          else{
            responce.nodes.push({"nodeID":req.body.nodes[i].nodeID,"result":"invalid nodeID"});
          }
        }
        else{
          responce.nodes.push({"nodeID":"?","result":"missing nodeID"});
        }
      });
    }
    res.send(responce);
  });

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('syncRequest', function(msg){
    // Grab all entries and send them
    console.log('syncRequest received');
    socket.emit('syncResponce', nodes);
  });

  socket.on('enabled', function(msg){
    // Set node as enabled/disabled
    console.log(msg);
    if((msg.nodeID !== undefined) && (msg.enabled !== undefined)){
      nodes[msg.nodeID - 1].enabled = msg.enabled;
      var nodesToSave = safelyParseJSON(fs.readFileSync('nodes.json', 'utf8'));
      nodesToSave.nodes[msg.nodeID - 1].enabled = msg.enabled;
      fs.writeFile("nodes.json", JSON.stringify(nodesToSave, null, 2));
      if((nodes[msg.nodeID - 1].enabled) && (nodes[msg.nodeID - 1].online)){
        artnetInstances[msg.nodeID - 1].enable();
        artnetInstances[msg.nodeID - 1].set([parseInt(nodes[msg.nodeID - 1].colour[0] + nodes[msg.nodeID - 1].colour[1], 16),parseInt(nodes[msg.nodeID - 1].colour[2] + nodes[msg.nodeID - 1].colour[3], 16),parseInt(nodes[msg.nodeID - 1].colour[4] + nodes[msg.nodeID - 1].colour[5], 16)]);
      }
      else{
        artnetInstances[msg.nodeID - 1].set([0,0,0]);
        setTimeout(function (){
          artnetInstances[msg.nodeID - 1].disable();
        }, 30);
      }
    }
    io.emit('nodeUpdated', {nodeID: msg.nodeID, enabled: nodes[msg.nodeID - 1].enabled});
  });

  socket.on('enabledAll', function(msg){
    console.log(msg);
    var nodesToSave = safelyParseJSON(fs.readFileSync('nodes.json', 'utf8'));
    nodes.forEach(function(cur, i) {
      nodes[i].enabled = msg.enabled;
      id = nodes[i].nodeID - 1;
      nodesToSave.nodes[id].enabled = msg.enabled;
      if((nodes[i].enabled) && (nodes[i].online)){
        artnetInstances[id].enable();
        artnetInstances[id].set([parseInt(nodes[id].colour[0] + nodes[id].colour[1], 16),parseInt(nodes[id].colour[2] + nodes[id].colour[3], 16),parseInt(nodes[id].colour[4] + nodes[id].colour[5], 16)]);
      }
      else{
        artnetInstances[id].set([0,0,0]);
        setTimeout(function (){
          artnetInstances[id].disable();
        }, 30);
      }
      io.emit('nodeUpdated', {nodeID:nodes[i].nodeID, enabled:msg.enabled});
    });
    fs.writeFile("nodes.json", JSON.stringify(nodesToSave, null, 2));
  });
});


// UDP functions
udpBeat.on('listening', function () {
    var address = udpBeat.address();
    // console.log('UDP Beat Server listening on ' + address.address + ":" + address.port);
});

udpSetColourLong.on('listening', function () {
    var address = udpSetColourLong.address();
    // console.log('UDP Colour Set Long Server listening on ' + address.address + ":" + address.port);
});

udpSetColourShort.on('listening', function () {
    var address = udpSetColourShort.address();
    // console.log('UDP Colour Set Short Server listening on ' + address.address + ":" + address.port);
});

udpBeat.on('message', function (message, remote) {
  //console.log('got beat: ' + message);

  var messageJSON = safelyParseJSON(message.toString());

  if(messageJSON !== undefined){
    if ((messageJSON.mac !== undefined) && (messageJSON.ip !== undefined) && (messageJSON.max_voltage !== undefined) && (messageJSON.min_voltage !== undefined) && (messageJSON.current_voltage !== undefined) && (messageJSON.lowest_voltage !== undefined) && (messageJSON.name !== undefined) && (messageJSON.output_enabled !== undefined)){

      // Get node id
      var nodeID = nodeIDs[messageJSON.name] - 1;

      // Add voltage percent to nodes
      nodes[nodeID ].battery = Math.round((messageJSON.current_voltage - messageJSON.min_voltage) / ((messageJSON.max_voltage - messageJSON.min_voltage) / 100));
      if(nodes[nodeID].battery < 0){
        nodes[nodeID].battery = 0;
      }
      else if(nodes[nodeID].battery > 100){
        nodes[nodeID].battery = 100;
      }

      // Save data to array for initial loading of page
      _.extend(nodes[nodeID], messageJSON);

      if(nodes[nodeID].current_voltage_data.push(messageJSON.current_voltage) > 6500){
        nodes[nodeID].current_voltage_data.shift();
      }
      if(nodes[nodeID].lowest_voltage_data.push(messageJSON.lowest_voltage) > 6500){
        nodes[nodeID].lowest_voltage_data.shift();
      }

      // Setup artnet
      artnetInstances[nodeID].setHost(messageJSON.ip);
      if((nodes[nodeID].online) && (nodes[nodeID].enabled)){
        artnetInstances[nodeID].enable();
      }

      var result = Object.assign({}, nodes[nodeID]);
      delete result.current_voltage_data;
      delete result.lowest_voltage_data;

      io.emit('nodeUpdated', result);

      pingSession.pingHost(nodes[nodeID].ip, function (error, target){
      if (error){
        console.log(target + ": " + error.toString ());
      }
      else{
        nodes[nodeID].online = true;
        if(nodes[nodeID].enabled === true){
          artnetInstances[nodeID].enable();
        }
        io.emit('nodeUpdated', {"nodeID":nodeID + 1,"online":nodes[nodeID].online});
        // Start timer to make offline
        if(timeouts[nodeID] !== undefined){
          clearTimeout(timeouts[nodeID]);
        }
        timeouts[nodeID] = setTimeout(function() { setOffline(nodeID + 1); }, 25000);
      }
      });
    }
	}
});

udpSetColourLong.on('message', function (message, remote) {
  //console.log(`got colour long:${message}`);

  var messageJSON = safelyParseJSON(message.toString());

  if(messageJSON.nodes !== undefined){
    messageJSON.nodes.forEach(function(cur, i) {
      // Do we have an id?
      if(messageJSON.nodes[i].nodeID !== undefined){
        // Is it a number?
        if(typeof messageJSON.nodes[i].nodeID == "number"){
          // Do we have a colour?
          if(messageJSON.nodes[i].colour !== undefined){
            // Is it a valid colour?
            if(messageJSON.nodes[i].colour.match(/^(?:[0-9a-fA-F]{3}){1,2}$/)){
              // We got totally valid data, now check we have that node
              if(nodes[messageJSON.nodes[i].nodeID - 1] !== undefined){
                // It exists! Update the colour
                nodes[messageJSON.nodes[i].nodeID - 1].colour = messageJSON.nodes[i].colour;
                if(nodes[messageJSON.nodes[i].nodeID - 1].enabled === true){
                  artnetInstances[messageJSON.nodes[i].nodeID - 1].set([parseInt(messageJSON.nodes[i].colour[0] + messageJSON.nodes[i].colour[1], 16),parseInt(messageJSON.nodes[i].colour[2] + messageJSON.nodes[i].colour[3], 16),parseInt(messageJSON.nodes[i].colour[4] + messageJSON.nodes[i].colour[5], 16)]);
                }
              }
            }
          }
        }
      }
    });
  }
});

udpSetColourShort.on('message', function (message, remote) {
  //console.log(`got colour short`);

  var messageJSON = msgpack.decode(message);

  if(messageJSON.ns !== undefined){
    messageJSON.ns.forEach(function(cur, i) {
      // Do we have an id?
      if(messageJSON.ns[i].n !== undefined){
        // Is it a number?
        if(typeof messageJSON.ns[i].n == "number"){
          // Do we have a colour?
          if(messageJSON.ns[i].c !== undefined){
            // Is it a valid colour?
            if(messageJSON.ns[i].c.match(/^(?:[0-9a-fA-F]{3}){1,2}$/)){
              // We got totally valid data, now check we have that node
              if(nodes[messageJSON.ns[i].n - 1] !== undefined){
                // It exists! Update the colour
                nodes[messageJSON.ns[i].n - 1].colour = messageJSON.ns[i].c;
                if(nodes[messageJSON.ns[i].n - 1].enabled === true){
                  artnetInstances[messageJSON.ns[i].n - 1].set([parseInt(messageJSON.ns[i].c[0] + messageJSON.ns[i].c[1], 16),parseInt(messageJSON.ns[i].c[2] + messageJSON.ns[i].c[3], 16),parseInt(messageJSON.ns[i].c[4] + messageJSON.ns[i].c[5], 16)]);
                }
              }
            }
          }
        }
      }
    });
  }
});

function setOffline(nodeID) {
  // console.info("offline");
  nodes[nodeID - 1].online = false;
  artnetInstances[nodeID - 1].disable();
  io.emit('nodeUpdated', {"nodeID":nodeID,"online":nodes[nodeID - 1].online});
}

(function() {
  var timeout = setInterval(function(){
    io.emit('updateNodes', nodes.map( function(current, index, array){
      return {"nodeID": current.nodeID, "colour": current.colour};
    }));
  }, 1000);
})();

udpBeat.bind(UDP_BEAT_PORT, UDP_BEAT_HOST);
udpSetColourLong.bind(UDP_COLOUR_LONG_PORT, UDP_COLOUR_LONG_HOST);
udpSetColourShort.bind(UDP_COLOUR_SHORT_PORT, UDP_COLOUR_SHORT_HOST);

// Helper functions
function safelyParseJSON (json) {
  // This function cannot be optimised, it's best to
  // keep it small!

  // preserve newlines, etc - use valid JSON

  json = json.replace(/\0/g, '');

  var parsed;

  try {
    parsed = JSON.parse(json);
  } catch (e) {
    // Oh well, but whatever...
    // console.log(e);
  }

  return parsed; // ould be undefined!
}