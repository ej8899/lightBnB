//
// checkImage(url)
// DOES NOT return a value - use the success and fail functions!
//

// global vars for GOOGLE MAP API and other cached database info
let map,mapBounds,mapMarkers,markersArray;
let currencyMultiplier = 1, averageCostPerNight = 0, graphCostRanges = {};
const mapsKey='XAIzaSyCfRtVUE5xGwJE6CABUHU7P_IZsWdgoK_k'; // remove first X to go live - also in index.html


//
// Any actions for Document Ready processing
//
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
      if (!$('#back-top').hasClass("fadeout")) {
        $('.back-top').addClass("fadeout");
        setTimeout(function() {
          $('.back-top').hide();
        }, 2300);
      }
    }
  });

  // grab some data from the db server to have cached in memory
  getAverageCostPerNight()
    .then(function(json) {
      averageCostPerNight = json.properties.avg;
    });
  getCostPerRange()
    .then(function(json) {
      graphCostRanges = JSON.parse(JSON.stringify(json.properties));
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
// toggleModal(title,body)
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
//  getProvinceCounts(action) & open search modal
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
    <div id="avgcostpernight" style="height: 100px;width:112%;margin-left:0px;margin-right:0px;margin-bottom:0px;left:-22px;"></div>
    <script>
    new Morris.Bar({
      element: 'avgcostpernight',
      // Chart data records -- each entry in this array corresponds to a point on
      // the chart.
      barColors: ['#cccccc'],
      axes: false,
      grid: false,
      hideHover: true,
      gridTextSize: 10,
      data: graphCostRanges,
      // The name of the data record attribute that contains x-values.
      xkey: 'Range',
      // A list of names of data record attributes that contain y-values.
      ykeys: ['Count'],
      // Labels for the ykeys -- will be displayed when you hover over the
      // chart.
      labels: ['properties in this range']
    });
    </script>
    <div class="range_container" style="margin-top:-28px;width=100%;">
    <div class="sliders_control">
        <input id="fromSlider" type="range" value="1" min="0" max="1000" name="minimum_price_per_night" />
        <input id="toSlider" type="range" value="1000" min="0" max="1000" name="maximum_price_per_night" />
    </div>
    <div class="form_control">
        <div class="form_control_container">selected: $ <output id="fromInput">0</output> to $ <output id="toInput">0</output>
        </div>
        <div class="form_control_container"><!-- max $ <output id="toInput">0</output> -->
        </div>
    </div>
    </div>

    <div style="margin-bottom:30px;">Minimum Rating: <output id="ratingvalue">1</output><br clear=all>
    <input type="range" value="1" min="1" max="5" step="1" name="minimum_rating" placeholder="Minimum Rating" id="search-property-form__minimum-rating" oninput="document.getElementById('ratingvalue').value = this.value" style="width:80%; margin-top:10px;margin-bottom:20px !important;">
    </div>
    
    <div>Sort by Price:</div>
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