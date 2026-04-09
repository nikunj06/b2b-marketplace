import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>🏪 B2B Marketplace</h3>
          <p style={{ margin: '0', fontSize: '13px', lineHeight: '1.6' }}>
            Connecting buyers and manufacturers for seamless B2B transactions.
            Request quotes, compare prices, and place orders with ease.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px', fontSize: '13px' }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0' }}>For Buyers</h4>
            <ul style={{ margin: '0', paddingLeft: '0', listStyle: 'none' }}>
              <li style={{ marginBottom: '5px' }}><a href="/products">Browse Products</a></li>
              <li style={{ marginBottom: '5px' }}><a href="/products">Search Suppliers</a></li>
              <li><a href="/login">Post RFQ</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px 0' }}>For Manufacturers</h4>
            <ul style={{ margin: '0', paddingLeft: '0', listStyle: 'none' }}>
              <li style={{ marginBottom: '5px' }}><a href="/register">Register Business</a></li>
              <li style={{ marginBottom: '5px' }}><a href="/login">Submit Quotes</a></li>
              <li><a href="/login">Manage Orders</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px 0' }}>About</h4>
            <ul style={{ margin: '0', paddingLeft: '0', listStyle: 'none' }}>
              <li style={{ marginBottom: '5px' }}><a href="/">About Us</a></li>
              <li style={{ marginBottom: '5px' }}><a href="/">Contact</a></li>
              <li><a href="/">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ margin: '0', fontSize: '12px' }}>
            © {new Date().getFullYear()} B2B Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
