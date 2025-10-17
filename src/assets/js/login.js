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