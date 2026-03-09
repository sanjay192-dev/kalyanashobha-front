import React, { useState } from 'react';
import axios from 'axios';
import './CreateModerator.css'; 

export default function CreateModerator() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  // These IDs MUST exactly match the link.id from your AdminSidebar allLinks array
  const availablePermissions = [
    { id: "dashboard", label: "Dashboard" },
    { id: "users", label: "User Registry" },
    { id: "reg-approvals", label: "Registration Approvals" },
    { id: "interest-approvals", label: "Interest Approvals" },
    { id: "agents", label: "Agents Management" },
    { id: "vendors", label: "Vendors Management" },
    { id: "user-certificates", label: "User Acceptance" },
    { id: "add-data", label: "Add Data Fields" },
    { id: "vendor-leads", label: "Vendor Leads" },
    { id: "help-center", label: "Help Center" },
    { id: "data-approval", label: "Data Approval" },
    { id: "manage-pages", label: "Manage Pages" },
    { id: "testimonials", label: "Testimonials" }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (id) => {
    setSelectedPermissions((prev) => 
      prev.includes(id) 
        ? prev.filter(perm => perm !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === availablePermissions.length) {
      setSelectedPermissions([]); // Deselect all
    } else {
      setSelectedPermissions(availablePermissions.map(p => p.id)); // Select all
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsLoading(true);

    if (selectedPermissions.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one permission.' });
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        'https://kalyanashobha-back.vercel.app/api/admin/create-moderator',
        {
          ...formData,
          permissions: selectedPermissions
        },
        {
          headers: { Authorization: token }
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Moderator created successfully!' });
        setFormData({ username: '', email: '', password: '' });
        setSelectedPermissions([]);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to create moderator.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-moderator-container">
      <h2>Create New Moderator</h2>
      
      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="moderator-form">
        <div className="form-group">
          <label>Username</label>
          <input 
            type="text" 
            name="username" 
            value={formData.username} 
            onChange={handleInputChange} 
            required 
            placeholder="Enter username"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleInputChange} 
            required 
            placeholder="Enter email address"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleInputChange} 
            required 
            placeholder="Set a secure password"
          />
        </div>

        <div className="permissions-section">
          <div className="permissions-header">
            <h3>Assign Page Permissions</h3>
            <button type="button" onClick={handleSelectAll} className="select-all-btn">
              {selectedPermissions.length === availablePermissions.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="permissions-grid">
            {availablePermissions.map((perm) => (
              <label key={perm.id} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={selectedPermissions.includes(perm.id)}
                  onChange={() => handleCheckboxChange(perm.id)}
                />
                <span className="checkbox-text">{perm.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="submit-btn">
          {isLoading ? 'Creating...' : 'Create Moderator'}
        </button>
      </form>
    </div>
  );
}
