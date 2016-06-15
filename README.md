# lumos
## Communication
### Get node info
To obtain a JSON file of all configured nodes, GET /nodes.json

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
To set node colours, PUT a JSON file to /setnodes

Example:
```
{
  nodes : [
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