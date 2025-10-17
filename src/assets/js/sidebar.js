// public/assets/js/sidebar.js

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');

    if (!sidebar) return; // Exit if sidebar element isn't found

    /**
     * Toggles the visibility of the submenu when a parent link is clicked.
     * This handles the run-time expansion/collapse behavior.
     */
    sidebar.querySelectorAll('.has-sub > span, .has-sub > i').forEach(element => {
        // Find the closest parent li.has-sub
        const parentLi = element.closest('.has-sub');
        if (!parentLi) return;

        // Attach event listener to the parent span or icon
        element.addEventListener('click', (e) => {
            // Stop propagation to prevent any unintended link following
            e.stopPropagation(); 
            
            // Get the submenu element
            const submenu = parentLi.querySelector('.submenu');

            if (submenu) {
                // Toggle the 'expanded' class on the parent LI
                parentLi.classList.toggle('expanded');
                
                // Toggle display for the submenu for smooth transition (using CSS transitions is better, but inline works)
                if (submenu.style.display === 'block') {
                    // Collapse
                    submenu.style.display = 'none';
                } else {
                    // Expand
                    submenu.style.display = 'block';
                }
            }
        });
    });
    
    // Optional: Add event listener to the main LI to handle clicks anywhere on the header row
    sidebar.querySelectorAll('.has-sub').forEach(parentLi => {
        parentLi.addEventListener('click', (e) => {
            // If the click wasn't directly on an anchor link, simulate a click on the span/icon
            if (!e.target.closest('a') && !e.target.closest('.submenu')) {
                parentLi.querySelector('span')?.click();
            }
        });
    });

    /**
     * Ensure the initial expanded state is set correctly from EJS/CSS.
     * The EJS code already handles adding the 'expanded' class and inline style,
     * so this JS primarily provides the interactive toggle behavior.
     */
});