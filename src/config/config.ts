import dotenv from 'dotenv'
dotenv.config()

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    database: {
        dev: {
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            name: process.env.DB_NAME,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT
        },
        production: {
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            name: process.env.DB_NAME,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT
        }
    }
}

export default config
