 // Sidebar toggle for mobile
 const sidebar = document.getElementById("sidebar");
 const toggleBtn = document.querySelector(".menu-toggle");

 toggleBtn.addEventListener("click", () => {
   sidebar.classList.toggle("open");
 });

 // Accordion logic for main menu items
 const items = document.querySelectorAll(".has-sub");
 items.forEach(item => {
   item.addEventListener("click", () => {
     items.forEach(i => {
       if (i !== item) i.classList.remove("active");
     });
     item.classList.toggle("active");
   });
 });

 // Add click event for top-level menu items like Dashboard
 const topLevelItems = document.querySelectorAll("#menu > li:not(.has-sub)");
 topLevelItems.forEach(item => {
   item.addEventListener("click", () => {
     const contentType = item.getAttribute("data-content");
     if (contentType) loadContent(contentType);
     sidebar.classList.remove("open"); // close sidebar after click on mobile
   });
 });

 // Dynamic content loading for submenu items
 const submenuItems = document.querySelectorAll(".submenu li");
 submenuItems.forEach(item => {
   item.addEventListener("click", (e) => {
     e.stopPropagation();
     const contentType = item.getAttribute("data-content");
     loadContent(contentType);
     sidebar.classList.remove("open"); // close sidebar after click
   });
 });

 async function loadDashboard(content) {
   try {
     const assetsRes = await apiFetch("/assets");
     let assets = [];
     if (assetsRes.ok) assets = await assetsRes.json();

     const expRes = await apiFetch("/expenses");
     let expenses = [];
     if (expRes.ok) expenses = await expRes.json();

     const totalAssets = assets.length;
     const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

     content.innerHTML = `
       <h2>Dashboard</h2>
       <div class="card">Total Assets: ${totalAssets}</div>
       <div class="card">Total Expenses: $${totalExpenses.toFixed(2)}</div>
     `;
   } catch (err) {
     console.error("Error loading dashboard:", err);
     content.innerHTML = `<h2>Dashboard</h2><p style="color:red;">Failed to load data</p>`;
   }
 }

 function loadContent(contentType) {
   const content = document.getElementById('dashboard-content');
   const currentPage = content.getAttribute("data-current-page");

   if (currentPage === contentType) {
     console.log(`Module ${contentType} already loaded, skipping reload`);
     return;
   }

   content.innerHTML = '<div class="loading">Loading...</div>';
   content.setAttribute("data-current-page", contentType);

   if (contentType === 'dashboard') {
     loadDashboard(content);
     return;
   }

   const routes = {
'create-assets': 'create-assets.html',
'view-assets': 'view-assets.html',
'assign-assets': 'assign-assets.html',
'create-expenses': 'create-expenses.html',
'reports': 'reports.html',
'create-users': 'create-user.html',
'edit-assets': 'edit-assets.html',
};


   const filePath = routes[contentType];
   if (!filePath) {
     content.innerHTML = `<h2>Content Not Found</h2><p>Submodule for ${contentType} is under development.</p>`;
     return;
   }

   fetch(filePath + '?_=' + Date.now(), { cache: 'no-store' })
     .then(res => {
       if (!res.ok) throw new Error(`File not found: ${filePath}`);
       return res.text();
     })
     .then(html => {
       const parser = new DOMParser();
       const doc = parser.parseFromString(html, 'text/html');
       const bodyEl = doc.querySelector('body');
       content.innerHTML = bodyEl ? bodyEl.innerHTML : html;

       document.querySelectorAll('style[data-page-style], link[data-page-style]').forEach(n => n.remove());
       doc.querySelectorAll('head style').forEach(s => {
         const injected = document.createElement('style');
         injected.setAttribute('data-page-style', 'true');
         injected.textContent = s.textContent;
         document.head.appendChild(injected);
       });
       doc.querySelectorAll('head link[rel="stylesheet"]').forEach(l => {
         const injected = document.createElement('link');
         injected.rel = 'stylesheet';
         injected.href = l.getAttribute('href');
         injected.setAttribute('data-page-style', 'true');
         document.head.appendChild(injected);
       });
       doc.querySelectorAll('script').forEach(old => {
         const s = document.createElement('script');
         if (old.src) {
           s.src = old.src + '?_=' + Date.now();
         } else {
           s.textContent = old.textContent;
         }
         document.body.appendChild(s);
         setTimeout(() => s.remove(), 0);
       });

       window.dispatchEvent(new CustomEvent('moduleLoaded', { detail: { module: contentType } }));
     })
     .catch(error => {
       content.innerHTML = `<div class="error">Error: ${error.message}</div>`;
       console.error(error);
     });
 }

 // Load default dashboard
 loadContent('dashboard');