/**
 * Database init file
 */

'use strict';

const {Pool} = require('pg');

//Setup Postgres (database)
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/uk';

//TODO - clean this up
const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
    const pool = new Pool({
        connectionString: connectionString,
    });
    module.exports = {
        query: (query) => pool.query(query)
    }

} else {
    const pool = new Pool();
    module.exports = {
        query: (query) => pool.query(query)
    }
}


