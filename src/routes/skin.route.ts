import { SkinController } from '../controller'
import { FastifyInstance } from 'fastify'

const skinport = async (app: FastifyInstance) => {
    app.get('/', SkinController.getSkins)
}

export default skinport
