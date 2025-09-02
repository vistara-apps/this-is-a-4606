import axios from 'axios';
import { supabase } from './supabase';
import { shippoConfig } from '../config';
import { handleError } from './errorHandler';

// Base URL for Shippo API
const SHIPPO_API_BASE_URL = shippoConfig.apiBaseUrl;

// Create an axios instance for Shippo API
const createShippoApiClient = (apiKey) => {
  return axios.create({
    baseURL: SHIPPO_API_BASE_URL,
    headers: {
      'Authorization': `ShippoToken ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
};

// Validate Shippo API key
export const validateApiKey = async (apiKey) => {
  try {
    const client = createShippoApiClient(apiKey);
    
    // Try to get the user's address
    await client.get('/addresses/');
    
    return { valid: true };
  } catch (error) {
    console.error('Error validating Shippo API key:', error);
    return { valid: false, error };
  }
};

// Save Shippo API key
export const saveApiKey = async (apiKey, userId) => {
  try {
    const { data, error } = await supabase
      .from('shipping_settings')
      .upsert({
        user_id: userId,
        shippo_api_key: apiKey,
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return { data };
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: true,
    });
  }
};

// Save shipping profile
export const saveShippingProfile = async (profile, userId) => {
  try {
    // Create the address in Shippo
    const client = createShippoApiClient(profile.shippoApiKey);
    
    const response = await client.post('/addresses/', {
      name: profile.name,
      company: profile.company,
      street1: profile.street1,
      street2: profile.street2,
      city: profile.city,
      state: profile.state,
      zip: profile.zip,
      country: profile.country,
      phone: profile.phone,
      email: profile.email,
      validate: true,
    });
    
    // Save the profile to the database
    const { data, error } = await supabase
      .from('shipping_profiles')
      .upsert({
        user_id: userId,
        address_id: response.data.object_id,
        name: profile.name,
        company: profile.company,
        street1: profile.street1,
        street2: profile.street2,
        city: profile.city,
        state: profile.state,
        zip: profile.zip,
        country: profile.country,
        phone: profile.phone,
        email: profile.email,
        is_default: profile.is_default,
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return { data };
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: true,
    });
  }
};

// Create a shipment
export const createShipment = async (apiKey, shipmentData) => {
  try {
    const client = createShippoApiClient(apiKey);
    
    const response = await client.post('/shipments/', {
      ...shipmentData,
      async: false,
    });
    
    return { shipment: response.data };
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: true,
    });
  }
};

// Purchase a label
export const purchaseLabel = async (apiKey, rateId) => {
  try {
    const client = createShippoApiClient(apiKey);
    
    const response = await client.post('/transactions/', {
      rate: rateId,
      async: false,
    });
    
    return { transaction: response.data };
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: true,
    });
  }
};

// Track a shipment
export const trackShipment = async (apiKey, carrier, trackingNumber) => {
  try {
    const client = createShippoApiClient(apiKey);
    
    const response = await client.post('/tracks/', {
      carrier,
      tracking_number: trackingNumber,
    });
    
    return { tracking: response.data };
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: false,
    });
  }
};

// Get shipping rates
export const getShippingRates = async (apiKey, shipmentId) => {
  try {
    const client = createShippoApiClient(apiKey);
    
    const response = await client.get(`/shipments/${shipmentId}/rates/`);
    
    return { rates: response.data };
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: false,
    });
  }
};

export default {
  validateApiKey,
  saveApiKey,
  saveShippingProfile,
  createShipment,
  purchaseLabel,
  trackShipment,
  getShippingRates,
};

