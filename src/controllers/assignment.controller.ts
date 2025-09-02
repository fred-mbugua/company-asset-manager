import { Request, Response } from 'express';
import { AssignmentModel } from '../models';
import logger from '../utils/logger';

class AssignmentController {
  async assignAsset(req: Request, res: Response) {
    try {
      const { asset_id, employee_id } = req.body;
      const newAssignment = await AssignmentModel.create({ asset_id, employee_id });
      res.status(201).json(newAssignment);
    } catch (error: any) {
      logger.error('Failed to assign asset:', error);
      res.status(400).json({ error: 'Failed to assign asset' });
    }
  }

  async returnAsset(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const returnedAssignment = await AssignmentModel.returnAsset(id);
      if (!returnedAssignment) {
        res.status(404).json({ error: 'Assignment not found' });
        return;
      }
      res.status(200).json(returnedAssignment);
    } catch (error: any) {
      logger.error(`Failed to return asset with assignment ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to return asset' });
    }
  }
}

export default new AssignmentController();