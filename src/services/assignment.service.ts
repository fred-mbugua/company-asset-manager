import { AssignmentModel, AssetModel } from '../models';

class AssignmentService {
  async assignAsset(assetId: string, employeeId: string) {
    const asset = await AssetModel.findById(assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }
    if (asset.status !== 'In Stock') {
      throw new Error('Asset is not available for assignment');
    }

    const newAssignment = await AssignmentModel.create({ asset_id: assetId, employee_id: employeeId });
    // Update asset status to 'In Use'
    await AssetModel.update(assetId, { status: 'In Use' });

    return newAssignment;
  }

  async returnAsset(assetId: string) {
    const assignment = await AssignmentModel.returnAsset(assetId);
    if (!assignment) {
      throw new Error('Active assignment not found for this asset');
    }
    // Update asset status to 'In Stock'
    await AssetModel.update(assetId, { status: 'In Stock' });

    return assignment;
  }

  async getAssignmentHistoryByAsset(assetId: string) {
    return AssignmentModel.findByAssetId(assetId);
  }
}

export default new AssignmentService();