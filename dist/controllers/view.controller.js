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
        res.render('create-assets');
    }
    // Rendering the page for viewing assets
    async renderViewAssets(req, res) {
        // res.render('view-assets');
        try {
            const assets = await models_1.AssetModel.findAll();
            res.render('view-assets', {
                pageTitle: 'View Assets',
                user: req.user,
                assets: assets
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
            console.log('Rendering assign-assets with data:', { assets, employees, assignments });
            res.render('assign-assets', { assets, employees, assignments });
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
            res.render('create-expenses', { assets });
        }
        catch (error) {
            console.error('Error rendering create-expenses page:', error);
            res.status(500).send('Error loading data for expenses.');
        }
    }
    // Rendering the page for creating and managing users
    async renderCreateUser(req, res) {
        res.render('create-user');
    }
    // Rendering the reports page
    async renderReports(req, res) {
        res.render('reports');
    }
}
exports.default = new ViewsController();
