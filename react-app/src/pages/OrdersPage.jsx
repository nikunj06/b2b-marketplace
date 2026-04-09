import React, { useState, useEffect } from 'react';
import { apiEndpoints as api } from '../services/api';
import Loader from '../components/Loader';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Assuming there's an orders endpoint
      await api.productAPI.list();
      // For now, we'll show sample data
      // In production, you would have an actual orders endpoint
      setOrders([]);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (status) => {
    const steps = ['pending', 'confirmed', 'shipped', 'delivered'];
    return steps;
  };

  const isStepCompleted = (step, currentStatus) => {
    const steps = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(step);
    return stepIndex <= currentIndex;
  };

  if (loading) return <Loader />;

  return (
    <div className="orders-page">
      <div className="container section">
        <h1 style={{ marginBottom: '10px' }}>My Orders</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Track your orders and their status</p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {orders.length > 0 ? (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map((order) => (
              <div key={order.id} className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3>Order #{order.id}</h3>
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{
                    padding: '6px 12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '13px',
                    textTransform: 'capitalize'
                  }}>
                    {order.status}
                  </span>
                </div>

                <div className="card-body">
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Product</p>
                    <p style={{ fontWeight: '600' }}>{order.product?.name}</p>
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                      Quantity: {order.quantity} × ₹{order.price || order.product?.base_price} = ₹{(order.quantity * (order.price || order.product?.base_price)).toFixed(2)}
                    </p>
                  </div>

                  {order.supplier && (
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Supplier</p>
                      <p style={{ fontWeight: '600' }}>{order.supplier.company_name}</p>
                      <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>{order.supplier.name}</p>
                    </div>
                  )}

                  {/* Order Timeline */}
                  <div>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>Order Status Timeline</p>
                    <div className="timeline">
                      {getStatusSteps(order.status).map((step, index) => {
                        const completed = isStepCompleted(step, order.status);
                        return (
                          <div key={step} className={`timeline-item ${completed ? 'completed' : ''}`}>
                            <div className="timeline-marker">✓</div>
                            <div className="timeline-content">
                              <p className="timeline-status" style={{ textTransform: 'capitalize' }}>
                                {step}
                              </p>
                              {index === getStatusSteps(order.status).indexOf(order.status) && (
                                <p className="timeline-time">Current status</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {order.status === 'pending' && (
                  <div className="card-footer">
                    <button className="btn btn-danger btn-small">Cancel Order</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: '18px', color: '#999', marginBottom: '20px' }}>
                No orders yet
              </p>
              <p style={{ color: '#999', marginBottom: '20px' }}>
                Your orders will appear here once you place them
              </p>
              <a href="/products" className="btn btn-primary">
                Start Shopping
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
