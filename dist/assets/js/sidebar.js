document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');

    if (!sidebar) {
        console.error('Sidebar element not found');
        return;
    }

    const currentPath = window.location.pathname;
    
    // Get the 'from' parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');

    // console.log('Sidebar initialized:', { currentPath, fromParam });

    /**
     * Initializing sidebar state on page load
     */
    function initializeSidebar() {
        // Finding all parent menus that have matching URLs
        const menusWithMatch = [];
        
        sidebar.querySelectorAll('.has-sub').forEach(parentLi => {
            const menuId = parentLi.getAttribute('data-menu-id');
            const hasMatch = parentLi.getAttribute('data-has-match') === 'true';
            
            if (hasMatch) {
                menusWithMatch.push({ element: parentLi, menuId: menuId });
            }
        });

        // console.log('Menus with match:', menusWithMatch.map(m => m.menuId));

        if (menusWithMatch.length === 0) {
            // console.log('No matching menus found');
            return;
        }

        // When there is a 'from' parameter, use it to determine which menu to expand
        if (fromParam) {
            const targetMenu = menusWithMatch.find(m => m.menuId === fromParam);
            
            if (targetMenu) {
                // console.log('Expanding menu from parameter:', fromParam);
                expandMenu(targetMenu.element);
                highlightActiveLink(targetMenu.element, currentPath);
                return;
            }
        }
        
        // Otherwise, expand the first matching menu
        // console.log('Expanding first matching menu');
        expandMenu(menusWithMatch[0].element);
        highlightActiveLink(menusWithMatch[0].element, currentPath);
    }

    /**
     * Expanding a specific menu
     */
    function expandMenu(parentLi) {
        console.log('Expanding menu:', parentLi.getAttribute('data-menu-id'));
        parentLi.classList.add('expanded');
        const submenu = parentLi.querySelector('.submenu');
        if (submenu) {
            submenu.style.display = 'block';
        }
    }

    /**
     * Highlighting the active link in a specific parent menu
     */
    function highlightActiveLink(parentLi, path) {
        const submenu = parentLi.querySelector('.submenu');
        if (!submenu) return;

        // console.log('Highlighting active link in menu for path:', path);
        
        submenu.querySelectorAll('li').forEach(li => {
            const link = li.querySelector('a');
            if (link) {
                const linkPath = new URL(link.href, window.location.origin).pathname;
                // console.log('Checking link:', linkPath, 'against', path);
                if (linkPath === path) {
                    // console.log('Adding active class to:', link.textContent);
                    li.classList.add('active');
                } else {
                    li.classList.remove('active');
                }
            }
        });
    }

    /**
     * Toggling the visibility of the submenu when a parent link is clicked.
     * This handles the run-time expansion/collapse behavior.
     */
    sidebar.querySelectorAll('.has-sub > span, .has-sub > i').forEach(element => {
        const parentLi = element.closest('.has-sub');
        if (!parentLi) return;

        element.addEventListener('click', (e) => {
            e.stopPropagation(); 
            
            const submenu = parentLi.querySelector('.submenu');

            if (submenu) {
                parentLi.classList.toggle('expanded');
                
                if (submenu.style.display === 'block') {
                    submenu.style.display = 'none';
                } else {
                    submenu.style.display = 'block';
                }
            }
        });
    });
    
    // Handling clicks anywhere on the parent LI
    sidebar.querySelectorAll('.has-sub').forEach(parentLi => {
        parentLi.addEventListener('click', (e) => {
            if (!e.target.closest('a') && !e.target.closest('.submenu')) {
                parentLi.querySelector('span')?.click();
            }
        });
    });

    // Initializing the sidebar on page load
    initializeSidebar();
});