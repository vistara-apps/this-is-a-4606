import { supabase } from '../lib/supabase';
import tiktokShopApi from '../lib/tiktokShopApi';
import shippoApi from '../lib/shippoApi';
import { handleError } from '../lib/errorHandler';

// Get all orders for a user
export const getOrders = async (userId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = null,
      sortBy = 'orderDate',
      sortDirection = 'desc',
    } = options;

    // Calculate the range for pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build the query
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .range(from, to)
      .order(sortBy, { ascending: sortDirection === 'asc' });

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Execute the query
    const { data: orders, count, error } = await query;

    if (error) {
      throw error;
    }

    return {
      orders,
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: false,
    });
  }
};

// Get a single order by ID
export const getOrderById = async (orderId, userId) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('orderId', orderId)
      .eq('userId', userId)
      .single();

    if (error) {
      throw error;
    }

    return { order };
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: false,
    });
  }
};

// Sync orders from TikTok Shop
export const syncOrders = async (userId) => {
  try {
    // Get the TikTok Shop credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from('tiktok_shop_credentials')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (credentialsError) {
      throw credentialsError;
    }

    // Get orders from TikTok Shop
    const { orders: tiktokOrders, error: tiktokError } = await tiktokShopApi.getOrders(
      credentials.access_token,
      credentials.shop_id
    );

    if (tiktokError) {
      throw tiktokError;
    }

    // Transform TikTok Shop orders to our format
    const transformedOrders = tiktokOrders.map(order => ({
      orderId: order.order_id,
      userId,
      customerName: order.recipient.name,
      customerAddress: JSON.stringify(order.recipient.address),
      productName: order.items[0].product_name,
      quantity: order.items.reduce((total, item) => total + item.quantity, 0),
      orderDate: new Date(order.create_time).toISOString(),
      shippingLabelUrl: order.shipping_label_url || null,
      trackingNumber: order.tracking_number || null,
      status: order.order_status,
    }));

    // Upsert orders to the database
    const { error: upsertError } = await supabase
      .from('orders')
      .upsert(transformedOrders, {
        onConflict: 'orderId',
        returning: 'minimal',
      });

    if (upsertError) {
      throw upsertError;
    }

    return { success: true };
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: false,
    });
  }
};

// Generate a shipping label for an order
export const generateShippingLabel = async (orderId, userId) => {
  try {
    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('orderId', orderId)
      .eq('userId', userId)
      .single();

    if (orderError) {
      throw orderError;
    }

    // Get the shipping profile
    const { data: profile, error: profileError } = await supabase
      .from('shipping_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Get the shipping settings
    const { data: settings, error: settingsError } = await supabase
      .from('shipping_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError) {
      throw settingsError;
    }

    // Parse the customer address
    const customerAddress = JSON.parse(order.customerAddress);

    // Create the shipment
    const { shipment, error: shipmentError } = await shippoApi.createShipment(
      settings.shippo_api_key,
      {
        address_from: {
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
        },
        address_to: {
          name: order.customerName,
          street1: customerAddress.street1,
          street2: customerAddress.street2,
          city: customerAddress.city,
          state: customerAddress.state,
          zip: customerAddress.zipcode,
          country: customerAddress.country,
          phone: customerAddress.phone,
          email: order.customerEmail,
        },
        parcels: [
          {
            length: '10',
            width: '8',
            height: '4',
            distance_unit: 'in',
            weight: '2',
            mass_unit: 'lb',
          },
        ],
      }
    );

    if (shipmentError) {
      throw shipmentError;
    }

    // Get the cheapest rate
    const rate = shipment.rates.reduce(
      (cheapest, rate) => {
        return parseFloat(rate.amount) < parseFloat(cheapest.amount) ? rate : cheapest;
      },
      shipment.rates[0]
    );

    // Purchase the label
    const { transaction, error: transactionError } = await shippoApi.purchaseLabel(
      settings.shippo_api_key,
      rate.object_id
    );

    if (transactionError) {
      throw transactionError;
    }

    // Update the order with the shipping label and tracking number
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        shippingLabelUrl: transaction.label_url,
        trackingNumber: transaction.tracking_number,
        status: 'Shipped',
      })
      .eq('orderId', orderId)
      .eq('userId', userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Update the order status in TikTok Shop
    const { data: credentials, error: credentialsError } = await supabase
      .from('tiktok_shop_credentials')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (credentialsError) {
      throw credentialsError;
    }

    await tiktokShopApi.updateOrderStatus(
      credentials.access_token,
      credentials.shop_id,
      orderId,
      'SHIPPED',
      transaction.tracking_number
    );

    return updatedOrder;
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: true,
    });
  }
};

// Get order statistics
export const getOrderStatistics = async (userId) => {
  try {
    // Get total orders
    const { count: totalOrders, error: totalError } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('userId', userId);

    if (totalError) {
      throw totalError;
    }

    // Get pending orders
    const { count: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .eq('status', 'AWAITING_SHIPMENT');

    if (pendingError) {
      throw pendingError;
    }

    // Get shipped orders
    const { count: shippedOrders, error: shippedError } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .eq('status', 'Shipped');

    if (shippedError) {
      throw shippedError;
    }

    // Get orders by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select('orderDate')
      .eq('userId', userId)
      .gte('orderDate', thirtyDaysAgo.toISOString())
      .order('orderDate', { ascending: true });

    if (recentError) {
      throw recentError;
    }

    // Group orders by date
    const ordersByDate = recentOrders.reduce((acc, order) => {
      const date = new Date(order.orderDate).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Fill in missing dates
    const orderTrend = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      orderTrend.unshift({
        date: dateString,
        orders: ordersByDate[dateString] || 0,
      });
    }

    return {
      totalOrders,
      pendingOrders,
      shippedOrders,
      orderTrend,
    };
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: false,
    });
  }
};

export default {
  getOrders,
  getOrderById,
  syncOrders,
  generateShippingLabel,
  getOrderStatistics,
};

