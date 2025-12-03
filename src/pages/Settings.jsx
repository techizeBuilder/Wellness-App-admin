import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Bell, Globe, Shield, Palette, RefreshCw } from 'lucide-react';
import Card from '../components/Card';
import { apiGet, apiPut } from '../utils/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    bookingUpdates: true,
    paymentAlerts: true,
    expertApplications: true,
    systemUpdates: false
  });

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Zenovia Wellness',
    timezone: 'Asia/Kolkata',
    language: 'English',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light'
  });

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
          role: admin.role === 'superadmin' ? 'Super Admin' : 'Admin'
        }));
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

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGeneralSettingChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      if (!formData.name || !formData.email) {
        toast.error('Name and email are required');
        return;
      }

      const response = await apiPut('/api/admin/profile', {
        name: formData.name,
        email: formData.email
      });

      if (response.success) {
        toast.success('Profile updated successfully!');
        // Refresh profile data
        await fetchProfile();
      } else {
        throw new Error(response.message || 'Failed to update profile');
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

  const handleSaveNotificationPreferences = () => {
    try {
      localStorage.setItem('adminNotificationPreferences', JSON.stringify(notifications));
      toast.success('Notification preferences saved successfully!');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Failed to save notification preferences');
    }
  };

  const handleSaveGeneralSettings = () => {
    try {
      localStorage.setItem('adminGeneralSettings', JSON.stringify(generalSettings));
      toast.success('General settings saved successfully!');
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast.error('Failed to save general settings');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'general', name: 'General', icon: Globe },
    { id: 'appearance', name: 'Appearance', icon: Palette }
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
                    <div className="w-20 h-20 bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {formData.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{formData.name}</h3>
                      <p className="text-gray-600">{formData.role}</p>
                      <button className="text-primary-900 text-sm font-medium mt-1">
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

          {activeTab === 'notifications' && (
            <Card title="Notification Preferences">
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h4>
                  <div className="space-y-4">
                    {Object.entries({
                      emailNotifications: 'General email notifications',
                      bookingUpdates: 'Booking updates and confirmations',
                      paymentAlerts: 'Payment and transaction alerts',
                      expertApplications: 'New expert applications'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">{label}</label>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(key)}
                          className={`
                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                            ${notifications[key] ? 'bg-primary-900' : 'bg-gray-200'}
                          `}
                        >
                          <span
                            className={`
                              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                              ${notifications[key] ? 'translate-x-6' : 'translate-x-1'}
                            `}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h4>
                  <div className="space-y-4">
                    {Object.entries({
                      pushNotifications: 'Browser push notifications',
                      systemUpdates: 'System maintenance and updates'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">{label}</label>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(key)}
                          className={`
                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                            ${notifications[key] ? 'bg-primary-900' : 'bg-gray-200'}
                          `}
                        >
                          <span
                            className={`
                              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                              ${notifications[key] ? 'translate-x-6' : 'translate-x-1'}
                            `}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleSaveNotificationPreferences} className="btn-primary">
                    Save Preferences
                  </button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'general' && (
            <Card title="General Settings">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Site Name</label>
                    <input
                      type="text"
                      name="siteName"
                      className="form-input"
                      value={generalSettings.siteName}
                      onChange={handleGeneralSettingChange}
                    />
                  </div>
                  <div>
                    <label className="form-label">Timezone</label>
                    <select
                      name="timezone"
                      className="form-input"
                      value={generalSettings.timezone}
                      onChange={handleGeneralSettingChange}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Language</label>
                    <select
                      name="language"
                      className="form-input"
                      value={generalSettings.language}
                      onChange={handleGeneralSettingChange}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Currency</label>
                    <select
                      name="currency"
                      className="form-input"
                      value={generalSettings.currency}
                      onChange={handleGeneralSettingChange}
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Date Format</label>
                    <select
                      name="dateFormat"
                      className="form-input"
                      value={generalSettings.dateFormat}
                      onChange={handleGeneralSettingChange}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
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

          {activeTab === 'appearance' && (
            <Card title="Appearance Settings">
              <div className="p-6 space-y-6">
                <div>
                  <label className="form-label">Theme</label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div
                      onClick={() => setGeneralSettings(prev => ({ ...prev, theme: 'light' }))}
                      className={`
                        p-4 border-2 rounded-lg cursor-pointer transition-colors
                        ${generalSettings.theme === 'light'
                          ? 'border-primary-900 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="w-full h-20 bg-white border border-gray-200 rounded mb-2"></div>
                      <div className="text-sm font-medium text-center">Light Theme</div>
                    </div>
                    <div
                      onClick={() => setGeneralSettings(prev => ({ ...prev, theme: 'dark' }))}
                      className={`
                        p-4 border-2 rounded-lg cursor-pointer transition-colors
                        ${generalSettings.theme === 'dark'
                          ? 'border-primary-900 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="w-full h-20 bg-gray-800 border border-gray-600 rounded mb-2"></div>
                      <div className="text-sm font-medium text-center">Dark Theme</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label">Brand Colors</label>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary-900 rounded-lg mx-auto mb-2"></div>
                      <div className="text-sm text-gray-600">Primary</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gold-500 rounded-lg mx-auto mb-2"></div>
                      <div className="text-sm text-gray-600">Gold</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-coral-400 rounded-lg mx-auto mb-2"></div>
                      <div className="text-sm text-gray-600">Coral</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleSaveGeneralSettings} className="btn-primary">
                    Save Appearance
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