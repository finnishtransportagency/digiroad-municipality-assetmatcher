const db = require('../db')

async function matchLineStringWithDigiroad(Feature) {
  const { coordinates } = Feature.geometry
  const lastIndex = coordinates.length - 1

  const querySourceAndTarget = {
    text: `
      WITH ref_point AS (
      	SELECT ST_SetSRID(ST_Point($1, $2),3067) as source_point,
      	ST_SetSRID(ST_Point($3, $4),3067) as target_point
      ), source_edge AS (
      	SELECT link_id
         	FROM dr_linkki, ref_point
      	WHERE ST_BUFFER(ref_point.source_point, 50) && dr_linkki.geom
      	ORDER BY ref_point.source_point <-> dr_linkki.geom ASC
      	LIMIT 1
      ), target_edge AS (
      	SELECT link_id
         	FROM dr_linkki, ref_point
      	WHERE ST_BUFFER(ref_point.target_point, 50) && dr_linkki.geom
      	ORDER BY ref_point.target_point <-> dr_linkki.geom ASC
      	LIMIT 1
      ), source_position AS (
         SELECT ST_LineLocatePoint(
      	(SELECT geom FROM dr_linkki WHERE link_id = (SELECT * FROM source_edge)),
      	(SELECT source_point FROM ref_point)
         ) AS position_fraction
      ), target_position AS (
         SELECT ST_LineLocatePoint(
      	(SELECT geom FROM dr_linkki WHERE link_id = (SELECT * FROM target_edge)),
      	(SELECT target_point FROM ref_point)
         ) AS position_fraction
      ), edges AS (
      	SELECT *, 1 as order_number FROM source_edge
      	UNION
      	SELECT *, 2 as order_number FROM target_edge
      ), fractions AS (
      	SELECT *, 1 as order_number FROM source_position
      	UNION
      	SELECT *, 2 as order_number FROM target_position
      )
      
      SELECT link_id,position_fraction FROM edges
      LEFT JOIN fractions ON
      edges.order_number = fractions.order_number
      ORDER BY fractions.order_number ASC
		`,
    values: [
      coordinates[0][0],
      coordinates[0][1],
      coordinates[lastIndex][0],
      coordinates[lastIndex][1],
    ],
  }

  // promise
  return db
    .query(querySourceAndTarget)
    .then((res) => {
      const result = res.rows
      if (result[0].link_id === result[1].link_id) return [result[0].link_id]

      const routingQuery = {
        text: `
				WITH edges AS (
					SELECT id3 AS edge FROM pgr_trspViaEdges(
						'SELECT link_id::INTEGER AS id, source::INTEGER, target::INTEGER, cost FROM dr_linkki'::text,
						ARRAY[$1,$2]::INTEGER[],
						ARRAY[$3,$4]::FLOAT[],
						false,false)
					)
		
				SELECT ARRAY_AGG(DISTINCT edge) AS edges FROM edges WHERE edge > 0
				`,
        values: [
          result[0].link_id,
          result[1].link_id,
          result[0].position_fraction,
          result[1].position_fraction,
        ],
      }

      return db
        .query(routingQuery)
        .then((res) => {
          return res.rows[0].edges
        })
        .catch((e) => console.error(e.stack))
    })
    .catch((e) => console.error(e.stack))
}

module.exports = { matchLineStringWithDigiroad }
