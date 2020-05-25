const { Pool } = require('pg')

const host = process.env.PG_HOST || 'localhost'
const port = Number(process.env.PG_PORT) || 5432
const user = process.env.PG_USER || 'postgres'
const password = process.env.PG_PASSWORD
const database = process.env.PG_DATABASE || 'dr_r'

const pool = new Pool({
  host,
  port,
  user,
  password,
  database,
})

pool.connect((err, client) => {
  if (err) {
    console.error('Error While connecting to postgres:', err)
  } else {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`Postgres connected: ${host}:${port}`)
    }
  }
})

module.exports = {
  query: (text, params) => pool.query(text, params),
}
