document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');

    // Format dates
    const formatDateElements = document.querySelectorAll('.format-date');
    formatDateElements.forEach(el => {
        const dateStr = el.getAttribute('data-date');
        if (dateStr) {
            el.textContent = DateUtils.formatDateTime(dateStr);
        }
    });

    // Handle profile form submission (Admin only)
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                first_name: document.getElementById('first_name').value.trim(),
                middle_name: document.getElementById('middle_name').value.trim(),
                last_name: document.getElementById('last_name').value.trim(),
                phone: document.getElementById('phone').value.trim()
            };

            // Validation
            if (!formData.first_name || !formData.last_name) {
                AppNotify.warning('First name and last name are required.');
                return;
            }

            try {
                const response = await API.put('/users/profile', formData);
                if (response.success) {
                    AppNotify.success('Profile updated successfully!');
                    window.location.reload();
                } else {
                    AppNotify.error(response.message || 'Failed to update profile.');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                AppNotify.error('An error occurred while updating your profile.');
            }
        });
    }

    // Handle password change form (Admin only)
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentPassword = document.getElementById('current_password').value;
            const newPassword = document.getElementById('new_password').value;
            const confirmPassword = document.getElementById('confirm_password').value;

            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                AppNotify.warning('All password fields are required.');
                return;
            }

            if (newPassword !== confirmPassword) {
                AppNotify.warning('New password and confirm password do not match.');
                return;
            }

            if (newPassword.length < 6) {
                AppNotify.warning('New password must be at least 6 characters long.');
                return;
            }

            try {
                const response = await API.post('/users/change-password', {
                    current_password: currentPassword,
                    new_password: newPassword
                });

                if (response.success) {
                    AppNotify.success('Password changed successfully!');
                    passwordForm.reset();
                } else {
                    AppNotify.error(response.message || 'Failed to change password.');
                }
            } catch (error) {
                console.error('Error changing password:', error);
                AppNotify.error('An error occurred while changing your password.');
            }
        });
    }
});
