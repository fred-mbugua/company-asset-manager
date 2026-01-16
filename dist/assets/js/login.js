document.getElementById('login-button').addEventListener('click', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('error');
    const loginButton = document.getElementById('login-button');
    
    // Clear previous error
    errorElement.textContent = '';
    errorElement.style.display = 'none';

    // Validate inputs
    if (!email || !password) {
        errorElement.textContent = 'Please enter both email and password.';
        errorElement.style.display = 'block';
        return;
    }

    // Disable button and show loading state
    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';

    try {
        const payload = { email, password };
        const response = await API.post('/auth/login', payload);
        
        // If we get here, login was successful (no error thrown)
        const redirectUrl = response.data?.returnTo || '/dashboard';
        window.location.href = redirectUrl;

    } catch (error) {
        // Display the error message
        errorElement.textContent = error.message || 'Login failed. Please check your credentials.';
        errorElement.style.display = 'block';
        
        // Re-enable the button
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
});