import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>403 - Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      <Link to="/login">Back to login</Link>
    </div>
  );
};

export default UnauthorizedPage;