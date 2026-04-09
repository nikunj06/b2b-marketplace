import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

function RegisterPage({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('role'); // role | details
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    role: 'buyer',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company_name: '',
    phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role: role
    }));
    setStep('details');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.company_name) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        company_name: formData.company_name,
        phone: formData.phone,
        role: formData.role
      });

      const { data } = response;

      if (data.success) {
        // Registration successful - direct to login
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
      <div style={{ width: '100%', maxWidth: '450px' }}>
        <div className="card">
          <div className="card-header" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '28px', margin: '0' }}>Create Account</h1>
            <p style={{ fontSize: '14px', color: '#666', margin: '10px 0 0 0' }}>
              Join the B2B marketplace
            </p>
          </div>

          <div className="card-body">
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success" style={{ marginBottom: '20px' }}>
                {success}
              </div>
            )}

            {step === 'role' ? (
              <div>
                <p style={{ marginBottom: '20px', color: '#666', textAlign: 'center' }}>
                  I want to join as:
                </p>

                <div style={{ display: 'grid', gap: '15px' }}>
                  <div
                    onClick={() => handleRoleSelect('buyer')}
                    style={{
                      padding: '20px',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0066cc'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
                    <h3 style={{ margin: '0 0 10px 0' }}>Buyer</h3>
                    <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>
                      Search products & request quotes
                    </p>
                  </div>

                  <div
                    onClick={() => handleRoleSelect('manufacturer')}
                    style={{
                      padding: '20px',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0066cc'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📦</div>
                    <h3 style={{ margin: '0 0 10px 0' }}>Manufacturer</h3>
                    <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>
                      Submit quotes & receive orders
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f0f5ff', borderRadius: '6px', textAlign: 'center', fontSize: '13px', color: '#0066cc' }}>
                  Registering as: <strong>{formData.role === 'buyer' ? 'Buyer' : 'Manufacturer'}</strong>
                  <button
                    type="button"
                    onClick={() => setStep('role')}
                    style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Change
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    name="company_name"
                    className="form-input"
                    placeholder="Company name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
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
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="+91-XXXXX-XXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
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

                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
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
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            <div style={{ textAlign: 'center', fontSize: '14px' }}>
              <p style={{ color: '#666' }}>
                Already have an account? <Link to="/login" style={{ color: '#0066cc', fontWeight: '600' }}>Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
