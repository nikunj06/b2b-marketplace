import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiEndpoints as api } from '../services/api';
import Loader from '../components/Loader';

function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'Electronics',
    'Textiles',
    'Machinery',
    'Chemicals',
    'Pharmaceuticals',
    'Agriculture',
    'All Products'
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.productAPI.list();
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${searchTerm}`);
  };

  const handleCategoryClick = (category) => {
    if (category === 'All Products') {
      setSelectedCategory('');
      navigate('/products');
    } else {
      setSelectedCategory(category);
      navigate(`/products?category=${category}`);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Search Section */}
      <div className="search-container">
        <div className="container">
          <h1 style={{ color: 'white', marginBottom: '20px', fontSize: '32px' }}>
            Find Best Suppliers & Quotes
          </h1>
          
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products, suppliers..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn">Search</button>
          </form>

          <div>
            <p style={{ color: 'white', marginBottom: '10px', fontSize: '14px' }}>Popular Categories:</p>
            <div className="categories-list">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className={`category-tag ${selectedCategory === cat || (cat === 'All Products' && !selectedCategory) ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="container section">
        <h2 style={{ marginBottom: '30px' }}>Featured Products</h2>
        
        {loading ? (
          <Loader />
        ) : products.length > 0 ? (
          <div className="row">
            {products.slice(0, 6).map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <span>📦 {product.name?.substring(0, 15)}...</span>
                </div>
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-category">{product.category}</div>
                  <div className="product-price">₹{product.base_price}</div>
                  <div className="product-moq">MOQ: {product.moq} units</div>
                  <div className="product-actions">
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#999' }}>No products found</p>
        )}

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/products')}
          >
            View All Products
          </button>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={{ backgroundColor: '#f5f5f5', padding: '40px 0' }}>
        <div className="container">
          <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>How It Works</h2>
          <div className="row">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>🔍</div>
              <h3 style={{ marginBottom: '10px' }}>1. Search & Explore</h3>
              <p>Browse thousands of products from trusted suppliers</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>💬</div>
              <h3 style={{ marginBottom: '10px' }}>2. Request Quote</h3>
              <p>Post your requirements and get quotes from suppliers</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>✅</div>
              <h3 style={{ marginBottom: '10px' }}>3. Compare & Order</h3>
              <p>Compare quotes and place orders with confidence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
