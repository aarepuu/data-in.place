#!/bin/bash

echo Importing geo lookup.....

function sqlCommand() {
  PGPASSWORD="${POSTGRES_PASSWORD}" psql -U${POSTGRES_USER} -w ${POSTGRES_DB} -c "$1"
}

function restoreFile() {
  PGPASSWORD="${POSTGRES_PASSWORD}" zcat "$1" | psql -U${POSTGRES_USER} -d ${POSTGRES_DB}
}


# FILE=/tmp/geom/oa11_postcodes-11-02-2019.gz

# restoreFile "$FILE" 