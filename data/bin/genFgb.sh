#!/bin/bash
# Generates a Flatgeobuf in EPSG:4326

SRC_PATH=$1
DST_PATH=$2
DATASOURCE_ID=$3
SQL_QUERY=$4

# echo "SRC_PATH: $1"
# echo "DST_PATH: $2"
# echo "DATASOURCE_ID: $3"
# echo "SQL_QUERY: $4"

ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf -nlt PROMOTE_TO_MULTI -wrapdateline -dialect OGRSQL -sql "${SQL_QUERY}" ${DST_PATH}/${DATASOURCE_ID}.fgb ${SRC_PATH}