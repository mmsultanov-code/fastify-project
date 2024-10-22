import App from './src/app'
import dotenv from 'dotenv'
import { UsersRepository, SkinsRepository } from './src/repository'

dotenv.config()

const app = App({ logger: true })
const PORT = Number(process.env.PORT_DEV) || 3000

app.listen({ port: PORT, host: '0.0.0.0' }, async (err) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
    try {
        await SkinsRepository.createTable()
        await UsersRepository.createTable()
        const exists_default_rows = await UsersRepository.getUsers()
        if (!exists_default_rows.rows.length) {
            await UsersRepository.insertDefaultRows()
        }
    } catch (err) {
        console.log(err)
        app.log.error('Failed to create users table')
        app.log.error(err)
        process.exit(1)
    }
    app.log.info(`Server started on port: ${PORT}`)
})
