// Shared Attachment Utilities
// This module provides reusable functions for handling attachments across different entities

const AttachmentManager = {
    /**
     * Initialize attachment functionality for an entity
     * @param {string} entityType - 'asset', 'expense', or 'assignment'
     * @param {number} entityId - The ID of the entity
     */
    init(entityType, entityId) {
        const fileInput = document.getElementById(`${entityType}-attachment-file-${entityId}`);
        const uploadLabel = fileInput?.nextElementSibling;
        const selectedFileDiv = uploadLabel?.nextElementSibling;
        const uploadBtn = document.querySelector(`[data-entity-type="${entityType}"][data-entity-id="${entityId}"].btn-upload-attachment`);
        const notesInput = document.getElementById(`${entityType}-attachment-notes-${entityId}`);

        if (!fileInput || !uploadBtn) return;

        // Handle file selection
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (10MB)
                if (file.size > 10 * 1024 * 1024) {
                    showMessage('File size must be less than 10MB', 'error');
                    fileInput.value = '';
                    return;
                }

                // Show selected file
                if (uploadLabel && selectedFileDiv) {
                    uploadLabel.style.display = 'none';
                    selectedFileDiv.style.display = 'flex';
                    selectedFileDiv.querySelector('.file-name').textContent = file.name;
                }
            }
        });

        // Clear file button
        const clearBtn = selectedFileDiv?.querySelector('.clear-file-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                fileInput.value = '';
                if (uploadLabel && selectedFileDiv) {
                    uploadLabel.style.display = 'flex';
                    selectedFileDiv.style.display = 'none';
                }
            });
        }

        // Upload button
        uploadBtn.addEventListener('click', async function() {
            const file = fileInput.files[0];
            if (!file) {
                showMessage('Please select a file to upload', 'error');
                return;
            }

            const notes = notesInput?.value || '';
            await AttachmentManager.uploadAttachment(entityType, entityId, file, notes);

            // Reset form
            fileInput.value = '';
            if (notesInput) notesInput.value = '';
            if (uploadLabel && selectedFileDiv) {
                uploadLabel.style.display = 'flex';
                selectedFileDiv.style.display = 'none';
            }

            // Reload attachments
            AttachmentManager.loadAttachments(entityType, entityId);
        });

        // Load existing attachments
        AttachmentManager.loadAttachments(entityType, entityId);
    },

    /**
     * Load and display attachments for an entity
     */
    async loadAttachments(entityType, entityId) {
        const listContainer = document.getElementById(`${entityType}-attachments-list-${entityId}`);
        if (!listContainer) return;

        try {
            const endpoint = entityType === 'asset' ? 'asset-attachments' : 
                           entityType === 'expense' ? 'expense-attachments' : 
                           'assignment-attachments';
            const response = await API.get(`/${endpoint}/${entityId}/attachments`);
            const attachments = response.data;

            if (attachments.length === 0) {
                listContainer.innerHTML = '<p class="no-attachments">No attachments yet. Upload your first file above.</p>';
                return;
            }

            listContainer.innerHTML = attachments.map(attachment => `
                <div class="attachment-item" data-attachment-id="${attachment.id}">
                    <i class="uil uil-file attachment-icon"></i>
                    <div class="attachment-info">
                        <div class="attachment-name">${attachment.file_name}</div>
                        <div class="attachment-meta">
                            <span><i class="uil uil-user"></i> ${attachment.uploader_name || 'Unknown'}</span>
                            <span style="margin-left: 1rem;"><i class="uil uil-clock"></i> <span data-datetime="${attachment.uploaded_at}"></span></span>
                            <span style="margin-left: 1rem;"><i class="uil uil-file-size"></i> ${AttachmentManager.formatFileSize(attachment.file_size)}</span>
                        </div>
                        ${attachment.notes ? `<div class="attachment-notes"><i class="uil uil-notes"></i> ${attachment.notes}</div>` : ''}
                    </div>
                    <div class="attachment-actions">
                        <button class="btn-small btn-download" onclick="AttachmentManager.downloadAttachment('${attachment.file_path}', '${attachment.file_name}')">
                            <i class="uil uil-download-alt"></i> Download
                        </button>
                        <button class="btn-small btn-delete-attachment" onclick="AttachmentManager.deleteAttachment('${entityType}', ${entityId}, ${attachment.id})">
                            <i class="uil uil-trash-alt"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');

            // Format dates
            listContainer.querySelectorAll('[data-datetime]').forEach(el => {
                const datetime = el.getAttribute('data-datetime');
                el.textContent = DateUtils.formatDateTime(datetime);
            });

        } catch (error) {
            console.error('Error loading attachments:', error);
            listContainer.innerHTML = '<p class="no-attachments">Error loading attachments</p>';
        }
    },

    /**
     * Upload an attachment
     */
    async uploadAttachment(entityType, entityId, file, notes) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (notes) {
                formData.append('notes', notes);
            }

            const endpoint = entityType === 'asset' ? 'asset-attachments' : 
                           entityType === 'expense' ? 'expense-attachments' : 
                           'assignment-attachments';
            const response = await fetch(`/api/${endpoint}/${entityId}/attachments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Upload failed');
            }

            const result = await response.json();
            showMessage(result.message || 'Attachment uploaded successfully', 'success');
            return result.data;
        } catch (error) {
            console.error('Error uploading attachment:', error);
            showMessage(error.message || 'Failed to upload attachment', 'error');
            throw error;
        }
    },

    /**
     * Delete an attachment
     */
    async deleteAttachment(entityType, entityId, attachmentId) {
        if (!confirm('Are you sure you want to delete this attachment?')) {
            return;
        }

        try {
            const endpoint = entityType === 'asset' ? 'asset-attachments' : 
                           entityType === 'expense' ? 'expense-attachments' : 
                           'assignment-attachments';
            const response = await API.delete(`/${endpoint}/attachments/${attachmentId}`);
            
            showMessage(response.message || 'Attachment deleted successfully', 'success');
            
            // Reload attachments
            AttachmentManager.loadAttachments(entityType, entityId);
        } catch (error) {
            console.error('Error deleting attachment:', error);
            showMessage(error.message || 'Failed to delete attachment', 'error');
        }
    },

    /**
     * Download an attachment
     */
    downloadAttachment(filePath, fileName) {
        // For server storage, filePath is relative URL
        // For Firebase, filePath is full URL
        const link = document.createElement('a');
        link.href = filePath;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
};

// Make AttachmentManager available globally
window.AttachmentManager = AttachmentManager;
