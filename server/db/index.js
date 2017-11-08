/**
 * Database init file
 */

'use strict';

const {Pool} = require('pg');

//Setup Postgres (database)
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/uk';


const pool = new Pool({
    connectionString: connectionString,
});


//const pool = new Pool();

module.exports = {
    query: (query)  => pool.query(query)
}
