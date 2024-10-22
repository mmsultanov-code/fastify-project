import authJwt from '../middlewares/authjwt';
import { UserController } from '../controller';
import { FastifyInstance } from 'fastify';

const userRoute = async (app: FastifyInstance) => {
    app.get('/', { preHandler: authJwt }, UserController.getUsers);
    app.post('/login', UserController.login);
    app.get('/:id', { preHandler: authJwt }, UserController.getUserById);
    app.post('/buy', { preHandler: authJwt }, UserController.simpleBuyItem);
    app.patch('/change-password', { preHandler: authJwt }, UserController.changePassword);
};

export default userRoute;