const properties = require('./json/properties.json');
const users = require('./json/users.json');
const db = require("./db");

/*
// connect to PSQL database lightbnb
const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});
*/
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

  return db.query(sqlQueryString, sqlValues,(res) => res.rows[0]);
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

  return db.query(sqlQueryString, sqlValues,(res) => res.rows[0]);
};
exports.getUserWithId = getUserWithId;

//
// extrastretch - get counts per cost per night ranges (for filter/search graph)
//
/* NOTE: this code would work and be scalable.... back or front end would have to translate index into 'human' readable form.
SELECT
   Floor(cost_per_night/5000) as index,
   Floor(cost_per_night/5000)+5000 as upperBounds,
   Count(*)
FROM
   properties
GROUP BY
   Floor(cost_per_night/5000)
   ORDER by index;
*/
const getCostPerRange = function() {
  let sqlQueryString = `
    SELECT 
    case 
      when cost_per_night between 0 and 5000 then      '$   0 - 50'
      when cost_per_night between 5001 and 10000 then  '$  51 - 100'
      when cost_per_night between 10001 and 15000 then '$ 101 - 150'
      when cost_per_night between 15001 and 20000 then '$ 151 - 200'
      when cost_per_night between 20001 and 25000 then '$ 201 - 250'
      when cost_per_night between 25001 and 30000 then '$ 251 - 300'
      when cost_per_night between 30001 and 35000 then '$ 301 - 350'
      when cost_per_night between 35001 and 40000 then '$ 351 - 400'
      when cost_per_night between 40001 and 45000 then '$ 401 - 450'
      when cost_per_night between 45001 and 50000 then '$ 451 - 500'
      when cost_per_night between 50001 and 55000 then '$ 501 - 550'
      when cost_per_night between 55001 and 60000 then '$ 551 - 600'
      when cost_per_night between 60001 and 65000 then '$ 601 - 650'
      when cost_per_night between 65001 and 70000 then '$ 651 - 700'
      when cost_per_night between 70001 and 75000 then '$ 701 - 750'
      when cost_per_night between 75001 and 80000 then '$ 751 - 800'
      when cost_per_night between 80001 and 85000 then '$ 801 - 850'
      when cost_per_night between 85001 and 90000 then '$ 851 - 900'
      when cost_per_night between 90001 and 95000 then '$ 901 - 950'
      when cost_per_night between 95001 and 100000 then '$ 951 - 1000'
      when cost_per_night > 100001 then '$ 1001+'
      else 'OTHERS'
    end as "Range",
    count(*) as "Count"
  FROM properties
  GROUP BY "Range"
  ORDER BY "Range"
  `;
  let sqlValues = [];

  return db.query(sqlQueryString, sqlValues,(res) => res.rows);
};
exports.getCostPerRange = getCostPerRange;

//
// extrastretch - getAllCities for our map
//
const getAllCities = function() {
  let sqlQueryString = `
  SELECT distinct city,province from properties;
  `;
  let sqlValues = [];

  return db.query(sqlQueryString, sqlValues,(res) => res.rows);
};
exports.getAllCities = getAllCities;

//
// extrastretch - getCountbyProv
//
const getCountbyProv = function(data) {
  let sqlQueryString = `
  SELECT distinct count(*), province
  FROM properties
  GROUP BY province
  ORDER by province ASC
  `;
  let sqlValues = [];

  return db.query(sqlQueryString, sqlValues,(res) => res.rows);
};
exports.getCountbyProv = getCountbyProv;

//
// extrastretch - get average cost per night throughout all listings
//
const getAverageCostPerNight = function(data) {
  let sqlQueryString = `
  SELECT AVG(cost_per_night)
  FROM properties
  `;
  let sqlValues = [];

  return db.query(sqlQueryString, sqlValues,(res) => res.rows[0]);
};
exports.getAverageCostPerNight = getAverageCostPerNight;

//
// extrastretch - getAllCities for our map
//
const getCountbyCity = function(city) {
  let sqlQueryString = `
  SELECT count(*), city
  from properties
  WHERE city = $1
  GROUP by properties.city
  `;
  let sqlValues = [city.city];

  return db.query(sqlQueryString, sqlValues,(res) => res.rows[0]);
};
exports.getCountbyCity = getCountbyCity;

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

  return db.query(sqlQueryString, sqlValues,(res) => res.rows[0]);
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
  SELECT 
	r.*, 
	p.*,
	round(avg(pr.rating),1) as average_rating
	
  FROM reservations as r
  JOIN properties as p on p.id = r.property_id
  JOIN property_reviews as pr on pr.property_id = r.property_id
  WHERE r.guest_id = $1
  GROUP BY r.id, p.id
  ORDER BY r.start_date desc
  LIMIT $2;
  `;    // note the "RETURNING *" gives us back the auto gen. ID/PK
  let sqlValues = [guest_id, limit];

  return db.query(sqlQueryString, sqlValues,(res) => res.rows);
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
    SELECT properties.*, AVG(property_reviews.rating) as average_rating 
    FROM properties
    JOIN property_reviews on properties.id = property_reviews.property_id
    `;
  let sqlValues = [];

  if (options.city) {                     // process search CITY
    sqlValues.push(`%${options.city}%`);
    sqlQueryString +=  `WHERE city iLIKE $${sqlValues.length} `;
  }
  if (options.province) {                     // process search PROVINCE
    sqlQueryString += (sqlValues.length ? `AND ` : 'WHERE ');
    sqlValues.push(`${options.province}`);
    //sqlQueryString +=  `province iLIKE $${sqlValues.length} `;
    sqlQueryString +=  `province = $${sqlValues.length}::text `;
  }
  if (options.owner_id) {                 // process search OWNER (via ID)
    sqlQueryString += (sqlValues.length ? `AND ` : 'WHERE ');
    sqlValues.push(options.owner_id);
    sqlQueryString += `properties.owner_id = $${sqlValues.length} `;
  }
  if (options.minimum_price_per_night) {  // process SEARCH RANGE
    sqlQueryString += (sqlValues.length ? `AND ` : 'WHERE ');
    sqlValues.push(options.minimum_price_per_night * 100);
    sqlQueryString += `properties.cost_per_night >= $${sqlValues.length} `;
  }
  if (options.maximum_price_per_night) {
    sqlQueryString += (sqlValues.length ? `AND ` : 'WHERE ');
    sqlValues.push(options.maximum_price_per_night * 100);
    sqlQueryString += `properties.cost_per_night <= $${sqlValues.length} `;
  }
  sqlQueryString += 'GROUP BY properties.id ';    // dont forget ORDERING of GROUP by and HAVING!
  if (options.minimum_rating) {           // process MIN rating
    sqlValues.push(options.minimum_rating);
    sqlQueryString += `
    HAVING avg(property_reviews.rating) >= $${sqlValues.length} `;
  }
  if (options.pricesort === "DESC") {
    sqlQueryString += `ORDER BY properties.cost_per_night DESC `;
  } else {
    sqlQueryString += `ORDER BY properties.cost_per_night ASC `;
  }
  sqlValues.push(limit); // add SQL "limit" to values
  sqlQueryString += `
    LIMIT $${sqlValues.length}
    ;
  `;
  console.log(sqlQueryString + ' | ' + sqlValues);
  return db.query(sqlQueryString, sqlValues,(res) => res.rows);
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
