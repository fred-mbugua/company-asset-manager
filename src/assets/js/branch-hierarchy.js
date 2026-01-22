/**
 * Branch Hierarchy Configuration Page
 * Manages organization branch structure with parent-child relationships
 */
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loadingTree = document.getElementById('loading-tree');
    const hierarchyTree = document.getElementById('hierarchy-tree');
    const emptyTree = document.getElementById('empty-tree');
    const noSelection = document.getElementById('no-selection');
    const configForm = document.getElementById('config-form');
    const saveBar = document.getElementById('save-bar');
    const saveBtn = document.getElementById('save-btn');
    const saveAllBtn = document.getElementById('save-all-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // Form Elements
    const selectedBranchId = document.getElementById('selected-branch-id');
    const selectedBranchName = document.getElementById('selected-branch-name');
    const selectedBranchLocation = document.getElementById('selected-branch-location');
    const hqBadge = document.getElementById('hq-badge');
    const parentSelect = document.getElementById('parent-select');
    const parentSearch = document.getElementById('parent-search');
    const parentDropdown = document.getElementById('parent-dropdown');
    const parentSelectWrapper = document.getElementById('parent-select-wrapper');
    const hierarchyLevel = document.getElementById('hierarchy-level');
    const isHeadquarters = document.getElementById('is-headquarters');
    const childrenList = document.getElementById('children-list');
    const accessibleBranches = document.getElementById('accessible-branches');
    const applyChangesBtn = document.getElementById('apply-changes-btn');

    // State
    let branches = [];
    let pendingChanges = new Map(); // { branchId: { parent_id, is_headquarters } }
    let selectedBranch = null;
    let parentDropdownOpen = false;
    let highlightedIndex = -1;

    // ==================== INITIALIZATION ====================

    init();

    async function init() {
        await loadBranches();
        setupEventListeners();
        setupSearchableSelect();
    }

    async function loadBranches() {
        try {
            showLoading(true);
            const response = await API.get('/branches/hierarchy/list');
            branches = response.data || [];
            
            if (branches.length === 0) {
                showEmptyState();
            } else {
                renderTree();
                populateParentDropdown();
            }
        } catch (error) {
            console.error('Error loading branches:', error);
            AppNotify.error('Failed to load branches');
            showEmptyState();
        } finally {
            showLoading(false);
        }
    }

    function setupEventListeners() {
        // HQ checkbox change
        isHeadquarters.addEventListener('change', handleHqChange);

        // Apply changes button
        applyChangesBtn.addEventListener('click', applyCurrentChanges);

        // Save buttons
        saveBtn.addEventListener('click', saveAllChanges);
        saveAllBtn.addEventListener('click', saveAllChanges);
        cancelBtn.addEventListener('click', cancelChanges);
    }

    // ==================== SEARCHABLE SELECT ====================

    function setupSearchableSelect() {
        // Focus on search input opens dropdown
        parentSearch.addEventListener('focus', () => {
            openParentDropdown();
        });

        // Input for filtering
        parentSearch.addEventListener('input', (e) => {
            filterParentDropdown(e.target.value);
            highlightedIndex = -1;
        });

        // Keyboard navigation
        parentSearch.addEventListener('keydown', (e) => {
            const options = parentDropdown.querySelectorAll('.select-option:not(.no-results)');
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    highlightedIndex = Math.min(highlightedIndex + 1, options.length - 1);
                    updateHighlight(options);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    highlightedIndex = Math.max(highlightedIndex - 1, -1);
                    updateHighlight(options);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (highlightedIndex >= 0 && options[highlightedIndex]) {
                        selectParentOption(options[highlightedIndex]);
                    }
                    break;
                case 'Escape':
                    closeParentDropdown();
                    parentSearch.blur();
                    break;
                case 'Tab':
                    closeParentDropdown();
                    break;
            }
        });

        // Click outside closes dropdown
        document.addEventListener('click', (e) => {
            if (!parentSelectWrapper.contains(e.target)) {
                closeParentDropdown();
            }
        });
    }

    function openParentDropdown() {
        parentSelectWrapper.classList.add('open');
        parentDropdownOpen = true;
        highlightedIndex = -1;
        filterParentDropdown(parentSearch.value);
    }

    function closeParentDropdown() {
        parentSelectWrapper.classList.remove('open');
        parentDropdownOpen = false;
        highlightedIndex = -1;
    }

    function updateHighlight(options) {
        options.forEach((opt, idx) => {
            opt.classList.toggle('highlighted', idx === highlightedIndex);
            if (idx === highlightedIndex) {
                opt.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    function filterParentDropdown(searchTerm) {
        const excludeId = selectedBranch?.id;
        const term = searchTerm.toLowerCase().trim();
        
        let html = `
            <div class="select-option ${parentSelect.value === '' ? 'selected' : ''}" data-value="">
                <i class="uil-minus-circle option-icon"></i>
                <span class="option-text">-- No Parent (Root Level) --</span>
            </div>
        `;
        
        let hasResults = true;
        const filteredBranches = branches.filter(branch => {
            if (excludeId && branch.id === excludeId) return false;
            if (!term) return true;
            return branch.name.toLowerCase().includes(term) || 
                   (branch.location && branch.location.toLowerCase().includes(term));
        });

        if (filteredBranches.length === 0 && term) {
            html += `<div class="no-results">No branches found matching "${searchTerm}"</div>`;
            hasResults = false;
        } else {
            filteredBranches.forEach(branch => {
                const isSelected = parentSelect.value == branch.id;
                const isHq = branch.is_headquarters;
                html += `
                    <div class="select-option ${isSelected ? 'selected' : ''} ${isHq ? 'is-hq' : ''}" data-value="${branch.id}">
                        <i class="uil-building option-icon"></i>
                        <span class="option-text">${branch.name}</span>
                        <span class="option-location">${branch.location || 'No location'}</span>
                        ${isHq ? '<i class="uil-star hq-star"></i>' : ''}
                    </div>
                `;
            });
        }

        parentDropdown.innerHTML = html;

        // Add click handlers to options
        parentDropdown.querySelectorAll('.select-option').forEach(option => {
            option.addEventListener('click', () => selectParentOption(option));
        });
    }

    function selectParentOption(option) {
        const value = option.dataset.value;
        const text = option.querySelector('.option-text').textContent;
        
        parentSelect.value = value;
        parentSearch.value = value === '' ? '' : text;
        
        // Update has-value class for clear button functionality
        parentSelectWrapper.classList.toggle('has-value', value !== '');
        
        closeParentDropdown();
        handleParentChange();
    }

    function setParentSelectValue(value) {
        parentSelect.value = value || '';
        
        if (value) {
            const branch = branches.find(b => b.id == value);
            if (branch) {
                parentSearch.value = branch.name;
                parentSelectWrapper.classList.add('has-value');
            }
        } else {
            parentSearch.value = '';
            parentSelectWrapper.classList.remove('has-value');
        }
    }

    // ==================== TREE RENDERING ====================

    function renderTree() {
        const treeHtml = buildTreeHtml(branches);
        hierarchyTree.innerHTML = treeHtml;
        hierarchyTree.style.display = 'block';

        // Add click handlers to tree items
        hierarchyTree.querySelectorAll('.tree-item').forEach(item => {
            item.addEventListener('click', () => {
                const branchId = parseInt(item.dataset.branchId);
                selectBranch(branchId);
            });
        });

        // Add toggle handlers
        hierarchyTree.querySelectorAll('.tree-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const nodeId = toggle.dataset.nodeId;
                toggleTreeNode(nodeId);
            });
        });
    }

    function buildTreeHtml(branchList) {
        // Build tree structure
        const branchMap = new Map();
        const roots = [];

        branchList.forEach(branch => {
            branchMap.set(branch.id, { ...branch, children: [] });
        });

        branchList.forEach(branch => {
            const node = branchMap.get(branch.id);
            if (branch.parent_id && branchMap.has(branch.parent_id)) {
                branchMap.get(branch.parent_id).children.push(node);
            } else {
                roots.push(node);
            }
        });

        return renderNodes(roots);
    }

    function renderNodes(nodes, level = 0) {
        if (!nodes || nodes.length === 0) return '';

        return nodes.map(node => {
            const hasChildren = node.children && node.children.length > 0;
            const isHq = node.is_headquarters;
            const pendingChange = pendingChanges.get(node.id);
            
            return `
                <div class="tree-node" data-node-id="${node.id}">
                    <div class="tree-item ${isHq ? 'is-hq' : ''} ${selectedBranch?.id === node.id ? 'selected' : ''}" 
                         data-branch-id="${node.id}">
                        <span class="tree-toggle ${hasChildren ? '' : 'no-children'} expanded" 
                              data-node-id="${node.id}">
                            <i class="uil-angle-right"></i>
                        </span>
                        <div class="tree-icon">
                            <i class="uil-building"></i>
                        </div>
                        <div class="tree-content">
                            <div class="tree-name">
                                ${node.name}
                                ${isHq ? '<i class="uil-star hq-star"></i>' : ''}
                                ${pendingChange ? '<i class="uil-edit" style="color: #f39c12; font-size: 12px;"></i>' : ''}
                            </div>
                            <div class="tree-location">${node.location || 'No location'}</div>
                        </div>
                        <div class="tree-meta">
                            <span class="level-tag">Level ${node.hierarchy_level || 0}</span>
                            ${hasChildren ? `<span class="children-count">${node.children.length} child${node.children.length > 1 ? 'ren' : ''}</span>` : ''}
                        </div>
                    </div>
                    ${hasChildren ? `<div class="tree-children">${renderNodes(node.children, level + 1)}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    function toggleTreeNode(nodeId) {
        const node = hierarchyTree.querySelector(`.tree-node[data-node-id="${nodeId}"]`);
        const toggle = node.querySelector('.tree-toggle');
        const children = node.querySelector('.tree-children');
        
        if (children) {
            if (toggle.classList.contains('expanded')) {
                toggle.classList.remove('expanded');
                children.style.display = 'none';
            } else {
                toggle.classList.add('expanded');
                children.style.display = 'block';
            }
        }
    }

    // ==================== BRANCH SELECTION ====================

    function selectBranch(branchId) {
        const branch = branches.find(b => b.id === branchId);
        if (!branch) return;

        selectedBranch = branch;

        // Update tree selection
        hierarchyTree.querySelectorAll('.tree-item').forEach(item => {
            item.classList.remove('selected');
        });
        hierarchyTree.querySelector(`.tree-item[data-branch-id="${branchId}"]`).classList.add('selected');

        // Show config form
        noSelection.style.display = 'none';
        configForm.style.display = 'block';

        // Populate form
        populateConfigForm(branch);
    }

    function populateConfigForm(branch) {
        // Check for pending changes
        const pending = pendingChanges.get(branch.id) || {};
        const currentParentId = pending.parent_id !== undefined ? pending.parent_id : branch.parent_id;
        const currentIsHq = pending.is_headquarters !== undefined ? pending.is_headquarters : branch.is_headquarters;

        // Basic info
        selectedBranchId.value = branch.id;
        selectedBranchName.textContent = branch.name;
        selectedBranchLocation.textContent = branch.location || 'No location specified';

        // HQ badge
        hqBadge.style.display = currentIsHq ? 'flex' : 'none';

        // Parent select - use new searchable select
        setParentSelectValue(currentParentId);
        filterParentDropdown(''); // Reset dropdown options

        // Hierarchy level
        hierarchyLevel.textContent = branch.hierarchy_level || 0;

        // HQ checkbox
        isHeadquarters.checked = currentIsHq;

        // Children list
        populateChildrenList(branch.id);

        // Accessible branches
        updateAccessPreview(branch.id);
    }

    function populateParentDropdown(excludeId = null) {
        // Initial population of dropdown - this is now handled by filterParentDropdown
        filterParentDropdown('');
    }

    function populateChildrenList(branchId) {
        const children = branches.filter(b => b.parent_id === branchId);
        
        if (children.length === 0) {
            childrenList.innerHTML = '<p class="no-children">This branch has no child branches.</p>';
        } else {
            childrenList.innerHTML = children.map(child => `
                <div class="child-item">
                    <i class="uil-building"></i>
                    <span>${child.name}</span>
                    <span class="level-tag">Level ${child.hierarchy_level || 0}</span>
                </div>
            `).join('');
        }
    }

    async function updateAccessPreview(branchId) {
        try {
            // Get the branch and check if it's HQ
            const branch = branches.find(b => b.id === branchId);
            const pending = pendingChanges.get(branchId) || {};
            const isHq = pending.is_headquarters !== undefined ? pending.is_headquarters : branch?.is_headquarters;

            if (isHq) {
                // HQ can access all branches
                accessibleBranches.innerHTML = branches.map(b => `
                    <span class="accessible-tag ${b.id === branchId ? 'is-self' : ''}">
                        <i class="uil-check"></i> ${b.name}
                    </span>
                `).join('');
            } else {
                // Build descendant list (self + all descendants)
                const accessible = getDescendants(branchId);
                accessible.unshift(branchId); // Add self

                accessibleBranches.innerHTML = accessible.map(id => {
                    const b = branches.find(br => br.id === id);
                    return `
                        <span class="accessible-tag ${id === branchId ? 'is-self' : ''}">
                            <i class="uil-check"></i> ${b?.name || 'Unknown'}
                        </span>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('Error updating access preview:', error);
        }
    }

    function getDescendants(branchId) {
        const descendants = [];
        const children = branches.filter(b => b.parent_id === branchId);
        
        children.forEach(child => {
            descendants.push(child.id);
            descendants.push(...getDescendants(child.id));
        });
        
        return descendants;
    }

    // ==================== CHANGE HANDLERS ====================

    function handleParentChange() {
        if (!selectedBranch) return;

        const newParentId = parentSelect.value ? parseInt(parentSelect.value) : null;
        
        // Track the change
        trackChange(selectedBranch.id, { parent_id: newParentId });

        // Update level display (estimate)
        if (newParentId === null) {
            hierarchyLevel.textContent = '0';
        } else {
            const parent = branches.find(b => b.id === newParentId);
            hierarchyLevel.textContent = (parent?.hierarchy_level || 0) + 1;
        }

        // Update access preview
        updateAccessPreview(selectedBranch.id);
    }

    function handleHqChange() {
        if (!selectedBranch) return;

        const isHq = isHeadquarters.checked;
        
        // Track the change
        trackChange(selectedBranch.id, { is_headquarters: isHq });

        // Update HQ badge
        hqBadge.style.display = isHq ? 'flex' : 'none';

        // If setting as HQ, clear parent
        if (isHq) {
            parentSelect.value = '';
            trackChange(selectedBranch.id, { parent_id: null });
        }

        // Update access preview
        updateAccessPreview(selectedBranch.id);
    }

    function trackChange(branchId, changes) {
        const existing = pendingChanges.get(branchId) || {};
        pendingChanges.set(branchId, { ...existing, ...changes });
        updateSaveBar();
        renderTree(); // Re-render to show pending indicators
        
        // Re-select current branch to maintain selection
        if (selectedBranch) {
            setTimeout(() => {
                const item = hierarchyTree.querySelector(`.tree-item[data-branch-id="${selectedBranch.id}"]`);
                if (item) item.classList.add('selected');
            }, 0);
        }
    }

    function updateSaveBar() {
        const hasChanges = pendingChanges.size > 0;
        saveBar.style.display = hasChanges ? 'flex' : 'none';
        saveBtn.disabled = !hasChanges;
    }

    function applyCurrentChanges() {
        if (!selectedBranch) return;
        AppNotify.info('Changes tracked. Click "Save Changes" to persist.');
    }

    // ==================== SAVE/CANCEL ====================

    async function saveAllChanges() {
        if (pendingChanges.size === 0) return;

        try {
            saveBtn.disabled = true;
            saveAllBtn.disabled = true;
            saveAllBtn.innerHTML = '<i class="uil-spinner-alt spin"></i> Saving...';

            // Build hierarchy array
            const hierarchy = [];
            
            for (const [branchId, changes] of pendingChanges) {
                // Handle HQ changes first
                if (changes.is_headquarters === true) {
                    await API.post(`/branches/hierarchy/headquarters/${branchId}`);
                }
                
                // Handle parent changes
                if (changes.parent_id !== undefined) {
                    hierarchy.push({
                        branch_id: branchId,
                        parent_id: changes.parent_id
                    });
                }
            }

            // Send hierarchy updates
            if (hierarchy.length > 0) {
                await API.put('/branches/hierarchy/update', { hierarchy });
            }

            AppNotify.success('Branch hierarchy saved successfully!');
            pendingChanges.clear();
            updateSaveBar();
            
            // Reload branches to get updated data
            await loadBranches();
            
            // Re-select the branch if one was selected
            if (selectedBranch) {
                selectBranch(selectedBranch.id);
            }

        } catch (error) {
            console.error('Error saving hierarchy:', error);
            AppNotify.error('Failed to save changes: ' + (error.message || 'Unknown error'));
        } finally {
            saveBtn.disabled = false;
            saveAllBtn.disabled = false;
            saveAllBtn.innerHTML = '<i class="uil-save"></i> Save All Changes';
        }
    }

    function cancelChanges() {
        pendingChanges.clear();
        updateSaveBar();
        renderTree();
        
        // Re-populate form if branch selected
        if (selectedBranch) {
            const branch = branches.find(b => b.id === selectedBranch.id);
            if (branch) populateConfigForm(branch);
        }
        
        AppNotify.info('Changes discarded');
    }

    // ==================== UTILITIES ====================

    function showLoading(show) {
        loadingTree.style.display = show ? 'flex' : 'none';
        hierarchyTree.style.display = show ? 'none' : 'block';
    }

    function showEmptyState() {
        loadingTree.style.display = 'none';
        hierarchyTree.style.display = 'none';
        emptyTree.style.display = 'block';
    }
});
