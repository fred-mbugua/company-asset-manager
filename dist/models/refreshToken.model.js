"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class RefreshTokenModel {
    /**
     * Saves a new refresh token to the database or updates an existing one for the user.
     * @param userId The ID of the user.
     * @param token The refresh token string.
     * @param expiresAt The expiration date of the token.
     */
    async save(userId, token, expiresAt) {
        const query = 'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at';
        await database_1.default.query(query, [token, userId, expiresAt]);
    }
    /**
     * Finds a refresh token by its string value.
     * @param token The refresh token string.
     */
    async findByToken(token) {
        const query = 'SELECT * FROM refresh_tokens WHERE token = $1';
        const result = await database_1.default.query(query, [token]);
        return result.rows[0];
    }
    /**
     * Deletes a refresh token from the database.
     * @param token The refresh token string.
     */
    async deleteByToken(token) {
        const query = 'DELETE FROM refresh_tokens WHERE token = $1';
        await database_1.default.query(query, [token]);
    }
}
exports.default = new RefreshTokenModel();
