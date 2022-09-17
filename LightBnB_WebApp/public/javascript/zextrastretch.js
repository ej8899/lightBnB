//
// checkImage(url)
// DOES NOT return a value - use the success and fail functions!
//

// global vars for GOOGLE MAP API
let map,mapMarkers,markersArray;

const checkImage = (url,id) => {
  let image = new Image();
  
  image.onload = () => { // image DOES exist
    if (this.width > 0) {
      // unhide each id if we setup for lazy load of images
    }
  };
  image.onerror = () => { // image does NOT exist
    let listid = "#listingid" + id;
    $(listid).attr("src","./images/missingimage.png");
  };
  image.src = url; // NOTE: set SRC after the onload event: https://stackoverflow.com/questions/7434371/image-onload-function-with-return
};


//
//  toggleDarkMode(option);
//  toggle to switch classes between .light and .dark
//  if no class is present (initial state), then assume current state based on system color scheme
//  if (option) is "check", we're assuming initial load state and checking localStorage for a saved state from prior use
//
const toggleDarkMode = function(option) {
  // internal helper functions:
  const addDark = () => {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
    $("#dayicon").addClass("darkmodeIconVisible");
    $("#dayicon").removeClass("darkmodeIconInvisible");
    $("#nighticon").removeClass("darkmodeIconVisible");
    $("#nighticon").addClass("darkmodeIconInvisible");
  };
  const addLight = () => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    $("#dayicon").addClass("darkmodeIconInvisible");
    $("#dayicon").removeClass("darkmodeIconVisible");
    $("#nighticon").addClass("darkmodeIconVisible");
    $("#nighticon").removeClass("darkmodeIconInvisible");
  };

  // check localStorage to see if we have a dark preference & apply theme if so
  if (option === 'check') {
    if (localStorage.getItem('isDarkMode') === 'true') {
      $('#darkmodeswitch').prop('checked', true);
      setTimeout(() => {    // fake delay IS required here
        addDark();
      }, 0);
      setTimeout(() => {    // minimize 'flash' when initially loading page
        $('body').css('transition', 'all .3s ease-in');
      }, 10);
    } else {
      addLight();
    }
    // remove any flash as we've hidden the page initially - BUT also needs transitions OFF (we add above after load)
    $('body').css('visibility','visible');
    $('body').css('opacity','1');
    return;
  }

  // toggle themes
  if (document.documentElement.classList.contains("light")) {
    addDark();
  } else if (document.documentElement.classList.contains("dark")) {
    addLight();
  } else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      addDark();
    } else {
      addLight();
    }
  }
  // save our preference for next time here
  if (document.documentElement.classList.contains("dark")) {
    localStorage.setItem('isDarkMode',true);  // https://blog.logrocket.com/localstorage-javascript-complete-guide/
  } else {
    localStorage.removeItem('isDarkMode');
  }
};

toggleDarkMode('check');




//
//  google mapping of properties
//

// https://www.w3schools.com/graphics/google_maps_reference.asp
//
const initMap = function() {
  markersArray = [];          // array to hold the map markers

  /*
  // WORKING CODE: this gets all cities and maps them  -- might be a bit too much for the map (258 pins)
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
  map = new google.maps.Map(document.getElementById("map"), mapProp);

  //
  //  RIGHT CLICK handler for ENTIRE map
  //
  /*
  google.maps.event.addListener(map, 'rightclick', function(event) {      //what happens when the map is right clicked
    clearOverlays();            //removes current markers form the map
  });
  */

  /*
  //
  //  MOUSE OVER (& OUT) handler
  //
  marker.addListener('mouseover', function() {
    infoWindow.open(map, this);
  });

  // assuming you also want to hide the infowindow when user mouses-out
  marker.addListener('mouseout', function() {
    infoWindow.close();
  });
*/
};

window.initMap = initMap;

const placeMarker = function(location,city) {
  // CUSTOM icon for LightBNB (bed icon)
  let icon = {
    path: "M32 32c17.7 0 32 14.3 32 32V320H288V160c0-17.7 14.3-32 32-32H544c53 0 96 43 96 96V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V416H352 320 64v32c0 17.7-14.3 32-32 32s-32-14.3-32-32V64C0 46.3 14.3 32 32 32zM176 288c-44.2 0-80-35.8-80-80s35.8-80 80-80s80 35.8 80 80s-35.8 80-80 80z",
    fillColor: '#CA4246',
    fillOpacity: 1,
    strokeWeight: 0,
    scale: 0.05,
  };
  let iconDark = {
    path: "M32 32c17.7 0 32 14.3 32 32V320H288V160c0-17.7 14.3-32 32-32H544c53 0 96 43 96 96V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V416H352 320 64v32c0 17.7-14.3 32-32 32s-32-14.3-32-32V64C0 46.3 14.3 32 32 32zM176 288c-44.2 0-80-35.8-80-80s35.8-80 80-80s80 35.8 80 80s-35.8 80-80 80z",
    fillColor: '#505050',
    fillOpacity: 1,
    strokeWeight: 0,
    scale: 0.05,
  };

  //place marker function, adds marker to passed in location
  let marker = new google.maps.Marker({
    position: location,
    map: map,
    icon: icon,
    //title: city, // title is default for maps hover/tooltip tag
    mytitle: city, // we can use our own defined options like this one
  });
  markersArray.push(marker);        //adds new marker to the markers array

  //
  // add info window for each marker
  //
  
  // get total count of properties per city
  let tempCount;
  getCountbyCity(city)
    .then(function(json) {
      tempCount = (json.properties[0].count);
      console.log('count for ' + city + ':' + tempCount);
      // throw('error')  (a test for .finally)
    })
    .catch((error) => {
      console.log('error occured: ' + error.message);
    })
    .then(() => { // "always" component of then.catch.promises
      const infoWindowData = `<div class="map-infobox-wrapper"><div><i class="fa-solid fa-magnifying-glass fa-xlg" style="color: #434038ff"></i></div><div class="map-infobox-content"><B>${city} - ${tempCount} listings.</B><Br><small> click or tap to search this city</small></div></div>`;
      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowData,
      });

      //  MOUSE OVER MARKER handler
      marker.addListener('mouseover', function() {
        //console.log(tempCount)
        this.setIcon(iconDark);
        infoWindow.open(map, this);
        let iw_container = $(".gm-style-iw").parent();
        iw_container.stop().hide();
        iw_container.fadeIn(500);
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
        // alert(this.getTitle());
        //let citysearch = this.getTitle(); // this is a built in getter for marker object title element
        let citysearch = this.get('mytitle'); // we can do this get get our own marker object items
        
        getAllListings(`city=${citysearch}`)
          .then(function(json) {
            propertyListings.addProperties(json.properties);
            views_manager.show('listings');
          });
      });
    });
};
const clearMapMarkers = function() {
  //function to clear the markers from the arrays, deleting them from the map
  for (let i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
};


//
// scrolling animation activator
//
const reveal = () => {
  var reveals = document.querySelectorAll(".reveal");
  for (var i = 0; i < reveals.length; i++) {
    var windowHeight = window.innerHeight;
    var elementTop = reveals[i].getBoundingClientRect().top;
    var elementVisible = 150;
    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add("active");
    } else {
      reveals[i].classList.remove("active");
    }
  }
};
window.addEventListener("scroll", reveal);


//
// code for modal window
// modal library at http://www.github.com/ej8899/conColors
//
const modal = document.querySelector(".modal");
const closeButton = document.querySelector(".close-button");
$("#propertySubmit").removeAttr("style"); // helps eliminate any initial page draw showing the modal window
const toggleModal = function(title,body) {
  // modal-title, modal-body
  $("#modal-title").html(title);
  $("#modal-body").html(body);
  modal.classList.toggle("show-modal");
};
// modal needs window click handler to clear it
const windowOnClick = function(event) {
  if (event.target === modal) {
    toggleModal();
  }
};
// model listeners for general window click and close button
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);