import fastify, { FastifyServerOptions } from 'fastify'
import { userRoute, skinRoute } from './routes'

const App = (options: FastifyServerOptions) => {
    const app = fastify(options)

    app.register(userRoute, { prefix: '/users' })
    app.register(skinRoute, { prefix: '/skin' })

    return app
}

export default App
