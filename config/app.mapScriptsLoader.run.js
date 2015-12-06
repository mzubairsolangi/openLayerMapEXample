/**
 * Created by Shahzad on 5/25/2015.
 */

(function () {

  'use strict';

  angular
    .module('titleToolBox')
    .run( mapScriptLoader );

  mapScriptLoader.$inject = ['$rootScope', 'appFlags'];

  function mapScriptLoader( $rootScope, appFlags ) {

    //scripts URLs.
    var scriptsUrls = {
      google: 'http://maps.google.com/maps/api/js?&v=3.2&libraries=places&callback=getOpenLayers', //work-around for V3
      //google: 'https://maps.googleapis.com/maps/api/js?sensor=false', //new API endpoint for V3
      openLayers: 'http://openlayers.org/api/OpenLayers.js' // OpenLayers V2
    };

    //makes getOpenLayers global, so it can be called once google map Api is completely loaded.
    window.getOpenLayers = getOpenLayers;

    //request to get google map API script.
    getGoogleMap();

    //loads google map api v3 asynchronously
    function getGoogleMap() {
      $.ajax({
        url: scriptsUrls.google,
        dataType: "script",
        cache: true
      });
    }

    //loads OpenLayers api v2 asynchronously
    function getOpenLayers() {
      $.ajax({
        url: scriptsUrls.openLayers,
        dataType: "script",
        cache: true,
        success: function () {
          //sets a flag which tells that the map scripts has been loaded
          appFlags.mapScriptsLoaded = true;

          //broadcasts "mapScriptsLoaded" event
          $rootScope.$broadcast('mapScriptsLoaded', {});
        }
      });
    }
  }

})();
