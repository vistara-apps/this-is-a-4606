import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import subscriptionService from '../../services/subscriptionService';
import { subscriptionPlans } from '../../config';
import { Check, Loader2, AlertCircle } from 'lucide-react';

const SubscriptionPlan = ({ onComplete }) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = Object.values(subscriptionPlans).map(plan => ({
    ...plan,
    orderLimit: plan.orderLimit === Infinity ? 'Unlimited' : plan.orderLimit,
  }));

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would redirect to Stripe checkout
      // For now, we'll just simulate a successful subscription
      
      // Update the user's subscription plan in the database
      await supabase
        .from('users')
        .update({
          subscriptionPlan: selectedPlan,
          subscriptionStatus: 'active',
        })
        .eq('id', user.id);
      
      // Mark this step as complete
      onComplete();
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      setError('Failed to subscribe to plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Choose a Subscription Plan</h3>
        <p className="text-gray-400">
          Select a plan that fits your business needs. You can upgrade or downgrade anytime.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-dark-surface/50 rounded-lg p-6 border transition-all ${
              selectedPlan === plan.id
                ? 'border-purple-500 ring-2 ring-purple-500/50'
                : 'border-dark-border hover:border-gray-500'
            }`}
            onClick={() => handleSelectPlan(plan.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>
              {selectedPlan === plan.id && (
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">${plan.price}</span>
              <span className="text-gray-400">/month</span>
            </div>
            
            <div className="text-sm text-gray-400 mb-4">
              {typeof plan.orderLimit === 'number'
                ? `Up to ${plan.orderLimit} orders per month`
                : 'Unlimited orders per month'}
            </div>
            
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check size={16} className="text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleSelectPlan(plan.id)}
              className={`w-full py-2 px-4 rounded-lg transition-colors ${
                selectedPlan === plan.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-dark-card text-gray-300 hover:bg-dark-border'
              }`}
            >
              {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          <strong>Note:</strong> You can start with a 14-day free trial of any plan. You won't be charged until the trial ends, and you can cancel anytime.
        </p>
      </div>
      
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin mr-2" />
            Processing...
          </>
        ) : (
          `Start Free Trial with ${plans.find(p => p.id === selectedPlan)?.name}`
        )}
      </button>
      
      <p className="text-center text-gray-400 text-sm">
        By subscribing, you agree to our{' '}
        <a href="#" className="text-purple-400 hover:text-purple-300">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-purple-400 hover:text-purple-300">
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export default SubscriptionPlan;
