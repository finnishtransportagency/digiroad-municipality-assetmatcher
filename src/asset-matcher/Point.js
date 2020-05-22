const db = require('../db')
async function matchPointWithDigiroad(Feature) {
  const { coordinates } = Feature.geometry

  const query = {
    text: `
      WITH ref_point AS (
        SELECT ST_SetSRID(ST_Point($1, $2),3067) AS geom
      )
      
      SELECT link_id
        FROM dr_linkki, ref_point
      WHERE ST_BUFFER(ref_point.geom, 50) && dr_linkki.geom
      ORDER BY ref_point.geom <-> dr_linkki.geom ASC
      LIMIT 1
      `,
    values: [coordinates[0], coordinates[1]],
  }

  // promise
  return db
    .query(query)
    .then((res) => {
      return res.rows.map((row) => row.link_id)
    })
    .catch((e) => console.error(e.stack))
}

module.exports = { matchPointWithDigiroad }
