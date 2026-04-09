import React, { useState, useEffect } from 'react';
import { apiEndpoints as api } from '../services/api';
import { authService } from '../services/authService';
import Loader from '../components/Loader';

function ManufacturerDashboardPage() {
  const user = authService.getCurrentUser();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ price: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRFQs();
  }, []);

  const loadRFQs = async () => {
    try {
      setLoading(true);
      const { data } = await api.rfqAPI.list();
      setRfqs(data.data || []);
    } catch (error) {
      console.error('Error loading RFQs:', error);
      setError('Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSubmit = async (e, rfqId) => {
    e.preventDefault();
    
    if (!quoteForm.price) {
      setError('Please enter quote price');
      return;
    }

    try {
      setSubmitting(true);
      await api.rfqAPI.submitResponse(rfqId, {
        quoted_price: parseFloat(quoteForm.price),
        message: quoteForm.message
      });

      setError('');
      setQuoteForm({ price: '', message: '' });
      loadRFQs();
      setSelectedRFQ(null);
      alert('Quote submitted successfully!');
    } catch (error) {
      console.error('Error submitting quote:', error);
      setError(error.response?.data?.message || 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  const hasResponded = (rfq) => {
    return rfq.responses?.some(r => r.manufacturer_id === user?.id);
  };

  if (loading) return <Loader />;

  const respondedCount = rfqs.filter(r => hasResponded(r)).length;
  const pendingCount = rfqs.filter(r => !hasResponded(r)).length;

  return (
    <div className="manufacturer-dashboard-page">
      <div className="container section">
        <div style={{ marginBottom: '30px' }}>
          <h1>RFQ Management</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>Welcome back, {user?.company_name || user?.name}</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="row" style={{ marginBottom: '40px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Total RFQs</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#0066cc' }}>{rfqs.length}</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Pending Quotes</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#f5a623' }}>{pendingCount}</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Quotes Sent</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#27ae60' }}>{respondedCount}</p>
          </div>
        </div>

        {/* RFQ Listing */}
        <div className="card">
          <div className="card-header">Available RFQs</div>
          
          {rfqs.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Required By</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map((rfq) => {
                    const responded = hasResponded(rfq);
                    return (
                      <tr key={rfq.id}>
                        <td>
                          <span style={{ fontWeight: '600' }}>{rfq.product?.name}</span>
                          <br />
                          <span style={{ fontSize: '12px', color: '#666' }}>Buyer: {rfq.buyer?.company_name}</span>
                        </td>
                        <td>{rfq.quantity}</td>
                        <td>{new Date(rfq.required_by).toLocaleDateString()}</td>
                        <td>
                          {rfq.budget ? (
                            <span style={{ fontWeight: '600', color: '#f5a623' }}>₹{rfq.budget}</span>
                          ) : (
                            <span style={{ color: '#999' }}>-</span>
                          )}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            backgroundColor: responded ? '#d4edda' : '#fff3cd',
                            color: responded ? '#155724' : '#856404',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {responded ? 'Quoted' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-primary btn-small"
                            onClick={() => {
                              setSelectedRFQ(rfq);
                              setQuoteForm({ price: '', message: '' });
                            }}
                          >
                            {responded ? 'View' : 'Quote'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: '18px', color: '#999' }}>No RFQs available at the moment</p>
            </div>
          )}
        </div>

        {/* RFQ Detail Modal */}
        {selectedRFQ && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }} onClick={() => setSelectedRFQ(null)}>
            <div className="card" style={{
              maxWidth: '700px',
              maxHeight: '90vh',
              overflow: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>RFQ Details - #{selectedRFQ.id}</h2>
                <button 
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                  onClick={() => setSelectedRFQ(null)}
                >
                  ×
                </button>
              </div>

              <div className="card-body">
                {/* RFQ Information */}
                <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
                  <h3 style={{ marginBottom: '15px' }}>RFQ Information</h3>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Product</p>
                    <p style={{ fontWeight: '600' }}>{selectedRFQ.product?.name}</p>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Quantity Required</p>
                    <p style={{ fontWeight: '600' }}>{selectedRFQ.quantity} units</p>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Required By</p>
                    <p style={{ fontWeight: '600' }}>{new Date(selectedRFQ.required_by).toLocaleDateString()}</p>
                  </div>

                  {selectedRFQ.budget && (
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Buyer's Budget</p>
                      <p style={{ fontWeight: '600', color: '#f5a623', fontSize: '16px' }}>₹{selectedRFQ.budget}</p>
                    </div>
                  )}

                  {selectedRFQ.special_requirements && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Special Requirements</p>
                      <p style={{ fontWeight: '600' }}>{selectedRFQ.special_requirements}</p>
                    </div>
                  )}
                </div>

                {/* Buyer Information */}
                <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
                  <h3 style={{ marginBottom: '15px' }}>Buyer Information</h3>
                  <p style={{ marginBottom: '5px' }}><strong>Company:</strong> {selectedRFQ.buyer?.company_name}</p>
                  <p style={{ marginBottom: '5px' }}><strong>Contact:</strong> {selectedRFQ.buyer?.name}</p>
                  {selectedRFQ.contact_person && (
                    <p style={{ marginBottom: '5px' }}><strong>Contact Person:</strong> {selectedRFQ.contact_person}</p>
                  )}
                  {selectedRFQ.phone && (
                    <p><strong>Phone:</strong> {selectedRFQ.phone}</p>
                  )}
                </div>

                {/* Quote Response */}
                {hasResponded(selectedRFQ) ? (
                  <div>
                    <h3 style={{ marginBottom: '15px' }}>Your Quote</h3>
                    {selectedRFQ.responses?.map((response) => (
                      response.manufacturer_id === user?.id && (
                        <div key={response.id} style={{
                          padding: '15px',
                          backgroundColor: '#d4edda',
                          borderRadius: '6px',
                          border: '1px solid #c3e6cb'
                        }}>
                          <p style={{ marginBottom: '10px', fontSize: '14px' }}>
                            <strong>Quoted Price:</strong> ₹{response.quoted_price}
                          </p>
                          {response.message && (
                            <p style={{ marginBottom: '10px', fontSize: '14px' }}>
                              <strong>Message:</strong> {response.message}
                            </p>
                          )}
                          <p style={{ fontSize: '12px', color: '#666' }}>
                            Submitted on: {new Date(response.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <form onSubmit={(e) => handleQuoteSubmit(e, selectedRFQ.id)}>
                    <h3 style={{ marginBottom: '15px' }}>Submit Your Quote</h3>
                    
                    <div className="form-group">
                      <label className="form-label">Quoted Price (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        placeholder="Enter your quote price"
                        value={quoteForm.price}
                        onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Message (Optional)</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Add any additional information about your quote..."
                        value={quoteForm.message}
                        onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                        rows="3"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success btn-block"
                      disabled={submitting}
                      style={{ padding: '12px', fontSize: '15px', fontWeight: '600' }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Quote'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManufacturerDashboardPage;
