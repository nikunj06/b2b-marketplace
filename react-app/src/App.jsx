import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/App.css';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import RFQFormPage from './pages/RFQFormPage';
import BuyerDashboardPage from './pages/BuyerDashboardPage';
import ManufacturerDashboardPage from './pages/ManufacturerDashboardPage';
import OrdersPage from './pages/OrdersPage';

// Protected Route Component
const ProtectedRoute = ({ element, requiredRole = null }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return element;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in on app load
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setIsAuthenticated(true);
      setUser(currentUser);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        <Header 
          isAuthenticated={isAuthenticated} 
          user={user}
          onLogout={handleLogout}
        />
        
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />} 
            />
            <Route 
              path="/register" 
              element={<RegisterPage onRegisterSuccess={handleLoginSuccess} />} 
            />
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />

            {/* Protected Routes - Any authenticated user */}
            <Route 
              path="/rfq/:productId" 
              element={<ProtectedRoute element={<RFQFormPage />} />} 
            />
            <Route 
              path="/orders" 
              element={<ProtectedRoute element={<OrdersPage />} />} 
            />

            {/* Protected Routes - Buyer specific */}
            <Route 
              path="/buyer/dashboard" 
              element={
                <ProtectedRoute 
                  element={<BuyerDashboardPage />}
                  requiredRole="buyer"
                />
              } 
            />

            {/* Protected Routes - Manufacturer specific */}
            <Route 
              path="/manufacturer/dashboard" 
              element={
                <ProtectedRoute 
                  element={<ManufacturerDashboardPage />}
                  requiredRole="manufacturer"
                />
              } 
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
