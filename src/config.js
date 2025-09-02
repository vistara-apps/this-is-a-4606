// Application configuration

// Environment variables
const env = import.meta.env || window.env || {};

// Supabase configuration
export const supabaseConfig = {
  url: env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co',
  anonKey: env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
};

// TikTok Shop API configuration
export const tiktokShopConfig = {
  clientId: env.VITE_TIKTOK_SHOP_CLIENT_ID || 'your-tiktok-shop-client-id',
  redirectUri: `${window.location.origin}/onboarding`,
  oauthUrl: 'https://auth.tiktok-shops.com/oauth/authorize',
  apiBaseUrl: 'https://open-api.tiktokglobalshop.com',
};

// Shippo API configuration
export const shippoConfig = {
  apiBaseUrl: 'https://api.goshippo.com/',
};

// Subscription plans
export const subscriptionPlans = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 29,
    orderLimit: 50,
    description: 'Perfect for new TikTok Shop creators',
    features: [
      'Up to 50 orders per month',
      'Automated order ingestion',
      'One-click shipping label generation',
      'Basic analytics',
    ],
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 49,
    orderLimit: 150,
    description: 'For growing TikTok Shop creators',
    features: [
      'Up to 150 orders per month',
      'Automated order ingestion',
      'One-click shipping label generation',
      'Advanced analytics',
      'Priority support',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 99,
    orderLimit: Infinity,
    description: 'For established TikTok Shop creators',
    features: [
      'Unlimited orders',
      'Automated order ingestion',
      'One-click shipping label generation',
      'Advanced analytics',
      'Priority support',
      'Real-time inventory sync',
      'Multi-channel support',
    ],
  },
};

// API endpoints
export const apiEndpoints = {
  createCheckoutSession: '/api/create-checkout-session',
  cancelSubscription: '/api/cancel-subscription',
  updateSubscription: '/api/update-subscription',
  stripeWebhook: '/api/stripe-webhook',
  tiktokWebhook: '/api/tiktok-webhook',
};

// Application routes
export const routes = {
  home: '/',
  dashboard: '/dashboard',
  orders: '/orders',
  products: '/products',
  shipping: '/shipping',
  settings: '/settings',
  signup: '/signup',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  onboarding: '/onboarding',
};

// Default settings
export const defaultSettings = {
  theme: 'dark',
  notifications: {
    orderCreated: true,
    orderShipped: true,
    lowStock: true,
  },
  pagination: {
    ordersPerPage: 10,
    productsPerPage: 10,
  },
};

// Error messages
export const errorMessages = {
  auth: {
    invalidCredentials: 'Invalid email or password. Please try again.',
    emailInUse: 'This email is already in use. Please try another email.',
    weakPassword: 'Password is too weak. It should be at least 8 characters long and include uppercase, lowercase, and numbers.',
    passwordMismatch: 'Passwords do not match. Please try again.',
    emailRequired: 'Email is required.',
    passwordRequired: 'Password is required.',
  },
  tiktokShop: {
    connectionFailed: 'Failed to connect to TikTok Shop. Please try again.',
    apiError: 'TikTok Shop API error. Please try again.',
  },
  shippo: {
    invalidApiKey: 'Invalid Shippo API key. Please check and try again.',
    labelGenerationFailed: 'Failed to generate shipping label. Please try again.',
  },
  subscription: {
    paymentFailed: 'Payment failed. Please try again.',
    subscriptionCanceled: 'Subscription canceled.',
    subscriptionUpdated: 'Subscription updated.',
  },
  general: {
    unexpectedError: 'An unexpected error occurred. Please try again.',
    networkError: 'Network error. Please check your internet connection and try again.',
    serverError: 'Server error. Please try again later.',
  },
};

export default {
  supabaseConfig,
  tiktokShopConfig,
  shippoConfig,
  subscriptionPlans,
  apiEndpoints,
  routes,
  defaultSettings,
  errorMessages,
};

