$(() => {

  const $propertyListings = $(`
  <section class="property-listings" id="property-listings">
      <p>Loading...</p>
    </section>
  `);
  window.$propertyListings = $propertyListings;

  window.propertyListings = {};

  function addListing(listing) {
    $propertyListings.append(listing);
  }
  function clearListings() {
    $propertyListings.empty();
  }
  window.propertyListings.clearListings = clearListings;

  function addProperties(properties, isReservation = false) {
    clearListings();
    clearMapMarkers();

    if(properties.length < 1) {
      addListing(generateNoResults());
    }
    let pCount = 0; // counter needed for our scroll animation (don't want to hide top 2 properties)
    for (const propertyId in properties) {
      const property = properties[propertyId];
      const listing = propertyListing.createListing(property, isReservation, pCount);
      pCount ++;
      addListing(listing);
    }
  }
  window.propertyListings.addProperties = addProperties;

});

//
//  extrastretch - generate a no results 'error'
//
const generateNoResults = () => {
  return `
        <div class="nolistings"><i class="fa-regular fa-face-frown fa-xlg"></i> Sorry, no listings found!</div>
    `;
};