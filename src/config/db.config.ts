import config from './config'
const { Client } = require('pg')

const dbConfig = config.env === 'development' ? config.database.dev : config.database.production

const client = new Client({
    host: dbConfig.host,
    user: dbConfig.username,
    port: Number(dbConfig.port),
    password: dbConfig.password,
    database: dbConfig.name
})

client.connect()

export { client }
