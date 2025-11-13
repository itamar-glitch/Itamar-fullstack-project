// Use localhost when testing locally, or relative path when in containers
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'http://localhost:3000/api';

const showError = (elementId, message) => {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
    setTimeout(() => {
        errorElement.classList.remove('show');
    }, 5000);
};

const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

const showView = (viewId) => {
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('register-box').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById(viewId).style.display = 'block';
};

const loadProfile = async () => {
    const token = getToken();
    if (!token) {
        showView('login-box');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('user-id').textContent = data.user.id;
            document.getElementById('user-username').textContent = data.user.username;
            document.getElementById('user-email').textContent = data.user.email;
            document.getElementById('user-created').textContent = new Date(data.user.created_at).toLocaleDateString();
            showView('dashboard');
        } else {
            removeToken();
            showView('login-box');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showView('login-box');
    }
};

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            setToken(data.token);
            await loadProfile();
        } else {
            showError('login-error', data.error || 'Login failed');
        }
    } catch (error) {
        showError('login-error', 'Network error. Please try again.');
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showError('register-error', 'Registration successful! Please login.');
            document.getElementById('register-form').reset();
            setTimeout(() => {
                showView('login-box');
            }, 2000);
        } else {
            showError('register-error', data.error || 'Registration failed');
        }
    } catch (error) {
        showError('register-error', 'Network error. Please try again.');
    }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    const token = getToken();
    
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    removeToken();
    document.getElementById('login-form').reset();
    showView('login-box');
});

document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    showView('register-box');
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    showView('login-box');
});

// Check if user is already logged in on page load
window.addEventListener('DOMContentLoaded', () => {
    if (getToken()) {
        loadProfile();
    } else {
        showView('login-box');
    }
});

