# B2B Marketplace Frontend - React App

Complete React frontend for the B2B marketplace with RFQ-based workflow.

## Overview

This is a fully-featured React 18 frontend application that integrates with the Node.js/Express backend API. The application provides a seamless platform for buyers to request quotes and manufacturers to submit competitive bids.

## Features

### 🔍 For All Users
- **Product Discovery**: Browse and search through products
- **Product Details**: View complete product information with variants
- **Authentication**: Secure login/registration with role-based access

### 👤 For Buyers
- **RFQ Management**: Create and track RFQs
- **Quote Comparison**: Compare quotes from multiple suppliers
- **Dashboard**: View all submitted RFQs and responses
- **Order Tracking**: Monitor order status with timeline

### 🏭 For Manufacturers  
- **RFQ Dashboard**: View all available requests for quotation
- **Quote Submission**: Submit competitive quotes with pricing and notes
- **Buyer Information**: Access complete buyer details and requirements

## Project Structure

```
react-app/
├── public/
│   └── index.html              # Main HTML file
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Loader.jsx
│   ├── pages/                  # Page-level components
│   │   ├── HomePage.jsx
│   │   ├── ProductListPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── RFQFormPage.jsx
│   │   ├── BuyerDashboardPage.jsx
│   │   ├── ManufacturerDashboardPage.jsx
│   │   ├── OrdersPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── services/               # API and auth services
│   │   ├── api.js              # API endpoints
│   │   └── authService.js      # Auth helper functions
│   ├── styles/
│   │   └── App.css             # Global styles
│   ├── App.jsx                 # Main app component with routing
│   ├── index.js                # React entry point
│   └── index.css               # Global styles
├── package.json
└── README.md
```

## Installation & Setup

### 1. Prerequisites

**IMPORTANT: Start the backend FIRST, then the React app**

Required:
- Node.js 14+ and npm installed
- MySQL database running locally
- Backend server running on http://localhost:3000
- Backend must have sample data loaded in database

To set up backend:
```bash
# From d:\b2b directory (NOT react-app)
cd d:\b2b
node server.js
```

Expected output:
```
✅ MySQL connected successfully
🚀 Server running at http://localhost:3000
```

If backend fails to start, see [Troubleshooting](../TROUBLESHOOTING_AUTH.md)

### 2. Install Dependencies

```bash
cd react-app
npm install
```

This installs:
- React 18.2.0
- React Router 6.10.0
- Axios 1.3.0
- All peer dependencies

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000` (React dev server, different from backend API)

### 4. Build for Production

```bash
npm run build
```

Creates optimized production build in `build/` directory.

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm run test` - Run tests (if configured)
- `npm run eject` - Eject from Create React App (not recommended)

## Configuration

### API Base URL
Set in `src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true
});
```

### Environment Variables
Create `.env` file in `react-app/` root:
```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
```

## Authentication Flow

1. **Login/Register**: User submits credentials
2. **JWT Token**: Backend returns JWT token
3. **Token Storage**: Token saved in localStorage
4. **Auto-Injection**: Axios interceptor adds token to all API requests
5. **Protected Routes**: Only authenticated users can access certain pages
6. **Role-Based Access**: Dashboards visible only to appropriate role

### Test Credentials

**IMPORTANT:** The backend must be running FIRST (see Prerequisites)

**Retailer/Buyer Account:**
- Email: `ankit@ankitmart.com`
- Password: `password123`

**Manufacturer Account:**
- Email: `ravi@texcorp.com`
- Password: `password123`

**Admin Account:**
- Email: `admin@b2b.com`
- Password: `password123`

If credentials don't work, see [Troubleshooting](../TROUBLESHOOTING_AUTH.md)

## API Integration

All API calls are centralized in `src/services/api.js`:

### Available API Groups
- `api.authAPI` - Login, register, logout
- `api.productAPI` - List, get product details
- `api.variantAPI` - Product variants and attributes
- `api.rfqAPI` - RFQ operations (create, list, responses)
- `api.orderAPI` - Order management

### Example Usage
```javascript
import { api } from '../services/api';

// Get products
const { data } = await api.productAPI.list();

// Create RFQ
await api.rfqAPI.create({
  product_id: 1,
  quantity: 100,
  required_by: '2024-01-31',
  special_requirements: 'Premium quality'
});
```

## Styling

- **CSS**: Global styles in `src/styles/App.css`
- **CSS Variables**: Color scheme defined with CSS custom properties
- **Responsive Design**: Mobile-first approach with media queries
- **Card-based Layout**: Consistent design using card components
- **Flexbox & Grid**: Modern layout techniques

### Color Palette
```css
--primary-color: #0066cc    (Blue)
--secondary-color: #f5a623 (Orange)
--success-color: #27ae60   (Green)
--danger-color: #e74c3c    (Red)
--gray-light: #ecf0f1      (Light Gray)
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

- Code splitting via React Router
- Lazy loading for images and components
- Efficient API calls with proper error handling
- CSS optimized for production builds

## Troubleshooting

### API Connection Issues
- Check backend is running on `http://localhost:3000`
- Verify database is connected
- Check browser console for CORS errors

### Login Fails
- Verify credentials are correct
- Check network tab in DevTools
- Ensure token is being saved to localStorage

### Styling Issues
- Clear browser cache (Ctrl+Shift+Delete)
- Check CSS file is loaded (`src/styles/App.css`)
- Verify CSS variable syntax in browser DevTools

### Page Not Loading
- Check React Router configuration in `App.jsx`
- Verify page component file exists
- Check browser console for JavaScript errors

## Next Steps

1. **Database Link**: Connect Orders page to actual order API endpoint
2. **Image Upload**: Add product image upload capability
3. **Advanced Search**: Implement filters and advanced search
4. **Notifications**: Add toast notifications for user feedback
5. **Analytics**: Add page view tracking
6. **Admin Panel**: Create admin dashboard for system management

## Additional Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)
- [CSS Styling Guide](https://developer.mozilla.org/en-US/docs/Web/CSS)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend API documentation
3. Check browser console for error messages
4. Verify all services are running properly

## License

MIT License - See LICENSE file for details
