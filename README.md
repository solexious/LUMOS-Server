# lumos
## Install
You will need a current version of nodejs and nodemon installed.

Install dependencies using `npm install`

## Run
Recomended to run with `nodemon`

## Communication
### Get node info
#### HTTP
To obtain a JSON file of all configured nodes, GET /nodes on port 3000.

Example: 
```
{
  "nodes" : [
    {
      "nodeID": 1,
      "battery": 0,
      "online": false,
      "enabled": true,
      "colour": "000000"
    },
    {
      "nodeID": 2,
      "battery": 97,
      "online": true,
      "enabled": true,
      "colour": "FF0032"
    },
    ...
  ]
}
```

### Set node colour
#### HTTP
To set node colours, PUT a JSON file to /nodes on port 3000.

You can update the colour of as many or few nodes and in any order you wish.

Example:
```
{
  "nodes" : [
    {
      "nodeID" : 1,
      "colour" : "00F431"
    },
    {
      "nodeID" : 2,
      "colour" : "00F431"
    },
    {
      "nodeID" : 6,
      "colour" : "00F431"
    },
    ...
  ]
}
```
Response:
```
{
  "nodes": [
    {
      "nodeID": 1,
      "result": "success"
    },
    {
      "nodeID": 2,
      "result": "success"
    },
    {
      "nodeID": 6,
      "result": "success"
    },
    ...
  ]
}
```
Possible results:
* `success` - colour saved successfully.
* `nodeID not found` - could not find a node with given ID.
* `invalid nodeID` - nodeID wasn't a valid integer.
* `missing nodeID` - a nodeID wasn't provided.
* `invalid colour` - colour given wasn't a 6 character hex colour.
* `missing colour` - a colour wasn't provided.

#### UDP Packet
##### Full text JSON
The format of the JSON is the same as a normall HTTP call, but all white space should be removed to minimise the packet size.

UDP packets should be sent to port 3001, no response is given.

#### MessagePack JSON
A smaller packer size version is avalible, this should be sent to port 3002. This utilizes MessagePack data serialisation, libraries for this can be found at: [http://msgpack.org](http://msgpack.org)

The format is as follows (MessagePack removes white space by default):
```
{
  "nodes" : [
    {
      "n" : 1,
      "c" : "00F431"
    },
    {
      "n" : 2,
      "c" : "00F431"
    },
    {
      "n" : 6,
      "c" : "00F431"
    },
    ...
  ]
}
```
No response is given to UDP Packets.