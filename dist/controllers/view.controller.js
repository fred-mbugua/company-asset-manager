"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lookup_service_1 = __importDefault(require("../services/lookup.service"));
const services_1 = require("../services");
const models_1 = require("../models");
const utils_1 = require("../utils");
const bulkUserImport_service_1 = __importDefault(require("../services/bulkUserImport.service"));
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' });
class ViewsController {
    // Rendering the login page
    async renderLogin(req, res) {
        const returnTo = req.session.returnTo || '';
        res.render('login', { returnTo });
    }
    // Rendering the dashboard page with dynamic data
    async renderDashboard(req, res) {
        try {
            // Fetch necessary data for the dashboard
            const totalAssets = await models_1.ReportModel.getTotalAssetCount();
            const totalExpenses = await models_1.ReportModel.getTotalExpenseSum();
            const totalAssetValue = await models_1.ReportModel.getTotalAssetValue();
            // Fetch analytics data
            const assetsByType = await models_1.ReportModel.getAssetsByType();
            const assetsByStatus = await models_1.ReportModel.getAssetsByStatus();
            const assetsByBranch = await models_1.ReportModel.getAssetsByBranch();
            const monthlyExpenses = await models_1.ReportModel.getMonthlyExpenses(6);
            const recentAssignments = await models_1.ReportModel.getRecentAssignments(10);
            const topExpensiveAssets = await models_1.ReportModel.getTopExpensiveAssets(5);
            const assignmentStats = await models_1.ReportModel.getAssignmentStats();
            const recentExpenses = await models_1.ReportModel.getRecentExpenses(10);
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
            const branches = await models_1.LocationModel.findAll();
            res.render('create-assets', { user: req.user, assetTypes, assetStatuses, branches });
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
            const page = 1;
            const itemsPerPage = 20;
            // Fetch filter data
            const assetTypes = await models_1.AssetTypeModel.findAll();
            const branches = await models_1.LocationModel.findAll();
            const assetStatuses = await models_1.AssetStatusModel.findAll();
            // Get total count of assets for pagination
            const totalAssets = await models_1.AssetModel.count();
            const totalPages = Math.ceil(totalAssets / itemsPerPage);
            const pagination = {
                currentPage: page,
                itemsPerPage: itemsPerPage,
                totalPages: totalPages,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages
            };
            // Get paginated assets
            const result = await models_1.AssetModel.findAll(page, itemsPerPage);
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
            res.render('assign-assets', { user: req.user, assets: assets.assets, employees, assignments });
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
            res.render('create-expenses', { user: req.user, assets: assets.assets, expenseTypes, expenses });
        }
        catch (error) {
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
    async renderAssetAssignmentReport(req, res) {
        try {
            const page = 1;
            const itemsPerPage = 20;
            const limit = itemsPerPage;
            const offset = (page - 1) * itemsPerPage;
            const initialFilters = {};
            const filterData = await lookup_service_1.default.getAssignmentFilters();
            const { assignments, totalCount } = await services_1.AssignmentService.getPaginatedAssignments(initialFilters, limit, offset);
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
        }
        catch (error) {
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
    async renderAssetExpenseReport(req, res) {
        try {
            const page = 1;
            const itemsPerPage = 20;
            const limit = itemsPerPage;
            const offset = (page - 1) * itemsPerPage;
            const initialFilters = {}; // Start with no filters on load
            //  Fetching filter lookup data
            const filterData = await lookup_service_1.default.getExpenseFilters();
            //  Fetching initial paginated expenses
            const { expenses, totalCount } = await services_1.ExpenseService.getPaginatedExpenses(initialFilters, limit, offset);
            //  Formatting initial data for EJS rendering
            const formattedExpenses = expenses.map((e) => ({
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
        }
        catch (error) {
            console.error('Error rendering expenses report page:', error);
            res.status(500).send('Failed to load expenses report page.');
        }
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
    // Rendering the page for creating and managing users
    async renderCreateUser(req, res) {
        try {
            // Fetch all users with linked department/branch/employee names
            const users = await services_1.UserService.getAllUsersDetails();
            const filterData = await lookup_service_1.default.getUserFilters();
            // Render the EJS view
            res.render('manage-users', {
                user: req.user, // Current authenticated user
                users: users,
                ...filterData // departments, locations, employees, userRoles
            });
        }
        catch (error) {
            console.error('Error rendering manage users page:', error);
            res.status(500).send('Failed to load user management page.');
        }
    }
    async renderManageBranches(req, res) {
        try {
            const branches = await services_1.BranchService.findAll();
            res.render('manage-branches', {
                user: req.user,
                branches: branches,
            });
        }
        catch (error) {
            console.error('Error rendering manage branches page:', error);
            res.status(500).send('Failed to load branch management page.');
        }
    }
    /**
     * Rendering the Manage Departments EJS view.
     */
    async renderManageDepartments(req, res) {
        try {
            const departments = await services_1.DepartmentService.getAll();
            res.render('manage-departments', {
                user: req.user,
                departments: departments,
            });
        }
        catch (error) {
            utils_1.logger.error('Error rendering manage departments page:', error);
            res.status(500).send('Failed to load department management page.');
        }
    }
    /**
     * Rendering the Manage Asset Statuses EJS view.
     */
    async renderManageAssetStatuses(req, res) {
        try {
            const assetStatuses = await services_1.AssetStatusService.findAll();
            res.render('manage-asset-statuses', {
                user: req.user,
                assetStatuses: assetStatuses,
            });
        }
        catch (error) {
            utils_1.logger.error('Error rendering manage asset statuses page:', error);
            res.status(500).send('Failed to load asset status management page.');
        }
    }
    /**
     * Rendering the Manage Asset Types EJS view.
     */
    async renderManageAssetTypes(req, res) {
        try {
            const assetTypes = await services_1.AssetTypeService.findAll();
            res.render('manage-asset-types', {
                user: req.user,
                assetTypes: assetTypes,
            });
        }
        catch (error) {
            utils_1.logger.error('Error rendering manage asset types page:', error);
            res.status(500).send('Failed to load asset type management page.');
        }
    }
    /**
     * Rendering the Manage Expense Types EJS view.
     */
    async renderManageExpenseTypes(req, res) {
        try {
            const expenseTypes = await services_1.ExpenseTypeService.findAll();
            res.render('manage-expense-types', {
                user: req.user,
                expenseTypes: expenseTypes,
            });
        }
        catch (error) {
            utils_1.logger.error('Error rendering manage expense types page:', error);
            res.status(500).send('Failed to load expense type management page.');
        }
    }
    /**
     * Rendering the Action Log Report EJS view, loading initial filters and data for the first page.
     */
    async renderActionLogReport(req, res) {
        try {
            const page = 1;
            const itemsPerPage = 20;
            const limit = itemsPerPage;
            const offset = (page - 1) * itemsPerPage;
            const initialFilters = {}; // Start with no filters on load
            // Fetching filter lookup data
            const filterData = await lookup_service_1.default.getActionLogFilters();
            // Fetching initial paginated action logs
            const { logs, totalCount } = await services_1.ActionLogService.getPaginatedActionLogs(initialFilters, limit, offset);
            // Formatting initial data for EJS rendering
            const formattedLogs = logs.map((log) => ({
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
        }
        catch (error) {
            console.error('Error rendering action log report page:', error);
            res.status(500).send('Failed to load action log report page.');
        }
    }
    // Rendering the 404 error page
    async render404(req, res) {
        res.status(404).render('404');
    }
    // Rendering the system configuration page
    async renderSystemConfiguration(req, res) {
        try {
            res.render('system-configuration', {
                user: req.user
            });
        }
        catch (error) {
            console.error('Error rendering system configuration page:', error);
            res.status(500).send('Failed to load system configuration page.');
        }
    }
    async renderProfile(req, res) {
        var _a, _b, _c;
        try {
            const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const currentUserRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
            if (!currentUserId) {
                res.redirect('/login');
                return;
            }
            // Check if viewing another user's profile
            const targetUserId = req.query.userId;
            const isViewingOtherUser = targetUserId && targetUserId !== currentUserId.toString();
            // Security Check: Only admins can view other users' profiles
            if (isViewingOtherUser) {
                if (currentUserRole !== 'Admin') {
                    res.status(403).render('error', {
                        message: 'Access Denied',
                        error: { status: 403, stack: '' },
                        details: 'You do not have permission to view other user profiles. Only administrators can access this feature.'
                    });
                    return;
                }
                // Validate userId parameter (prevent injection)
                if (!/^\d+$/.test(targetUserId)) {
                    res.status(400).send('Invalid user ID format.');
                    return;
                }
            }
            // Fetch user details
            const userIdToFetch = isViewingOtherUser ? targetUserId : currentUserId.toString();
            const userDetails = await services_1.UserService.getUserById(userIdToFetch);
            if (!userDetails) {
                res.status(404).send('User not found.');
                return;
            }
            // Fetch bulk import info if user was bulk imported (only for admins viewing other users)
            let bulkImportInfo = null;
            if (isViewingOtherUser && userDetails.is_bulk_imported) {
                bulkImportInfo = await bulkUserImport_service_1.default.getBulkImportInfoByUserId(parseInt(userIdToFetch));
            }
            res.render('profile', {
                // Use 'user' for logged-in user (for sidebar/navbar navigation)
                user: req.user,
                // Use 'profileUser' for the user being viewed
                profileUser: userDetails,
                isViewingOtherUser,
                viewerIsAdmin: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) === 'Admin',
                bulkImportInfo
            });
        }
        catch (error) {
            console.error('Error rendering profile page:', error);
            res.status(500).send('Failed to load profile page.');
        }
    }
    /**
     * Rendering the Repair Summary Report page
     */
    async renderRepairSummaryReport(req, res) {
        try {
            res.render('repair-summary-report', {
                user: req.user
            });
        }
        catch (error) {
            console.error('Error rendering repair summary report page:', error);
            res.status(500).send('Failed to load repair summary report page.');
        }
    }
    /**
     * Rendering the Repair Requests page
     */
    async renderRepairRequests(req, res) {
        try {
            // Fetch dropdown data
            const requestTypes = await models_1.RepairRequestTypeModel.findAll();
            const statuses = await models_1.RepairRequestStatusModel.findAll();
            const priorities = await models_1.RepairRequestPriorityModel.findAll();
            const branches = await models_1.LocationModel.findAll();
            const assets = await models_1.AssetModel.findAll();
            res.render('repair-requests', {
                user: req.user,
                requestTypes: requestTypes,
                statuses: statuses,
                priorities: priorities,
                branches: branches,
                assets: assets.assets || []
            });
        }
        catch (error) {
            utils_1.logger.error('Error rendering repair requests page:', error);
            res.status(500).send('Failed to load repair requests page.');
        }
    }
    /**
     * Rendering the Manage Repair Request Types EJS view.
     */
    async renderManageRepairTypes(req, res) {
        try {
            const repairTypes = await services_1.RepairRequestTypeService.findAll(true);
            res.render('manage-repair-types', {
                user: req.user,
                repairTypes: repairTypes,
            });
        }
        catch (error) {
            utils_1.logger.error('Error rendering manage repair types page:', error);
            res.status(500).send('Failed to load repair type management page.');
        }
    }
    /**
     * Rendering the Manage Repair Request Statuses EJS view.
     */
    async renderManageRepairStatuses(req, res) {
        try {
            const repairStatuses = await services_1.RepairRequestStatusService.findAll(true);
            res.render('manage-repair-statuses', {
                user: req.user,
                repairStatuses: repairStatuses,
            });
        }
        catch (error) {
            utils_1.logger.error('Error rendering manage repair statuses page:', error);
            res.status(500).send('Failed to load repair status management page.');
        }
    }
    /**
     * Rendering the Manage Repair Request Priorities EJS view.
     */
    async renderManageRepairPriorities(req, res) {
        try {
            const repairPriorities = await services_1.RepairRequestPriorityService.findAll(true);
            res.render('manage-repair-priorities', {
                user: req.user,
                repairPriorities: repairPriorities,
            });
        }
        catch (error) {
            utils_1.logger.error('Error rendering manage repair priorities page:', error);
            res.status(500).send('Failed to load repair priority management page.');
        }
    }
    /**
     * Rendering the Bulk Import History page
     */
    async renderBulkImportHistory(req, res) {
        try {
            res.render('bulk-import-history', {
                user: req.user
            });
        }
        catch (error) {
            console.error('Error rendering bulk import history page:', error);
            res.status(500).send('Failed to load bulk import history page.');
        }
    }
    /**
     * Rendering the Repair Workflow Configuration page
     */
    async renderManageRepairWorkflow(req, res) {
        try {
            // Fetch statuses for dropdowns
            const statuses = await models_1.RepairRequestStatusModel.findAll();
            // Fetch roles from database
            const roles = await models_1.RoleModel.findAll();
            res.render('manage-repair-workflow', {
                user: req.user,
                statuses: statuses,
                roles: roles
            });
        }
        catch (error) {
            utils_1.logger.error('Error rendering manage repair workflow page:', error);
            res.status(500).send('Failed to load repair workflow configuration page.');
        }
    }
    /**
     * Rendering the Manage Roles EJS view.
     */
    async renderManageRoles(req, res) {
        try {
            res.render('manage-roles', {
                user: req.user
            });
        }
        catch (error) {
            utils_1.logger.error('Error rendering manage roles page:', error);
            res.status(500).send('Failed to load roles management page.');
        }
    }
    /**
     * Rendering the Manage Permissions EJS view.
     */
    async renderManagePermissions(req, res) {
        try {
            res.render('manage-permissions', {
                user: req.user
            });
        }
        catch (error) {
            utils_1.logger.error('Error rendering manage permissions page:', error);
            res.status(500).send('Failed to load permissions management page.');
        }
    }
}
exports.default = new ViewsController();
