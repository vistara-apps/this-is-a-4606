import axios from 'axios';
import { supabase } from './supabase';
import { tiktokShopConfig } from '../config';

// Base URL for TikTok Shop API
const TIKTOK_SHOP_API_BASE_URL = tiktokShopConfig.apiBaseUrl;

// Create an axios instance for TikTok Shop API
const tiktokShopApiClient = axios.create({
  baseURL: TIKTOK_SHOP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the access token to all requests
tiktokShopApiClient.interceptors.request.use(
  async (config) => {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get the user's TikTok Shop API credentials from the database
    const { data: credentials, error } = await supabase
      .from('tiktok_shop_credentials')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (error || !credentials) {
      throw new Error('TikTok Shop API credentials not found');
    }
    
    // Check if the access token is expired
    const now = new Date();
    const tokenExpiry = new Date(credentials.access_token_expires_at);
    
    // If the token is expired or about to expire (within 5 minutes), refresh it
    if (!tokenExpiry || now.getTime() > tokenExpiry.getTime() - 5 * 60 * 1000) {
      // Refresh the access token
      const refreshedCredentials = await refreshAccessToken(credentials.refresh_token, user.id);
      
      // Update the config with the new access token
      config.headers.Authorization = `Bearer ${refreshedCredentials.access_token}`;
    } else {
      // Use the existing access token
      config.headers.Authorization = `Bearer ${credentials.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to refresh the access token
const refreshAccessToken = async (refreshToken, userId) => {
  try {
    // Make a request to the TikTok Shop API to refresh the access token
    const response = await axios.post(`${TIKTOK_SHOP_API_BASE_URL}/api/v2/token/refresh`, {
      refresh_token: refreshToken,
    });
    
    const { access_token, refresh_token, expires_in } = response.data.data;
    
    // Calculate the expiry date
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expires_in);
    
    // Update the credentials in the database
    const { data, error } = await supabase
      .from('tiktok_shop_credentials')
      .update({
        access_token,
        refresh_token,
        access_token_expires_at: expiryDate.toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error) {
      throw new Error('Failed to update TikTok Shop API credentials');
    }
    
    return data;
  } catch (error) {
    console.error('Error refreshing TikTok Shop API access token:', error);
    throw new Error('Failed to refresh TikTok Shop API access token');
  }
};

// Function to connect a TikTok Shop account
export const connectTikTokShop = async (authCode, userId) => {
  try {
    // Exchange the authorization code for an access token
    const response = await axios.post(`${TIKTOK_SHOP_API_BASE_URL}/api/v2/token/get`, {
      auth_code: authCode,
      grant_type: 'authorization_code',
    });
    
    const { access_token, refresh_token, expires_in, shop_id, seller_name } = response.data.data;
    
    // Calculate the expiry date
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expires_in);
    
    // Store the credentials in the database
    const { data, error } = await supabase
      .from('tiktok_shop_credentials')
      .upsert({
        user_id: userId,
        shop_id,
        seller_name,
        access_token,
        refresh_token,
        access_token_expires_at: expiryDate.toISOString(),
      })
      .select()
      .single();
      
    if (error) {
      throw new Error('Failed to store TikTok Shop API credentials');
    }
    
    // Update the user's tiktokShopId in the users table
    await supabase
      .from('users')
      .update({
        tiktokShopId: shop_id,
      })
      .eq('id', userId);
      
    return data;
  } catch (error) {
    console.error('Error connecting TikTok Shop account:', error);
    throw new Error('Failed to connect TikTok Shop account');
  }
};

// Function to get orders from TikTok Shop
export const getOrders = async (params = {}) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = params;
    
    // Build the request parameters
    const requestParams = {
      page_size: limit,
      page_number: page,
    };
    
    // Add optional parameters if provided
    if (status) {
      requestParams.order_status = status;
    }
    
    if (startDate) {
      requestParams.create_time_from = new Date(startDate).toISOString();
    }
    
    if (endDate) {
      requestParams.create_time_to = new Date(endDate).toISOString();
    }
    
    // Make the request to the TikTok Shop API
    const response = await tiktokShopApiClient.get('/api/orders/search', {
      params: requestParams,
    });
    
    return {
      orders: response.data.data.orders,
      total: response.data.data.total,
      page,
      limit,
    };
  } catch (error) {
    console.error('Error getting orders from TikTok Shop:', error);
    throw new Error('Failed to get orders from TikTok Shop');
  }
};

// Function to get order details from TikTok Shop
export const getOrderDetails = async (orderId) => {
  try {
    // Make the request to the TikTok Shop API
    const response = await tiktokShopApiClient.get('/api/orders/detail/query', {
      params: {
        order_id: orderId,
      },
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error getting order details from TikTok Shop:', error);
    throw new Error('Failed to get order details from TikTok Shop');
  }
};

// Function to get products from TikTok Shop
export const getProducts = async (params = {}) => {
  try {
    const { page = 1, limit = 10 } = params;
    
    // Make the request to the TikTok Shop API
    const response = await tiktokShopApiClient.get('/api/products/search', {
      params: {
        page_size: limit,
        page_number: page,
      },
    });
    
    return {
      products: response.data.data.products,
      total: response.data.data.total,
      page,
      limit,
    };
  } catch (error) {
    console.error('Error getting products from TikTok Shop:', error);
    throw new Error('Failed to get products from TikTok Shop');
  }
};

// Function to get product details from TikTok Shop
export const getProductDetails = async (productId) => {
  try {
    // Make the request to the TikTok Shop API
    const response = await tiktokShopApiClient.get('/api/products/details', {
      params: {
        product_id: productId,
      },
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error getting product details from TikTok Shop:', error);
    throw new Error('Failed to get product details from TikTok Shop');
  }
};

// Function to update product inventory in TikTok Shop
export const updateProductInventory = async (productId, skuId, quantity) => {
  try {
    // Make the request to the TikTok Shop API
    const response = await tiktokShopApiClient.post('/api/products/stocks', {
      product_id: productId,
      skus: [
        {
          id: skuId,
          stock_infos: [
            {
              warehouse_id: 'default',
              available_stock: quantity,
            },
          ],
        },
      ],
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error updating product inventory in TikTok Shop:', error);
    throw new Error('Failed to update product inventory in TikTok Shop');
  }
};

// Function to update order status in TikTok Shop
export const updateOrderStatus = async (orderId, status, trackingNumber = null) => {
  try {
    // Build the request body
    const requestBody = {
      order_id: orderId,
      status,
    };
    
    // Add tracking number if provided
    if (trackingNumber) {
      requestBody.tracking_number = trackingNumber;
    }
    
    // Make the request to the TikTok Shop API
    const response = await tiktokShopApiClient.post('/api/orders/update', requestBody);
    
    return response.data.data;
  } catch (error) {
    console.error('Error updating order status in TikTok Shop:', error);
    throw new Error('Failed to update order status in TikTok Shop');
  }
};

export default {
  connectTikTokShop,
  getOrders,
  getOrderDetails,
  getProducts,
  getProductDetails,
  updateProductInventory,
  updateOrderStatus,
};
