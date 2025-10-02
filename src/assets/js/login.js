// // src/assets/js/login.js
// document.addEventListener('DOMContentLoaded', () => {
//     const loginForm = document.getElementById('login-form');
//     const errorElement = document.getElementById('error');

//     const showError = (message) => {
//         errorElement.textContent = message;
//         errorElement.style.display = 'block';
//     };

//     const clearError = () => {
//         errorElement.textContent = '';
//         errorElement.style.display = 'none';
//     };

//     if (loginForm) {
//         loginForm.addEventListener('submit', async (event) => {
//             event.preventDefault();

//             clearError();

//             const email = document.getElementById('email').value;
//             const password = document.getElementById('password').value;

//             try {
//                 // The API call is the same, but the response no longer contains tokens
//                 const response = await fetch('/api/auth/login', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ email, password }),
//                 });

//                 if (response.ok) {
//                     // The tokens have been set as HttpOnly cookies by the server.
//                     // We don't need to do anything here. Just redirect.
//                     window.location.href = '/dashboard';
//                 } else {
//                     const data = await response.json();
//                     showError(data.error || 'Login failed. Please try again.');
//                 }
//             } catch (error) {
//                 console.error('Error during login:', error);
//                 showError('A network error occurred. Please try again later.');
//             }
//         });
//     }
// });

// public/assets/js/login.js

document.getElementById('login-button').addEventListener('click', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('error');
    errorElement.textContent = '';

    console.log('Login button clicked with email:', email);

    

    try {
        const payload = { email, password };
        const response = await API.post('/auth/login', payload);
        
        // Login successful - redirect logic is handled server-side 
        // using the 'returnTo' session variable, but we redirect to the dashboard as a fallback.
        window.location.href = '/dashboard'; 

    } catch (error) {
        errorElement.textContent = error.message || 'Login failed. Please check your credentials.';
        errorElement.style.color = 'red';
    }
});