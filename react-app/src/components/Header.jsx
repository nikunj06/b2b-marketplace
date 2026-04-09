import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header({ isAuthenticated, user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="navbar">
          <Link to="/" className="nav-brand">
            🏪 B2B Marketplace
          </Link>

          <ul className="nav-menu">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            
            {isAuthenticated && user?.role === 'buyer' && (
              <li><Link to="/buyer/dashboard">My RFQs</Link></li>
            )}
            
            {isAuthenticated && user?.role === 'manufacturer' && (
              <li><Link to="/manufacturer/dashboard">RFQs</Link></li>
            )}
            
            {isAuthenticated && (
              <li><Link to="/orders">Orders</Link></li>
            )}
          </ul>

          <div className="nav-auth">
            {isAuthenticated ? (
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>
                  {user?.company_name || user?.name}
                </span>
                <button 
                  className="btn btn-outline btn-small"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/login" className="btn btn-outline btn-small">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-small">
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
