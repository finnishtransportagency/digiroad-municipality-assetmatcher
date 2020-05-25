const fs = require('fs')
const app = require('../index')
const supertest = require('supertest')
const api = supertest(app)

const point = JSON.parse(
  fs.readFileSync(__dirname + '/testdata/point.json', 'utf-8')
)
const polygon = JSON.parse(
  fs.readFileSync(__dirname + '/testdata/polygon.json', 'utf-8')
)
const linestring = JSON.parse(
  fs.readFileSync(__dirname + '/testdata/linestring.json', 'utf-8')
)

describe('Asset matcher can process data', () => {
  it('Process Point Geometry', async () => {
    const result = await api
      .post('/')
      .send(point)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)

    expect(result.body.properties).toEqual(
      expect.objectContaining({
        link_ids: expect.any(Array),
      })
    )
  })

  it('Process Polygon Geometry', async () => {
    const result = await api.post('/').send(polygon)
    expect(result.body.properties).toEqual(
      expect.objectContaining({
        link_ids: expect.any(Array),
      })
    )
  })

  it('Process Linestring Geometry', async () => {
    const result = await api.post('/').send(linestring)
    expect(result.body.properties).toEqual(
      expect.objectContaining({
        link_ids: expect.any(Array),
        matching_rate: expect.any(Number),
      })
    )
  })
})
