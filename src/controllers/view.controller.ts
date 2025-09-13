import { Request, Response } from 'express';
import { AssetModel, EmployeeModel, ReportModel } from '../models';
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

            // Pass the data to the EJS template
            res.render('dashboard', { 
                user: req.user,
                totalAssets: totalAssets,
                totalExpenses: totalExpenses
            });
        } catch (error) {
            console.error('Error rendering dashboard:', error);
            res.status(500).send('Error loading dashboard data.');
        }
    }

    // Rendering the page for creating a new asset
    async renderCreateAsset(req: Request, res: Response) {
        res.render('create-assets');
    }

    // Rendering the page for viewing assets
    async renderViewAssets(req: Request, res: Response) {
        res.render('view-assets');
    }
    
    // Rendering the page for assigning assets. Requires lists of assets and employees.
    async renderAssignAssets(req: Request, res: Response) {
        try {
            const assets = await AssetModel.findAll();
            const employees = await EmployeeModel.findAll();
            res.render('assign-assets', { assets, employees });
        } catch (error) {
            console.error('Error rendering assign-assets page:', error);
            res.status(500).send('Error loading data for asset assignment.');
        }
    }

    // Rendering the page for creating expenses. Requires a list of assets.
    async renderCreateExpenses(req: Request, res: Response) {
        try {
            const assets = await AssetModel.findAll();
            res.render('create-expenses', { assets });
        } catch (error) {
            console.error('Error rendering create-expenses page:', error);
            res.status(500).send('Error loading data for expenses.');
        }
    }

    // Rendering the page for creating and managing users
    async renderCreateUser(req: Request, res: Response) {
        res.render('create-user');
    }

    // Rendering the reports page
    async renderReports(req: Request, res: Response) {
        res.render('reports');
    }
}

export default new ViewsController();