#!/bin/bash

echo ""
echo "Starting Karma Server (http://karma-runner.github.io)"
echo "-------------------------------------------------------------------"

../node_modules/karma/bin/karma start karma.conf.js $*
