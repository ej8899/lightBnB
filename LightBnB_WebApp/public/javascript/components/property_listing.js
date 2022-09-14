$(() => {
  window.propertyListing = {};
  

  function createListing(property, isReservation) {
    // error check for broken images via bad url or missing image at url
    checkImage(property.thumbnail_photo_url, property.id);
    getGeo(property.city,property.province);

    // process star rating
    const fullStar =  `<i class="fa-solid fa-star"></i>`;
    const halfStar =  `<i class="fa-solid fa-star-half-stroke"></i>`;
    const emptyStar = `<i class="fa-regular fa-star"></i>`;
    let finalStars = '';
    let theRating = Math.round(property.average_rating * 100) / 100;
    let decimal = Math.trunc(theRating);
    let starCounter = 0;
    for (starCounter = 0; starCounter < decimal; starCounter ++) {
      finalStars += fullStar;
    }
    if (theRating - decimal > .8) {
      // rounded up
      finalStars += fullStar;
      starCounter ++;
    } else if (theRating - decimal < 0.2) {
      // rounded down (do nothing)
    } else {
      // half star
      finalStars += halfStar;
      starCounter ++;
    }
    let moreStars = 5 - starCounter;
    for(let x = 0; x < moreStars; x ++) {
      finalStars += emptyStar;
    }

    // ORIGINAL code to replace ${finalStars}
    let actualRating = Math.round(property.average_rating * 100) / 100; // out of 5
    let toolTipRating = "Exact rating: " + actualRating + " / 5.";
    return `
    <article class="property-listing">
        <section class="property-listing__preview-image">
          <img src="${property.thumbnail_photo_url}" alt="house" class="imgthumb" id="listingid${property.id}">
        </section>
        <section class="property-listing__details">
          <h3 class="property-listing__title">${property.title}</h3>
          <ul class="property-listing__details">
            <li>beds: ${property.number_of_bedrooms} / baths: ${property.number_of_bathrooms}</li>
            <!--<li>number_of_bathrooms: ${property.number_of_bathrooms}</li>-->
            <li>parking_spaces: ${property.parking_spaces}</li>
            <li>city: ${property.city}, ${property.province}</li>
          </ul>
          <p>${isReservation ? 
            `booked: ${moment(property.start_date).format('ll')} - ${moment(property.end_date).format('ll')}` 
            : ``}&nbsp;</p>
          <footer class="property-listing__footer">
            <div class="property-listing__rating tooltip expand stars" data-title="${toolTipRating}">${finalStars}</div>
            <div class="property-listing__price">$${property.cost_per_night/100.0}/night</div>
          </footer>
        </section>
      </article>
    `
  }

  window.propertyListing.createListing = createListing;

});


//
// implement mapping
// 1. get lat long,
// 2. plot map markers
//

// get lat long of city
const getGeo = (city,prov) => {

  const apiKey = 'AIzaSyCfRtVUE5xGwJE6CABUHU7P_IZsWdgoK_k';
  const apiURL = `https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}&address=${city},${prov}&sensor=false`;
  
  fetch(apiURL).then(function (response) {
    // The API call was successful!
    return response.json();
  }).then(function (data) {
    // This is the OBJECT from our response
    placeMarker({lat:data.results[0].geometry.location.lat,lng:data.results[0].geometry.location.lng},city);
    //placeMarker({lat:42.4668,lng:-70.9495});
    //placeMarker({lat:50.912,lng:-114.113});
    console.log(data.results[0].geometry.location.lat);
  }).catch(function (err) {
    // There was an error
    console.warn('GEOCODE: Something went wrong.', err);
  });
};