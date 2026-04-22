#!/bin/bash

# OKAY! Here's how the OUS Demographic set up works in the Belize reports (from data/bin folder):
# 1. Run this script data folder to create json: 
#    ./1-ousDemographicPrep.sh
# 2. Run this script to publish fgb to aws:
#    ./2-ousDemographicPublish.sh
# 3. Run this script to precalculate demographics data overlap:
#    npx tsx 3-ousDemographicPrecalc.ts

# Pares down OUS demographic data (copied from Data Products) to what reports need
# and saves into data/dist/ous_demographics.json for use in precalc 

# Delete old merged geojson since ogr2ogr can't overwrite it
rm ../src/Analytics/OUS/ous_demographics.geojson

# Select only necessary columns
ogr2ogr -t_srs "EPSG:4326" -f GeoJSON -nlt PROMOTE_TO_MULTI -wrapdateline -dialect OGRSQL \
-sql "SELECT \"shapes_2026-03-12\".response_i AS resp_id, \
             \"shapes_2026-03-12\".pratica_pe AS gear, \
             \"shapes_2026-03-12\".stado AS state, \
             \"shapes_2026-03-12\".sector AS sector, \
             \"shapes_2026-03-12\".participan AS number_of_ppl \
      FROM \"shapes_2026-03-12\"" ../src/Analytics/OUS/ous_demographics.geojson ../src/Analytics/OUS/shapes_2026-03-12.geojson

# Delete old dist files in prep for new
rm ../dist/ous_demographics.json
rm ../dist/ous_demographics.fgb

# Sort by respondent_id (for faster processing at runtime)
npx tsx ousDemographicSort.ts

# Create json file for direct import by precalc
cp ../src/Analytics/OUS/ous_demographics_sorted.geojson ../dist/ous_demographics.json

# Generate cloud-optimized Flatgeobuf
./genFgb.sh ../dist/ous_demographics.json ../dist ous_demographics 'SELECT * FROM "shapes_2026-03-12"' -nlt PROMOTE_TO_MULTI