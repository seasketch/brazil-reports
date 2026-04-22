#!/bin/bash

# Uploads OUS Demographic data to s3 bucket

DATA_DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
BUCKET="gp-brazil-reports-datasets"

aws s3 cp --recursive "${DATA_DIR}/dist/" s3://${BUCKET} --cache-control max-age=3600 --exclude "*" --include "ous_demographics.fgb"