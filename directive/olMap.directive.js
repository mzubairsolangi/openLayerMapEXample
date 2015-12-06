/**
 *  * Created by Shahzad on 5/28/2015.
 */

(function () {

  'use strict';

  angular
    .module('titleToolBox')
    .directive('olMap', olMap );

  olMap.$inject = ['appFlags', 'olFactory', '$q', '$timeout'];

  function olMap( appFlags, olFactory, $q, $timeout ) {

    var mapDefaults = {
      lonLat: [-117.844105, 33.683219],
      zoom: 14,
      numZoomLevels: 20,
      markerDefaults: {
        image: 'assets/images/_pin.png',
        height: 51,
        width: 36
      }
    };

    return {
      restrict : 'A',
      scope: {
        onResize : '=',
        options: '=',
        mapObject: '=?'
      },
      link: function ( $scope, $element) {

        var map, mapNode, controls, options, resizeMap;

        //Adds loading class on map initially
        $element.addClass('loading');

        //destroy listener to destroy map
        $scope.$on('$destroy', destroyMap() );

        options = angular.extend({}, mapDefaults, $scope.options || {});
        mapNode = $element[0];

        if ( options.calculateHeight ) {
          $element.css({
            height: $(window).height()
          });
        }

        //window resize listener.
        if ( options.listenResize ) {
          $(window).resize( resizeListener );
        }
        //console.log($scope.options);
        //console.log(options);

        $q.all([
          checkMapScripts(),
          getLonLat()
        ]).then(initializeMap);

        // check if OpenLayers and Google Map scripts are downloaded or listen to it's availability.
        function checkMapScripts() {
          var deferred = $q.defer();

          if ( appFlags.mapScriptsLoaded ) {
            deferred.resolve();
          } else {
            $scope.$on('mapScriptsLoaded', deferred.resolve);
          }

          return deferred.promise;
        }

        // gets LonLat to center the map.
        function getLonLat() {
          var deferred = $q.defer();

          if ( $scope.options.lonLat ) {
            deferred.resolve();
          } else if ( window.navigator ) {
            navigator.geolocation.getCurrentPosition(function(position) {
              options.lonLat = [position.coords.longitude, position.coords.latitude];
              deferred.resolve();
            }, function(err) {
              deferred.resolve();
            });
          } else {
            deferred.resolve();
          }

          return deferred.promise;
        }

        //creates a map inside selected node.
        function initializeMap() {

          mapDefaults.projections = olFactory.getProjections() || olFactory.createProjections();

          map = new OpenLayers.Map( mapNode, {
            controls: getControls(options),

            projection: options.projection,

            zoom: options.zoom,

            center: new OpenLayers.LonLat(options.lonLat)
              .transform( mapDefaults.projections.geographic, mapDefaults.projections.proj3857 ),

            layers:  [
              //new OpenLayers.Layer.Google( "Google Streets", {
              //  numZoomLevels: options.numZoomLevels
              //}) // the default layer
              new OpenLayers.Layer.OSM('Street Map')
            ]

          });

          $scope.mapObject = $scope.mapObject || {};
          $scope.mapObject.map = map;

          if ( options.markers && options.markers.length ) {
            olFactory.createMarkers(map, options, mapDefaults);
          }

          //console.log('map initialized');

          //removes loading class from map
          $element.removeClass('loading');
        }

        //returns controls according to given options e.g zoomControls : false
        function getControls() {
          var controls = undefined;

          if ( options.zoomControls === false ) {
            controls = [
              new OpenLayers.Control.Navigation(),
              new OpenLayers.Control.ArgParser(),
              new OpenLayers.Control.Attribution()
            ]
          }

          return controls;
        }

        ////destroys map and its components.
        function destroyMap() {
          if ( map ) {
            olFactory.destroyPopups();
            map.destroy();

            //destroy resizeListener
            $(window).off('resize', resizeListener );
          }
        }
        // Resize Map
        function resizeListener() {
          $element.css({
            height: $(window).height()
          });
        }
      }
    };
  }
})();
