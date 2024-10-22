import { client } from '../config/db.config'

class SkinsRepository {
    constructor(private repository: any = client) {}

    /**
     * Retrieves a list of skins from the database with optional pagination.
     *
     * @param {number} [limit] - The maximum number of skins to retrieve.
     * @param {number} [offset] - The number of skins to skip before starting to retrieve.
     * @returns {Promise<any[]>} A promise that resolves to an array of skins.
     */
    async getSkins(limit?: number, offset?: number) {
        let query = 'SELECT name, min_price_non_tradable, min_price_tradable FROM items'
        const params: any[] = []

        if (limit) {
            params.push(limit)
            query += ` LIMIT $${params.length}`
        }

        if (offset) {
            params.push(offset)
            query += ` OFFSET $${params.length}`
        }

        return await this.repository.query(query, params)
    }

    /**
     * Retrieves a skin by its ID from the database.
     *
     * @param id - The unique identifier of the skin.
     * @returns A promise that resolves to the skin data.
     */
    async getSkinById(id: number) {
        return await this.repository.query('SELECT * FROM items WHERE id = $1', [id])
    }

    /**
     * Initiates a database transaction by executing the 'BEGIN' SQL command.
     * 
     * @returns {Promise<any>} A promise that resolves when the transaction begins successfully.
     */
    async begin() {
        return await this.repository.query('BEGIN')
    }

    /**
     * Rolls back the current transaction.
     *
     * This method executes a 'ROLLBACK' SQL query to undo any changes made during the current transaction.
     *
     * @returns {Promise<any>} A promise that resolves when the rollback is complete.
     */
    async rollBack() {
        return await this.repository.query('ROLLBACK')
    }

    /**
     * Commits the current transaction.
     *
     * @returns {Promise<any>} A promise that resolves when the commit is successful.
     */
    async commit() {
        return await this.repository.query('COMMIT')
    }

    /**
     * Retrieves a skin for update by its ID.
     * Executes a SQL query to select the name, minimum non-tradable price, and minimum tradable price
     * of the item with the specified ID, locking the row for update.
     *
     * @param {number} id - The ID of the skin to retrieve.
     * @returns {Promise<any>} A promise that resolves to the skin data. If more than one row is returned,
     *                         it returns an array of rows; otherwise, it returns a single row.
     */
    async getSkinForUpdate(id: number) {
        const response = await this.repository.query('SELECT name, min_price_non_tradable, min_price_tradable FROM items WHERE id = $1 FOR UPDATE', [id])
        if (response.rows.length > 1) {
            return response.rows
        }
        return response.rows[0]
    }

    /**
     * Updates the fields of a skin in the database.
     *
     * @param id - The unique identifier of the skin to be updated.
     * @param payload - An object containing the fields to be updated. 
     *                  It can include `name`, `min_price_non_tradable`, and `min_price_tradable`.
     * @returns A promise that resolves to the updated skin object.
     */
    async updateSkinFields(id: number, payload: Partial<{ name: string; min_price_non_tradable: number; min_price_tradable: number }>) {
        const { name, min_price_non_tradable, min_price_tradable } = payload
        const response = await this.repository.query(
            '\
            UPDATE skins SET name = $1,\
            min_price_non_tradable = $2,\
            min_price_tradable = $3\
            WHERE id = $4\
            RETURNING *',
            [name, min_price_non_tradable, min_price_tradable, id]
        )
        return response.rows[0]
    }

    /**
     * Creates the `items` table in the database if it does not already exist.
     * The table includes the following columns:
     * - `id`: A serial primary key.
     * - `name`: A variable character field with a maximum length of 255.
     * - `min_price_non_tradable`: A float representing the minimum price for non-tradable items.
     * - `min_price_tradable`: A float representing the minimum price for tradable items.
     *
     * @returns {Promise<void>} A promise that resolves when the table is created.
     */
    async createTable() {
        await this.repository.query(
            'CREATE TABLE IF NOT EXISTS items (id SERIAL PRIMARY KEY, name VARCHAR(255), min_price_non_tradable FLOAT, min_price_tradable FLOAT)'
        )
    }

    /**
     * Inserts an array of skins into the database in bulk, using batch processing.
     * 
     * @param skins - An array of skin objects to be inserted. Each object should have the following properties:
     *  - `name`: The name of the skin.
     *  - `min_price_non_tradable`: The minimum price of the skin when it is non-tradable.
     *  - `min_price_tradable`: The minimum price of the skin when it is tradable.
     * @param batchSize - The number of skins to insert per batch. Defaults to 500.
     * 
     * @throws Will throw an error if the batch insert fails.
     */
    async bulkInsertSkins(skins: { name: string; min_price_non_tradable: number; min_price_tradable: number }[], batchSize: number = 500) {
        if (skins.length === 0) {
            return
        }

        const chunkedSkins = this.chunkArray(skins, batchSize)

        for (const chunk of chunkedSkins) {
            const valueStrings = chunk.map((_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`).join(', ')

            const values: Array<string | number> = []
            chunk.forEach(({ name, min_price_non_tradable, min_price_tradable }) => {
                values.push(name, min_price_non_tradable, min_price_tradable)
            })

            const query = `
                INSERT INTO items (name, min_price_non_tradable, min_price_tradable)
                VALUES ${valueStrings}
                RETURNING *
            `

            try {
                await this.repository.query(query, values)
            } catch (error) {
                console.error('Batch insert failed', error)
                throw error
            }
        }
    }

    /**
     * Splits an array into smaller arrays (chunks) of a specified size.
     *
     * @param array - The array to be split into chunks.
     * @param chunkSize - The size of each chunk.
     * @returns An array containing the chunks.
     */
    chunkArray(array: any[], chunkSize: number) {
        const chunks = []
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize))
        }
        return chunks
    }
}

export default new SkinsRepository()
