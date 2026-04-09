import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiEndpoints as api } from '../services/api';
import { authService } from '../services/authService';
import Loader from '../components/Loader';

function BuyerDashboardPage() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRFQ, setSelectedRFQ] = useState(null);

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

  const getTotalResponses = (rfq) => {
    return rfq.responses?.length || 0;
  };

  const getBestQuote = (rfq) => {
    if (!rfq.responses || rfq.responses.length === 0) return null;
    return rfq.responses.reduce((best, current) => 
      current.quoted_price < best.quoted_price ? current : best
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': '#0066cc',
      'responded': '#27ae60',
      'ordered': '#f5a623',
      'closed': '#95a5a6'
    };
    return colors[status] || '#666';
  };

  if (loading) return <Loader />;

  return (
    <div className="buyer-dashboard-page">
      <div className="container section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1>My RFQs</h1>
            <p style={{ color: '#666', marginTop: '5px' }}>Welcome back, {user?.company_name || user?.name}</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/products')}
          >
            New RFQ
          </button>
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
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Open RFQs</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#f5a623' }}>
              {rfqs.filter(r => r.status === 'open').length}
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>With Responses</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#27ae60' }}>
              {rfqs.filter(r => getTotalResponses(r) > 0).length}
            </p>
          </div>
        </div>

        {/* RFQs Table */}
        <div className="card">
          {rfqs.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Required By</th>
                    <th>Responses</th>
                    <th>Best Quote</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map((rfq) => {
                    const bestQuote = getBestQuote(rfq);
                    const responseCount = getTotalResponses(rfq);
                    return (
                      <tr key={rfq.id}>
                        <td>
                          <span style={{ fontWeight: '600' }}>{rfq.product?.name}</span>
                          <br />
                          <span style={{ fontSize: '12px', color: '#666' }}>SKU: {rfq.variant?.sku || 'N/A'}</span>
                        </td>
                        <td>{rfq.quantity}</td>
                        <td>{new Date(rfq.required_by).toLocaleDateString()}</td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            backgroundColor: responseCount > 0 ? '#d4edda' : '#fff3cd',
                            color: responseCount > 0 ? '#155724' : '#856404',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            {responseCount}
                          </span>
                        </td>
                        <td>
                          {bestQuote ? (
                            <span style={{ fontWeight: '600', color: '#f5a623' }}>₹{bestQuote.quoted_price}</span>
                          ) : (
                            <span style={{ color: '#999' }}>-</span>
                          )}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            backgroundColor: `${getStatusColor(rfq.status)}15`,
                            color: getStatusColor(rfq.status),
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {rfq.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-primary btn-small"
                            onClick={() => setSelectedRFQ(rfq)}
                          >
                            View
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
              <p style={{ fontSize: '18px', color: '#999', marginBottom: '20px' }}>
                No RFQs yet
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/products')}
              >
                Create Your First RFQ
              </button>
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
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
              animation: 'slideIn 0.3s ease-out'
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
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Product</p>
                  <p style={{ fontWeight: '600' }}>{selectedRFQ.product?.name}</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Quantity</p>
                  <p style={{ fontWeight: '600' }}>{selectedRFQ.quantity} units</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Required By</p>
                  <p style={{ fontWeight: '600' }}>{new Date(selectedRFQ.required_by).toLocaleDateString()}</p>
                </div>

                {selectedRFQ.special_requirements && (
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Special Requirements</p>
                    <p style={{ fontWeight: '600' }}>{selectedRFQ.special_requirements}</p>
                  </div>
                )}

                {selectedRFQ.budget && (
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Budget</p>
                    <p style={{ fontWeight: '600', color: '#f5a623', fontSize: '16px' }}>₹{selectedRFQ.budget}</p>
                  </div>
                )}

                {getTotalResponses(selectedRFQ) > 0 && (
                  <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
                    <h3 style={{ marginBottom: '15px' }}>Received Quotes ({getTotalResponses(selectedRFQ)})</h3>
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {selectedRFQ.responses?.map((response) => (
                        <div key={response.id} style={{
                          padding: '15px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '6px',
                          border: '1px solid #eee'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <p style={{ fontWeight: '600' }}>{response.manufacturer?.company_name}</p>
                            <p style={{ fontWeight: '700', color: '#f5a623', fontSize: '16px' }}>₹{response.quoted_price}</p>
                          </div>
                          {response.message && (
                            <p style={{ fontSize: '13px', color: '#666' }}>{response.message}</p>
                          )}
                          <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                            Quoted on: {new Date(response.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerDashboardPage;
