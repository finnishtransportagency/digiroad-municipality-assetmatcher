const lineString = require('./LineString')
const point = require('./Point')
const polygon = require('./Polygon')
const LineMatcher = require('./matchingRateLineString')

async function matchFeatureToDigiroa(Feature) {
  const { type } = Feature.geometry

  const link_ids = await matchLinkIds(Feature)

  if (link_ids.length > 0) Feature.properties['link_ids'] = link_ids

  if (type === 'LineString' && link_ids.length > 0) {
    const matching_rate = await LineMatcher.calculateMatchingRate(Feature)
    if (matching_rate > 0) {
      Feature.properties['matching_rate'] = matching_rate
    }
  }

  return Feature
}

async function matchLinkIds(Feature) {
  const { type } = Feature.geometry
  switch (type) {
    case 'Point':
      return point.matchPointWithDigiroad(Feature)
    case 'LineString':
      return lineString.matchLineStringWithDigiroad(Feature)
    case 'Polygon':
      return polygon.matchPolygonWithDigiroad(Feature)
    default:
      return []
  }
}

module.exports = { matchFeatureToDigiroa }
