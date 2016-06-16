var app = require('express')();
var express = require('express');
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var bodyParser = require('body-parser');

var dgram = require('dgram');
var udp = dgram.createSocket('udp4');


var UDP_PORT = 33333;
var UDP_HOST = '0.0.0.0';

server.listen(3000);

var nodes = safelyParseJSON(fs.readFileSync('nodes.json', 'utf8'));
var nodeIDs = safelyParseJSON(fs.readFileSync('nodeIDs.json', 'utf8'));
var timeouts = [];

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.route('/nodes')
  .get(function(req, res, next){
    res.type('application/json');

    console.info(nodes.length);
    var jsonNodes = {};
    jsonNodes.nodes = [];
    for (var property in nodes) {
      if(nodes.hasOwnProperty(property)){
        jsonNodes.nodes.push({"nodeID" : nodes[property].nodeID, "battery" : nodes[property].battery, "online" : nodes[property].online, "enabled" : nodes[property].enabled, "colour" : nodes[property].colour});
      }
    }

    res.send(JSON.stringify(jsonNodes, null, 2));
  })
  .put(function(req, res, next){
    // Itterate over array of nodes and set colours in main array
    var responce = {"nodes" : []};
    // var responce["nodes"] = new Array();

    if(req.body.nodes != undefined){
      for(var i = 0; i < req.body.nodes.length; i++){
        // Do we have an id?
        if(req.body.nodes[i].nodeID != undefined){
          // Is it a number?
          if(typeof req.body.nodes[i].nodeID == "number"){
            // Do we have a colour?
            if(req.body.nodes[i].colour != undefined){
              // Is it a valid colour?
              console.info(typeof req.body.nodes[i].colour);
              console.info(req.body.nodes[i].colour);
              if(req.body.nodes[i].colour.match(/^(?:[0-9a-fA-F]{3}){1,2}$/)){
                // We got totally valid data, now check we have that node
                if(nodes[req.body.nodes[i].nodeID] != undefined){
                  // It exists! Update the colour
                  nodes[req.body.nodes[i].nodeID].colour = req.body.nodes[i].colour;
                  responce.nodes.push({"nodeID":req.body.nodes[i].nodeID,"result":"success"});
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
      }
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
      if ((messageJSON.mac != undefined) && (messageJSON.ip != undefined) && (messageJSON.max_voltage != undefined) && (messageJSON.min_voltage != undefined) && (messageJSON.current_voltage != undefined) && (messageJSON.lowest_voltage != undefined) && (messageJSON.name != undefined) && (messageJSON.output_enabled != undefined)){

        // Get node id
        var nodeID = nodeIDs[messageJSON.name];

        // Add voltage percent to nodes
        nodes[nodeID].battery = Math.round((messageJSON.current_voltage - messageJSON.min_voltage) / ((messageJSON.max_voltage - messageJSON.min_voltage) / 100));
        if(nodes[nodeID].battery < 0){
          nodes[nodeID].battery = 0;
        }
        else if(nodes[nodeID].battery > 100){
          nodes[nodeID].battery = 100;
        }

        // Add code to emit io message
        messageJSON.nodeID = nodes[nodeID].nodeID;
        messageJSON.colour = nodes[nodeID].colour;
        messageJSON.enabled = nodes[nodeID].enabled;
        nodes[nodeID].online = true;
        messageJSON.online = nodes[nodeID].online;
        if(nodes[nodeID].current_voltage_data.push(messageJSON.current_voltage) > 6500){
          nodes[nodeID].current_voltage_data.shift();
        }
        if(nodes[nodeID].lowest_voltage_data.push(messageJSON.lowest_voltage) > 6500){
          nodes[nodeID].lowest_voltage_data.shift();
        }

        // Start timer to make offline
        if(timeouts[nodeID] != undefined){
          clearTimeout(timeouts[nodeID]);
        }
        timeouts[nodeID] = setTimeout(function() { setOffline(nodeID) }, 25000);

	      io.emit('beat', messageJSON);
	    }
	}
});

function setOffline(nodeID) {
  console.info("offline");
  nodes[name].online = false;
  io.emit('online-status', {"nodeID":nodeID,"online":nodes[nodeID].online});
}

(function() {
  var timeout = setInterval(function(){
    var output = {nodes:[]};
    for(var i = 0; i < Object.keys(nodes).length; i++){
      output.nodes.push({"nodeID":nodes[i+1].nodeID,"colour":nodes[i+1].colour});
    }
    io.emit('colours', output);
  }, 1000);
})();

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