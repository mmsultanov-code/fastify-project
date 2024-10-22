import { UsersRepository } from '../repository/'

class UserService {
    constructor(private usersRepository: any = UsersRepository) {}

    /**
     * Retrieves a list of users from the repository.
     *
     * @returns {Promise<any[]>} A promise that resolves to an array of user objects.
     * @throws {Error} Throws an error if the users could not be fetched.
     */
    async getUsers() {
        try {
            const res = await this.usersRepository.getUsers()
            return res.rows
        } catch (err) {
            throw new Error('Failed to fetch users')
        }
    }

    /**
     * Retrieves a user by their ID.
     *
     * @param id - The unique identifier of the user.
     * @returns The user object corresponding to the provided ID.
     * @throws Will throw an error if the user retrieval fails.
     */
    async getUserById(id: number) {
        try {
            const res = await this.usersRepository.getUserById(id)
            return res.rows[0]
        } catch (err) {
            throw new Error(`Failed to fetch user with ID ${id}`)
        }
    }

    /**
     * Deducts a specified amount from the user's balance.
     * 
     * @param userId - The ID of the user whose balance is to be deducted.
     * @param amount - The amount to be deducted from the user's balance.
     * @returns An object indicating the success or failure of the operation.
     *          If successful, the object contains the user's updated balance.
     *          If unsuccessful, the object contains an error message.
     * 
     * @throws Will roll back the transaction and return an error message if any step fails.
     */
    async deductBalance(userId: number, amount: number) {
        try {
            await this.usersRepository.begin()
            const res = await this.usersRepository.getUserForUpdate(userId)
            if (!res) {
                await this.usersRepository.rollBack()
                return {
                    success: false,
                    msg: 'User not found'
                }
            }
            const balance = res.balance
            if (balance < amount) {
                await this.usersRepository.rollBack()
                return {
                    success: false,
                    msg: 'Insufficient balance'
                }
            }
            const newBalance = balance - amount
            await this.usersRepository.updateUserBalance(userId, newBalance)
            await this.usersRepository.commit()

            return {
                success: true,
                user: {
                    id: userId,
                    balance: newBalance
                }
            }
        } catch (error) {
            await this.usersRepository.rollBack()
            return { success: false, msg: error }
        }
    }

    /**
     * Retrieves a user by their email address.
     *
     * @param email - The email address of the user to retrieve.
     * @returns The user object corresponding to the provided email address.
     * @throws Will throw an error if the user cannot be fetched.
     */
    async getUserByEmail(email: string) {
        try {
            const res = await this.usersRepository.getUserByEmail(email)
            return res.rows[0]
        } catch (err) {
            throw new Error(`Failed to fetch user with email ${email}`)
        }
    }

    /**
     * Changes the password for a user with the specified ID.
     *
     * @param userId - The ID of the user whose password is to be changed.
     * @param newPassword - The new password to be set for the user.
     * @throws Will throw an error if the password change operation fails.
     */
    async changePassword(userId: number, newPassword: string) {
        try {
            await this.usersRepository.changePassword(userId, newPassword)
        } catch (err) {
            throw new Error(`Failed to change password for user with ID ${userId}`)
        }
    }
}

export default new UserService()
