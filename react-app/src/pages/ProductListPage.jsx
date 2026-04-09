import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiEndpoints as api } from '../services/api';
import Loader from '../components/Loader';

function ProductListPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const searchTerm = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.productAPI.list();
      let products = data.data || [];

      // Filter by search term
      if (searchTerm) {
        products = products.filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filter by category
      if (category) {
        products = products.filter(p => p.category === category);
      }

      setProducts(products);
      setFilteredProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadProducts();
  }, [searchTerm, category]);

  const handleSortChange = (sortType) => {
    let sorted = [...filteredProducts];
    if (sortType === 'price-low') {
      sorted.sort((a, b) => a.base_price - b.base_price);
    } else if (sortType === 'price-high') {
      sorted.sort((a, b) => b.base_price - a.base_price);
    } else if (sortType === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    setFilteredProducts(sorted);
  };

  return (
    <div className="product-list-page">
      <div className="container section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1>
              {searchTerm || category ? `Search Results: ${searchTerm || category}` : 'All Products'}
            </h1>
            <p style={{ color: '#666', marginTop: '5px' }}>
              Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label htmlFor="sort" style={{ fontWeight: '500' }}>Sort by:</label>
            <select 
              id="sort"
              className="form-select"
              style={{ width: 'auto', minWidth: '150px' }}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : filteredProducts.length > 0 ? (
          <div className="row">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <span>📦 {product.name?.substring(0, 15)}...</span>
                </div>
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-category">{product.category}</div>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px', lineHeight: '1.4' }}>
                    {product.description?.substring(0, 60)}...
                  </p>
                  <div className="product-price">₹{product.base_price}</div>
                  <div className="product-moq">MOQ: {product.moq} units</div>
                  <div className="product-actions" style={{ marginTop: '15px' }}>
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      View Details
                    </button>
                    <button 
                      className="btn btn-secondary btn-small"
                      onClick={() => navigate(`/rfq/${product.id}`)}
                    >
                      Get Quote
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '18px', color: '#999', marginBottom: '20px' }}>
              No products found matching your criteria
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/products')}
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductListPage;
