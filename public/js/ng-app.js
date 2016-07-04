(function() {
  var app = angular.module('lumosControl',['btford.socket-io']);

  app.factory('socket', function (socketFactory) {
    return socketFactory();
  });

  app.controller('NodeController', function(socket){
    var nodeCtrl = this;
    this.nodes = [];

    socket.on('connect', function(){
      console.log("socket.io connected");
      socket.emit('syncRequest');
    });

    socket.on('syncResponce', function(msg){
      nodeCtrl.nodes = msg;
    });
  });

  app.directive('nodeButton', [function(){
    // Runs during compile
    return {
      restrict: 'E',
      templateUrl: 'node-button.html'
    };
  }]);

  app.directive('nodeModal', [function(){
    // Runs during compile
    return {
      restrict: 'E',
      templateUrl: 'node-modal.html'
    };
  }]);

  app.filter('numberFixedLen', function () {
    return function(a,b){
        return(1e4+""+a).slice(-b);
    };
  });

  var nodes = [{
    battery: 25,
    colour: "000000",
    current_voltage: 800,
    current_voltage_data: [
      802,
      801,
      802,
      800
    ],
    enabled: true,
    hw_version: "0.2",
    ip: "192.168.0.111",
    lowest_voltage: 800,
    lowest_voltage_data: [
      802,
      801,
      801,
      800
    ],
    mac: "5C:CF:7F:14:60:35",
    name: "LUMOS-1460FF",
    nodeID: 1,
    online: false,
    sw_version: "0.41"
  },{
    battery: 25,
    colour: "000000",
    current_voltage: 800,
    current_voltage_data: [
      802,
      801,
      802,
      800
    ],
    enabled: true,
    hw_version: "0.2",
    ip: "192.168.0.111",
    lowest_voltage: 800,
    lowest_voltage_data: [
      802,
      801,
      801,
      800
    ],
    mac: "5C:CF:7F:14:60:35",
    name: "LUMOS-146035",
    nodeID: 2,
    online: true,
    sw_version: "0.41"
  },{
    battery: 25,
    colour: "000000",
    current_voltage: 800,
    current_voltage_data: [
      802,
      801,
      802,
      800
    ],
    enabled: false,
    hw_version: "0.2",
    ip: "192.168.0.111",
    lowest_voltage: 800,
    lowest_voltage_data: [
      802,
      801,
      801,
      800
    ],
    mac: "5C:CF:7F:14:60:35",
    name: "LUMOS-FF3311",
    nodeID: 3,
    online: true,
    sw_version: "0.41"
  }];
})();