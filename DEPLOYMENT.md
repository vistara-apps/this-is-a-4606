# Deployment Guide for TikTokFlow

This guide provides detailed instructions for deploying TikTokFlow to production.

## Prerequisites

Before deploying TikTokFlow, ensure you have the following:

- A Supabase account and project
- A TikTok Shop Developer account
- A Shippo account
- A Stripe account (for subscription management)
- A Vercel account (for hosting)

## Supabase Setup

### Database Setup

1. Create a new Supabase project.

2. Create the following tables in your Supabase database:

#### Users Table

```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  tiktokShopId TEXT,
  subscriptionPlan TEXT DEFAULT 'basic',
  subscriptionStatus TEXT DEFAULT 'inactive',
  onboardingCompleted BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Orders Table

```sql
CREATE TABLE orders (
  orderId TEXT PRIMARY KEY,
  userId UUID REFERENCES users(id) NOT NULL,
  customerName TEXT NOT NULL,
  customerAddress TEXT NOT NULL,
  productName TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  orderDate DATE NOT NULL,
  shippingLabelUrl TEXT,
  trackingNumber TEXT,
  status TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Products Table

```sql
CREATE TABLE products (
  productId TEXT PRIMARY KEY,
  userId UUID REFERENCES users(id) NOT NULL,
  productName TEXT NOT NULL,
  sku TEXT NOT NULL,
  stockLevel INTEGER NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### TikTok Shop Credentials Table

```sql
CREATE TABLE tiktok_shop_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  shop_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  access_token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Shipping Settings Table

```sql
CREATE TABLE shipping_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  shippo_api_key TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Shipping Profiles Table

```sql
CREATE TABLE shipping_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  address_id TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  street1 TEXT NOT NULL,
  street2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  status TEXT NOT NULL,
  price_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE
);
```

### Row Level Security (RLS)

Set up Row Level Security (RLS) policies for each table:

#### Users Table

```sql
-- Users can only read their own data
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  USING (auth.uid() = id);
```

#### Orders Table

```sql
-- Users can only read their own orders
CREATE POLICY "Users can read their own orders" ON orders
  FOR SELECT
  USING (auth.uid() = userId);

-- Users can only insert their own orders
CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = userId);

-- Users can only update their own orders
CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE
  USING (auth.uid() = userId);
```

#### Products Table

```sql
-- Users can only read their own products
CREATE POLICY "Users can read their own products" ON products
  FOR SELECT
  USING (auth.uid() = userId);

-- Users can only insert their own products
CREATE POLICY "Users can insert their own products" ON products
  FOR INSERT
  WITH CHECK (auth.uid() = userId);

-- Users can only update their own products
CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE
  USING (auth.uid() = userId);
```

Apply similar RLS policies to the other tables.

### Authentication Setup

1. Configure email authentication in the Supabase dashboard.

2. Set up email templates for:
   - Sign up confirmation
   - Password reset
   - Email change confirmation

## TikTok Shop API Setup

1. Create a TikTok Shop Developer account.

2. Create a new app in the TikTok Shop Developer Portal.

3. Configure the OAuth redirect URL to your application's URL.

4. Get the Client ID and Client Secret.

## Shippo API Setup

1. Create a Shippo account.

2. Get your API key from the Shippo dashboard.

## Stripe Setup

1. Create a Stripe account.

2. Create the following products and prices:
   - Basic Plan: $29/month
   - Standard Plan: $49/month
   - Premium Plan: $99/month

3. Set up webhooks to handle subscription events.

## Serverless Functions

Create the following serverless functions:

### Create Checkout Session

```javascript
// /api/create-checkout-session
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, planId, successUrl, cancelUrl } = req.body;

  try {
    // Get the price ID for the plan
    let priceId;
    switch (planId) {
      case 'basic':
        priceId = process.env.STRIPE_BASIC_PRICE_ID;
        break;
      case 'standard':
        priceId = process.env.STRIPE_STANDARD_PRICE_ID;
        break;
      case 'premium':
        priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
        break;
      default:
        return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Get the user's email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: userId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId,
          planId,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
```

### Cancel Subscription

```javascript
// /api/cancel-subscription
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subscriptionId } = req.body;

  try {
    // Cancel the subscription
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return res.status(200).json({ subscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}
```

### Update Subscription

```javascript
// /api/update-subscription
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subscriptionId, planId } = req.body;

  try {
    // Get the price ID for the plan
    let priceId;
    switch (planId) {
      case 'basic':
        priceId = process.env.STRIPE_BASIC_PRICE_ID;
        break;
      case 'standard':
        priceId = process.env.STRIPE_STANDARD_PRICE_ID;
        break;
      case 'premium':
        priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
        break;
      default:
        return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update the subscription
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      metadata: {
        ...subscription.metadata,
        planId,
      },
    });

    return res.status(200).json({ subscription: updatedSubscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ error: 'Failed to update subscription' });
  }
}
```

### Stripe Webhook

```javascript
// /api/stripe-webhook
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return res.status(200).json({ received: true });
}

async function handleCheckoutSessionCompleted(session) {
  const userId = session.client_reference_id;
  const subscriptionId = session.subscription;

  // Update the user's subscription status
  await supabase
    .from('users')
    .update({
      subscriptionStatus: 'active',
    })
    .eq('id', userId);
}

async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata.userId;
  const planId = subscription.metadata.planId;

  // Create a new subscription record
  await supabase.from('subscriptions').insert({
    id: subscription.id,
    user_id: userId,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    created: new Date(subscription.created * 1000).toISOString(),
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  });

  // Update the user's subscription plan
  await supabase
    .from('users')
    .update({
      subscriptionPlan: planId,
      subscriptionStatus: subscription.status,
    })
    .eq('id', userId);
}

async function handleSubscriptionUpdated(subscription) {
  // Update the subscription record
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      quantity: subscription.items.data[0].quantity,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    })
    .eq('id', subscription.id);

  // Update the user's subscription status
  const userId = subscription.metadata.userId;
  const planId = subscription.metadata.planId;

  await supabase
    .from('users')
    .update({
      subscriptionPlan: planId,
      subscriptionStatus: subscription.status,
    })
    .eq('id', userId);
}

async function handleSubscriptionDeleted(subscription) {
  // Update the subscription record
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      ended_at: new Date(subscription.ended_at * 1000).toISOString(),
    })
    .eq('id', subscription.id);

  // Update the user's subscription status
  const userId = subscription.metadata.userId;

  await supabase
    .from('users')
    .update({
      subscriptionStatus: 'inactive',
    })
    .eq('id', userId);
}
```

### TikTok Shop Webhook

```javascript
// /api/tiktok-webhook
import { createClient } from '@supabase/supabase-js';
import orderService from '../../src/services/orderService';
import inventoryService from '../../src/services/inventoryService';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event_type, timestamp, data } = req.body;

  try {
    switch (event_type) {
      case 'order.created':
        await handleOrderCreated(data.order_id);
        break;
      case 'order.updated':
        await handleOrderUpdated(data.order_id);
        break;
      case 'product.updated':
        await handleProductUpdated(data.product_id);
        break;
      case 'inventory.updated':
        await handleInventoryUpdated(data.product_id, data.sku_id, data.stock_level);
        break;
      default:
        console.log(`Unhandled event type: ${event_type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling TikTok Shop webhook:', error);
    return res.status(500).json({ error: 'Failed to handle TikTok Shop webhook' });
  }
}

async function handleOrderCreated(orderId) {
  // Get the order details from TikTok Shop
  const orderDetails = await tiktokShopApi.getOrderDetails(orderId);

  // Get the user ID from the TikTok Shop credentials
  const { data: credentials, error } = await supabase
    .from('tiktok_shop_credentials')
    .select('user_id')
    .eq('shop_id', orderDetails.shop_id)
    .single();

  if (error) {
    throw new Error('Failed to get user ID from TikTok Shop credentials');
  }

  // Sync the order
  await orderService.syncOrders(credentials.user_id);

  // Handle inventory updates
  await inventoryService.handleOrderCreation({
    orderId,
    userId: credentials.user_id,
    productName: orderDetails.items[0].product_name,
    quantity: orderDetails.items.reduce((total, item) => total + item.quantity, 0),
  });
}

async function handleOrderUpdated(orderId) {
  // Get the order details from TikTok Shop
  const orderDetails = await tiktokShopApi.getOrderDetails(orderId);

  // Get the user ID from the TikTok Shop credentials
  const { data: credentials, error } = await supabase
    .from('tiktok_shop_credentials')
    .select('user_id')
    .eq('shop_id', orderDetails.shop_id)
    .single();

  if (error) {
    throw new Error('Failed to get user ID from TikTok Shop credentials');
  }

  // Sync the order
  await orderService.syncOrders(credentials.user_id);
}

async function handleProductUpdated(productId) {
  // Get the product details from TikTok Shop
  const productDetails = await tiktokShopApi.getProductDetails(productId);

  // Get the user ID from the TikTok Shop credentials
  const { data: credentials, error } = await supabase
    .from('tiktok_shop_credentials')
    .select('user_id')
    .eq('shop_id', productDetails.shop_id)
    .single();

  if (error) {
    throw new Error('Failed to get user ID from TikTok Shop credentials');
  }

  // Sync the products
  await inventoryService.syncProducts(credentials.user_id);
}

async function handleInventoryUpdated(productId, skuId, stockLevel) {
  // Get the product details from TikTok Shop
  const productDetails = await tiktokShopApi.getProductDetails(productId);

  // Get the user ID from the TikTok Shop credentials
  const { data: credentials, error } = await supabase
    .from('tiktok_shop_credentials')
    .select('user_id')
    .eq('shop_id', productDetails.shop_id)
    .single();

  if (error) {
    throw new Error('Failed to get user ID from TikTok Shop credentials');
  }

  // Get the product from the database
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('productId', productId)
    .eq('userId', credentials.user_id)
    .single();

  if (productError && productError.code !== 'PGRST116') {
    throw new Error('Failed to get product from database');
  }

  if (product) {
    // Update the product stock level
    await supabase
      .from('products')
      .update({
        stockLevel: stockLevel,
      })
      .eq('productId', productId)
      .eq('userId', credentials.user_id);
  } else {
    // Sync the products
    await inventoryService.syncProducts(credentials.user_id);
  }
}
```

## Environment Variables

Set the following environment variables in your deployment environment:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_TIKTOK_SHOP_CLIENT_ID=your-tiktok-shop-client-id
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
STRIPE_BASIC_PRICE_ID=your-stripe-basic-price-id
STRIPE_STANDARD_PRICE_ID=your-stripe-standard-price-id
STRIPE_PREMIUM_PRICE_ID=your-stripe-premium-price-id
```

## Vercel Deployment

1. Push your code to a GitHub repository.

2. Connect your repository to Vercel.

3. Set the environment variables in the Vercel dashboard.

4. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. Deploy the application.

## Post-Deployment Tasks

1. Set up the TikTok Shop webhook URL in the TikTok Shop Developer Portal.

2. Set up the Stripe webhook URL in the Stripe dashboard.

3. Test the application end-to-end:
   - Sign up for a new account
   - Complete the onboarding process
   - Connect a TikTok Shop account
   - Set up shipping settings
   - Subscribe to a plan
   - Test order ingestion
   - Test shipping label generation
   - Test inventory synchronization

## Monitoring and Maintenance

1. Set up logging and monitoring:
   - Vercel Analytics
   - Sentry for error tracking
   - Logtail for log management

2. Set up regular database backups.

3. Set up a CI/CD pipeline for automated testing and deployment.

4. Set up a staging environment for testing new features before deploying to production.

5. Set up a monitoring dashboard to track key metrics:
   - User signups
   - Order volume
   - Shipping label generation
   - Subscription conversions
   - Error rates

## Troubleshooting

### Common Issues

1. **TikTok Shop API Authentication Errors**
   - Check that the OAuth redirect URL is correctly configured
   - Check that the access token is being refreshed properly
   - Check that the API credentials are stored securely

2. **Shippo API Errors**
   - Check that the API key is valid
   - Check that the address validation is working properly
   - Check that the shipping label generation is working properly

3. **Stripe Subscription Errors**
   - Check that the webhook is configured correctly
   - Check that the subscription events are being handled properly
   - Check that the subscription status is being updated in the database

4. **Database Errors**
   - Check that the RLS policies are configured correctly
   - Check that the database schema is up to date
   - Check that the database indexes are optimized for performance

### Support Resources

- [TikTok Shop Developer Support](https://developers.tiktok-shops.com/support)
- [Shippo Support](https://goshippo.com/support)
- [Stripe Support](https://support.stripe.com)
- [Supabase Support](https://supabase.com/support)
- [Vercel Support](https://vercel.com/support)

