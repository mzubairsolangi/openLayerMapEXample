/**
 *  * Created by zubair on 6/18/2015.
 */

//taken from https://gist.github.com/kirschbaum/fcac2ff50f707dae75dc

(function () {

  'use strict';

  angular
    .module('titleToolBox')
    .directive('googleAutocomplete', googleAutocomplete );

  googleAutocomplete.$inject = ['$timeout', 'appFlags', 'olFactory'];

  function googleAutocomplete( $timeout, appFlags, olFactory ) {
    return {
      require: 'ngModel',
      scope: {
        ngModel: '=',
        details: '=?',
        mapObject: '=?',
        'onPlaceChanged': '=?'
      },
      link: function ($scope, $element, $attrs, model) {

        var autocomplete, autocompleteOptions,
          mapDefaults, autoCompleteListener,latLongg,popuppp;
        var apiKey = "AqfESGm-lRuN36vFdiozlVxIpHuydCGANra1-8WpHKPhCpNv2RAzPa1BNJPdtfwe";
        var GOOGLE_API_KEY = "AIzaSyA_VYX50VGZMYnPW9dgg0CTDrbb3u__lZg";
        var PRINTER;
        var SHADOW_Z_INDEX = 10;
        var MARKER_Z_INDEX = 11;

        /*listeners*/
        $scope.$on('$destroy', destroyAutocomplete );

        autocompleteOptions = {
          types: ['geocode'],
          componentRestrictions: {}
        };

        mapDefaults = {
          markerDefaults: {
            image: 'images/_pin.png',
            height: 51,
            width: 36
          },
          popupDefaults: {
            width: 220,
            height: 135
          }
        };

        // check if OpenLayers and Google Map scripts have been loaded or listen to it's availability.
        if ( appFlags.mapScriptsLoaded ) {
          initialize();
        } else {
          $scope.$on('mapScriptsLoaded', initialize );
        }

        //initialize autocomplete
        function initialize(){

          mapDefaults.projections = olFactory.getProjections();

          autocomplete = new google.maps.places.Autocomplete($element[0], autocompleteOptions);

          autoCompleteListener = google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChanged);
        }

        //listener for 'place_changed' event of autocomplete
        function onPlaceChanged(){

          if ( $scope.mapObject && $scope.mapObject.map ) {
            updateMarkerAndPopup();
          }

          $timeout(function () {

            //to fill the details object of $scope.
            fillInAddress();

            //set the view value of autocomplete input model
            model.$setViewValue($element.val());

            //invoke the place_changed listener if defined.
            $scope.onPlaceChanged && $scope.onPlaceChanged();

            //console.log($scope.details);
          });
        }

        //to  store place details in $scope.details
        function fillInAddress() {
          var place, addressComp;

          $scope.details = $scope.details || {};

          // Get the place details from the autocomplete object.
          place = autocomplete.getPlace();

          // Get each component of the address from the place details
          // and create $scope.details
          for (var i = 0, len = place.address_components.length; i < len; i++) {
            addressComp = place.address_components[i];

            switch( addressComp.types[0] ) {
              case 'street_number':
                $scope.details.site_street_number = addressComp.short_name;
                break;
              case 'route':
                $scope.details.site_route = addressComp.short_name;
                break;
              case 'locality':
                $scope.details.site_city = addressComp.long_name;
                break;
              case 'administrative_area_level_1':
                $scope.details.site_state = addressComp.short_name;
                break;
              case 'administrative_area_level_2':
                $scope.details.county = addressComp.short_name;
                break;
              case 'country':
                $scope.details.country = addressComp.long_name;
                break;
              case 'postal_code':
                $scope.details.site_zip = $scope.postal_code = addressComp.short_name;
                break;
            }
          }
        }

        //updates marker and its popup on map
        function updateMarkerAndPopup(){
          var map, place, lonlat, vectorLayer;

          place = autocomplete.getPlace();
          if ( !place.geometry ) {
            return;
          }

          //console.log('place changed in map', place.geometry.location.lng(), place.geometry.location.lat());

          map = $scope.mapObject.map;
          vectorLayer = map.getLayersByName('Overlay')[0];

          // creates a vector layer if no vector layer found on map.
          if ( !vectorLayer ) {
            //console.log('no vector layers');
            vectorLayer = new OpenLayers.Layer.Vector('Overlay');
            map.addLayer(vectorLayer);
          }

          //destroys previously added features
          vectorLayer.destroyFeatures();

          //destroys previously added popups
          if ( map.popups ) {
            for (var i = 0; i < map.popups.length; i++) {
              map.removePopup(map.popups[0]);
            }
          }

          // console.log(place.geometry.location.lng(), place.geometry.location.lat());
          lonlat = new OpenLayers.LonLat(place.geometry.location.lng(), place.geometry.location.lat())
            .transform( mapDefaults.projections.geographic, mapDefaults.projections.mercator);

          map.setCenter(lonlat, 10);


          var feature = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat),
            null,
            {
              externalGraphic: mapDefaults.markerDefaults.image,
              graphicHeight: mapDefaults.markerDefaults.height,
              graphicWidth: mapDefaults.markerDefaults.width
            }
          );


          vectorLayer.addFeatures([feature]);

          // add a popup
          var address_ = [
            '<div class="info-box">',
            ' <h3>Search property</h3>',
            ' <p>',
            $element.val(),
            ' </p>',
            '</div>'
          ].join(' ');

          feature.popup = new OpenLayers.Popup.FramedCloud("pop",
            feature.geometry.getBounds().getCenterLonLat(),
            null,
            address_,
            null,
            false
          );
          console.log('lat,long',feature.geometry.getBounds().getCenterLonLat());
          map.addPopup(feature.popup);

          //since the popup is added on map, now resize it to required dimensions.
          feature.popup.setSize( new OpenLayers.Size(mapDefaults.popupDefaults.width, mapDefaults.popupDefaults.height) );
          //feature.popup.updateSize();

          //after modifying popup size, make popup completely visible
          feature.popup.panIntoView();

          // Add a drag feature control to move pin around.
          var dragger = new OpenLayers.Control.DragFeature(vectorLayer, {
            onStart: dragFeatureStart,
            onComplete: dragFeatureComplete
          });
          map.addControl(dragger);
          dragger.activate();


        }


        function dragFeatureStart(feature, pixel){
          console.log(feature);
          var map, place, lonlat, vectorLayer;

          place = autocomplete.getPlace();
          if ( !place.geometry ) {
            return;
          }

          feature.popup.destroy();
        }

        function dragFeatureComplete(feature, pixel) {
          console.log('Drag event for', feature, pixel);
          if (feature) {
            feature.attributes = {
              posx: pixel.x,
              posy: pixel.y
            };
            var map = $scope.mapObject.map;

            var address_ = [
              '<div class="info-box">',
              ' <h3>Search property</h3>',
              ' <p>',
              $element.val(),
              ' </p>',
              '</div>'
            ].join(' ');

            feature.popup =  new OpenLayers.Popup.FramedCloud("pop",
                feature.geometry.getBounds().getCenterLonLat(),
                null,
                address_,
                null,
                false
            );
            map.addPopup(feature.popup);
          }
        };


        //to destroy autocomplete
        function destroyAutocomplete() {

          //destroy autocomplete listener
          if ( window.google ) {
            google.maps.event.removeListener(autoCompleteListener);
          }
        }
      }
    };
  }
})();
