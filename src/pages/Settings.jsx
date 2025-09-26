import React, { useState } from 'react';
import { Save, Eye, EyeOff, Bell, Globe, Shield, Palette } from 'lucide-react';
import Card from '../components/Card';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@zenovia.com',
    phone: '+91 9876543210',
    role: 'Super Admin',
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

  const handleSaveProfile = () => {
    // Here you would typically make an API call to update the profile
    alert('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New password and confirm password do not match!');
      return;
    }
    // Here you would typically make an API call to change the password
    alert('Password changed successfully!');
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleSaveSettings = () => {
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'general', name: 'General', icon: Globe },
    { id: 'appearance', name: 'Appearance', icon: Palette }
  ];

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
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-input"
                        value={formData.phone}
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
                    <button onClick={handleSaveProfile} className="btn-primary flex items-center space-x-2">
                      <Save size={16} />
                      <span>Save Changes</span>
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
                    <button onClick={handleChangePassword} className="btn-primary">
                      Change Password
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
                  <button onClick={handleSaveSettings} className="btn-primary">
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
                  <button onClick={handleSaveSettings} className="btn-primary">
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
                  <button onClick={handleSaveSettings} className="btn-primary">
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