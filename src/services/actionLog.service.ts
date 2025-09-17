// src/services/actionLog.service.ts

import ActionLogModel from '../models/actionLog.model';

class ActionLogService {
    /**
     * Logs a system action with details.
     * @param userId The ID of the user who performed the action.
     * @param actionType The type of action (e.g., 'CREATE', 'LOGIN').
     * @param entityType The type of entity affected (e.g., 'Asset').
     * @param entityId The ID of the affected entity.
     * @param details Additional details about the action.
     */
    async logAction(
        userId: number,
        actionType: string,
        entityType: string,
        entityId: number | null,
        details: object | null = null
    ) {
        const logData = {
            user_id: userId,
            action_type: actionType,
            entity_type: entityType,
            entity_id: entityId,
            details
        };

        // Call the model to save the data.
        // The `await` keyword is important to ensure the log is created.
        await ActionLogModel.create(logData);
    }
}

export default new ActionLogService();