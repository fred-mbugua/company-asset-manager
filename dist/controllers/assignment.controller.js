"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
class AssignmentController {
    async assignAsset(req, res) {
        try {
            const { asset_id, employee_id } = req.body;
            const newAssignment = await models_1.AssignmentModel.create({ asset_id, employee_id });
            res.status(201).json(newAssignment);
        }
        catch (error) {
            logger_1.default.error('Failed to assign asset:', error);
            res.status(400).json({ error: 'Failed to assign asset' });
        }
    }
    async returnAsset(req, res) {
        try {
            const { id } = req.params;
            const returnedAssignment = await models_1.AssignmentModel.returnAsset(id);
            if (!returnedAssignment) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }
            res.status(200).json(returnedAssignment);
        }
        catch (error) {
            logger_1.default.error(`Failed to return asset with assignment ID ${req.params.id}:`, error);
            res.status(500).json({ error: 'Failed to return asset' });
        }
    }
}
exports.default = new AssignmentController();
