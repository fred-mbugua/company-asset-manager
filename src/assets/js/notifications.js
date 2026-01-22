/**
 * AppNotify - Global Notification and Confirmation Dialog System
 * Provides consistent UX for messages and confirmations across the application
 */

const AppNotify = {
    // Default configuration
    defaultDuration: 4000,
    
    /**
     * Show a notification toast
     * @param {string} message - The message to display
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {object} options - Optional settings: { title, duration, closable }
     */
    show(message, type = 'info', options = {}) {
        const container = document.getElementById('notification-container');
        if (!container) {
            console.warn('Notification container not found. Make sure notifications.ejs is included.');
            // Fallback to legacy message box if available
            const messageBox = document.getElementById('form-message');
            if (messageBox) {
                messageBox.textContent = message;
                messageBox.className = 'message ' + type;
                setTimeout(() => {
                    messageBox.textContent = '';
                    messageBox.className = 'message';
                }, this.defaultDuration);
            }
            return;
        }

        const { 
            title = this.getDefaultTitle(type),
            duration = this.defaultDuration,
            closable = true 
        } = options;

        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        
        toast.innerHTML = `
            <i class="notification-icon ${this.getIcon(type)}"></i>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            ${closable ? '<button class="notification-close" aria-label="Close"><i class="uil uil-times"></i></button>' : ''}
        `;

        container.appendChild(toast);

        // Close button handler
        if (closable) {
            const closeBtn = toast.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => this.dismiss(toast));
        }

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => this.dismiss(toast), duration);
        }

        return toast;
    },

    /**
     * Dismiss a notification toast
     * @param {HTMLElement} toast - The toast element to dismiss
     */
    dismiss(toast) {
        if (!toast || toast.classList.contains('hiding')) return;
        
        toast.classList.add('hiding');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },

    /**
     * Clear all notifications
     */
    clearAll() {
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    },

    /**
     * Show success notification
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    },

    /**
     * Show error notification
     */
    error(message, options = {}) {
        return this.show(message, 'error', { duration: 6000, ...options });
    },

    /**
     * Show warning notification
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    },

    /**
     * Show info notification
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    },

    /**
     * Get icon class for notification type
     */
    getIcon(type) {
        const icons = {
            success: 'uil uil-check-circle',
            error: 'uil uil-times-circle',
            warning: 'uil uil-exclamation-triangle',
            info: 'uil uil-info-circle'
        };
        return icons[type] || icons.info;
    },

    /**
     * Get default title for notification type
     */
    getDefaultTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        return titles[type] || '';
    }
};

/**
 * AppConfirm - Custom Confirmation Dialog
 * Returns a Promise that resolves to true (confirmed) or false (cancelled)
 */
const AppConfirm = {
    /**
     * Show confirmation dialog
     * @param {string} message - The confirmation message
     * @param {object} options - Optional settings
     * @returns {Promise<boolean>} - Resolves true if confirmed, false if cancelled
     */
    show(message, options = {}) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('confirm-dialog');
            const titleEl = document.getElementById('confirm-dialog-title');
            const messageEl = document.getElementById('confirm-dialog-message');
            const iconEl = document.getElementById('confirm-dialog-icon');
            const headerEl = overlay.querySelector('.confirm-dialog-header');
            const confirmBtn = document.getElementById('confirm-dialog-confirm');
            const cancelBtn = document.getElementById('confirm-dialog-cancel');

            if (!overlay) {
                console.warn('Confirmation dialog not found. Make sure notifications.ejs is included.');
                // Fallback to native confirm
                resolve(confirm(message));
                return;
            }

            const {
                title = 'Confirm Action',
                type = 'warning', // 'warning', 'danger', 'info', 'success'
                confirmText = 'Confirm',
                cancelText = 'Cancel',
                confirmClass = type === 'danger' ? 'danger' : '',
                icon = this.getIcon(type)
            } = options;

            // Set content
            titleEl.textContent = title;
            messageEl.textContent = message;
            iconEl.className = icon;
            
            // Set header type
            headerEl.className = 'confirm-dialog-header';
            if (type) headerEl.classList.add(type);
            
            // Set button text and class
            confirmBtn.innerHTML = `<i class="uil uil-check"></i> ${confirmText}`;
            confirmBtn.className = 'btn-dialog btn-dialog-confirm';
            if (confirmClass) confirmBtn.classList.add(confirmClass);
            
            cancelBtn.innerHTML = `<i class="uil uil-times"></i> ${cancelText}`;

            // Show dialog
            overlay.classList.add('showing');
            document.body.style.overflow = 'hidden';
            
            // Trigger reflow for animation
            void overlay.offsetWidth;
            overlay.classList.add('visible');

            // Cleanup function
            const cleanup = () => {
                overlay.classList.remove('visible');
                setTimeout(() => {
                    overlay.classList.remove('showing');
                    document.body.style.overflow = '';
                }, 200);
                confirmBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);
                document.removeEventListener('keydown', onKeydown);
            };

            // Event handlers
            const onConfirm = () => {
                cleanup();
                resolve(true);
            };

            const onCancel = () => {
                cleanup();
                resolve(false);
            };

            const onKeydown = (e) => {
                if (e.key === 'Escape') {
                    onCancel();
                } else if (e.key === 'Enter') {
                    onConfirm();
                }
            };

            // Attach event listeners
            confirmBtn.addEventListener('click', onConfirm);
            cancelBtn.addEventListener('click', onCancel);
            document.addEventListener('keydown', onKeydown);

            // Focus confirm button
            setTimeout(() => confirmBtn.focus(), 100);
        });
    },

    /**
     * Show delete confirmation (danger style)
     */
    delete(message, options = {}) {
        return this.show(message, {
            title: 'Confirm Delete',
            type: 'danger',
            confirmText: 'Delete',
            confirmClass: 'danger',
            icon: 'uil uil-trash-alt',
            ...options
        });
    },

    /**
     * Show warning confirmation
     */
    warn(message, options = {}) {
        return this.show(message, {
            title: 'Warning',
            type: 'warning',
            icon: 'uil uil-exclamation-triangle',
            ...options
        });
    },

    /**
     * Get icon class for confirmation type
     */
    getIcon(type) {
        const icons = {
            warning: 'uil uil-exclamation-triangle',
            danger: 'uil uil-exclamation-octagon',
            info: 'uil uil-info-circle',
            success: 'uil uil-check-circle'
        };
        return icons[type] || icons.warning;
    }
};

// Legacy support - override global alert with AppNotify
window.showAlert = function(message, type = 'info') {
    AppNotify.show(message, type);
};

// Legacy support - override for showMessage if used
window.showMessage = function(message, type = 'info') {
    // First try to update legacy message box if it exists
    const messageBox = document.getElementById('form-message');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.className = 'message ' + type;
    }
    // Also show toast notification
    AppNotify.show(message, type);
};

// Make globally available
window.AppNotify = AppNotify;
window.AppConfirm = AppConfirm;
