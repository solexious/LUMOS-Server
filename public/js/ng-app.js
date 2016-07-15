(function() {
  var app = angular.module('lumosControl',['btford.socket-io', 'chart.js']);

  app.factory('socket', function (socketFactory) {
    return socketFactory();
  });

  app.controller('NodeController', function(socket){
    var nodeCtrl = this;
    this.nodes = [];

    this.toggleEnabled = function(nodeID){
      socket.emit('enabled', {nodeID: nodeID, enabled: !nodeCtrl.nodes[nodeID].enabled});
    };

    socket.on('connect', function(){
      socket.emit('syncRequest');
    });

    socket.on('syncResponce', function(msg){
      nodeCtrl.nodes = msg;
    });

    socket.on('updateNodes', function(msg){
      $.extend(nodeCtrl.nodes, msg);
    });

    socket.on('nodeUpdated', function(msg){
      $.extend(nodeCtrl.nodes[msg.nodeID], msg);
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