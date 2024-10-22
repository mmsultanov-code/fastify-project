import { client } from '../config/db.config'
import bcrypt from 'bcryptjs'

const salt = Number(process.env.SALT)

class UsersRepository {
    constructor(private repository: any = client) {}

    /**
     * Retrieves a list of users from the database.
     *
     * @returns {Promise<any[]>} A promise that resolves to an array of user objects, 
     * each containing the user's id, balance, and email.
     */
    async getUsers() {
        return await this.repository.query('SELECT id, balance, email FROM users')
    }

    /**
     * Retrieves a user by their ID.
     *
     * @param {number} id - The ID of the user to retrieve.
     * @returns {Promise<any>} A promise that resolves to the user data, including id, balance, and email.
     */
    async getUserById(id: number) {
        return await this.repository.query('SELECT id, balance, email FROM users WHERE id = $1', [id])
    }

    /**
     * Initiates a database transaction by executing the 'BEGIN' SQL command.
     *
     * @returns {Promise<any>} A promise that resolves when the transaction begins.
     */
    async begin() {
        return await this.repository.query('BEGIN')
    }

    /**
     * Rolls back the current transaction.
     *
     * This method executes a 'ROLLBACK' SQL query to undo any changes made during the current transaction.
     *
     * @returns {Promise<void>} A promise that resolves when the rollback is complete.
     */
    async rollBack() {
        return await this.repository.query('ROLLBACK')
    }

    /**
     * Commits the current transaction by executing a 'COMMIT' SQL query.
     *
     * @returns {Promise<any>} A promise that resolves when the commit is successful.
     */
    async commit() {
        return await this.repository.query('COMMIT')
    }

    /**
     * Retrieves a user by their ID for update, locking the selected row.
     * 
     * @param id - The ID of the user to retrieve.
     * @returns The user data if a single user is found, or an array of user data if multiple users are found.
     * @throws Will throw an error if the query fails.
     */
    async getUserForUpdate(id: number) {
        const response = await this.repository.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [id])
        if (response.rows.length > 1) {
            return response.rows
        }
        return response.rows[0]
    }

    /**
     * Updates the balance of a user in the database.
     *
     * @param userId - The unique identifier of the user whose balance is to be updated.
     * @param newBalance - The new balance to be set for the user.
     * @returns A promise that resolves to the result of the update query, which includes the user's id, balance, and email.
     */
    async updateUserBalance(userId: number, newBalance: number) {
        return await this.repository.query('UPDATE users SET balance = $1 WHERE id = $2 RETURNING id, balance, email', [newBalance, userId])
    }

    /**
     * Creates the `users` table in the database if it does not already exist.
     * The table includes the following columns:
     * - `id`: A serial primary key.
     * - `balance`: An integer representing the user's balance, which cannot be null.
     * - `email`: A varchar field for the user's email, which cannot be null.
     * - `password`: A varchar field for the user's password, which cannot be null.
     * 
     * @returns {Promise<void>} A promise that resolves when the table is created.
     */
    async createTable() {
        return await this.repository.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            balance INT NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL
        )`)
    }

    /**
     * Inserts default rows into the users table with predefined balance, email, and hashed password.
     * 
     * @returns {Promise<any>} A promise that resolves when the rows are successfully inserted.
     */
    async insertDefaultRows() {
        return await this.repository.query(`
            INSERT INTO users (balance, email, password) VALUES
            (1000, 'test@example.com', '${bcrypt.hashSync('password', salt)}'),
            (1000, 'test2@example.com', '${bcrypt.hashSync('password', salt)}'),
            (1000, 'test3@example.com', '${bcrypt.hashSync('password', salt)}')
        `)
    }

    /**
     * Retrieves a user by their email address.
     *
     * @param email - The email address of the user to retrieve.
     * @returns A promise that resolves to the user object containing id, balance, email, and password.
     */
    async getUserByEmail(email: string) {
        return await this.repository.query('SELECT id, balance, email, password FROM users WHERE email = $1', [email])
    }

    /**
     * Changes the password for a user with the given userId.
     *
     * @param userId - The ID of the user whose password is to be changed.
     * @param newPassword - The new password to set for the user.
     * @returns A promise that resolves to the result of the password update query, 
     *          which includes the user's id, balance, and email.
     */
    async changePassword(userId: number, newPassword: string) {
        return await this.repository.query('UPDATE users SET password = $1 WHERE id = $2 RETURNING id, balance, email', [bcrypt.hashSync(newPassword, salt), userId])
    }
}

export default new UsersRepository()
