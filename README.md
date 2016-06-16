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
      "nodeID" : "1",
      "colour" : "00F431"
    },
    {
      "nodeID" : "2",
      "colour" : "00F431"
    },
    {
      "nodeID" : "6",
      "colour" : "00F431"
    },
    ...
  ]
}
```
## Install
You will need a current version of nodejs and nodemon installed.

Install dependencies using `npm install`

## Run
Recomended to run with `nodemon`