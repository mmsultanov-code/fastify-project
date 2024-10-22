import { FastifyRequest, FastifyReply } from 'fastify';
import { verify } from 'jsonwebtoken';

interface JwtPayload {
    user: {
        id: number;
    };
}

/**
 * Middleware function to authenticate JWT tokens in incoming requests.
 * 
 * @param req - The Fastify request object.
 * @param res - The Fastify reply object.
 * 
 * @returns A response with status 403 if no token is provided, or status 401 if the token is invalid.
 * 
 * @remarks
 * This middleware checks for the presence of a JWT token in the `Authorization` header of the request.
 * If a token is found, it attempts to verify it using a secret key. If the token is missing or invalid,
 * an appropriate error response is sent back to the client.
 * 
 * @example
 * ```typescript
 * fastify.addHook('preHandler', authJwt);
 * ```
 */
const authJwt = async (req: FastifyRequest, res: FastifyReply) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).send({
            statusCode: 403,
            msg: 'Access denied! No token provided.',
        });
    }

    const jwtSecret = process.env.JWT_SECRET || 'secret';

    try {
        const decoded = verify(token, jwtSecret) as JwtPayload;
    } catch (err) {
        return res.status(401).send({
            statusCode: 401,
            msg: 'Unauthorized! Invalid token.',
        });
    }
};

export default authJwt;