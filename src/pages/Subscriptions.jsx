import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Crown, CheckCircle, Loader2 } from 'lucide-react';
import Card from '../components/Card';
import { formatCurrency } from '../utils/dummyData';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import toast from 'react-hot-toast';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Fetch subscriptions on component mount
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/admin/subscriptions');
      setSubscriptions(response.data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (planData) => {
    try {
      const response = await apiPost('/api/admin/subscriptions', planData);
      setSubscriptions(prev => [...prev, response.data]);
      toast.success('Subscription plan created successfully!');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error(error.message || 'Failed to create subscription plan');
    }
  };

  const handleUpdatePlan = async (planId, planData) => {
    try {
      const response = await apiPut(`/api/admin/subscriptions/${planId}`, planData);
      setSubscriptions(prev => 
        prev.map(plan => plan._id === planId ? response.data : plan)
      );
      toast.success('Subscription plan updated successfully!');
      setEditingPlan(null);
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error(error.message || 'Failed to update subscription plan');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this subscription plan?')) {
      try {
        await apiDelete(`/api/admin/subscriptions/${planId}`);
        setSubscriptions(prev => prev.filter(plan => plan._id !== planId));
        toast.success('Subscription plan deleted successfully!');
      } catch (error) {
        console.error('Error deleting plan:', error);
        toast.error(error.message || 'Failed to delete subscription plan');
      }
    }
  };

  const PlanModal = ({ plan, onClose, isEdit = false }) => {
    const [formData, setFormData] = useState(
      plan || {
        name: '',
        description: '',
        price: '',
        duration: '1 Month',
        features: [''],
        maxUsers: 1,
        maxConsultations: 10,
        hasVideoCall: true,
        hasChat: true,
        hasPrioritySupport: false,
        hasAdvancedAnalytics: false,
        isPopular: false,
        status: 'Active'
      }
    );
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      if (plan) {
        setFormData({
          name: plan.name || '',
          description: plan.description || '',
          price: plan.price || '',
          duration: plan.duration || '1 Month',
          features: plan.features && plan.features.length > 0 ? plan.features : [''],
          maxUsers: plan.maxUsers || 1,
          maxConsultations: plan.maxConsultations || 10,
          hasVideoCall: plan.hasVideoCall !== undefined ? plan.hasVideoCall : true,
          hasChat: plan.hasChat !== undefined ? plan.hasChat : true,
          hasPrioritySupport: plan.hasPrioritySupport || false,
          hasAdvancedAnalytics: plan.hasAdvancedAnalytics || false,
          isPopular: plan.isPopular || false,
          status: plan.status || 'Active'
        });
      }
    }, [plan]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.name.trim()) {
        toast.error('Plan name is required');
        return;
      }
      
      if (!formData.price || formData.price <= 0) {
        toast.error('Valid price is required');
        return;
      }

      const filteredFeatures = formData.features.filter(feature => feature.trim() !== '');
      if (filteredFeatures.length === 0) {
        toast.error('At least one feature is required');
        return;
      }

      const planData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        duration: formData.duration,
        features: filteredFeatures,
        maxUsers: parseInt(formData.maxUsers),
        maxConsultations: formData.maxConsultations === '-1' ? -1 : parseInt(formData.maxConsultations),
        hasVideoCall: formData.hasVideoCall,
        hasChat: formData.hasChat,
        hasPrioritySupport: formData.hasPrioritySupport,
        hasAdvancedAnalytics: formData.hasAdvancedAnalytics,
        isPopular: formData.isPopular,
        status: formData.status
      };

      setSubmitting(true);
      try {
        if (isEdit && plan) {
          await handleUpdatePlan(plan._id, planData);
        } else {
          await handleCreatePlan(planData);
        }
      } finally {
        setSubmitting(false);
      }
    };

    const handleFeatureChange = (index, value) => {
      const newFeatures = [...formData.features];
      newFeatures[index] = value;
      setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
      setFormData({ ...formData, features: [...formData.features, ''] });
    };

    const removeFeature = (index) => {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData({ ...formData, features: newFeatures });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {isEdit ? 'Edit Plan' : 'Add New Plan'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="form-label">Plan Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter plan name"
                required
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter plan description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="form-label">Duration</label>
                <select
                  className="form-input"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                >
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                  <option value="Lifetime">Lifetime</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Max Users</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={formData.maxUsers}
                  onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Max Consultations</label>
                <input
                  type="number"
                  min="-1"
                  className="form-input"
                  value={formData.maxConsultations}
                  onChange={(e) => setFormData({ ...formData, maxConsultations: e.target.value })}
                  placeholder="-1 for unlimited"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Features</label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    className="form-input flex-1"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="Enter feature"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                    disabled={formData.features.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="btn-secondary text-sm w-full mt-2"
              >
                Add Feature
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="form-label">Plan Features</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hasVideoCall}
                      onChange={(e) => setFormData({ ...formData, hasVideoCall: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Video Call Support</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hasChat}
                      onChange={(e) => setFormData({ ...formData, hasChat: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Chat Support</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hasPrioritySupport}
                      onChange={(e) => setFormData({ ...formData, hasPrioritySupport: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Priority Support</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hasAdvancedAnalytics}
                      onChange={(e) => setFormData({ ...formData, hasAdvancedAnalytics: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Advanced Analytics</span>
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <label className="form-label">Settings</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Mark as Popular</span>
                  </label>
                  <div>
                    <label className="form-label text-sm">Status</label>
                    <select
                      className="form-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button 
                type="submit" 
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
                disabled={submitting}
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                <span>{isEdit ? 'Update Plan' : 'Create Plan'}</span>
              </button>
              <button 
                type="button" 
                onClick={onClose} 
                className="btn-secondary flex-1"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600 mt-1">Manage subscription plans and pricing</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Plan</span>
          </button>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={48} className="animate-spin text-primary-600" />
        </div>
      ) : subscriptions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscription plans found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first subscription plan.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Create First Plan
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {subscriptions.map((plan, index) => (
            <Card key={plan._id} className={`relative ${plan.isPopular ? 'ring-2 ring-gold-500' : ''}`}>
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gold-500 text-primary-900 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Crown size={14} />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}
              
              <div className="p-6">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                  )}
                  <div className="text-3xl font-bold text-primary-900 mb-1">
                    {formatCurrency(plan.price)}
                  </div>
                  <div className="text-sm text-gray-600">
                    per {plan.duration}
                  </div>
                  <div className="mt-2 space-y-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {plan.subscribers || 0} subscribers
                    </span>
                    <div className="text-xs text-gray-500">
                      {plan.maxUsers} user{plan.maxUsers > 1 ? 's' : ''} • {plan.maxConsultations === -1 ? 'Unlimited' : plan.maxConsultations} consultations
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features && plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  
                  {/* Service Features */}
                  {plan.hasVideoCall && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                      <span className="text-sm text-gray-700">Video Call Support</span>
                    </div>
                  )}
                  {plan.hasChat && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                      <span className="text-sm text-gray-700">Chat Support</span>
                    </div>
                  )}
                  {plan.hasPrioritySupport && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                      <span className="text-sm text-gray-700">Priority Support</span>
                    </div>
                  )}
                  {plan.hasAdvancedAnalytics && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                      <span className="text-sm text-gray-700">Advanced Analytics</span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    plan.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {plan.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setEditingPlan(plan)}
                    className="btn-primary flex-1 text-sm"
                  >
                    Edit Plan
                  </button>
                  <button 
                    onClick={() => handleDeletePlan(plan._id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Comparison Table */}
      {subscriptions.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Plan Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Feature</th>
                    {subscriptions.map(plan => (
                      <th key={plan._id} className="text-center py-3 px-4 font-medium text-gray-700">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">Price</td>
                    {subscriptions.map(plan => (
                      <td key={plan._id} className="text-center py-3 px-4 font-semibold text-primary-900">
                        {formatCurrency(plan.price)}
                      </td>
                    ))}
                  </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">Duration</td>
                  {subscriptions.map(plan => (
                    <td key={plan._id} className="text-center py-3 px-4 text-gray-700">
                      {plan.duration}
                    </td>
                  ))}
                </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">Max Users</td>
                    {subscriptions.map(plan => (
                      <td key={plan._id} className="text-center py-3 px-4 text-gray-700">
                        {plan.maxUsers}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">Max Consultations</td>
                    {subscriptions.map(plan => (
                      <td key={plan._id} className="text-center py-3 px-4 text-gray-700">
                        {plan.maxConsultations === -1 ? 'Unlimited' : plan.maxConsultations}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">Active Subscribers</td>
                    {subscriptions.map(plan => (
                      <td key={plan._id} className="text-center py-3 px-4 font-semibold text-green-600">
                        {plan.subscribers || 0}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">Monthly Revenue</td>
                    {subscriptions.map(plan => (
                      <td key={plan._id} className="text-center py-3 px-4 font-semibold text-gold-600">
                        {formatCurrency((plan.price * (plan.subscribers || 0)))}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">Video Call</td>
                    {subscriptions.map(plan => (
                      <td key={plan._id} className="text-center py-3 px-4">
                        {plan.hasVideoCall ? (
                          <CheckCircle className="text-green-500 mx-auto" size={16} />
                        ) : (
                          <span className="text-gray-400">✕</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">Chat Support</td>
                    {subscriptions.map(plan => (
                      <td key={plan._id} className="text-center py-3 px-4">
                        {plan.hasChat ? (
                          <CheckCircle className="text-green-500 mx-auto" size={16} />
                        ) : (
                          <span className="text-gray-400">✕</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">Priority Support</td>
                    {subscriptions.map(plan => (
                      <td key={plan._id} className="text-center py-3 px-4">
                        {plan.hasPrioritySupport ? (
                          <CheckCircle className="text-green-500 mx-auto" size={16} />
                        ) : (
                          <span className="text-gray-400">✕</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">Advanced Analytics</td>
                    {subscriptions.map(plan => (
                      <td key={plan._id} className="text-center py-3 px-4">
                        {plan.hasAdvancedAnalytics ? (
                          <CheckCircle className="text-green-500 mx-auto" size={16} />
                        ) : (
                          <span className="text-gray-400">✕</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Status</td>
                    {subscriptions.map(plan => (
                      <td key={plan._id} className="text-center py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          plan.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {plan.status}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      {showAddModal && (
        <PlanModal onClose={() => setShowAddModal(false)} />
      )}
      
      {editingPlan && (
        <PlanModal 
          plan={editingPlan} 
          onClose={() => setEditingPlan(null)} 
          isEdit={true}
        />
      )}
    </div>
  );
};

export default Subscriptions;