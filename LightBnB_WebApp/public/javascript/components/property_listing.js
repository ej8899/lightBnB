$(() => {
  window.propertyListing = {};
  
// full star:   <i class="fa-solid fa-star"></i>
// half star:   <i class="fa-solid fa-star-half-stroke"></i>
// empty star:  <i class="fa-regular fa-star"></i>

  function createListing(property, isReservation) {
    // error check for broken images via bad url or missing image at url
    checkImage(property.thumbnail_photo_url, property.id);

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
    // ${Math.round(property.average_rating * 100) / 100}/5 stars
    return `
    <article class="property-listing">
        <section class="property-listing__preview-image">
          <img src="${property.thumbnail_photo_url}" alt="house" id="listingid${property.id}">
        </section>
        <section class="property-listing__details">
          <h3 class="property-listing__title">${property.title}</h3>
          <ul class="property-listing__details">
            <li>number_of_bedrooms: ${property.number_of_bedrooms}</li>
            <li>number_of_bathrooms: ${property.number_of_bathrooms}</li>
            <li>parking_spaces: ${property.parking_spaces}</li>
          </ul>
          ${isReservation ? 
            `<p>booked: ${moment(property.start_date).format('ll')} - ${moment(property.end_date).format('ll')}</p>` 
            : ``}
          <footer class="property-listing__footer">
            <div class="property-listing__rating">${finalStars}</div>
            <div class="property-listing__price">$${property.cost_per_night/100.0}/night</div>
          </footer>
        </section>
      </article>
    `
  }

  window.propertyListing.createListing = createListing;

});