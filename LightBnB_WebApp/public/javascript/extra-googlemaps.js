//
//  google mapping of properties
//

// https://www.w3schools.com/graphics/google_maps_reference.asp
// https://developers.google.com/maps/documentation/javascript/examples
const initMap = function() {
  markersArray = [];          // array to hold the map markers

  /*
  // WORKING CODE: this gets all cities and maps them  -- might be a bit too much for the map (258 pins), plus API request costs
   getAllTheCities()
    .then(function(json) {
      //console.log(json.properties);  // test ok
      // alert(json.properties.length); // 258
      json.properties.forEach(element => {
        getGeo(element.city,element.province);
      });
    });
  */

  const clearOverlays = function() {
    //function to clear the markers from the arrays, deleting them from the map
    for (let i = 0; i < markersArray.length; i++) {
      markersArray[i].setMap(null);
    }
    markersArray.length = 0;
  };
    
  let mapProp = {                                     // setup initial map display
    center:new google.maps.LatLng(53.5, -104.0),      // center of (roughly canada centered)
    zoom:4,
    mapTypeControlOptions: { mapTypeIds: [] },
    streetViewControl: false,
    fullscreenControl: false,
  };
  
  /*
  ATTEMPT working with dark/light mode toggle of the map.
  - how best to refresh the map on mode change??
  let mapDarkStyles = {
    styles: [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
      },
      {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
      },
    ],
  };
  if (document.documentElement.classList.contains("light")) {
    delete mapProp.styles;
  }
  if (document.documentElement.classList.contains("dark")) {
    mapProp.styles = mapDarkStyles.styles;
  }
  */
  map = new google.maps.Map(document.getElementById("map"), mapProp);
  mapBounds = new google.maps.LatLngBounds();
};

window.initMap = initMap;

//
// placeMarker(location,city,province) where location is object of lat/lng for maps API
//
const placeMarker = function(location,city,prov) {
  // CUSTOM icon for LightBNB (bed icon)
  let iconBase = {
    path: "M32 32c17.7 0 32 14.3 32 32V320H288V160c0-17.7 14.3-32 32-32H544c53 0 96 43 96 96V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V416H352 320 64v32c0 17.7-14.3 32-32 32s-32-14.3-32-32V64C0 46.3 14.3 32 32 32zM176 288c-44.2 0-80-35.8-80-80s35.8-80 80-80s80 35.8 80 80s-35.8 80-80 80z",
    strokeWeight: 0,
    scale: 0.05,
  };
  let icon = {
    ...iconBase,
    fillColor: '#CA4246',
    fillOpacity: 0.8,
  };
  let iconDark = {
    ...iconBase,
    fillColor: '#505050',
    fillOpacity: 1.0,
  };

  //
  //  check for existing marker here - if so, just return so we're not doing useless work, or burdening map displays
  //
  for (let x = 0; x < markersArray.length; x++) {
    let tempString = JSON.stringify(markersArray[x].getPosition());
    if (tempString !== undefined) {
      let tempLoc = JSON.parse(tempString);
      if (location.lat === tempLoc.lat) {
        if (location.lng === tempLoc.lng) {
          return;
        }
      }
    }

    //let tempLoc = JSON.parse(JSON.stringify(markersArray[x].getPosition()));
    // NOTE getPosition() retrns promise - need to process PROPERLY!
  }

  //
  // place marker code --  adds marker to passed in location
  //
  let marker = new google.maps.Marker({
    position: location, // position: is object of {lat: lng:}
    map: map,
    animation: google.maps.Animation.DROP,
    icon: icon,
    //title: city, // title is default for maps hover/tooltip tag - don't use it to keep the hover tooltip "off"
    mytitle: city, // we can use our own defined options like this one
    myprov: prov,
  });
  markersArray.push(marker);        //adds new marker to the markers array
  mapBounds.extend(marker.position);
  map.setOptions({maxZoom: 15});
  //map.fitBounds(mapBounds);
  google.maps.event.addListenerOnce(map, "idle", function() {
    if (map.getZoom() > 16) map.setZoom(16);
  });

  //
  // add info window for each marker:
  //
  
  // get total count of properties per city
  let tempCount;
  getCountbyCity(city)
    .then(function(json) {
      tempCount = JSON.parse(JSON.stringify(json.properties.count));
      console.log('count for ' + city + ':' + tempCount);
    })
    .catch((error) => {
      console.log('error occured: ' + error.message);
    })
    .then(() => { // "always" component of then.catch.promises
      const infoWindowData = `<div class="map-infobox-wrapper"><div><i class="fa-solid fa-magnifying-glass fa-xlg" style="color: #FF4433 "></i></div><div class="map-infobox-content"><B>${city} - ${tempCount} listings.</B><Br><small> click or tap to search this city</small></div></div>`;
      // more on infoWindow here: https://developers.google.com/maps/documentation/javascript/infowindows
      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowData,
      });

      //  MOUSE OVER MARKER handler - adds and removes styles as necessary
      marker.addListener('mouseover', function() {
        //console.log(tempCount)
        this.setIcon(iconDark);
        infoWindow.open(map, this);
        let iwContainer = $(".gm-style-iw").parent();
        iwContainer.stop().hide();
        iwContainer.fadeIn(500);
      });

      // mouse OUT of MARKER handler
      marker.addListener('mouseout', function() {
        this.setIcon(icon);
        infoWindow.close();
      });
  
      //
      // LEFT BUTTON CLICK listener on each MARKER
      //
      google.maps.event.addListener(marker, 'click', function() {
        //let citysearch = this.getTitle(); // this is a built in getter for marker object title element
        let citysearch = this.get('mytitle'); // we can do this get get our own marker object items
        let theprov = this.get('myprov');
        googlePlaceSearch(citysearch,theprov);
        getAllListings(`city=${citysearch}`)
          .then(function(json) {
            propertyListings.addProperties(json.properties);
            views_manager.show('listings');
          });
      });
    });
};


//
// clearMapMarkers() - clear markers from arrays and thusly map
//
const clearMapMarkers = function() {
  for (let i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
};


//
// googleplaceSearch() -- FUTURE USE ONLY.
//  Used to grab details on each city as presented to user
//  Expensive API calls - this part of project is on hold
//

const googlePlaceSearch = (city,prov) => {
  /*
  var config = {
    method: 'get',
    url: 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Museum%20of%20Contemporary%20Art%20Australia&inputtype=textquery&fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&key=YOUR_API_KEY',
    headers: { }
  };
  */
};