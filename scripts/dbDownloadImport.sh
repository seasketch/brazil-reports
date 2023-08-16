#!/bin/bash

# export tables from db as fgbs
DBINFO="host=200.132.11.22 port=1305 dbname=sbs user=sbs_user password=Mugil_2023"
LAYERS="human.mining_active_anm human.mining_potential_dnpm"

for LAYER in $LAYERS; do

    LAYER_NAME="/workspaces/brazil-reports/data/src/fromDatabase/${LAYER}.json"

    ogr2ogr \
        -f GeoJSON $LAYER_NAME \
        PG:"${DBINFO}" "${LAYER}"
done


npx ts-node /workspaces/brazil-reports/scripts/importDataNoninteractive.ts


# precalc for sub-regional planning will come next
