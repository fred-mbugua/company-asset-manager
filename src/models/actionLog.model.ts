import db from '../config/database';

interface IActionLog {
    user_id: number;
    action_type: string; // e.g., 'CREATE', 'UPDATE', 'DELETE'
    entity_type: string; // e.g., 'Asset', 'Employee', 'User'
    entity_id: number | null;
    details: object | null;
}

class ActionLogModel {
    /**
     * Creates a new action log entry in the database.
     * @param logData The data for the action log entry.
     */
    static async create(logData: IActionLog) {
        try {
            const query = `
                INSERT INTO action_logs (user_id, action_type, entity_type, entity_id, details)
                VALUES ($1, $2, $3, $4, $5);
            `;
            const values = [
                logData.user_id,
                logData.action_type,
                logData.entity_type,
                logData.entity_id, //typically the ID of the affected entity eg users, assets, etc
                JSON.stringify(logData.details) // Store JSON data as a string
            ];

            await db.query(query, values);
            // console.log('Logging action:', logData);

        } catch (error) {
            console.error('Failed to log action:', error);
            // You might not want to throw here to avoid
            // blocking the original request on a non-critical action log failure.
        }
    }
}

export default ActionLogModel;