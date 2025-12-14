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
        
        // Redirect to the returnTo URL if available, otherwise to dashboard
        if (response.status !== 200) {
            throw new Error(response.data?.message || 'Login failed');
        }
        const redirectUrl = response.data?.returnTo || '/dashboard';
        window.location.href = redirectUrl;

    } catch (error) {
        errorElement.textContent = error.message || 'Login failed. Please check your credentials.';
        errorElement.style.color = 'red';
    }
});