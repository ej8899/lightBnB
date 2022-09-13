const properties = require('./json/properties.json');
const users = require('./json/users.json');

// connect to PSQL database lightbnb
const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

// test PSQL connection
// pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})



/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  // https://flex-web.compass.lighthouselabs.ca/workbooks/flex-m05w13/activities/776?journey_step=51&workbook=17
  
  let userEmail = email.toLowerCase().trim();
  let sqlQueryString = `
  SELECT * 
  from users
  WHERE users.email = $1;
`;
  let sqlValues = [userEmail];

  return pool
    .query(sqlQueryString, sqlValues)
    .then((result) => {
      console.log(result.rows);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  
  let sqlQueryString = `
  SELECT * 
  from users
  WHERE users.id = $1;
  `;
  let sqlValues = [id];

  return pool
    .query(sqlQueryString, sqlValues)
    .then((result) => {
      console.log(result.rows);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  let sqlQueryString = `
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;
  `;    // note the "RETURNING *" gives us back the auto gen. ID/PK
  let sqlValues = [user.name, user.email, user.password];

  return pool
    .query(sqlQueryString, sqlValues)
    .then((result) => {
      console.log(result.rows);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addUser = addUser;




/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  //return getAllProperties(null, 2);

  let sqlQueryString = `
  select 
	r.*, 
	p.*,
	round(avg(pr.rating),1) as average_rating
	
from reservations as r
join properties as p on p.id = r.property_id
join property_reviews as pr on pr.property_id = r.property_id
where r.guest_id = $1
group by r.id, p.id
order by r.start_date desc
LIMIT $2;
  `;    // note the "RETURNING *" gives us back the auto gen. ID/PK
  let sqlValues = [guest_id, limit];

  return pool
    .query(sqlQueryString, sqlValues)
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllReservations = getAllReservations;




/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  // https://flex-web.compass.lighthouselabs.ca/workbooks/flex-m05w12/activities/769?journey_step=42&workbook=16

  let sqlQueryString = `
    SELECT * 
    from properties
    order by random()
    LIMIT $1
  `;
  let sqlValues = [limit];
  return pool
    .query(sqlQueryString, sqlValues)
    .then((result) => {
      // console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllProperties = getAllProperties;
// getAllProperties();



/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  let sqlQueryString = `
    INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `;
  let sqlValues = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night * 100,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms
  ];

  return pool
    .query(sqlQueryString, sqlValues)
    .then((result) => {
      // console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addProperty = addProperty;
