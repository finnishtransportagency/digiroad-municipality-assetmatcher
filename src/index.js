const express = require('express')
const app = express()
const assetmatcher = require('./asset-matcher')

app.use(express.json())

app.post('/', async (request, response) => {
  const feature = request.body
  const matchedFeature = await assetmatcher.matchFeatureToDigiroa(feature)
  response.send(matchedFeature)
})

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log(`Express Running on port: ${PORT} 🚀`)
})

// shut down server
const shutdown = () => {
  // NOTE: server.close is for express based apps
  // If using hapi, use `server.stop`
  server.close((err) => {
    if (err) {
      console.error(err)
      process.exitCode = 1
    }
    process.exit()
  })
}

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', () => {
  console.info(
    'Got SIGINT (aka ctrl-c in docker). Graceful shutdown ',
    new Date().toISOString()
  )
  shutdown()
})

// quit properly on docker stop
process.on('SIGTERM', () => {
  console.info(
    'Got SIGTERM (docker container stop). Graceful shutdown ',
    new Date().toISOString()
  )
  shutdown()
})
