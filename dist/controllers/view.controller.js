"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class ViewsController {
    // Rendering the login page
    async renderLogin(req, res) {
        res.render('login');
    }
    // Rendering the dashboard page with dynamic data
    async renderDashboard(req, res) {
        try {
            // Fetch necessary data for the dashboard
            const totalAssets = await models_1.ReportModel.getTotalAssetCount();
            const totalExpenses = await models_1.ReportModel.getTotalExpenseSum();
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
        }
        catch (error) {
            console.error('Error rendering dashboard:', error);
            res.status(500).send('Error loading dashboard data.');
        }
    }
    // Rendering the page for creating a new asset
    async renderCreateAsset(req, res) {
        try {
            const assetTypes = await models_1.AssetTypeModel.findAll();
            const assetStatuses = await models_1.AssetStatusModel.findAll();
            res.render('create-assets', { user: req.user, assetTypes, assetStatuses });
        }
        catch (error) {
            console.error('Error rendering create-assets page:', error);
            res.status(500).send('Error loading asset types.');
        }
    }
    // Rendering the page for viewing assets
    async renderViewAssets(req, res) {
        // res.render('view-assets');
        try {
            const assets = await models_1.AssetModel.findAll();
            const assetTypes = await models_1.AssetTypeModel.findAll();
            // console.log('Rendering view-assets with assets:', assets);
            res.render('view-assets', {
                user: req.user,
                pageTitle: 'View Assets',
                assets: assets,
                assetTypes: assetTypes
            });
        }
        catch (error) {
            console.error('Error rendering view-assets page:', error);
            res.status(500).send('Error loading assets.');
            return;
        }
    }
    // Rendering the page for assigning assets. Requires lists of assets and employees.
    async renderAssignAssets(req, res) {
        try {
            const assets = await models_1.AssetModel.findAll();
            const employees = await models_1.EmployeeModel.findEmployeesSpecificData();
            const assignments = await models_1.AssignmentModel.findAll();
            // console.log('Rendering assign-assets with data:', { assets, employees, assignments });
            res.render('assign-assets', { user: req.user, assets, employees, assignments });
        }
        catch (error) {
            console.error('Error rendering assign-assets page:', error);
            res.status(500).send('Error loading data for asset assignment.');
        }
    }
    // Rendering the page for creating expenses. Requires a list of assets.
    async renderCreateExpenses(req, res) {
        try {
            const assets = await models_1.AssetModel.findAll();
            const expenseTypes = await models_1.ExpenseTypeModel.findAll();
            const expenses = await models_1.ReportModel.getExpenseDetailForAllAssets();
            // console.log('Rendering create-expenses with data:', { assets, expenseTypes, expenses });
            res.render('create-expenses', { user: req.user, assets, expenseTypes, expenses });
        }
        catch (error) {
            console.error('Error rendering create-expenses page:', error);
            res.status(500).send('Error loading data for expenses.');
        }
    }
    // Rendering the page for creating and managing users
    async renderCreateUser(req, res) {
        res.render('create-user', { user: req.user });
    }
    // Rendering the reports page
    // async renderReports(req: Request, res: Response) {
    //     const assignments = await AssignmentModel.findAll();
    //     res.render('reports', { user: req.user, assignments });
    // }
    async renderAssetAssignmentReport(req, res) {
        res.render('assignments-report', { user: req.user });
    }
    async renderAssetExpenseReport(req, res) {
        res.render('expense-report', { user: req.user });
    }
    async renderAssetsReport(req, res) {
        const assetTypes = await models_1.AssetTypeModel.findAll();
        const branches = await models_1.LocationModel.findAll();
        const departments = await models_1.DepartmentModel.findAll();
        const assetStatuses = await models_1.AssetStatusModel.findAll();
        const page = 1;
        const itemsPerPage = 20;
        // Get total count of assets for pagination
        const totalAssets = await models_1.AssetModel.count();
        const totalPages = Math.ceil(totalAssets / itemsPerPage);
        const pagination = {
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalPages: totalPages
        };
        // Get paginated assets
        const result = await models_1.AssetModel.findAll(page, itemsPerPage);
        const assets = result.assets;
        // const assets = await AssetModel.findAll();
        res.render('assets-report', { user: req.user, assetTypes, branches, departments, assetStatuses, assets, pagination, totalAssets });
    }
}
exports.default = new ViewsController();
