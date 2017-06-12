/**
 * Database init file
 */

'use strict';

const pg = require('pg');
//TODO - add pg-promise?, pools for connecting

//Setup Postgres (database)
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/uk';

const client = new pg.Client(connectionString);
client.connect();

/*
const query = client.query(
    'CREATE TABLE items(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)');
query.on('end', () => { client.end(); });
*/
