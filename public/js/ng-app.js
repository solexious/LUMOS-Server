(function() {
  var app = angular.module('lumosControl',['btford.socket-io', 'chart.js']);

  app.factory('socket', function (socketFactory) {
    return socketFactory();
  });

  app.controller('NodeController', function(socket){
    var nodeCtrl = this;
    this.nodes = [];

    this.toggleEnabled = function(nodeID){
      socket.emit('enabled', {nodeID: nodeID, enabled: !nodeCtrl.nodes[nodeID - 1].enabled});
    };

    socket.on('connect', function(){
      socket.emit('syncRequest');
    });

    socket.on('syncResponce', function(msg){
      console.log(msg);
      nodeCtrl.nodes = msg;
    });

    socket.on('updateNodes', function(msg){
      console.log(msg);
      for(var i = 0; i < msg.length; i++){
        $.extend(nodeCtrl.nodes[msg[i].nodeID - 1], msg[i]);
      }
    });

    socket.on('nodeUpdated', function(msg){
      console.log(msg);
      $.extend(nodeCtrl.nodes[msg.nodeID - 1], msg);
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
})();