import { Request, Response } from 'express';
import LookupService from '../services/lookup.service';
import { ExpenseService, AssignmentService } from '../services';
import { AssetModel, EmployeeModel, ReportModel, AssignmentModel, AssetTypeModel, AssetStatusModel, ExpenseTypeModel, ExpenseModel, LocationModel, DepartmentModel } from '../models';
import { AuthenticatedRequest } from '../types';

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' });
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
            // console.log('Assets fetched:', assets);
            const assetTypes = await AssetTypeModel.findAll();
            // console.log('Rendering view-assets with assets:', assets);
            res.render('view-assets', {
                user: req.user,
                pageTitle: 'View Assets',
                assets: assets.assets,
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
            const expenses = await ReportModel.getExpenseDetailForAllAssets();
            // console.log('Rendering create-expenses with data:', { assets, expenseTypes, expenses });
            res.render('create-expenses', { user: req.user, assets: assets.assets, expenseTypes, expenses });
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
    // async renderReports(req: Request, res: Response) {
    //     const assignments = await AssignmentModel.findAll();
    //     res.render('reports', { user: req.user, assignments });
    // }

    // async renderAssetAssignmentReport(req: Request, res: Response) {
    //     res.render('assignments-report', { user: req.user });
    // }

    /**
         * Renders the Assignments Report EJS view, loading initial filters and data for the first page.
         */
        async renderAssetAssignmentReport(req: Request, res: Response) {
            try {
                const page = 1;
                const itemsPerPage = 20;
                const limit = itemsPerPage;
                const offset = (page - 1) * itemsPerPage;
                const initialFilters = {}; 
    
                const filterData = await LookupService.getAssignmentFilters(); 
                
                const { assignments, totalCount } = await AssignmentService.getPaginatedAssignments(initialFilters, limit, offset);
    
                const formattedAssignments = assignments.map(a => ({
                    ...a,
                    assignment_date: new Date(a.assignment_date).toLocaleDateString(),
                    return_date: a.return_date ? new Date(a.return_date).toLocaleDateString() : 'Active',
                }));
    
                const totalPages = Math.ceil(totalCount / itemsPerPage);
                const pagination = {
                    currentPage: page,
                    itemsPerPage: itemsPerPage,
                    totalPages: totalPages,
                    totalItems: totalCount
                };
                
                res.render('assignments-report', { 
                    user: req.user, 
                    ...filterData, // assetTags, departments, employees, locations
                    initialAssignments: formattedAssignments,
                    pagination,
                    totalAssignments: totalCount 
                });
    
            } catch (error) {
                console.error('Error rendering assignments report page:', error);
                res.status(500).send('Failed to load assignments report page.');
            }
        }

    // async renderAssetExpenseReport(req: Request, res: Response) {
    //     // Fetching lookup data from services/models
    //     const lookupData = await LookupService.getExpenseFilters(); 
        
    //     res.render('expense-report', {
    //         pageTitle: 'Expenses Report',
    //         user: req.user,
    //         // Data passed to locals:
    //         assetTags: lookupData.assetTags,
    //         expenseTypes: lookupData.expenseTypes,
    //         departments: lookupData.departments,
    //         locations: lookupData.locations,
    //     });
    // }

    /**
     * Rendering the Expenses Report EJS view, loading initial filters and data for the first page.
     */
    async renderAssetExpenseReport(req: Request, res: Response) {
        
        try {
            const page = 1;
            const itemsPerPage = 20;
            const limit = itemsPerPage;
            const offset = (page - 1) * itemsPerPage;
            const initialFilters = {}; // Start with no filters on load

            //  Fetching filter lookup data
            const filterData = await LookupService.getExpenseFilters();
            
            //  Fetching initial paginated expenses
            const { expenses, totalCount } = await ExpenseService.getPaginatedExpenses(initialFilters, limit, offset);

            //  Formatting initial data for EJS rendering
            const formattedExpenses = expenses.map((e: any) => ({
                ...e,
                // Ensuring date is a friendly string
                expense_date: new Date(e.expense_date).toLocaleDateString(),
                // Ensuring amount is formatted as currency
                amount: currencyFormatter.format(e.amount),
            }));

            // console.log('Rendering expenses report with data:', formattedExpenses);

            // Calculating pagination metadata
            const totalPages = Math.ceil(totalCount / itemsPerPage);
            const pagination = {
                currentPage: page,
                itemsPerPage: itemsPerPage,
                totalPages: totalPages,
                totalItems: totalCount
            };
            
            //  Rendering the EJS view
            res.render('expense-report', { 
                user: req.user, 
                // Filters
                assetTags: filterData.assetTags,
                expenseTypes: filterData.expenseTypes,
                departments: filterData.departments,
                locations: filterData.locations,
                
                // Initial Data
                initialExpenses: formattedExpenses, // Renamed for clarity in EJS
                pagination,
                totalExpenses: totalCount 
            });

        } catch (error) {
            console.error('Error rendering expenses report page:', error);
            res.status(500).send('Failed to load expenses report page.');
        }
    }

    async renderAssetsReport(req: Request, res: Response) {
        const assetTypes = await AssetTypeModel.findAll();
        const branches = await LocationModel.findAll();
        const departments = await DepartmentModel.findAll();
        const assetStatuses = await AssetStatusModel.findAll();

        const page = 1;
        const itemsPerPage = 20;

        // Get total count of assets for pagination
        const totalAssets = await AssetModel.count();
        const totalPages = Math.ceil(totalAssets / itemsPerPage);
        const pagination = {
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalPages: totalPages
        };

        // Get paginated assets
        const result = await AssetModel.findAll(page, itemsPerPage);
        const assets = result.assets;
        // const assets = await AssetModel.findAll();
        res.render('assets-report', { user: req.user, assetTypes, branches, departments, assetStatuses, assets, pagination, totalAssets });
    }
}

export default new ViewsController();