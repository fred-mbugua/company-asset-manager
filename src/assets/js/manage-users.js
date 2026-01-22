document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addUserBtn = document.getElementById('add-user-btn');
    const modal = document.getElementById('user-form-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');
    const userForm = document.getElementById('user-form');
    const usersTableBody = document.getElementById('users-table-body');

    // Form Fields
    const userIdField = document.getElementById('user-id');
    const firstNameField = document.getElementById('first_name');
    const middleNameField = document.getElementById('middle_name');
    const lastNameField = document.getElementById('last_name');
    const phoneField = document.getElementById('phone');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const passwordConfirmField = document.getElementById('password_confirm');
    const roleField = document.getElementById('role');
    const departmentField = document.getElementById('department_id');
    const branchField = document.getElementById('branch_id');
    const companyField = document.getElementById('company_id');
    const employeeIdField = document.getElementById('employee_id');

    // const API_ENDPOINT = '/api/admin/users'; // Assumed API endpoint
    const API_ENDPOINT = '/api';

    // ==================== SEARCHABLE SELECT FUNCTIONALITY ====================
    
    function initSearchableSelects() {
        const searchableSelects = document.querySelectorAll('.searchable-select');
        
        searchableSelects.forEach(select => {
            const input = select.querySelector('.select-input');
            const dropdown = select.querySelector('.select-dropdown');
            const hiddenInput = select.querySelector('input[type="hidden"]');
            const options = select.querySelectorAll('.select-option');
            const allOptions = Array.from(options);
            
            // Store original options for filtering
            select.allOptions = allOptions.map(opt => ({
                value: opt.dataset.value,
                text: opt.textContent,
                isDefault: opt.dataset.default === 'true'
            }));
            
            // Open dropdown on focus/click
            input.addEventListener('focus', () => openSelectDropdown(select));
            input.addEventListener('click', () => openSelectDropdown(select));
            
            // Filter on input
            input.addEventListener('input', () => filterSelectOptions(select));
            
            // Handle option click
            dropdown.addEventListener('click', (e) => {
                const option = e.target.closest('.select-option');
                if (option) {
                    selectOption(select, option.dataset.value, option.textContent);
                }
            });
            
            // Keyboard navigation
            input.addEventListener('keydown', (e) => handleSelectKeyboard(e, select));
            
            // Set default value if exists
            const defaultOpt = select.allOptions.find(o => o.isDefault);
            if (defaultOpt && defaultOpt.value) {
                selectOption(select, defaultOpt.value, defaultOpt.text);
            }
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.searchable-select')) {
                closeAllSelectDropdowns();
            }
        });
    }
    
    function openSelectDropdown(select) {
        closeAllSelectDropdowns();
        select.classList.add('open');
        filterSelectOptions(select);
    }
    
    function closeAllSelectDropdowns() {
        document.querySelectorAll('.searchable-select.open').forEach(s => {
            s.classList.remove('open');
        });
    }
    
    function filterSelectOptions(select) {
        const input = select.querySelector('.select-input');
        const dropdown = select.querySelector('.select-dropdown');
        const search = input.value.toLowerCase().trim();
        
        const filtered = select.allOptions.filter(opt => 
            opt.text.toLowerCase().includes(search)
        );
        
        if (filtered.length === 0) {
            dropdown.innerHTML = '<div class="select-empty">No matches found</div>';
        } else {
            dropdown.innerHTML = filtered.map(opt => 
                `<div class="select-option" data-value="${opt.value}">${opt.text}</div>`
            ).join('');
        }
    }
    
    function selectOption(select, value, text) {
        const input = select.querySelector('.select-input');
        const hiddenInput = select.querySelector('input[type="hidden"]');
        
        input.value = text === '-- None --' ? '' : text;
        hiddenInput.value = value;
        
        closeAllSelectDropdowns();
    }
    
    function handleSelectKeyboard(e, select) {
        const dropdown = select.querySelector('.select-dropdown');
        const options = dropdown.querySelectorAll('.select-option');
        const currentIndex = Array.from(options).findIndex(o => o.classList.contains('highlighted'));
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!select.classList.contains('open')) {
                openSelectDropdown(select);
            }
            const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
            highlightSelectOption(options, nextIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
            highlightSelectOption(options, prevIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const highlighted = dropdown.querySelector('.select-option.highlighted');
            if (highlighted) {
                selectOption(select, highlighted.dataset.value, highlighted.textContent);
            } else if (options.length === 1) {
                selectOption(select, options[0].dataset.value, options[0].textContent);
            }
        } else if (e.key === 'Escape') {
            closeAllSelectDropdowns();
        }
    }
    
    function highlightSelectOption(options, index) {
        options.forEach(o => o.classList.remove('highlighted'));
        if (options[index]) {
            options[index].classList.add('highlighted');
            options[index].scrollIntoView({ block: 'nearest' });
        }
    }
    
    function setSearchableSelectValue(name, value, text) {
        const select = document.querySelector(`.searchable-select[data-name="${name}"]`);
        if (select) {
            const input = select.querySelector('.select-input');
            const hiddenInput = select.querySelector('input[type="hidden"]');
            input.value = text || '';
            hiddenInput.value = value || '';
        }
    }
    
    function getOptionTextByValue(name, value) {
        const select = document.querySelector(`.searchable-select[data-name="${name}"]`);
        if (select && select.allOptions) {
            const opt = select.allOptions.find(o => o.value == value);
            return opt ? opt.text : '';
        }
        return '';
    }
    
    function resetSearchableSelects() {
        document.querySelectorAll('.searchable-select').forEach(select => {
            const input = select.querySelector('.select-input');
            const hiddenInput = select.querySelector('input[type="hidden"]');
            input.value = '';
            hiddenInput.value = '';
            
            // Set default if exists
            const defaultOpt = select.allOptions?.find(o => o.isDefault);
            if (defaultOpt && defaultOpt.value) {
                input.value = defaultOpt.text;
                hiddenInput.value = defaultOpt.value;
            }
        });
    }
    
    // Initialize searchable selects
    initSearchableSelects();
    
    // ==================== PASSWORD TOGGLE ====================
    
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.dataset.target;
            const input = document.getElementById(targetId);
            if (input.type === 'password') {
                input.type = 'text';
                toggle.classList.remove('uil-eye');
                toggle.classList.add('uil-eye-slash');
            } else {
                input.type = 'password';
                toggle.classList.remove('uil-eye-slash');
                toggle.classList.add('uil-eye');
            }
        });
    });

    // ==================== MODAL FUNCTIONS ====================

    /**
     * Resets the form and prepares the modal for adding a new user.
     */
    const openAddModal = () => {
        userForm.reset();
        resetSearchableSelects();
        userIdField.value = '';
        modalTitle.textContent = 'Add New User';
        document.querySelector('.modal-header h4 i').className = 'uil-user-plus';
        passwordField.required = true;
        passwordField.placeholder = 'Required for new user';
        emailField.disabled = false;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    };

    /**
     * Fetches user data and populates the form for editing.
     * @param {string} id - The ID of the user to edit.
     */
    const openEditModal = async (id) => {
        try {
            // Assumed API call to fetch a single user's details by ID
            const response = await API.get(`/users/${id}`); 
            const user = response.data; 

            // console.log('Fetched user data for editing:', user);

            // Populate form fields
            userIdField.value = user.id;
            employeeIdField.value = user.employee_id || '';
            firstNameField.value = user.first_name;
            middleNameField.value = user.middle_name;
            lastNameField.value = user.last_name;
            emailField.value = user.email;
            emailField.disabled = true; // Prevent email change
            phoneField.value = user.phone || '';
            
            // Set searchable select values
            setSearchableSelectValue('role', user.role_id, getOptionTextByValue('role', user.role_id));
            setSearchableSelectValue('department_id', user.departmnt_id || '', getOptionTextByValue('department_id', user.departmnt_id));
            setSearchableSelectValue('branch_id', user.branch_id || '', getOptionTextByValue('branch_id', user.branch_id));
            setSearchableSelectValue('company_id', user.company_id || '', getOptionTextByValue('company_id', user.company_id));
            
            // For editing, password is not required unless explicitly resetting
            passwordField.value = ''; 
            passwordField.required = false;
            passwordField.placeholder = 'Leave blank to keep current';

            modalTitle.textContent = `Edit User: ${user.username}`;
            document.querySelector('.modal-header h4 i').className = 'uil-edit';
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';

        } catch (error) {
            console.error('Error fetching user data:', error);
            AppNotify.error('Failed to load user data for editing.');
        }
    };

    /**
     * Handles password reset modal logic (simple version).
     * In a real app, this should be a dedicated small modal.
     * @param {string} id - The ID of the user whose password to reset.
     */
    const handleResetPassword = async (id) => {
        const newPassword = prompt("Enter new password for this user:");
        if (!newPassword || newPassword.length < 6) {
            if (newPassword !== null) AppNotify.warning("Password must be at least 6 characters.");
            return;
        }

        const confirmed = await AppConfirm.warn(`Are you sure you want to reset the password for user ID ${id}?`);
        if (!confirmed) {
            return;
        }

        try {
            // API call to the password reset endpoint
            await API.post(`/users/reset-password/${id}`, { password: newPassword });
            AppNotify.success('Password reset successfully!');
        } catch (error) {
            console.error('Password reset failed:', error);
            AppNotify.error('Password reset failed. Check server logs.');
        }
    };

    /**
     * Toggles the active status of a user.
     */
    const handleToggleStatus = async (id, currentStatus, button) => {
        const newStatus = currentStatus === 'true' ? false : true;
        const action = newStatus ? 'Enable' : 'Disable';

        const confirmed = await AppConfirm.warn(`Are you sure you want to ${action} user ID ${id}?`);
        if (!confirmed) {
            return;
        }

        try {
            // API call to toggle status endpoint
            await API.post(`/users/toggle-status/${id}`, { is_active: newStatus });
            
            AppNotify.success(`User status changed to ${newStatus ? 'Active' : 'Disabled'}.`);
            
            // Optimistically update the UI
            const statusCell = button.closest('tr').children[6];
            statusCell.textContent = newStatus ? 'Active' : 'Disabled';
            statusCell.style.color = newStatus ? '#28a745' : '#dc3545';
            
            button.textContent = newStatus ? 'Disable' : 'Enable';
            button.dataset.status = newStatus;

        } catch (error) {
            console.error('Toggle status failed:', error);
            AppNotify.error('Failed to change user status.');
        }
    };

    /**
     * Handles form submission for both creating and updating a user.
     */
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = userIdField.value;
        const isUpdate = !!id;

        const departmentText = departmentField.options[departmentField.selectedIndex].text;
        const branchText = branchField.options[branchField.selectedIndex].text;
        const companyText = companyField.options[companyField.selectedIndex].text;

        const formData = {
            "first_name": firstNameField.value,
            "middle_name": middleNameField.value,
            "last_name": lastNameField.value,
            "email": emailField.value,
            "phone": phoneField.value,
            "password": passwordField.value || undefined, // Send only if provided
            "role_id": roleField.value,
            "department_id": departmentField.value || null, // Send null if 'N/A' selected
            "department": departmentText || null,
            "branch_id": branchField.value || null,
            "branch_location": branchText || null,
            "company_id": companyField.value || null,
            "company": companyText || null,
            "employee_id": employeeIdField.value || null,
        };

        try {
            let response;
            if (passwordField.value && passwordField.value.length < 6) {
                AppNotify.warning('Password must be at least 6 characters long.');
                return;
            } else if (passwordField.value !== passwordConfirmField.value) {
                AppNotify.warning('Password and confirmation do not match.');
                return;
            }
            
            // build payload without null or undefined values
            const payload = Object.fromEntries(
                Object.entries(formData).filter(([, v]) => v !== null && v !== undefined)
            );

            // console.log('Submitting user data:', payload);

            if (isUpdate) {
                // Update existing user
                response = await API.put(`/auth/update-user/${id}`, payload);
                AppNotify.success(`User ${payload.email || id} updated successfully!`);
            } else {
                // Create new user
                response = await API.post(`/auth/register`, formData);
                AppNotify.success(`User ${payload.email} created successfully!`);
            }
            
            // Close modal and reload the page or update table dynamically
            modal.style.display = 'none';
            window.location.reload(); // Simple reload for full update

        } catch (error) {
            console.error('User save failed:', error);
            AppNotify.error('User save failed. Check the form data and server logs.');
        }
    });

    // --- Event Listeners ---
    
    // Open Add User Modal
    addUserBtn.addEventListener('click', openAddModal);

    // Close Modal - Only via close button, NOT clicking outside
    closeModalBtn.addEventListener('click', () => { 
        modal.style.display = 'none';
        document.body.style.overflow = '';
    });
    
    // Prevent closing when clicking modal content
    modal.querySelector('.modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Optional: Allow closing with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            // Don't close if a searchable dropdown is open
            if (!document.querySelector('.searchable-select.open')) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    });

    // Delegated Table Button Clicks (Edit, Reset, Toggle Status)
    usersTableBody.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        
        if (!id) return;

        if (target.classList.contains('btn-edit')) {
            openEditModal(id);
        } else if (target.classList.contains('btn-reset-password')) {
            handleResetPassword(id);
        } else if (target.classList.contains('btn-toggle-status')) {
            const currentStatus = target.dataset.status;
            handleToggleStatus(id, currentStatus, target);
        }
    });

    // --- Pagination Logic ---
    const usersTable = document.getElementById('users-table');
    const pageSizeSelect = document.getElementById('page-size');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');
    const searchInput = document.getElementById('search-input');

    let currentPage = 1;
    let itemsPerPage = 10;
    let allUsers = [];
    let filteredUsers = [];

    // Store all user rows when page loads
    if (usersTableBody) {
        const rows = Array.from(usersTableBody.querySelectorAll('tr'));
        allUsers = rows.map(row => {
            const emailCell = row.querySelector('td[data-label="Email"]');
            const roleCell = row.querySelector('td[data-label="Role"]');
            const deptCell = row.querySelector('td[data-label="Department"]');
            const branchCell = row.querySelector('td[data-label="Branch"]');
            
            const emailText = emailCell?.textContent || '';
            const roleText = roleCell?.textContent || '';
            const deptText = deptCell?.textContent || '';
            const branchText = branchCell?.textContent || '';
            
            return {
                element: row.cloneNode(true),
                email: String(emailText).toLowerCase(),
                role: String(roleText).toLowerCase(),
                department: String(deptText).toLowerCase(),
                branch: String(branchText).toLowerCase(),
                isValid: emailCell && !emailText.includes('No users found')
            };
        });
        filteredUsers = [...allUsers];

        // Initialize pagination
        updatePagination();

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                
                if (!searchTerm) {
                    filteredUsers = [...allUsers];
                } else {
                    filteredUsers = allUsers.filter(user => {
                        if (!user || !user.isValid) return false;
                        
                        const email = user.email || '';
                        const role = user.role || '';
                        const department = user.department || '';
                        const branch = user.branch || '';
                        
                        return email.includes(searchTerm) ||
                               role.includes(searchTerm) ||
                               department.includes(searchTerm) ||
                               branch.includes(searchTerm);
                    });
                }
                
                currentPage = 1;
                updatePagination();
            });
        }

        // Page size change handler
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                itemsPerPage = parseInt(e.target.value);
                currentPage = 1;
                updatePagination();
            });
        }

        // Previous button handler
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    updatePagination();
                }
            });
        }

        // Next button handler
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    updatePagination();
                }
            });
        }
    }

    function updatePagination() {
        const validUsers = filteredUsers.filter(user => user.isValid);
        
        const totalItems = validUsers.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        usersTableBody.innerHTML = '';
        
        if (totalItems === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = '<td colspan="8" style="text-align:center;">No users found.</td>';
            usersTableBody.appendChild(noDataRow);
        } else {
            const pageUsers = validUsers.slice(startIndex, endIndex);
            pageUsers.forEach(user => {
                usersTableBody.appendChild(user.element.cloneNode(true));
            });
        }
        
        pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalItems} total)`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= totalPages;
    }

    // ==================== BULK IMPORT FUNCTIONALITY ====================
    initBulkImport();
});

/**
 * Initialize bulk import functionality
 */
function initBulkImport() {
    const bulkImportBtn = document.getElementById('bulk-import-btn');
    const bulkImportModal = document.getElementById('bulk-import-modal');
    const closeImportModal = document.getElementById('close-import-modal');
    const cancelImportBtn = document.getElementById('cancel-import-btn');
    
    if (!bulkImportBtn || !bulkImportModal) return;

    const uploadArea = document.getElementById('upload-area');
    const importFileInput = document.getElementById('import-file');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const removeFileBtn = document.getElementById('remove-file');
    const previewBtn = document.getElementById('preview-btn');
    const backToUploadBtn = document.getElementById('back-to-upload-btn');
    const startImportBtn = document.getElementById('start-import-btn');
    const closeResultsBtn = document.getElementById('close-results-btn');

    let selectedFile = null;
    let validUsers = [];
    let importType = 'excel';

    // Open modal
    bulkImportBtn.addEventListener('click', () => {
        resetImportModal();
        bulkImportModal.style.display = 'block';
    });

    // Close modal handlers
    closeImportModal.addEventListener('click', () => {
        bulkImportModal.style.display = 'none';
    });

    cancelImportBtn.addEventListener('click', () => {
        bulkImportModal.style.display = 'none';
    });

    closeResultsBtn?.addEventListener('click', () => {
        bulkImportModal.style.display = 'none';
        window.location.reload();
    });

    window.addEventListener('click', (e) => {
        if (e.target === bulkImportModal) {
            bulkImportModal.style.display = 'none';
        }
    });

    // Upload area interactions
    uploadArea.addEventListener('click', () => importFileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    });

    importFileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleFileSelect(e.target.files[0]);
    });

    removeFileBtn.addEventListener('click', () => {
        selectedFile = null;
        importFileInput.value = '';
        fileInfo.style.display = 'none';
        uploadArea.style.display = 'flex';
        previewBtn.disabled = true;
    });

    // Handle file selection
    function handleFileSelect(file) {
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            AppNotify.warning('Please upload an Excel (.xlsx, .xls) or CSV file');
            return;
        }

        selectedFile = file;
        importType = fileExtension === '.csv' ? 'csv' : 'excel';
        fileName.textContent = file.name;
        uploadArea.style.display = 'none';
        fileInfo.style.display = 'flex';
        previewBtn.disabled = false;
    }

    // Preview button click
    previewBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        previewBtn.disabled = true;
        previewBtn.innerHTML = '<span class="spinner-small"></span> Processing...';

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('/api/bulk-user-import/preview', {
                method: 'POST',
                body: formData
            });

            // Handle 401 Unauthorized - session expired
            if (response.status === 401) {
                let message = 'Your session has expired. Please login again.';
                try {
                    const data = await response.json();
                    message = data.message || message;
                } catch (e) {}
                if (typeof AppNotify !== 'undefined') {
                    AppNotify.warning(message);
                    setTimeout(() => { window.location.href = '/login'; }, 2000);
                } else {
                    AppNotify.warning(message);
                    window.location.href = '/login';
                }
                return;
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to preview file');
            }

            validUsers = result.data.valid;
            renderPreview(result.data);
            goToStep(2);
        } catch (error) {
            console.error('Preview failed:', error);
            AppNotify.error('Failed to preview file: ' + error.message);
        } finally {
            previewBtn.disabled = false;
            previewBtn.innerHTML = '<i class="uil uil-eye"></i> Preview Data';
        }
    });

    // Render preview data
    function renderPreview(data) {
        document.getElementById('valid-count').textContent = data.valid.length;
        document.getElementById('invalid-count').textContent = data.invalid.length;
        document.getElementById('import-count').textContent = data.valid.length;

        // Render valid records
        const validBody = document.getElementById('valid-preview-body');
        if (data.valid.length === 0) {
            validBody.innerHTML = '<tr><td colspan="7" class="text-center">No valid records</td></tr>';
        } else {
            validBody.innerHTML = data.valid.map(user => `
                <tr>
                    <td>${escapeHtml(user.first_name)}</td>
                    <td>${escapeHtml(user.last_name)}</td>
                    <td>${escapeHtml(user.email)}</td>
                    <td>${escapeHtml(user.phone || '-')}</td>
                    <td>${escapeHtml(user.department || user.department_id || '-')}</td>
                    <td>${escapeHtml(user.branch_location || user.branch_id || '-')}</td>
                    <td>${escapeHtml(user.company || 'Jirani')}</td>
                </tr>
            `).join('');
        }

        // Render invalid records
        const invalidBody = document.getElementById('invalid-preview-body');
        if (data.invalid.length === 0) {
            invalidBody.innerHTML = '<tr><td colspan="3" class="text-center">No invalid records</td></tr>';
        } else {
            invalidBody.innerHTML = data.invalid.map(item => `
                <tr>
                    <td>${item.row}</td>
                    <td>${escapeHtml(item.data.email || item.data.first_name || 'Unknown')}</td>
                    <td class="error-text">${item.errors.join(', ')}</td>
                </tr>
            `).join('');
        }

        startImportBtn.disabled = data.valid.length === 0;
    }

    // Preview tab switching
    document.querySelectorAll('.preview-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preview-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.preview-table-container .tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + '-table-container').classList.add('active');
        });
    });

    // Back to upload button
    backToUploadBtn.addEventListener('click', () => goToStep(1));

    // Start import button
    startImportBtn.addEventListener('click', async () => {
        if (validUsers.length === 0) return;

        goToStep(3);
        document.getElementById('import-progress').style.display = 'block';
        document.getElementById('import-results').style.display = 'none';

        try {
            const response = await API.post('/bulk-user-import/process', {
                users: validUsers,
                importType: importType
            });

            const result = response.data || response;
            
            document.getElementById('result-success').textContent = result.successfulRecords;
            document.getElementById('result-failed').textContent = result.failedRecords;
            
            document.getElementById('import-progress').style.display = 'none';
            document.getElementById('import-results').style.display = 'block';
        } catch (error) {
            console.error('Import failed:', error);
            AppNotify.error('Import failed: ' + (error.message || 'Unknown error'));
            goToStep(2);
        }
    });

    // Step navigation
    function goToStep(step) {
        document.querySelectorAll('.import-steps .step').forEach((s, index) => {
            s.classList.toggle('active', index < step);
            s.classList.toggle('completed', index < step - 1);
        });

        document.querySelectorAll('.import-step-content').forEach((content, index) => {
            content.style.display = index === step - 1 ? 'block' : 'none';
        });
    }

    // Reset modal
    function resetImportModal() {
        selectedFile = null;
        validUsers = [];
        importFileInput.value = '';
        fileInfo.style.display = 'none';
        uploadArea.style.display = 'flex';
        previewBtn.disabled = true;
        goToStep(1);
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}