//
// checkImage(url)
// DOES NOT return a value - use the success and fail functions!
//

// global vars for GOOGLE MAP API
let map,mapBounds,mapMarkers,markersArray,mapsKey='XAIzaSyCfRtVUE5xGwJE6CABUHU7P_IZsWdgoK_k'; // remove first X to go live - also in index.html
let currencyMultiplier = 1, averageCostPerNight = 0;

// Actions on Document Ready
$(document).ready(function() {

  // setup for SEARCH modal button
  $('#filtertoggleicon').click(function() {
    getProvinceCounts(); // this starts the filter form by getting province counts, then falls into the modal via promises
  });

  // setup "back to top" scroll button & deal with the scrolling
  $('.back-top').hide();
  $('#back-top').click(function() {
    window.scrollTo({top: 0, behavior: 'smooth'});
  });
  $(window).on("scroll", function() {
    // Show & Hide Back To Top Button
    if ($(window).scrollTop() > 300) {
      $('.back-top').removeClass("fadeout");
      $('.back-top').show();
    } else {
      if(!$('#back-top').hasClass("fadeout")) {
        $('.back-top').addClass("fadeout");
        setTimeout(function() {
          $('.back-top').hide();
        }, 2300);
      }
    }
  });

  getAverageCostPerNight()
    .then(function(json) {
      averageCostPerNight = json.properties.avg;
    });


}); // END DOCUMENT READY


//
// checkImage()
// check if image is valid at detination URL - if not, use a built in "missing image" to prevent broken image link
//
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
  /*
  ATTEMPT working with dark/light mode toggle of the map.
  - how best to refresh the map on mode change??
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

  //  check for existing marker here - if so, just return so we're not doing useless work
  for (let x = 0; x < markersArray.length; x++) {
    let tempLoc = JSON.parse(JSON.stringify(markersArray[x].getPosition()));
    // NOTE getPosition() retrns promise - need to process PROPERLY!

    if (location.lat === tempLoc.lat) {
      if (location.lng === tempLoc.lng) {
        return;
      }
    }
  }

  //place marker function, adds marker to passed in location
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
  google.maps.event.addListenerOnce(map, "idle", function () {
    if (map.getZoom() > 16) map.setZoom(16);
  });

  //
  // add info window for each marker:
  //
  
  // get total count of properties per city
  let tempCount;
  getCountbyCity(city)
    .then(function(json) {
      tempCount = (json.properties[0].count);
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
const clearMapMarkers = function() {
  //function to clear the markers from the arrays, deleting them from the map
  for (let i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
};


//
// googleplaceSearch() -- FUTURE USE to grab details on each city as presented to user
//  Expensive API calls - this part of project is on hold
//
const googlePlaceSearch = (city,prov) => {
  var config = {
    method: 'get',
    url: 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Museum%20of%20Contemporary%20Art%20Australia&inputtype=textquery&fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&key=YOUR_API_KEY',
    headers: { }
  };
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



//
//  changeCurrency()
//  pass (data) if in modal and sending a new currency to use, otherwise if no (data), we try to read existing data settings
//  in reality, we'd use an API to fetch accurate exchange rates - NOTE api call should be secure via the server side to hide any KEY
//  possible API to use: https://app.currencyapi.com/dashboard
//
const changeCurrency = function(data) {
  if (data) {
    toggleModal();
  } else {
    // read from localStorage (FUTURE USE)
  }
  switch (data) {
  case 'CAD':
    currencyMultiplier = 1.0;
    break;
  case 'USD':
    currencyMultiplier = 0.75;
    break;
  case 'MXN':
    currencyMultiplier = 15.04;
    break;
  case 'EUR':
    currencyMultiplier = 0.752;
    break;
  case 'BZD':
    currencyMultiplier = 1.514;
    break;
  }
  // set the new currency label
  $(".nav_currency_button").html("$ "+data);
  clearandGet();
  // save to localStorage (FUTURE USE)
};


//
// show Privacy Policy modal window
//
const showPrivacyPolicy = () => {
  let privacyPolicy = `
  This privacy policy is to inform you on how the information collected on this website is used. Be sure to read this privacy policy before using our website or submitting any personal information and be aware that by using our website, you are accepting the practices described in this policy. We reserve the right to make changes to this website's policy at any time without prior notice. Be also aware that privacy practices set forth in this here are for this website only and do not apply for any other linking websites.<BR><BR>
  ....etc, etc, etc.
  `;
  toggleModal('Privacy Policy',privacyPolicy);
};


//
// filter search form process to collect provincal data - total # of listings in each province,
// once ready, open the modal filter form with populated information
//
const getProvinceCounts = (action) => {
  const provinceArray = ['Alberta',
    'British Columbia',
    'Manitoba',
    'Quebec',
    'Ontario',
    'Newfoundland And Labrador',
    'New Brunswick',
    'Northwest Territories',
    'Nova Scotia',
    'Nunavut',
    'Prince Edward Island',
    'Saskatchewan',
    'Yukon'];
    // query database and get a COUNT of listings per province, split apart and save into object for reference

    getCountbyProv()
    .then(function(json) {
      let returnString = `<OPTION value="" selected>Any Province</OPTION>`;
      for (const item of json.properties) {
        returnString += `<OPTION value="${item.province}">${item.province} (${item.count} listings)</OPTION>`;
      }
      filterModal(returnString);
    })
    .catch((error) => {
      let returnString = `<OPTION value="" selected>Any</OPTION>`;
      for (const prov of provinceArray) {
        returnString += `<OPTION value="${prov}">${prov}</OPTION>`;
      }
      filterModal(returnString);
    });
};

//
// filterModal() - assemble final data for our modal search form and present to user
//
const filterModal = (provinceCounts) => {
  let maxPrice = 1000;  // base rate for CAD -- note we'd need to adjust this for different currencies, and adjust back to base for search
  let selectList = provinceCounts;
  let avgPerNightString = "";
  if (averageCostPerNight > 0) {
    avgPerNightString = "<BR>(Average Cost Per Night: $" + ((averageCostPerNight / 100.0) * currencyMultiplier).toFixed(2) + ")";
  } else {
    avgPerNightString = "";
  }
  const $searchModalForm = $(`
  <form action="/properties" method="get" id="filterform" class="search-property-form">
  <div style="width:100%;border-box">
    
    <div>Province:</div>
    <div><select name="province" id="search=property-form__province" value="" style="width:100%;border: 1px solid;border-radius: 5px;margin-top:5px;margin-left:0px;">
    ${selectList}</select>
    </div><br>

    <div>City:</div>
    <div><input type="text" name="city" placeholder="City" id="search-property-form__city" style="box-sizing:border-box;border: 1px solid;border-radius: 5px;margin-top:5px;margin-left:0px;">
    </div><br>

    <div style="margin-bottom:5px">Price Range:${avgPerNightString}</div>
    <div class="range_container">
    <div class="sliders_control">
        <input id="fromSlider" type="range" value="1" min="0" max="1000" name="minimum_price_per_night" />
        <input id="toSlider" type="range" value="1000" min="0" max="1000" name="maximum_price_per_night" />
    </div>
    <div class="form_control">
        <div class="form_control_container">min $ <output id="fromInput">0</output>
        </div>
        <div class="form_control_container">max $ <output id="toInput">0</output>
        </div>
    </div>
    </div>

    <div style="margin-bottom:30px;">Minimum Rating: <output id="ratingvalue">1</output><br clear=all>
    <input type="range" value="1" min="1" max="5" step="1" name="minimum_rating" placeholder="Minimum Rating" id="search-property-form__minimum-rating" oninput="document.getElementById('ratingvalue').value = this.value" style="width:80%; margin-top:10px;margin-bottom:20px !important;">
    </div>
    
    <div>Priced:</div>
    <span class="switchcontainer" style="justify-content:flex-start">low to high<input type="checkbox" class="toggle" unchecked id="search-property-form__priceswitch" style="width:42px !important">high to low</div>

    <div class="search-property-form__field-wrapper">
        <button class="button" style="margin-top:20px;">Search</button>&nbsp;&nbsp;
    </div>
  </div>
  </form>
  `);
  // open the search modal window
  toggleModal('Filter Results',$searchModalForm);
  addSliderListeners();

  // set click handler on submit
  $("#filterform").on('submit', function(event) {
    toggleModal();
    event.preventDefault();
    let checkedValue = $('#search-property-form__priceswitch:checked').is(":checked");

    let data = $(this).serialize();
    checkedValue ? data += "&pricesort=DESC" : data += "&pricesort=ASC";
    
    getAllListings(data).then(function( json ) {
      propertyListings.addProperties(json.properties);
      views_manager.show('listings');
    });
  });
};