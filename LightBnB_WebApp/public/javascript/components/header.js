$(() => {
  window.header = {};

  const $pageHeader = $('#page-header');
  let currentUser = null;
  function updateHeader(user) {
    currentUser = user;
    $pageHeader.find("#page-header__user-links").remove();
    let userLinks;

    if (!user) {
      userLinks = `
      <nav id="page-header__user-links" class="page-header__user-links">
        <ul>
          <li class="home hoverbutton"><i class="fa-solid fa-house"></i></li>
          <li class="search_button hoverbutton">Search</li>
          <li class="login_button hoverbutton">Log In</li>
          <li class="sign-up_button hoverbutton">Sign Up</li>
          <li style="padding-left:20px"><a href="https://github.com/ej8899/lightBnB" target="new"><i class="fa-brands fa-github fa-lg"></i></a></li>
          <li style="padding-left:5px" class="tooltip expand" data-title="latest version on github"><a href="https://www.linkedin.com/in/ernie-johnson-3b77829b/ target="new"><i class="fa-brands fa-linkedin fa-lg"></i></a></li>
          <li class="tooltip expand" data-title="check us out on linkedin"><div class="switchcontainer"><i class="fa-solid fa-sun darkicon" id="dayicon"></i>&nbsp;<input type="checkbox" class="toggle" unchecked onclick="toggleDarkMode();" id="darkmodeswitch"><i class="fa-solid fa-moon darkicon" id="nighticon" style="padding-left: 4px;"></i></div></li>
        </ul>
      </nav>
      `
    } else {
      userLinks = `
      <nav id="page-header__user-links" class="page-header__user-links">
        <ul>
          <li class="home hoverbutton"><i class="fa-solid fa-house"></i></li>
          <li class="search_button hoverbutton">Search</li>
          <li class="hoverbutton">${user.name}</li>
          <li class="create_listing_button hoverbutton">Create Listing</li>
          <li class="my_listing_button hoverbutton">My Listings</li>
          <li class="my_reservations_button hoverbutton">My Reservations</li>
          <li class="logout_button hoverbutton">Log Out</li>
          <li style="padding-left:20px" class="tooltip expand" data-title="latest version on github"><a href="https://github.com/ej8899/lightBnB" target="new"><i class="fa-brands fa-github fa-lg"></i></a></li>
          <li style="padding-left:5px" class="tooltip expand" data-title="check us out on linkedin"><a href="https://www.linkedin.com/in/ernie-johnson-3b77829b/ target="new"><i class="fa-brands fa-linkedin fa-lg"></i></a></li>
          <li><div class="switchcontainer tooltip expand" data-title="toggle light & dark mode"><i class="fa-solid fa-sun darkicon" id="dayicon"></i>&nbsp;<input type="checkbox" class="toggle" unchecked onclick="toggleDarkMode();" id="darkmodeswitch"><i class="fa-solid fa-moon darkicon" id="nighticon" style="padding-left: 4px;"></i></div></li>
        </ul>
      </nav>
      `
    }

    $pageHeader.append(userLinks);
  }

  window.header.update = updateHeader;

  getMyDetails()
    .then(function( json ) {
    updateHeader(json.user);
  });

  $("header").on("click", '.my_reservations_button', function() {
    propertyListings.clearListings();
    getAllReservations()
      .then(function(json) {
        propertyListings.addProperties(json.reservations, true);
        views_manager.show('listings');
      })
      .catch(error => console.error(error));
  });
  $("header").on("click", '.my_listing_button', function() {
    propertyListings.clearListings();
    getAllListings(`owner_id=${currentUser.id}`)
      .then(function(json) {
        propertyListings.addProperties(json.properties);
        views_manager.show('listings');
    });
  });

  $("header").on("click", '.home', function() {
    propertyListings.clearListings();
    getAllListings()
      .then(function(json) {
        propertyListings.addProperties(json.properties);
        views_manager.show('listings');
    });
  });

  $('header').on('click', '.search_button', function() {
    views_manager.show('searchProperty');
  });

  $("header").on('click', '.login_button', () => {
    views_manager.show('logIn');
  });
  $("header").on('click', '.sign-up_button', () => {
    views_manager.show('signUp');
  });
  $("header").on('click', '.logout_button', () => {
    logOut().then(() => {
      header.update(null);
    });
  });

  $('header').on('click', '.create_listing_button', function() {
    views_manager.show('newProperty');
  });

});