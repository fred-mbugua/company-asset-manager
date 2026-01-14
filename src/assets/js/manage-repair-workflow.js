/**
 * Repair Workflow Configuration Management
 * Handles workflow stages and role permissions configuration
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    initTabs();
    loadWorkflowStages();
    loadWorkflowPermissions();
    setupEventListeners();
});

// ============ Tab Management ============
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// ============ Event Listeners ============
function setupEventListeners() {
    // Modal close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal on outside click
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Cancel buttons
    document.getElementById('cancel-stage')?.addEventListener('click', function() {
        document.getElementById('stage-modal').style.display = 'none';
    });
    
    document.getElementById('cancel-permissions')?.addEventListener('click', function() {
        document.getElementById('permissions-modal').style.display = 'none';
    });
    
    // Stage form submission
    document.getElementById('stage-form')?.addEventListener('submit', handleStageSubmit);
    
    // Permissions form submission
    document.getElementById('permissions-form')?.addEventListener('submit', handlePermissionsSubmit);
}

// ============ Workflow Stages ============
async function loadWorkflowStages() {
    const tableBody = document.getElementById('stages-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr class="loading-row"><td colspan="9"><i class="uil uil-spinner-alt spin"></i> Loading stages...</td></tr>';
    
    try {
        const response = await fetch('/api/repair-requests/workflow/stages');
        const result = await response.json();
        
        if (result.success && result.data) {
            renderStagesTable(result.data);
        } else {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No workflow stages configured</td></tr>';
        }
    } catch (error) {
        console.error('Error loading stages:', error);
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Error loading stages</td></tr>';
    }
}

function renderStagesTable(stages) {
    const tableBody = document.getElementById('stages-table-body');
    
    if (!stages || stages.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No workflow stages configured</td></tr>';
        return;
    }
    
    let html = '';
    stages.forEach(stage => {
        const requirements = [];
        if (stage.requires_notes) requirements.push('<span class="req-badge"><i class="uil uil-comment"></i> Notes</span>');
        if (stage.requires_invoice) requirements.push('<span class="req-badge"><i class="uil uil-invoice"></i> Invoice</span>');
        if (stage.requires_payment) requirements.push('<span class="req-badge"><i class="uil uil-dollar-sign"></i> Payment</span>');
        
        html += `
            <tr data-id="${stage.id}">
                <td>${stage.display_order || 0}</td>
                <td><code>${stage.stage_key}</code></td>
                <td><strong>${stage.stage_name}</strong></td>
                <td>${stage.from_status_name || '<span class="text-muted">Any</span>'}</td>
                <td>${stage.to_status_name || '-'}</td>
                <td><span class="badge badge-${stage.action_type || 'secondary'}">${stage.action_type || '-'}</span></td>
                <td>
                    <div class="requirements">
                        ${requirements.length > 0 ? requirements.join('') : '<span class="text-muted">None</span>'}
                    </div>
                </td>
                <td>
                    <span class="badge badge-${stage.is_active ? 'active' : 'inactive'}">
                        ${stage.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info btn-icon" onclick="editStage(${stage.id})" title="Edit">
                            <i class="uil uil-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-${stage.is_active ? 'warning' : 'success'} btn-icon" 
                                onclick="toggleStageStatus(${stage.id}, ${!stage.is_active})" 
                                title="${stage.is_active ? 'Deactivate' : 'Activate'}">
                            <i class="uil uil-${stage.is_active ? 'pause' : 'play'}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

function openStageModal(mode = 'add', stage = null) {
    const modal = document.getElementById('stage-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('stage-form');
    
    // Reset form
    form.reset();
    document.getElementById('stage-id').value = '';
    document.getElementById('stage-key').readOnly = (mode === 'edit');
    
    if (mode === 'edit' && stage) {
        modalTitle.innerHTML = '<i class="uil uil-edit"></i> Edit Workflow Stage';
        document.getElementById('stage-id').value = stage.id;
        document.getElementById('stage-name').value = stage.stage_name;
        document.getElementById('stage-key').value = stage.stage_key;
        document.getElementById('from-status').value = stage.from_status_id || '';
        document.getElementById('to-status').value = stage.to_status_id || '';
        document.getElementById('stage-description').value = stage.description || '';
        document.getElementById('display-order').value = stage.display_order || 0;
        document.getElementById('action-type').value = stage.action_type || 'transition';
        document.getElementById('stage-icon').value = stage.icon || '';
        document.getElementById('button-color').value = stage.button_color || 'primary';
        document.getElementById('requires-notes').checked = stage.requires_notes;
        document.getElementById('requires-invoice').checked = stage.requires_invoice;
        document.getElementById('requires-payment').checked = stage.requires_payment;
    } else {
        modalTitle.innerHTML = '<i class="uil uil-plus"></i> Add Workflow Stage';
    }
    
    modal.style.display = 'block';
}

async function editStage(stageId) {
    try {
        const response = await fetch(`/api/repair-requests/workflow/stages/${stageId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            openStageModal('edit', result.data);
        } else {
            showToast('Error loading stage details', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error loading stage details', 'error');
    }
}

async function handleStageSubmit(event) {
    event.preventDefault();
    
    const stageId = document.getElementById('stage-id').value;
    const isEdit = !!stageId;
    
    const data = {
        stage_name: document.getElementById('stage-name').value,
        stage_key: document.getElementById('stage-key').value,
        from_status_id: document.getElementById('from-status').value || null,
        to_status_id: document.getElementById('to-status').value || null,
        description: document.getElementById('stage-description').value,
        display_order: parseInt(document.getElementById('display-order').value) || 0,
        action_type: document.getElementById('action-type').value,
        icon: document.getElementById('stage-icon').value,
        button_color: document.getElementById('button-color').value,
        requires_notes: document.getElementById('requires-notes').checked,
        requires_invoice: document.getElementById('requires-invoice').checked,
        requires_payment: document.getElementById('requires-payment').checked,
        is_active: document.getElementById('is-active')?.checked ?? true
    };
    
    try {
        const url = isEdit 
            ? `/api/repair-requests/workflow/stages/${stageId}` 
            : '/api/repair-requests/workflow/stages';
        
        const response = await fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(`Stage ${isEdit ? 'updated' : 'created'} successfully`, 'success');
            document.getElementById('stage-modal').style.display = 'none';
            loadWorkflowStages();
            loadWorkflowPermissions(); // Refresh permissions too
        } else {
            showToast(result.message || 'Error saving stage', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error saving stage', 'error');
    }
}

async function toggleStageStatus(stageId, newStatus) {
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} this stage?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/repair-requests/workflow/stages/${stageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: newStatus })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(`Stage ${action}d successfully`, 'success');
            loadWorkflowStages();
        } else {
            showToast(result.message || `Error ${action}ing stage`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast(`Error ${action}ing stage`, 'error');
    }
}

// ============ Workflow Permissions ============
async function loadWorkflowPermissions() {
    const container = document.getElementById('permissions-grid');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-row"><i class="uil uil-spinner-alt spin"></i> Loading permissions...</div>';
    
    try {
        // Load all stages with their permissions
        const response = await fetch('/api/repair-requests/workflow/stages');
        const result = await response.json();
        
        if (result.success && result.data) {
            await renderPermissionsCards(result.data);
        } else {
            container.innerHTML = '<div class="text-muted text-center">No workflow stages configured</div>';
        }
    } catch (error) {
        console.error('Error loading permissions:', error);
        container.innerHTML = '<div class="text-muted text-center">Error loading permissions</div>';
    }
}

async function renderPermissionsCards(stages) {
    const container = document.getElementById('permissions-grid');
    
    if (!stages || stages.length === 0) {
        container.innerHTML = '<div class="text-muted text-center">No workflow stages configured</div>';
        return;
    }
    
    let html = '';
    
    for (const stage of stages) {
        // Get permissions for this stage
        let permissions = [];
        try {
            const permResponse = await fetch(`/api/repair-requests/workflow/stages/${stage.id}/permissions`);
            const permResult = await permResponse.json();
            if (permResult.success && permResult.data) {
                permissions = permResult.data;
            }
        } catch (e) {
            console.error('Error loading permissions for stage:', stage.id, e);
        }
        
        const rolesList = permissions.length > 0
            ? permissions.map(p => `<span class="role-badge"><i class="fas fa-user-tag"></i> ${p.role_name}</span>`).join('')
            : '<span class="no-roles">No roles assigned</span>';
        
        html += `
            <div class="permission-card" data-stage-id="${stage.id}">
                <div class="permission-card-header">
                    <div class="permission-card-title">
                        <h5>${stage.stage_name}</h5>
                        <span class="stage-key">${stage.stage_key}</span>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="editPermissions(${stage.id}, '${escapeHtml(stage.stage_name)}')">
                        <i class="fas fa-user-cog"></i> Manage
                    </button>
                </div>
                <div class="permission-roles">
                    ${rolesList}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

async function editPermissions(stageId, stageName) {
    const modal = document.getElementById('permissions-modal');
    document.getElementById('permissions-stage-id').value = stageId;
    
    // Update stage info
    const stageInfo = document.getElementById('stage-info');
    stageInfo.innerHTML = `<h5>${stageName}</h5><p>Select which roles can execute this action</p>`;
    
    // Get current permissions for this stage
    try {
        const permResponse = await fetch(`/api/repair-requests/workflow/stages/${stageId}/permissions`);
        const permResult = await permResponse.json();
        const currentRoleIds = permResult.success && permResult.data 
            ? permResult.data.map(p => p.role_id.toString()) 
            : [];
        
        // Update checkboxes - match by role_id
        document.querySelectorAll('#permissions-form input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = currentRoleIds.includes(checkbox.value);
        });
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading permissions:', error);
        showToast('Error loading permissions', 'error');
    }
}

async function handlePermissionsSubmit(event) {
    event.preventDefault();
    
    const stageId = document.getElementById('permissions-stage-id').value;
    const checkedBoxes = document.querySelectorAll('#permissions-form input[type="checkbox"]:checked');
    const roleIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    
    // Format permissions as array of objects with roleId and canExecute
    const permissions = roleIds.map(roleId => ({
        roleId: roleId,
        canExecute: true
    }));
    
    try {
        const response = await fetch(`/api/repair-requests/workflow/stages/${stageId}/permissions`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissions })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Permissions updated successfully', 'success');
            document.getElementById('permissions-modal').style.display = 'none';
            loadWorkflowPermissions();
        } else {
            showToast(result.message || 'Error updating permissions', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error updating permissions', 'error');
    }
}

// ============ Utility Functions ============
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    // Use existing toast system if available
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: type,
            title: message,
            showConfirmButton: false,
            timer: 3000
        });
    } else if (typeof iziToast !== 'undefined') {
        iziToast[type]({ message: message, position: 'topRight' });
    } else {
        alert(message);
    }
}
