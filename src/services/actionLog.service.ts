import ActionLogModel from '../models/actionLog.model';
import ActionLogReportModel, { IActionLogReportFilters } from '../models/actionLogReport.model';

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

    /**
     * Fetches paginated action log data and the total count.
     * @param filters - Filtering criteria (action_type, entity_type, dates, etc.)
     * @param limit - Number of records per page.
     * @param offset - Starting offset for pagination.
     */
    async getPaginatedActionLogs(filters: IActionLogReportFilters, limit: number, offset: number) {
        return ActionLogReportModel.findPaginatedAndCount(filters, { limit, offset });
    }
    
    /**
     * Fetches ALL filtered action log data (used primarily for Excel export).
     * @param filters - Filtering criteria.
     */
    async getAllFilteredActionLogs(filters: IActionLogReportFilters) {
        return ActionLogReportModel.findAllFiltered(filters);
    }
}

export default new ActionLogService();