import { Request, Response } from 'express';
import { AssetModel, EmployeeModel, ReportModel, AssignmentModel, AssetTypeModel, AssetStatusModel, ExpenseTypeModel } from '../models';
import { AuthenticatedRequest } from '../types';

class ViewsController {
    
    // Rendering the login page
    async renderLogin(req: Request, res: Response) {
        res.render('login');
    }

    // Rendering the dashboard page with dynamic data
    async renderDashboard(req: AuthenticatedRequest, res: Response) {
        try {
            // Fetch necessary data for the dashboard
            const totalAssets = await ReportModel.getTotalAssetCount();
            const totalExpenses = await ReportModel.getTotalExpenseSum();

            // console.log('Rendering dashboard with data:', { 
            //     user: req.user,
            //     totalAssets: totalAssets,
            //     totalExpenses: totalExpenses
            // });

            // Pass the data to the EJS template
            res.render('dashboard', { 
                user: req.user,
                assetStats: {
                    totalAssets: totalAssets,
                    totalExpenses: totalExpenses
                }
            });
        } catch (error) {
            console.error('Error rendering dashboard:', error);
            res.status(500).send('Error loading dashboard data.');
        }
    }

    // Rendering the page for creating a new asset
    async renderCreateAsset(req: Request, res: Response) {
        try {
            const assetTypes = await AssetTypeModel.findAll();
            const assetStatuses = await AssetStatusModel.findAll();
            res.render('create-assets', { user: req.user, assetTypes, assetStatuses });
        } catch (error) {
            console.error('Error rendering create-assets page:', error);
            res.status(500).send('Error loading asset types.');
        }
    }

    // Rendering the page for viewing assets
    async renderViewAssets(req: Request, res: Response) {
        // res.render('view-assets');
        try {
            const assets = await AssetModel.findAll();
            const assetTypes = await AssetTypeModel.findAll();
            // console.log('Rendering view-assets with assets:', assets);
            res.render('view-assets', { 
                user: req.user,
                pageTitle: 'View Assets',
                assets: assets,
                assetTypes: assetTypes
            });
        } catch (error) {
            console.error('Error rendering view-assets page:', error);
            res.status(500).send('Error loading assets.');
            return;
        }
    }
    
    // Rendering the page for assigning assets. Requires lists of assets and employees.
    async renderAssignAssets(req: Request, res: Response) {
        try {
            const assets = await AssetModel.findAll();
            const employees = await EmployeeModel.findEmployeesSpecificData();
            const assignments = await AssignmentModel.findAll();
            // console.log('Rendering assign-assets with data:', { assets, employees, assignments });
            res.render('assign-assets', { user: req.user, assets, employees, assignments });
        } catch (error) {
            console.error('Error rendering assign-assets page:', error);
            res.status(500).send('Error loading data for asset assignment.');
        }
    }

    // Rendering the page for creating expenses. Requires a list of assets.
    async renderCreateExpenses(req: Request, res: Response) {
        try {
            const assets = await AssetModel.findAll();
            const expenseTypes = await ExpenseTypeModel.findAll();
            res.render('create-expenses', { user: req.user, assets, expenseTypes });
        } catch (error) {
            console.error('Error rendering create-expenses page:', error);
            res.status(500).send('Error loading data for expenses.');
        }
    }

    // Rendering the page for creating and managing users
    async renderCreateUser(req: Request, res: Response) {
        res.render('create-user', { user: req.user });
    }

    // Rendering the reports page
    async renderReports(req: Request, res: Response) {
        res.render('reports', { user: req.user });
    }
}

export default new ViewsController();