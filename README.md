# Digiroad Municipality Assetmatcher

This is a mircro service which takes a single GeoJSON Feature at a time and matches it to existing Digiroad Database.

## Prerequisite

This is a [Node.js](https://nodejs.org/en/) project. You need a Node.js installation and NPM or Yarn packagemanagers. This has been developped with version 13 of Node.js.

Also Docker and Docker-Compose is highly recommended but not neccessary.

## Environment Variables

In essence this project needs only PostgreSQL database connection.

```
      PG_HOST: 			(defaults => 'postgres')
      PG_PORT: 			(defaluts => 5432)
      PG_USER: 			(defaluts =>'postgres')
      PG_PASSWORD: 		required
      PG_DATABASE: 		(defalts => 'dr_r')
      PORT:				(defaults => 3000)
```

## Setting up the development database

The most simple and recommended way to set up development database is via Docker-Compose. If you want more indepth quide on setting up the database, check out Väylä's wiki or README.md of `digiroad-municipality-api` (related projet to asset matcher). This project needs a database related to municipality-api which has PGRouting, PostGIS and OSSP-UUID extensions already configured with Digiroad topology.

```bash
docker-compose up -d
```

## Run development environment


```bash
yarn start
or
npm run start
```
You should get something similar to this:

```bash
$ yarn start
yarn run v1.22.4
$ nodemon ./src/index.js
[nodemon] 2.0.4
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node ./src/index.js`
Express Running on port: 3000 🚀
Postgres connected: localhost:5432
```

## Asset matcher on action

The usage of this is meant to be as simple as possible. The Matcher accepts one GeoJSON feature at a time on with HTTP POST Request to its only endpoint. Notice that geometry has to be encoded with [EPSG:3067](https://epsg.io/3067).

```http://localhost:3000/  - POST```

Like this:

```json
{
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [390531.355788, 6685503.72725, 0],
          [390324.657666, 6685577.48872, 0],
          [390149.567429, 6685596.98163, 0],
          [389894.59267, 6685604.67455, 0],
          [389729.677084, 6685607.28968, 0]
        ]
      },
      "properties": {
        "type": "Roadlink",
        "id": 46557473,
        "name": "Mannerheimintie",
        "functionalClass": "Katu",
        "speedLimit": "40",
        "pavementClass": "1",
        "sideCode": 1
      }
    }
```

The Asset matcher adds `link_id`-property to Features properties. For lineStrings also matching_rate is calculated. Matching rate calculations to Polygons and Points may need further development.

An example response body:

```json
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
   	 "coordinates": [ ... ]
   },
   "properties": {
     "link_ids": [ ... ],
     "matching_rate": 0.82
     ...
   }
}
```

## Continuous Integration

Currently this project is using GitHub Actions to perform automated testing with docker-compose and shipps images to registery. This pipeline is triggered when you make a `pull_request` or `push` to development branch. This can be configured later to respond other branches as well. A new Image is shipped with a tag representing 8 digits of commit sha.

Suggestion: In future version tagged `v0.0.1` release branches could be merged into master which triggers a production build on and tags it with github tag. This tag can be later used in continuous delivery systems (Flux) later with regex to determinene production deployments.

## GeoJSON

GeoJSON is a very intuitive format and most of the modern GIS tools are able to handle transform their native data to GeoJSON and vice versa. If you are developing GeoJSON yourself at some point in your data pipeline you can reference [RFC-7946](https://tools.ietf.org/html/rfc7946) specification which is the official specification.

There is also an old specification which is now obsolete but it's more comprehensive and can also be used to getting started. You can access it [here](https://geojson.org/geojson-spec.html).