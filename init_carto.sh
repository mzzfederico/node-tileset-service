#!bin/sh

mkdir data
git clone git@github.com:gravitystorm/openstreetmap-carto.git ./data/carto

npm install -g carto
carto ./data/carto/project.mml >./data/carto/mapnik.xml

echo "./data/openstreetmap-carto/mapnik.xml" >>.env
