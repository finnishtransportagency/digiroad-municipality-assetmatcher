const db = require('../db')

async function calculateMatchingRate(Feature) {
  const { properties, geometry } = Feature
  if (!properties.link_ids) return 0

  const query = {
    text: `
      WITH Digiroad AS (
        SELECT ST_Buffer(ST_Collect(geom),2.5) AS geom
        FROM dr_linkki 
        WHERE link_id = ANY($1::int[])
      ), GeoJSON AS (
        SELECT 
          ST_buffer(
            ST_SetSRID(
              ST_GeomFromGeoJSON($2),
            3067),
          0.5) AS geom
      )
          
      SELECT 
        ST_AREA(
          ST_INTERSECTION(
          GeoJSON.geom, Digiroad.geom))
          /st_area(GeoJSON.geom) 
        AS matching_rate
      FROM Digiroad, GeoJSON
      `,
    values: [properties.link_ids, geometry],
  }

  return db
    .query(query)
    .then((res) => {
      return res.rows[0].matching_rate
    })
    .catch((e) => console.error(e.stack))
}

module.exports = { calculateMatchingRate }
