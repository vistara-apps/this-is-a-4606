import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

// Authentication helpers
export const auth = {
  // Sign up a new user
  signUp: async ({ email, password, metadata = {} }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  },

  // Sign in an existing user
  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out the current user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Reset password for a user
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  },

  // Update user password
  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },

  // Get the current user session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // Get the current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },
};

// Database helpers
export const db = {
  // Users
  users: {
    // Get a user by ID
    getById: async (id) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    // Update a user
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    // Get user subscription
    getSubscription: async (userId) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, subscription_items(*)')
        .eq('user_id', userId)
        .single();
      return { data, error };
    },
  },

  // Orders
  orders: {
    // Get all orders for a user
    getByUser: async (userId, options = {}) => {
      const { page = 1, limit = 10, status } = options;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('userId', userId)
        .order('orderDate', { ascending: false })
        .range(from, to);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;
      return { data, error, count, page, limit };
    },

    // Get a single order by ID
    getById: async (orderId) => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('orderId', orderId)
        .single();
      return { data, error };
    },

    // Create a new order
    create: async (order) => {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();
      return { data, error };
    },

    // Update an order
    update: async (orderId, updates) => {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('orderId', orderId)
        .select()
        .single();
      return { data, error };
    },
  },

  // Products
  products: {
    // Get all products for a user
    getByUser: async (userId, options = {}) => {
      const { page = 1, limit = 10 } = options;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('userId', userId)
        .order('productName', { ascending: true })
        .range(from, to);
      return { data, error, count, page, limit };
    },

    // Get a single product by ID
    getById: async (productId) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('productId', productId)
        .single();
      return { data, error };
    },

    // Create a new product
    create: async (product) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      return { data, error };
    },

    // Update a product
    update: async (productId, updates) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('productId', productId)
        .select()
        .single();
      return { data, error };
    },

    // Update stock level
    updateStock: async (productId, stockChange) => {
      // First get the current stock level
      const { data: product, error: getError } = await db.products.getById(productId);
      
      if (getError) {
        return { error: getError };
      }
      
      const newStockLevel = product.stockLevel + stockChange;
      
      // Update the stock level
      const { data, error } = await supabase
        .from('products')
        .update({ stockLevel: newStockLevel })
        .eq('productId', productId)
        .select()
        .single();
        
      return { data, error };
    },
  },
};

export default supabase;
