// public/assets/js/message.js

/**
 * Displays a dynamic message (success or error) in the global container.
 * @param {string} type - 'success' or 'error'
 * @param {string} text - The message text
 */
function showMessage(type, text) {
    const container = document.getElementById('dynamic-message-container');
    if (!container) return;

    // Create the message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `app-message app-message-${type}`;
    messageDiv.textContent = text;

    // Append to container
    container.appendChild(messageDiv);

    // Set a timeout to remove the message
    setTimeout(() => {
        messageDiv.classList.add('fade-out'); // Add fade-out class (needs CSS)
        setTimeout(() => {
            messageDiv.remove();
        }, 500); // Wait for fade-out transition
    }, 5000); // 5 seconds display time
}
