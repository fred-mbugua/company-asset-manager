import { Request, Response } from 'express';
import LookupService from '../services/lookup.service';
import { ExpenseService, AssignmentService, UserService, BranchService, DepartmentService, ActionLogService, AssetStatusService, AssetTypeService, ExpenseTypeService } from '../services';
import { AssetModel, EmployeeModel, ReportModel, AssignmentModel, AssetTypeModel, AssetStatusModel, ExpenseTypeModel, ExpenseModel, LocationModel, DepartmentModel } from '../models';
import { AuthenticatedRequest } from '../types';
import { logger } from '../utils';

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' });
class ViewsController {

    // Rendering the login page
    async renderLogin(req: Request, res: Response) {
        const returnTo = (req.session as any).returnTo || '';
        res.render('login', { returnTo });
    }

    // Rendering the dashboard page with dynamic data
    async renderDashboard(req: AuthenticatedRequest, res: Response) {
        try {
            // Fetch necessary data for the dashboard
            const totalAssets = await ReportModel.getTotalAssetCount();
            const totalExpenses = await ReportModel.getTotalExpenseSum();
            const totalAssetValue = await ReportModel.getTotalAssetValue();
            
            // Fetch analytics data
            const assetsByType = await ReportModel.getAssetsByType();
            const assetsByStatus = await ReportModel.getAssetsByStatus();
            const assetsByBranch = await ReportModel.getAssetsByBranch();
            const monthlyExpenses = await ReportModel.getMonthlyExpenses(6);
            const recentAssignments = await ReportModel.getRecentAssignments(10);
            const topExpensiveAssets = await ReportModel.getTopExpensiveAssets(5);
            const assignmentStats = await ReportModel.getAssignmentStats();
            const recentExpenses = await ReportModel.getRecentExpenses(10);

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
                    totalExpenses: totalExpenses || 0,
                    totalAssetValue: totalAssetValue || 0,
                    activeAssignments: assignmentStats.active_assignments || 0,
                    returnedAssignments: assignmentStats.returned_assignments || 0
                },
                analytics: {
                    assetsByType: assetsByType,
                    assetsByStatus: assetsByStatus,
                    assetsByBranch: assetsByBranch,
                    monthlyExpenses: monthlyExpenses,
                    recentAssignments: recentAssignments,
                    topExpensiveAssets: topExpensiveAssets,
                    recentExpenses: recentExpenses
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
            const branches = await LocationModel.findAll();
            res.render('create-assets', { user: req.user, assetTypes, assetStatuses, branches });
        } catch (error) {
            console.error('Error rendering create-assets page:', error);
            res.status(500).send('Error loading asset types.');
        }
    }

    // Rendering the page for viewing assets
    async renderViewAssets(req: Request, res: Response) {
        // res.render('view-assets');
        try {
            const page = 1;
            const itemsPerPage = 20;
            
            // Fetch filter data
            const assetTypes = await AssetTypeModel.findAll();
            const branches = await LocationModel.findAll();
            const assetStatuses = await AssetStatusModel.findAll();
            
            // Get total count of assets for pagination
            const totalAssets = await AssetModel.count();
            const totalPages = Math.ceil(totalAssets / itemsPerPage);
            const pagination = {
                currentPage: page,
                itemsPerPage: itemsPerPage,
                totalPages: totalPages,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages
            };
            
            // Get paginated assets
            const result = await AssetModel.findAll(page, itemsPerPage);
            const assets = result.assets;
            
            // console.log('Rendering view-assets with assets:', assets);
            res.render('view-assets', {
                user: req.user,
                pageTitle: 'View Assets',
                assets: assets,
                assetTypes: assetTypes,
                branches: branches,
                assetStatuses: assetStatuses,
                pagination: pagination,
                totalAssets: totalAssets
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
            res.render('assign-assets', { user: req.user, assets: assets.assets, employees, assignments });
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
                    // assignment_date: a.assignment_date ? new Date(a.assignment_date).toLocaleDateString() : null,
                    // return_date: a.return_date ? new Date(a.return_date).toLocaleDateString() : null,
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
                // date: new Date(e.date).toLocaleDateString(),
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

    // Rendering the page for creating and managing users
    async renderCreateUser(req: Request, res: Response) {
        try {
            // Fetch all users with linked department/branch/employee names
            const users = await UserService.getAllUsersDetails();
            const filterData = await LookupService.getUserFilters(); 
            

            // Render the EJS view
            res.render('manage-users', {
                user: req.user, // Current authenticated user
                users: users,
               ...filterData // departments, locations, employees, userRoles

            });

        } catch (error) {
            console.error('Error rendering manage users page:', error);
            res.status(500).send('Failed to load user management page.');
        }
        
    }

    async renderManageBranches(req: Request, res: Response): Promise<void> {
        try {
            const branches = await BranchService.findAll();
            
            res.render('manage-branches', {
                user: req.user,
                branches: branches,
            });

        } catch (error) {
            console.error('Error rendering manage branches page:', error);
            res.status(500).send('Failed to load branch management page.');
        }
    }

    /**
     * Rendering the Manage Departments EJS view.
     */
    async renderManageDepartments(req: Request, res: Response): Promise<void> {
        try {
            const departments = await DepartmentService.getAll();
            
            res.render('manage-departments', {
                user: req.user,
                departments: departments,
            });

        } catch (error) {
            logger.error('Error rendering manage departments page:', error);
            res.status(500).send('Failed to load department management page.');
        }
    }

    /**
     * Rendering the Manage Asset Statuses EJS view.
     */
    async renderManageAssetStatuses(req: Request, res: Response): Promise<void> {
        try {
            const assetStatuses = await AssetStatusService.findAll();
            
            res.render('manage-asset-statuses', {
                user: req.user,
                assetStatuses: assetStatuses,
            });

        } catch (error) {
            logger.error('Error rendering manage asset statuses page:', error);
            res.status(500).send('Failed to load asset status management page.');
        }
    }

    /**
     * Rendering the Manage Asset Types EJS view.
     */
    async renderManageAssetTypes(req: Request, res: Response): Promise<void> {
        try {
            const assetTypes = await AssetTypeService.findAll();
            
            res.render('manage-asset-types', {
                user: req.user,
                assetTypes: assetTypes,
            });

        } catch (error) {
            logger.error('Error rendering manage asset types page:', error);
            res.status(500).send('Failed to load asset type management page.');
        }
    }

    /**
     * Rendering the Manage Expense Types EJS view.
     */
    async renderManageExpenseTypes(req: Request, res: Response): Promise<void> {
        try {
            const expenseTypes = await ExpenseTypeService.findAll();
            
            res.render('manage-expense-types', {
                user: req.user,
                expenseTypes: expenseTypes,
            });

        } catch (error) {
            logger.error('Error rendering manage expense types page:', error);
            res.status(500).send('Failed to load expense type management page.');
        }
    }

    /**
     * Rendering the Action Log Report EJS view, loading initial filters and data for the first page.
     */
    async renderActionLogReport(req: Request, res: Response): Promise<void> {
        try {
            const page = 1;
            const itemsPerPage = 20;
            const limit = itemsPerPage;
            const offset = (page - 1) * itemsPerPage;
            const initialFilters = {}; // Start with no filters on load

            // Fetching filter lookup data
            const filterData = await LookupService.getActionLogFilters();
            
            // Fetching initial paginated action logs
            const { logs, totalCount } = await ActionLogService.getPaginatedActionLogs(initialFilters, limit, offset);

            // Formatting initial data for EJS rendering
            const formattedLogs = logs.map((log: any) => ({
                ...log,
                // created_at: new Date(log.created_at).toLocaleString(),
                details: log.details ? JSON.stringify(log.details) : 'N/A',
            }));

            // Calculating pagination metadata
            const totalPages = Math.ceil(totalCount / itemsPerPage);
            const pagination = {
                currentPage: page,
                itemsPerPage: itemsPerPage,
                totalPages: totalPages,
                totalItems: totalCount
            };
            
            // Rendering the EJS view
            res.render('action-log-report', { 
                user: req.user, 
                // Filters
                users: filterData.users,
                actionTypes: filterData.actionTypes,
                entityTypes: filterData.entityTypes,
                
                // Initial Data
                initialLogs: formattedLogs,
                pagination,
                totalLogs: totalCount 
            });

        } catch (error) {
            console.error('Error rendering action log report page:', error);
            res.status(500).send('Failed to load action log report page.');
        }
    }

    // Rendering the 404 error page
    async render404(req: Request, res: Response) {
        res.status(404).render('404');
    }
}

export default new ViewsController();