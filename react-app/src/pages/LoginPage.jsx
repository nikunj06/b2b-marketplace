import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(formData.email, formData.password);
      const { user } = response.data;
      
      if (user && user.user_id) {
        // Token is stored in HTTP-only cookie by backend
        // Store user data in localStorage for client-side access
        localStorage.setItem('user', JSON.stringify(user));
        
        onLoginSuccess(user);
        
        // Redirect based on role
        if (user.role === 'manufacturer') {
          navigate('/manufacturer/dashboard');
        } else {
          navigate('/buyer/dashboard');
        }
      } else {
        setError('Login failed: No user data returned');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 200px)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card">
          <div className="card-header" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '28px', margin: '0' }}>Login</h1>
            <p style={{ fontSize: '14px', color: '#666', margin: '10px 0 0 0' }}>
              Sign in to your account
            </p>
          </div>

          <div className="card-body">
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
                style={{ padding: '12px', fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '20px' }}>
              <p style={{ color: '#666' }}>
                Don't have an account? <Link to="/register" style={{ color: '#0066cc', fontWeight: '600' }}>Register here</Link>
              </p>
            </div>

            <div style={{ 
              padding: '15px', 
              backgroundColor: '#f0f5ff', 
              borderRadius: '6px',
              fontSize: '12px',
              color: '#0066cc'
            }}>
              <strong>Demo Credentials:</strong>
              <p style={{ marginTop: '5px', marginBottom: '3px' }}>Buyer: buyer@example.com / buyer123</p>
              <p>Manufacturer: mfg@example.com / mfg123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
