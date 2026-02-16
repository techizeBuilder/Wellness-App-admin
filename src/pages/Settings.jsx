import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Bell, Globe, Shield, RefreshCw } from 'lucide-react';
import Card from '../components/Card';
import { apiGet, apiPut } from '../utils/api';
import config from '../utils/config';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    profileImage: null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [generalSettings, setGeneralSettings] = useState({
    logo: null,
  });
  const [logoPreview, setLogoPreview] = useState(null);

  // Load admin profile on mount
  useEffect(() => {
    fetchProfile();
    loadNotificationPreferences();
    loadGeneralSettings();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/admin/profile');

      if (response.success && response.data?.admin) {
        const admin = response.data.admin;
        setFormData(prev => ({
          ...prev,
          name: admin.name || '',
          email: admin.email || '',
          phone: '', // Admin model doesn't have phone field
          role: admin.role === 'superadmin' ? 'Super Admin' : 'Admin',
          profileImage: admin.profileImage || null
        }));

        // Set profile image preview if exists
        if (admin.profileImage) {
          const apiUrl = config.getApiUrl();
          setProfileImagePreview(`${apiUrl}/uploads/profiles/${admin.profileImage}`);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationPreferences = () => {
    try {
      const saved = localStorage.getItem('adminNotificationPreferences');
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const loadGeneralSettings = () => {
    try {
      const saved = localStorage.getItem('adminGeneralSettings');
      if (saved) {
        setGeneralSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading general settings:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGeneralSettingChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setGeneralSettings(prev => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      if (!formData.name || !formData.email) {
        toast.error('Name and email are required');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);

      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      const token = localStorage.getItem('adminToken');
      const apiUrl = config.getApiUrl();

      const response = await fetch(`${apiUrl}/api/admin/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();
dsfh
      if (data.success) {
        toast.success('Profile updated successfully!');
        setProfileImage(null);
        await fetchProfile();

        // Trigger event to update navbar
        window.dispatchEvent(new Event('adminProfileUpdated'));
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        toast.error('All password fields are required');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New password and confirm password do not match!');
        return;
      }

      if (formData.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }

      setSaving(true);

      const response = await apiPut('/api/admin/change-password', {
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.success) {
        toast.success('Password changed successfully!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeneralSettings = async () => {
    try {
      setSaving(true);

      if (!generalSettings.logo) {
        toast.error('Please upload a logo first');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('logo', generalSettings.logo);

      const token = localStorage.getItem('adminToken');
      const apiUrl = config.getApiUrl();

      const response = await fetch(`${apiUrl}/api/admin/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Logo uploaded successfully!');
        setGeneralSettings(prev => ({ ...prev, logo: null }));
        setLogoPreview(null);
        
        // Trigger event to update navbar
        window.dispatchEvent(new Event('logoUpdated'));
      } else {
        throw new Error(data.message || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: Shield },
    { id: 'general', name: 'General', icon: Globe }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-primary-900" size={48} />
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1 h-fit">
          <div className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors
                      ${activeTab === tab.id
                        ? 'bg-primary-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Information */}
              <Card title="Profile Information">
                <div className="p-6 space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-primary-900 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-2xl">
                            {formData.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{formData.name}</h3>
                      <p className="text-gray-600">{formData.role}</p>
                      <input
                        type="file"
                        id="profileImageInput"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('profileImageInput').click()}
                        className="text-primary-900 text-sm font-medium mt-1 hover:underline cursor-pointer"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-input"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="form-input"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="form-label">Role</label>
                      <input
                        type="text"
                        className="form-input bg-gray-100"
                        value={formData.role}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      className="btn-primary flex items-center space-x-2"
                      disabled={saving}
                    >
                      <Save size={16} />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              </Card>

              {/* Change Password */}
              <Card title="Change Password">
                <div className="p-6 space-y-4">
                  <div>
                    <label className="form-label">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        className="form-input pr-12"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        className="form-input pr-12"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-input"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleChangePassword}
                      className="btn-primary"
                      disabled={saving}
                    >
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'general' && (
            <Card title="General Settings">
              <div className="p-6 space-y-6">
                <div>
                  <label className="form-label">Logo</label>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo"
                          className="w-32 h-32 object-contain border border-gray-200 rounded p-2"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                          <span className="text-gray-500 text-sm text-center">No logo uploaded</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="logoInput"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('logoInput').click()}
                        className="btn-primary mb-2"
                      >
                        Upload Logo
                      </button>
                      <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF, WebP</p>
                      <p className="text-xs text-gray-500">Max size: 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleSaveGeneralSettings} className="btn-primary">
                    Save Settings
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;