import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiEndpoints as api } from '../services/api';
import { authService } from '../services/authService';
import Loader from '../components/Loader';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductDetails();
  }, [id, loadProductDetails]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.productAPI.getById(id);
      setProduct(data.data);

      // Load variants for this product
      const variantsRes = await api.variantAPI.listByProduct(id);
      setVariants(variantsRes.data.data || []);
      
      // Select first variant by default
      if (variantsRes.data.data && variantsRes.data.data.length > 0) {
        setSelectedVariant(variantsRes.data.data[0]);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = () => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    navigate(`/rfq/${id}${selectedVariant ? `?variantId=${selectedVariant.id}` : ''}`);
  };

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="container section">
        <p style={{ textAlign: 'center', color: '#999' }}>Product not found</p>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Product Image */}
          <div>
            <div className="product-image" style={{ height: '400px' }}>
              <span style={{ fontSize: '20px' }}>📦 {product.name}</span>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 style={{ marginBottom: '10px' }}>{product.name}</h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>Category: {product.category}</p>

            <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Base Price</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#f5a623' }}>₹{product.base_price}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Minimum Order Quantity</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#0066cc' }}>{product.moq}</p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Description</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>{product.description}</p>
            </div>

            {variants.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Available Variants</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      style={{
                        padding: '15px',
                        border: selectedVariant?.id === variant.id ? '2px solid #0066cc' : '1px solid #ddd',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: selectedVariant?.id === variant.id ? '#f0f5ff' : 'white',
                      }}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: '#666' }}>SKU</p>
                          <p style={{ fontWeight: '600' }}>{variant.sku}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#666' }}>Price</p>
                          <p style={{ fontWeight: '600', color: '#f5a623' }}>₹{variant.price}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#666' }}>MOQ</p>
                          <p style={{ fontWeight: '600' }}>{variant.moq}</p>
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>Stock: {variant.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-primary btn-block"
                onClick={handleRequestQuote}
              >
                Request Quote
              </button>
            </div>
          </div>
        </div>

        {/* Specifications Table */}
        <div style={{ marginTop: '50px' }}>
          <h2 style={{ marginBottom: '20px' }}>Variant Specifications</h2>
          {selectedVariant && (
            <div className="card">
              <table className="table">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: '600', width: '30%' }}>SKU</td>
                    <td>{selectedVariant.sku}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '600' }}>Price</td>
                    <td>₹{selectedVariant.price}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '600' }}>MOQ</td>
                    <td>{selectedVariant.moq}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '600' }}>Stock Available</td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        backgroundColor: selectedVariant.stock > 100 ? '#d4edda' : '#fff3cd',
                        color: selectedVariant.stock > 100 ? '#155724' : '#856404'
                      }}>
                        {selectedVariant.stock} units
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
