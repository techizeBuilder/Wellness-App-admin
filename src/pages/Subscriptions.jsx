import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Crown, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import { subscriptions, formatCurrency } from '../utils/dummyData';

const Subscriptions = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const handleDeletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this subscription plan?')) {
      console.log('Deleting plan:', planId);
    }
  };

  const PlanModal = ({ plan, onClose, isEdit = false }) => {
    const [formData, setFormData] = useState(
      plan || {
        name: '',
        price: '',
        duration: '1 Month',
        features: [''],
        status: 'Active'
      }
    );

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
          
          <form className="space-y-4">
            <div>
              <label className="form-label">Plan Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter plan name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="form-label">Price (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="Enter price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            
            <div>
              <label className="form-label">Duration</label>
              <select
                className="form-input"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              >
                <option value="1 Month">1 Month</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
                <option value="1 Year">1 Year</option>
              </select>
            </div>

            <div>
              <label className="form-label">Features</label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    className="form-input flex-1"
                    placeholder="Enter feature"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-600 hover:text-red-800 p-1"
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

            <div>
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button type="submit" className="btn-primary flex-1">
                {isEdit ? 'Update Plan' : 'Create Plan'}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-900">{subscriptions.length}</div>
            <div className="text-sm text-gray-600">Total Plans</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {subscriptions.reduce((sum, s) => sum + s.subscribers, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Subscribers</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-gold-600">
              {formatCurrency(subscriptions.reduce((sum, s) => sum + (s.price * s.subscribers), 0))}
            </div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-coral-400">
              {Math.round(subscriptions.reduce((sum, s) => sum + s.subscribers, 0) / subscriptions.length)}
            </div>
            <div className="text-sm text-gray-600">Avg per Plan</div>
          </div>
        </Card>
      </div>

      {/* Subscription Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {subscriptions.map((plan, index) => (
          <Card key={plan.id} className={`relative ${index === 1 ? 'ring-2 ring-gold-500' : ''}`}>
            {index === 1 && (
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
                <div className="text-3xl font-bold text-primary-900 mb-1">
                  {formatCurrency(plan.price)}
                </div>
                <div className="text-sm text-gray-600">per {plan.duration}</div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {plan.subscribers} subscribers
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
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
                  onClick={() => handleDeletePlan(plan.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Plan Comparison Table */}
      <Card title="Plan Comparison">
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Feature</th>
                {subscriptions.map(plan => (
                  <th key={plan.id} className="text-center py-3 px-4 font-semibold text-gray-700">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-900">Price</td>
                {subscriptions.map(plan => (
                  <td key={plan.id} className="text-center py-3 px-4 font-semibold text-primary-900">
                    {formatCurrency(plan.price)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-900">Duration</td>
                {subscriptions.map(plan => (
                  <td key={plan.id} className="text-center py-3 px-4 text-gray-700">
                    {plan.duration}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-900">Active Subscribers</td>
                {subscriptions.map(plan => (
                  <td key={plan.id} className="text-center py-3 px-4 font-semibold text-green-600">
                    {plan.subscribers}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-900">Monthly Revenue</td>
                {subscriptions.map(plan => (
                  <td key={plan.id} className="text-center py-3 px-4 font-semibold text-gold-600">
                    {formatCurrency(plan.price * plan.subscribers)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

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