# lumos
## Communication
All urls accessed via port 3000

### Get node info
To obtain a JSON file of all configured nodes, GET /nodes

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
To set node colours, PUT a JSON file to /nodes

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
* `success` - colour saved successfully
* `nodeID not found` - could not find a node with given ID
* `invalid colour` - colour given wasn't a 6 character hex colour
* `missing colour` - a colour wasn't provided
* `invalid nodeID` - nodeID wasn't a valid integer
* `missing nodeID` - a nodeID wasn't provided

## Install
You will need a current version of nodejs and nodemon installed.

Install dependencies using `npm install`

## Run
Recomended to run with `nodemon`