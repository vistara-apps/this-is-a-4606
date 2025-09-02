import { supabase } from '../lib/supabase';
import tiktokShopApi from '../lib/tiktokShopApi';
import { handleError } from '../lib/errorHandler';

// Get all products for a user
export const getProducts = async (userId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'productName',
      sortDirection = 'asc',
      search = null,
    } = options;

    // Calculate the range for pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build the query
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .range(from, to)
      .order(sortBy, { ascending: sortDirection === 'asc' });

    // Add search filter if provided
    if (search) {
      query = query.ilike('productName', `%${search}%`);
    }

    // Execute the query
    const { data: products, count, error } = await query;

    if (error) {
      throw error;
    }

    return {
      products,
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

// Get a single product by ID
export const getProductById = async (productId, userId) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('productId', productId)
      .eq('userId', userId)
      .single();

    if (error) {
      throw error;
    }

    return { product };
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: false,
    });
  }
};

// Sync products from TikTok Shop
export const syncProducts = async (userId) => {
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

    // Get products from TikTok Shop
    const { products: tiktokProducts, error: tiktokError } = await tiktokShopApi.getProducts(
      credentials.access_token,
      credentials.shop_id
    );

    if (tiktokError) {
      throw tiktokError;
    }

    // Transform TikTok Shop products to our format
    const transformedProducts = tiktokProducts.map(product => ({
      productId: product.id,
      userId,
      productName: product.name,
      sku: product.skus[0]?.seller_sku || '',
      stockLevel: product.stock_infos[0]?.available_stock || 0,
    }));

    // Upsert products to the database
    const { error: upsertError } = await supabase
      .from('products')
      .upsert(transformedProducts, {
        onConflict: 'productId',
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

// Update product inventory
export const updateProductInventory = async (productId, userId, stockLevel) => {
  try {
    // Update the product in the database
    const { data: product, error: updateError } = await supabase
      .from('products')
      .update({ stockLevel })
      .eq('productId', productId)
      .eq('userId', userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Get the TikTok Shop credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from('tiktok_shop_credentials')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (credentialsError) {
      throw credentialsError;
    }

    // Update the product in TikTok Shop
    await tiktokShopApi.updateProductInventory(
      credentials.access_token,
      credentials.shop_id,
      productId,
      stockLevel
    );

    return { product };
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: false,
    });
  }
};

// Handle order creation (update inventory)
export const handleOrderCreation = async (order) => {
  try {
    // Get the product
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('productName', order.productName)
      .eq('userId', order.userId);

    if (productsError) {
      throw productsError;
    }

    if (products.length === 0) {
      // Product not found, sync products
      await syncProducts(order.userId);
      return { success: true };
    }

    // Update the product inventory
    const product = products[0];
    const newStockLevel = Math.max(0, product.stockLevel - order.quantity);

    await updateProductInventory(product.productId, order.userId, newStockLevel);

    return { success: true };
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: false,
    });
  }
};

// Get inventory statistics
export const getInventoryStatistics = async (userId) => {
  try {
    // Get total products
    const { count: totalProducts, error: totalError } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('userId', userId);

    if (totalError) {
      throw totalError;
    }

    // Get low stock products (less than 10 items)
    const { count: lowStockProducts, error: lowStockError } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .lt('stockLevel', 10);

    if (lowStockError) {
      throw lowStockError;
    }

    // Get out of stock products
    const { count: outOfStockProducts, error: outOfStockError } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .eq('stockLevel', 0);

    if (outOfStockError) {
      throw outOfStockError;
    }

    // Get top selling products
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('productName, quantity')
      .eq('userId', userId);

    if (ordersError) {
      throw ordersError;
    }

    // Group orders by product
    const productSales = orders.reduce((acc, order) => {
      acc[order.productName] = (acc[order.productName] || 0) + order.quantity;
      return acc;
    }, {});

    // Convert to array and sort
    const topSellingProducts = Object.entries(productSales)
      .map(([productName, quantity]) => ({ productName, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      topSellingProducts,
    };
  } catch (error) {
    return handleError(error, {
      logError: true,
      throwError: false,
    });
  }
};

export default {
  getProducts,
  getProductById,
  syncProducts,
  updateProductInventory,
  handleOrderCreation,
  getInventoryStatistics,
};

