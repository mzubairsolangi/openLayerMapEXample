/**
 * Created by Shahzad on 7/01/2015.
 */

(function () {

    'use strict';

  angular
    .module('titleToolBox')
    .factory('olFactory', olFactory );

  olFactory.$inject = [];

  function olFactory() {
    var olObject = {};
    var control;

    return {
      getProjections: getProjections,
      createProjections: createProjections,
      createMarkers: createMarkers,
      destroyPopups: destroyPopups
    };

    //return instantiated projections
    function getProjections() {
      return olObject.projections || createProjections() ;
    }

    //instantiates projections
    function createProjections() {

      olObject.projections = {};

      olObject.projections.geographic = new OpenLayers.Projection("EPSG:4326");
      olObject.projections.mercator = new OpenLayers.Projection("EPSG:900913");
      olObject.projections.proj3857 = new OpenLayers.Projection("EPSG:3857");

      return olObject.projections;
    }

    function createMarkers(map, options, mapDefaults) {
      var vectorLayer, feature, marker;
      vectorLayer = new OpenLayers.Layer.Vector('Overlay');

      for (var i = 0; i < options.markers.length; i++) {
        marker = options.markers[i];


        // Define markers as "features" of the vector layer:
        feature = new OpenLayers.Feature.Vector(
          new OpenLayers.Geometry.Point( marker.lonLat[0], marker.lonLat[1] )
            .transform( mapDefaults.projections.geographic, mapDefaults.projections.proj3857 ),
          marker.popup,
          {
            externalGraphic: marker.image || options.markerDefaults.image,
            graphicHeight: marker.height || options.markerDefaults.height,
            graphicWidth: marker.width || options.markerDefaults.width
          }
        );

        vectorLayer.addFeatures(feature);
        //Add a selector control to the vectorLayer with popup functions

        control  = {
          selector: new OpenLayers.Control.SelectFeature(vectorLayer, {
            id: 'select-feature',
            onSelect: createPopup,
            onUnselect: destroyPopup
          })
        };

        //adds vector layer on map
        map.addLayer(vectorLayer);

        //adds vector controls on map
        map.addControl(control.selector);

        //activates markers to be selected and show popups
        control.selector.activate();
      }

      //creates a popup against the marker element which were clicked
      function createPopup(feature) {

        feature.popup = new OpenLayers.Popup.FramedCloud("pop",
          feature.geometry.getBounds().getCenterLonLat(),
          null,
          feature.attributes.markup,
          null,
          true,
          destroyPopups
        );

        //feature.popup.closeOnMove = true;
        map.addPopup(feature.popup);

        //since the popup is added on map, now resize it to required dimensions.
        feature.popup.setSize( new OpenLayers.Size(feature.attributes.width, feature.attributes.height) );

        //pan popup to get completely visible after size is changed
        feature.popup.panIntoView();
      }

      //destroys the popup which were created previously
      function destroyPopup(feature) {
        if ( feature.popup ) {
          feature.popup.destroy();
          feature.popup = null;
        }
      }
    }

    //destroys popups.
    function destroyPopups() {
      if ( control ) {
        control.selector.unselectAll();
      }
    }

  }

})();
