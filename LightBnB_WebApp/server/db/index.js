const { Pool } = require("pg");

const pool = new Pool({
  user: "vagrant",
  password: "123",
  host: "localhost",
  database: "lightbnb"
});

//
// reference: https://node-postgres.com/guides/project-structure
//
module.exports = {
  query: async(text, params, callback) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("executed query in \x1b[36m" + duration + "ms\x1b[0m: ", { text, rows: res.rowCount });
    return callback(res);
  }
};