import { UserService } from '../service'
import { FastifyReply, FastifyRequest } from 'fastify'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'

class UserController {
    /**
     * Retrieves a list of users.
     * 
     * @param req - The Fastify request object.
     * @param res - The Fastify reply object.
     * @returns A promise that resolves to a response containing the list of users.
     * @throws Will throw an error if there is an issue retrieving the users.
     */
    async getUsers(req: FastifyRequest, res: FastifyReply) {
        try {
            const users = await UserService.getUsers()
            res.status(200).send({
                statusCode: 200,
                msg: 'Users retrieved successfully',
                users
            })
        } catch (error) {
            res.status(500).send({
                statusCode: 500,
                msg: 'Internal Server Error',
                error: error
            })
        }
    }

    /**
     * Retrieves a user by their ID.
     * 
     * @param req - The Fastify request object, containing the user ID in the parameters.
     * @param res - The Fastify reply object used to send the response.
     * @returns A promise that resolves to the user data if found, or an error message if not.
     * @throws Will throw an error if there is an issue with the request processing.
     * @remarks
     * - Responds with a 400 status code if the ID is invalid.
     * - Responds with a 404 status code if the user is not found.
     * - Responds with a 500 status code if there is an internal server error.
     */
    async getUserById(req: FastifyRequest, res: FastifyReply) {
        try {
            const { id } = req.params as { id: string }
            const userId = parseInt(id, 10)
            if (isNaN(userId)) {
                res.status(400).send({
                    statusCode: 400,
                    msg: 'Invalid ID'
                })
                return
            }
            const user = await UserService.getUserById(userId)
            if (!user) {
                res.status(404).send({
                    statusCode: 404,
                    msg: 'User not found'
                })
                return
            }
            res.status(200).send({
                statusCode: 200,
                msg: 'User retrieved successfully',
                user
            })
        } catch (error) {
            res.status(500).send({
                statusCode: 500,
                msg: 'Internal Server Error',
                error: error
            })
        }
    }

    /**
     * Handles the purchase of an item by deducting the specified amount from the user's balance.
     * 
     * @param req - The Fastify request object containing the userId and amount in the body.
     * @param res - The Fastify reply object used to send the response.
     * 
     * @remarks
     * - Validates the userId and amount from the request body.
     * - If validation fails, responds with a 400 status code and an error message.
     * - Calls the UserService to deduct the balance.
     * - If the deduction is successful, responds with a 200 status code and a success message.
     * - If the deduction fails, responds with a 400 status code and an error message.
     * - Catches and logs any errors, responding with a 500 status code and an internal server error message.
     * @throws Will throw an error if the UserService.deductBalance method fails.
     */
    async simpleBuyItem(req: FastifyRequest, res: FastifyReply) {
        try {
            const { userId, amount } = req.body as { userId: number; amount: number }
            if (!userId || !amount || isNaN(userId) || isNaN(amount) || amount <= 0) {
                res.status(400).send({
                    statusCode: 400,
                    msg: 'Invalid userId or amount'
                })
                return
            }
            const result = await UserService.deductBalance(userId, amount)
            if (result.success) {
                res.status(200).send({
                    statusCode: 200,
                    msg: 'Balance deducted successfully',
                    user: result.user
                })
            } else {
                res.status(400).send({
                    statusCode: 400,
                    msg: result.msg
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                statusCode: 500,
                msg: 'Internal Server Error',
                error: error
            })
        }
    }

    /**
     * Handles user login.
     *
     * @param {FastifyRequest} req - The request object containing email and password in the body.
     * @param {FastifyReply} res - The response object used to send back the appropriate response.
     * @returns {Promise<void>} - Sends a response with the status and message or token.
     * @throws {Error} - If an unexpected error occurs, a 500 status code is returned with the error message.
     */
    async login(req: FastifyRequest, res: FastifyReply) {
        try {
            const { email, password } = req.body as { email: string; password: string };
            if (!email || !password) {
                return res.status(400).send({
                    statusCode: 400,
                    msg: 'Email or password is missing',
                });
            }

            const user = await UserService.getUserByEmail(email);
            if (!user) {
                return res.status(404).send({
                    statusCode: 404,
                    msg: 'User not found',
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).send({
                    statusCode: 400,
                    msg: 'Invalid password',
                });
            }

            const payload = {
                user: {
                    id: user.id,
                },
            };
            const jwt_secret = process.env.JWT_SECRET || 'secret';

            // Используйте синхронную версию sign для получения токена
            const token = sign(payload, jwt_secret, { expiresIn: 3600 });

            // Отправьте ответ с токеном
            return res.status(200).send({
                statusCode: 200,
                msg: 'Login successful',
                token,
            });
        } catch (error) {
            console.error(error); // Вывод ошибки в консоль для отладки
            return res.status(500).send({
                statusCode: 500,
                msg: 'Internal Server Error',
                error: error,
            });
        }
    }

    /**
     * Handles the password change request for a user.
     *
     * @param req - The Fastify request object containing the email, old password, and new password.
     * @param res - The Fastify reply object used to send the response.
     * @returns A response indicating the result of the password change operation.
     * @throws Will return a 400 status code if the old password and new password are the same,
     * or if any of the required fields (email, old password, new password) are missing.
     * Will return a 404 status code if the user is not found.
     * Will return a 400 status code if the old password does not match the user's current password.
     * Will return a 500 status code if an internal server error occurs.
     */
    async changePassword(req: FastifyRequest, res: FastifyReply) {
        try {
            const { email, oldPassword, newPassword } = req.body as { email: string; oldPassword: string; newPassword: string };

            if(oldPassword === newPassword) {
                return res.status(400).send({
                    statusCode: 400,
                    msg: 'Old password and new password should not be the same',
                });
            }

            if (!email || !oldPassword || !newPassword) {
                return res.status(400).send({
                    statusCode: 400,
                    msg: 'Email, old password or new password is missing',
                });
            }

            const user = await UserService.getUserByEmail(email);
            if (!user) {
                return res.status(404).send({
                    statusCode: 404,
                    msg: 'User not found',
                });
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).send({
                    statusCode: 400,
                    msg: 'Invalid password',
                });
            }

            await UserService.changePassword(user.id, newPassword);

            return res.status(200).send({
                statusCode: 200,
                msg: 'Password changed successfully',
            });
        } catch (error) {
            console.error(error); // Вывод ошибки в консоль для отладки
            return res.status(500).send({
                statusCode: 500,
                msg: 'Internal Server Error',
                error: error,
            });
        }
    }
}

export default new UserController
