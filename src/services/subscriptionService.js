import { supabase } from '../lib/supabase';
import axios from 'axios';
import { subscriptionPlans, apiEndpoints } from '../config';

// Subscription plans
export const SUBSCRIPTION_PLANS = subscriptionPlans;

// Function to create a checkout session with Stripe
export const createCheckoutSession = async (userId, planId, successUrl, cancelUrl) => {
  try {
    // Get the plan details
    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
    
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }
    
    // Create a checkout session
    const response = await axios.post(apiEndpoints.createCheckoutSession, {
      userId,
      planId,
      successUrl,
      cancelUrl,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
};

// Function to get a user's subscription
export const getUserSubscription = async (userId) => {
  try {
    // Get the user's subscription from the database
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*, subscription_items(*)')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
      throw new Error('Failed to get user subscription');
    }
    
    if (!subscription) {
      return null;
    }
    
    // Get the plan ID from the subscription items
    const planId = subscription.subscription_items[0]?.price?.product?.metadata?.plan_id || 'basic';
    
    // Get the plan details
    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
    
    return {
      ...subscription,
      plan,
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    throw new Error('Failed to get user subscription');
  }
};

// Function to check if a user has an active subscription
export const hasActiveSubscription = async (userId) => {
  try {
    // Get the user's subscription
    const subscription = await getUserSubscription(userId);
    
    // Check if the subscription is active
    return subscription && subscription.status === 'active';
  } catch (error) {
    console.error('Error checking if user has active subscription:', error);
    return false;
  }
};

// Function to get a user's subscription plan
export const getUserSubscriptionPlan = async (userId) => {
  try {
    // Get the user's subscription
    const subscription = await getUserSubscription(userId);
    
    // Return the plan or the basic plan if no subscription is found
    return subscription?.plan || SUBSCRIPTION_PLANS.BASIC;
  } catch (error) {
    console.error('Error getting user subscription plan:', error);
    return SUBSCRIPTION_PLANS.BASIC;
  }
};

// Function to check if a user has reached their order limit
export const hasReachedOrderLimit = async (userId) => {
  try {
    // Get the user's subscription plan
    const plan = await getUserSubscriptionPlan(userId);
    
    // If the plan has unlimited orders, return false
    if (plan.orderLimit === Infinity) {
      return false;
    }
    
    // Get the current month's orders
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .gte('orderDate', startOfMonth.toISOString());
      
    if (error) {
      throw new Error('Failed to get order count');
    }
    
    // Check if the user has reached their order limit
    return count >= plan.orderLimit;
  } catch (error) {
    console.error('Error checking if user has reached order limit:', error);
    return false;
  }
};

// Function to cancel a subscription
export const cancelSubscription = async (userId) => {
  try {
    // Get the user's subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      throw new Error('Failed to get user subscription');
    }
    
    // Cancel the subscription
    const response = await axios.post(apiEndpoints.cancelSubscription, {
      subscriptionId: subscription.id,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
};

// Function to update a subscription
export const updateSubscription = async (userId, planId) => {
  try {
    // Get the user's subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      throw new Error('Failed to get user subscription');
    }
    
    // Update the subscription
    const response = await axios.post(apiEndpoints.updateSubscription, {
      subscriptionId: subscription.id,
      planId,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Failed to update subscription');
  }
};

export default {
  SUBSCRIPTION_PLANS,
  createCheckoutSession,
  getUserSubscription,
  hasActiveSubscription,
  getUserSubscriptionPlan,
  hasReachedOrderLimit,
  cancelSubscription,
  updateSubscription,
};
