// System Configuration Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    let currentConfig = {};
    
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Remove active class from all tabs and buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // Load configuration on page load
    loadConfiguration();

    // Storage type radio change handler
    const storageTypeRadios = document.querySelectorAll('input[name="storage_type"]');
    storageTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const firebaseSettings = document.getElementById('firebase-settings');
            if (this.value === 'firebase') {
                firebaseSettings.style.display = 'block';
            } else {
                firebaseSettings.style.display = 'none';
            }
        });
    });

    // Logo upload preview
    const logoInput = document.getElementById('company_logo');
    const logoPreview = document.getElementById('logo_preview');
    const logoPlaceholder = document.getElementById('logo_placeholder');

    logoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                showMessage('File size must be less than 5MB', 'error');
                logoInput.value = '';
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showMessage('Please select an image file', 'error');
                logoInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                logoPreview.src = e.target.result;
                logoPreview.classList.add('visible');
                logoPlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(file);

            // Upload logo immediately
            uploadLogo(file);
        }
    });

    // General Settings Form Submit
    document.getElementById('generalSettingsForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            app_name: document.getElementById('app_name').value
        };

        await updateConfiguration(formData);
    });

    // Company Info Form Submit
    document.getElementById('companyInfoForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            company_email: document.getElementById('company_email').value,
            company_phone: document.getElementById('company_phone').value,
            company_address: document.getElementById('company_address').value
        };

        await updateConfiguration(formData);
    });

    // Storage Settings Form Submit
    document.getElementById('storageSettingsForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const storageType = document.querySelector('input[name="storage_type"]:checked').value;
        
        const formData = {
            storage_type: storageType
        };

        // If Firebase is selected, include Firebase configuration
        if (storageType === 'firebase') {
            formData.firebase_api_key = document.getElementById('firebase_api_key').value;
            formData.firebase_auth_domain = document.getElementById('firebase_auth_domain').value;
            formData.firebase_project_id = document.getElementById('firebase_project_id').value;
            formData.firebase_storage_bucket = document.getElementById('firebase_storage_bucket').value;
            formData.firebase_messaging_sender_id = document.getElementById('firebase_messaging_sender_id').value;
            formData.firebase_app_id = document.getElementById('firebase_app_id').value;

            // Validate Firebase fields
            if (!formData.firebase_api_key || !formData.firebase_auth_domain || 
                !formData.firebase_project_id || !formData.firebase_storage_bucket) {
                showMessage('Please fill in all Firebase configuration fields', 'error');
                return;
            }
        }

        await updateConfiguration(formData);
    });

    // Load configuration from API
    async function loadConfiguration() {
        try {
            const response = await fetch('/api/system-config/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load configuration');
            }

            const result = await response.json();
            currentConfig = result.data;

            // Populate form fields
            populateForm(currentConfig);
        } catch (error) {
            console.error('Error loading configuration:', error);
            showMessage('Failed to load configuration', 'error');
        }
    }

    // Populate form with configuration data
    function populateForm(config) {
        // General Settings
        document.getElementById('app_name').value = config.app_name || '';

        // Company Information
        document.getElementById('company_email').value = config.company_email || '';
        document.getElementById('company_phone').value = config.company_phone || '';
        document.getElementById('company_address').value = config.company_address || '';

        // Logo
        if (config.company_logo_url) {
            logoPreview.src = config.company_logo_url;
            logoPreview.classList.add('visible');
            logoPlaceholder.style.display = 'none';
        }

        // Storage Settings
        const storageType = config.storage_type || 'server';
        document.querySelector(`input[name="storage_type"][value="${storageType}"]`).checked = true;
        
        if (storageType === 'firebase') {
            document.getElementById('firebase-settings').style.display = 'block';
            document.getElementById('firebase_api_key').value = config.firebase_api_key || '';
            document.getElementById('firebase_auth_domain').value = config.firebase_auth_domain || '';
            document.getElementById('firebase_project_id').value = config.firebase_project_id || '';
            document.getElementById('firebase_storage_bucket').value = config.firebase_storage_bucket || '';
            document.getElementById('firebase_messaging_sender_id').value = config.firebase_messaging_sender_id || '';
            document.getElementById('firebase_app_id').value = config.firebase_app_id || '';
        }
    }

    // Update configuration via API
    async function updateConfiguration(data) {
        try {
            const response = await fetch('/api/system-config/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to update configuration');
            }

            const result = await response.json();
            showMessage('Configuration updated successfully', 'success');
            
            // Update current config
            currentConfig = result.data;

            // Reload page to apply changes (especially for app name)
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error updating configuration:', error);
            showMessage('Failed to update configuration', 'error');
        }
    }

    // Upload logo
    async function uploadLogo(file) {
        try {
            const formData = new FormData();
            formData.append('logo', file);

            const response = await fetch('/api/system-config/upload-logo', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload logo');
            }

            const result = await response.json();
            showMessage('Logo uploaded successfully', 'success');
            
            // Update current config with new logo URL
            currentConfig.company_logo_url = result.data.logo_url;
        } catch (error) {
            console.error('Error uploading logo:', error);
            showMessage('Failed to upload logo', 'error');
            
            // Reset logo preview
            logoPreview.classList.remove('visible');
            logoPlaceholder.style.display = 'block';
            logoInput.value = '';
        }
    }
});
