/**
 * Created by Shahzad on 5/04/2015.
 */

(function () {

  'use strict';

  angular.module('titleToolBox')
    .controller('BaseCtrl', BaseCtrl );

  BaseCtrl.$inject = ['$scope'];

  function BaseCtrl( $scope ) {

    //listeners
    //angular itself destroys all listeners on $scope after triggering $destroy event.
    $scope.$on('$destroy', scopeDestroyListener );

    //event listener of $destroy.
    function scopeDestroyListener() {

      //invoke $scope.onDestroy if define by child $scope controller.
      $scope.onDestroy && $scope.onDestroy();

      //for development purpose
      //console.log('Destroyed:', $scope);
    }
  }

})();
