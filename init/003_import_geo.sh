#!/bin/bash

echo Importing geo lookup.....

function sqlCommand() {
  PGPASSWORD="${POSTGRES_PASSWORD}" psql -U${POSTGRES_USER} -w ${POSTGRES_DB} -c "$1"
}

function restoreFile() {
  PGPASSWORD="${POSTGRES_PASSWORD}" pg_restore -U${POSTGRES_USER} -Ft -d ${POSTGRES_DB} < "$1"
}


FILE=/tmp/geom/oa11_postcodes-11-02-2019.gz

restoreFile "$FILE" 