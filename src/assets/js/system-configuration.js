// System Configuration Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    let currentConfig = {};
    
    // Handle session expiry
    function handleSessionExpired(message = 'Your session has expired. Please login again.') {
        if (typeof AppNotify !== 'undefined') {
            AppNotify.warning(message);
            setTimeout(() => { window.location.href = '/login'; }, 2000);
        } else if (typeof toastr !== 'undefined') {
            toastr.warning(message, 'Session Expired', {
                timeOut: 3000,
                onHidden: () => { window.location.href = '/login'; }
            });
        } else {
            AppNotify.warning(message);
            window.location.href = '/login';
        }
    }

    // Wrapper for fetch with session handling
    async function secureFetch(url, options = {}) {
        const response = await fetch(url, options);
        
        if (response.status === 401) {
            let message = 'Your session has expired. Please login again.';
            try {
                const data = await response.clone().json();
                message = data.message || message;
            } catch (e) {}
            handleSessionExpired(message);
            throw new Error('Session expired');
        }
        
        return response;
    }
    
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
                showMessage('error', 'File size must be less than 5MB');
                logoInput.value = '';
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showMessage('error', 'Please select an image file');
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
                showMessage('error', 'Please fill in all Firebase configuration fields');
                return;
            }
        }

        await updateConfiguration(formData);
    });

    // Email Settings Form Submit
    document.getElementById('emailSettingsForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            smtp_host: document.getElementById('smtp_host').value || null,
            smtp_port: document.getElementById('smtp_port').value ? parseInt(document.getElementById('smtp_port').value) : null,
            smtp_secure: document.getElementById('smtp_secure').checked,
            smtp_user: document.getElementById('smtp_user').value || null,
            smtp_password: document.getElementById('smtp_password').value || null,
            smtp_from_name: document.getElementById('smtp_from_name').value || null,
            smtp_from_email: document.getElementById('smtp_from_email').value || null
        };

        await updateConfiguration(formData);
    });

    // Send Test Email
    document.getElementById('send-test-email').addEventListener('click', async function() {
        const testEmail = document.getElementById('test_email').value;
        const resultDiv = document.getElementById('test-email-result');
        
        if (!testEmail) {
            showMessage('error', 'Please enter a test email address');
            return;
        }

        // Show loading state
        resultDiv.style.display = 'block';
        resultDiv.className = 'test-result loading';
        resultDiv.innerHTML = '<i class="uil uil-spinner-alt"></i> Sending test email...';
        this.disabled = true;

        try {
            const response = await secureFetch('/api/system-config/test-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: testEmail })
            });

            const result = await response.json();

            if (response.ok) {
                resultDiv.className = 'test-result success';
                resultDiv.innerHTML = '<i class="uil uil-check-circle"></i> Test email sent successfully! Please check your inbox.';
            } else {
                resultDiv.className = 'test-result error';
                resultDiv.innerHTML = `<i class="uil uil-times-circle"></i> ${result.message || 'Failed to send test email'}`;
            }
        } catch (error) {
            resultDiv.className = 'test-result error';
            resultDiv.innerHTML = '<i class="uil uil-times-circle"></i> Failed to send test email. Please check your SMTP configuration.';
        }

        this.disabled = false;
    });

    // Security Settings Form Submit
    document.getElementById('securitySettingsForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            auto_send_password: document.getElementById('auto_send_password').checked
        };

        await updateConfiguration(formData);
    });

    // Auto-send password toggle handler
    const autoSendPasswordCheckbox = document.getElementById('auto_send_password');
    autoSendPasswordCheckbox.addEventListener('change', function() {
        const emailSettings = document.getElementById('email-notification-settings');
        if (this.checked) {
            emailSettings.style.display = 'block';
        } else {
            emailSettings.style.display = 'none';
        }
    });

    // Load configuration from API
    async function loadConfiguration() {
        try {
            const response = await secureFetch('/api/system-config/');

            if (!response.ok) {
                throw new Error('Failed to load configuration');
            }

            const result = await response.json();
            currentConfig = result.data;

            // Populate form fields
            populateForm(currentConfig);
        } catch (error) {
            console.error('Error loading configuration:', error);
            showMessage('error', 'Failed to load configuration');
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

        // Email Settings
        document.getElementById('smtp_host').value = config.smtp_host || '';
        document.getElementById('smtp_port').value = config.smtp_port || '';
        document.getElementById('smtp_secure').checked = config.smtp_secure || false;
        document.getElementById('smtp_user').value = config.smtp_user || '';
        // Don't populate password for security, just show placeholder if set
        if (config.smtp_password) {
            document.getElementById('smtp_password').placeholder = '••••••••••••';
        }
        document.getElementById('smtp_from_name').value = config.smtp_from_name || '';
        document.getElementById('smtp_from_email').value = config.smtp_from_email || '';

        // Security Settings
        const autoSendPassword = config.auto_send_password || false;
        document.getElementById('auto_send_password').checked = autoSendPassword;
        if (autoSendPassword) {
            document.getElementById('email-notification-settings').style.display = 'block';
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
            const response = await secureFetch('/api/system-config/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to update configuration');
            }

            const result = await response.json();
            showMessage('success', 'Configuration updated successfully');
            
            // Update current config
            currentConfig = result.data;

            // Reload page to apply changes (especially for app name)
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error updating configuration:', error);
            showMessage('error', 'Failed to update configuration');
        }
    }

    // Upload logo
    async function uploadLogo(file) {
        try {
            const formData = new FormData();
            formData.append('logo', file);

            const response = await secureFetch('/api/system-config/upload-logo', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload logo');
            }

            const result = await response.json();
            showMessage('success', 'Logo uploaded successfully');
            
            // Update current config with new logo URL
            currentConfig.company_logo_url = result.data.logo_url;
        } catch (error) {
            console.error('Error uploading logo:', error);
            showMessage('error', 'Failed to upload logo');
            
            // Reset logo preview
            logoPreview.classList.remove('visible');
            logoPlaceholder.style.display = 'block';
            logoInput.value = '';
        }
    }
});
// Toggle password visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('uil-eye');
        icon.classList.add('uil-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('uil-eye-slash');
        icon.classList.add('uil-eye');
    }
}

// Switch to a specific tab
function switchToTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove active class from all tabs and buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked button and corresponding content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}