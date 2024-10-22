import { FastifyReply, FastifyRequest } from 'fastify'
import { SkinService } from '../service'

class SkinController {
    /**
     * Handles the request to get skins.
     * 
     * @param req - The Fastify request object.
     * @param res - The Fastify reply object.
     * @returns A promise that resolves to the response from the SkinService.
     */
    async getSkins(req: FastifyRequest, res: FastifyReply) {
        const response = await SkinService.getSkinsByWorker(req, res)
        return response
    }
}

export default new SkinController()
