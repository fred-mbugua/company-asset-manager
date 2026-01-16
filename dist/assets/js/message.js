// public/assets/js/message.js

/**
 * Ensures the dynamic message container exists inside the content-area
 * @returns {HTMLElement|null} The message container element
 */
function ensureMessageContainer() {
    let container = document.getElementById('dynamic-message-container');
    
    if (!container) {
        // Find the content-area section
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) return null;
        
        // Create the container
        container = document.createElement('div');
        container.id = 'dynamic-message-container';
        
        // Insert at the beginning of content-area
        contentArea.insertBefore(container, contentArea.firstChild);
    }
    
    return container;
}

/**
 * Closes a message with smooth animation
 * @param {HTMLElement} messageDiv - The message element to close
 */
function closeMessage(messageDiv) {
    if (!messageDiv || messageDiv.classList.contains('fade-out')) return;
    
    messageDiv.classList.add('fade-out');
    setTimeout(() => {
        messageDiv.remove();
    }, 300); // Wait for fade-out transition
}

/**
 * Displays a dynamic message (success or error) in the global container.
 * @param {string} type - 'success' or 'error'
 * @param {string} text - The message text
 */
function showMessage(type, text) {
    const container = ensureMessageContainer();
    if (!container) return;

    // Create the message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `app-message app-message-${type}`;
    
    // Create message text span
    const messageText = document.createElement('span');
    messageText.className = 'app-message-text';
    messageText.textContent = text;
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'app-message-close';
    closeBtn.innerHTML = '<i class="fa fa-times"></i>';
    closeBtn.setAttribute('aria-label', 'Close message');
    closeBtn.onclick = () => closeMessage(messageDiv);
    
    // Append elements
    messageDiv.appendChild(messageText);
    messageDiv.appendChild(closeBtn);

    // Append to container
    container.appendChild(messageDiv);
    
    // Trigger reflow for animation
    messageDiv.offsetHeight;
    messageDiv.classList.add('show');

    // Set a timeout to remove the message
    setTimeout(() => {
        closeMessage(messageDiv);
    }, 5000); // 5 seconds display time
}
