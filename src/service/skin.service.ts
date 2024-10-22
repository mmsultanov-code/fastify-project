import { FastifyReply, FastifyRequest } from 'fastify'
import Redis from 'ioredis';
import { Worker } from 'worker_threads'

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
});

class SkinService {
    /**
     * Retrieves skins data by utilizing a worker thread and caches the result.
     * 
     * @param req - The Fastify request object.
     * @param res - The Fastify reply object.
     * 
     * @remarks
     * This method first attempts to retrieve the skins data from a Redis cache.
     * If the data is found in the cache, it is returned immediately.
     * If not, a worker thread is spawned to fetch the data.
     * The response is streamed back to the client in chunks.
     * The fetched data is then cached in Redis for subsequent requests.
     * 
     * @throws Internal server error if there is an issue with Redis or the worker thread.
     */
    async getSkinsByWorker(req: FastifyRequest, res: FastifyReply) {
        const cacheKey = 'skins_data'

        try {
            let cachedData = await redis.get(cacheKey);
            if (cachedData) {
                res.send({
                    statusCode: 200,
                    msg: 'Skins retrieved successfully (from cache)',
                    data: JSON.parse(cachedData)
                });
                return;
            }
        } catch (err) {
            console.error('Redis error:', err);
            res.status(500).send({ error: 'Internal server error (cache)' });
            return;
        }

        const worker = new Worker('./src/workers/skin.worker.js')

        res.raw.setHeader('Content-Type', 'application/json')
        res.raw.setHeader('Transfer-Encoding', 'chunked')
        res.raw.setHeader('Connection', 'keep-alive')
        res.raw.write('')

        let responseData: string = ''

        worker.on('message', (message) => {
            if (message !== null) {
                const data = JSON.parse(JSON.stringify(message))
                res.raw.write(data)
                responseData += data
            } else {
                try {
                    res.raw.end()
                } catch (err) {
                    console.error('JSON parsing error:', err)
                    res.status(500).send({ error: 'Internal server error while parsing JSON' })
                }
            }
        });

        worker.on('error', (error) => {
            console.error('Worker error:', error);
            res.status(500).send({ error: 'Internal server error' });
        });

        worker.on('exit', async(code) => {
            if (code !== 0) {
                console.log(`Worker stopped with exit code ${code}`);
            } else {
                await redis.set(cacheKey, responseData, 'EX', 300);
            }
        });
    }
}

export default new SkinService()
