import React from 'react';

function AdminPage({ onLogout }) {
  return (
    <div>
      <h1>Admin Page</h1>
      <p>Welcome, admin! This page is protected.</p>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default AdminPage;
