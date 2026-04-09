import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { apiEndpoints as api } from '../services/api';
import Loader from '../components/Loader';

function RFQFormPage() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    quantity: '',
    required_by: '',
    special_requirements: '',
    budget: '',
    contact_person: '',
    phone: ''
  });

  const variantId = searchParams.get('variantId');

  useEffect(() => {
    loadProductDetails();
  }, [productId, variantId, loadProductDetails]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      const { data: productData } = await api.productAPI.getById(productId);
      setProduct(productData.data);

      if (variantId) {
        const { data: variantData } = await api.variantAPI.getById(variantId);
        setVariant(variantData.data);
      }
    } catch (error) {
      console.error('Error loading details:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

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
    setSuccess('');

    // Validation
    if (!formData.quantity) {
      setError('Please enter quantity');
      return;
    }
    if (!formData.required_by) {
      setError('Please select required date');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        product_id: parseInt(productId),
        variant_id: variantId ? parseInt(variantId) : null,
        quantity: parseInt(formData.quantity),
        required_by: formData.required_by,
        special_requirements: formData.special_requirements,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        contact_person: formData.contact_person,
        phone: formData.phone
      };

      const { data } = await api.rfqAPI.create(payload);
      
      setSuccess('RFQ submitted successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        navigate('/buyer/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting RFQ:', error);
      setError(error.response?.data?.message || 'Failed to submit RFQ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="container section">
        <p style={{ textAlign: 'center', color: '#999' }}>Product not found</p>
      </div>
    );
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="rfq-form-page">
      <div className="container section">
        <h1 style={{ marginBottom: '10px' }}>Request for Quotation</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Product: <strong>{product.name}</strong></p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Form */}
          <form onSubmit={handleSubmit}>
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

            {/* Variant Selection */}
            {variant && (
              <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f0f5ff', border: '1px solid #0066cc' }}>
                <p style={{ fontSize: '12px', color: '#0066cc', marginBottom: '5px' }}>Selected Variant</p>
                <p style={{ fontWeight: '600', marginBottom: '5px' }}>{variant.sku}</p>
                <p style={{ fontSize: '13px', color: '#666' }}>Price: ₹{variant.price} | MOQ: {variant.moq}</p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Quantity Required *</label>
              <input
                type="number"
                name="quantity"
                min={variant?.moq || 1}
                className="form-input"
                placeholder={`Minimum: ${variant?.moq || product.moq}`}
                value={formData.quantity}
                onChange={handleChange}
                required
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Minimum order quantity: {variant?.moq || product.moq}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Required By Date *</label>
              <input
                type="date"
                name="required_by"
                min={minDateStr}
                className="form-input"
                value={formData.required_by}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Budget (Optional)</label>
              <input
                type="number"
                name="budget"
                step="0.01"
                className="form-input"
                placeholder="Enter your budget in ₹"
                value={formData.budget}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Special Requirements</label>
              <textarea
                name="special_requirements"
                className="form-textarea"
                placeholder="Any specific requirements, packaging, delivery preferences..."
                value={formData.special_requirements}
                onChange={handleChange}
                rows="4"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Person Name</label>
              <input
                type="text"
                name="contact_person"
                className="form-input"
                placeholder="Your name"
                value={formData.contact_person}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="Your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting}
              style={{ padding: '12px', fontSize: '15px', fontWeight: '600' }}
            >
              {submitting ? 'Submitting...' : 'Submit RFQ'}
            </button>
          </form>

          {/* Summary Card */}
          <div>
            <div className="card">
              <div className="card-header">RFQ Summary</div>
              <div className="card-body">
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Product</p>
                  <p style={{ fontWeight: '600' }}>{product.name}</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Category</p>
                  <p style={{ fontWeight: '600' }}>{product.category}</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Base Price</p>
                  <p style={{ fontWeight: '600', fontSize: '18px', color: '#f5a623' }}>₹{product.base_price}</p>
                </div>

                {variant && (
                  <>
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Selected Variant Details</p>
                      <p style={{ fontWeight: '600', marginBottom: '5px' }}>SKU: {variant.sku}</p>
                      <p style={{ fontSize: '13px', color: '#666', marginBottom: '3px' }}>Price: ₹{variant.price}</p>
                      <p style={{ fontSize: '13px', color: '#666' }}>Stock: {variant.stock} units</p>
                    </div>
                  </>
                )}

                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f5ff', borderRadius: '6px' }}>
                  <h4 style={{ marginBottom: '10px', color: '#0066cc' }}>Next Steps</h4>
                  <ul style={{ fontSize: '13px', color: '#666', lineHeight: '1.8', marginLeft: '15px' }}>
                    <li>Submit your RFQ details</li>
                    <li>Suppliers will receive your request</li>
                    <li>Compare quotes on your dashboard</li>
                    <li>Place order with best supplier</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RFQFormPage;
