(function() {
  var app = angular.module('lumosControl',['btford.socket-io', 'chart.js']);

  app.factory('socket', function (socketFactory) {
    return socketFactory();
  });

  app.controller('NodeController', ['$scope', 'socket', function($scope, socket){
    var nodeCtrl = this;
    this.nodes = [];

    // Common chart settings
    $scope.datasetOverride = [{ fill: false, pointRadius: 0, borderWidth: 1, borderColor: "rgba(255,0,0,1)" }, { fill: false, pointRadius: 0, borderColor: "rgba(0,0,255,0.3)" }];

    // $scope.data = [$scope.current_voltage_data, $scope.lowest_voltage_data];
    // $scope.labels = $scope.current_voltage_data;

    $scope.options = {
      animation: false,
      responsive: true,
      legend: {
        display: false,
      },
      hover: {
        mode: 'single'
      },
      tooltips:{
        enabled: false
      },
      scales: {
        xAxes: [{
          display: false,
          scaleLabel: {
            display: true,
            labelString: 'Time'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: false,
            labelString: 'Voltage'
          },
          ticks: {
            max: 1025,
            min: 675,
            stepSize: 25
          }
        }]
      },
      annotation: {
        annotations: [{
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: '970',
          borderColor: 'rgba(0,255,0,0.8)',
          borderWidth: 1
        },{
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: '730',
          borderColor: 'rgba(255,165,0,0.8)',
          borderWidth: 1
        },{
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: '680',
          borderColor: 'rgba(255,0,0,0.8)',
          borderWidth: 1
        }]
      }
    };

    this.toggleEnabled = function(nodeID){
      socket.emit('enabled', {nodeID: nodeID, enabled: !nodeCtrl.nodes[nodeID - 1].enabled});
    };

    this.enabledAll = function(enabled){
      socket.emit('enabledAll', {'enabled': enabled});
    };

    socket.on('connect', function(){
      socket.emit('syncRequest');
    });

    socket.on('syncResponce', function(msg){
      //console.log(msg);
      nodeCtrl.nodes = msg;
    });

    socket.on('updateNodes', function(msg){
      //console.log(msg);
      msg.forEach(function(cur, i) {
        $.extend(nodeCtrl.nodes[msg[i].nodeID - 1], msg[i]);
      });
    });

    socket.on('nodeUpdated', function(msg){
      //console.log(msg);
      $.extend(nodeCtrl.nodes[msg.nodeID - 1], msg);
      if(msg.current_voltage !== undefined){
        nodeCtrl.nodes[msg.nodeID - 1].current_voltage_data.push(msg.current_voltage);
        if(nodeCtrl.nodes[msg.nodeID - 1].current_voltage_data.length > 6500){
          nodeCtrl.nodes[msg.nodeID - 1].current_voltage_data.shift();
        }
      }
      if(msg.lowest_voltage !== undefined){
        nodeCtrl.nodes[msg.nodeID - 1].lowest_voltage_data.push(msg.lowest_voltage);
        if(nodeCtrl.nodes[msg.nodeID - 1].lowest_voltage_data.length > 6500){
          nodeCtrl.nodes[msg.nodeID - 1].lowest_voltage_data.shift();
        }
      }
    });
  }]);

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