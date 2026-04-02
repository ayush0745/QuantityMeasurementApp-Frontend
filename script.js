const API_BASE = 'quantitymeasurementapp-production.up.railway.app';

const loginTab   = document.getElementById('loginTab');
const signupTab  = document.getElementById('signupTab');
const loginForm  = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

function setActiveTab(isLogin) {
  loginTab.classList.toggle('active', isLogin);
  signupTab.classList.toggle('active', !isLogin);
  loginForm.classList.toggle('is-active', isLogin);
  signupForm.classList.toggle('is-active', !isLogin);
}

loginTab.addEventListener('click', () => setActiveTab(true));
signupTab.addEventListener('click', () => setActiveTab(false));

function showError(id, msg) {
  document.getElementById(id).textContent = msg;
}

async function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.innerHTML = loading ? '<span class="spinner"></span> Loading...' : btn.dataset.originalText || btn.innerHTML;
}

async function handleLogin() {
  const btn = document.getElementById('loginButton');
  if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerHTML;
  showError('loginError', '');
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) return showError('loginError', 'Please fill all fields');
  setLoading(btn, true);
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      window.location.href = 'index.html';
    } else {
      showError('loginError', data.message || 'Login failed');
    }
  } catch (e) {
    showError('loginError', 'Network error: ' + e.message);
  } finally {
    setLoading(btn, false);
  }
}

async function handleSignup() {
  const btn = document.getElementById('signupButton');
  if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerHTML;
  showError('signupError', '');
  const name     = document.getElementById('fullName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  if (!name || !email || !password) return showError('signupError', 'Please fill all fields');
  setLoading(btn, true);
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      window.location.href = 'index.html';
    } else {
      showError('signupError', data.message || 'Registration failed');
    }
  } catch (e) {
    showError('signupError', 'Network error: ' + e.message);
  } finally {
    setLoading(btn, false);
  }
}

document.getElementById('loginButton').addEventListener('click', handleLogin);
document.getElementById('signupButton').addEventListener('click', handleSignup);

document.querySelectorAll('.toggle-password').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const input = document.getElementById(toggle.dataset.target);
    input.type = input.type === 'password' ? 'text' : 'password';
    toggle.textContent = input.type === 'password' ? '👁' : '🙈';
  });
});

// Init — show login tab active
setActiveTab(true);
