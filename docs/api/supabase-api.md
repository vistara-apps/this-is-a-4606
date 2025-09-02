# Supabase API Documentation

This document provides information about the Supabase integration used in TikTokFlow.

## Overview

TikTokFlow uses Supabase as its backend service for authentication, database, and real-time functionality. Supabase provides a PostgreSQL database with a RESTful API, authentication services, and real-time subscriptions.

## Authentication

Supabase provides authentication services through the `supabase.auth` module. TikTokFlow uses email/password authentication.

### Sign Up

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      // User metadata
      onboardingCompleted: false,
    },
  },
});
```

### Sign In

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign Out

```javascript
const { error } = await supabase.auth.signOut();
```

### Get Current User

```javascript
const { data: { user }, error } = await supabase.auth.getUser();
```

### Get Current Session

```javascript
const { data, error } = await supabase.auth.getSession();
```

### Reset Password

```javascript
const { data, error } = await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: 'https://example.com/reset-password',
});
```

### Update Password

```javascript
const { data, error } = await supabase.auth.updateUser({
  password: 'newpassword123',
});
```

## Database

Supabase provides a PostgreSQL database with a RESTful API. TikTokFlow uses the following tables:

### Users Table

The `users` table stores user information.

**Schema:**
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

**Example Query:**
```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

### Orders Table

The `orders` table stores order information.

**Schema:**
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

**Example Query:**
```javascript
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('userId', userId)
  .order('orderDate', { ascending: false });
```

### Products Table

The `products` table stores product information.

**Schema:**
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

**Example Query:**
```javascript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('userId', userId)
  .order('productName', { ascending: true });
```

### TikTok Shop Credentials Table

The `tiktok_shop_credentials` table stores TikTok Shop API credentials.

**Schema:**
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

**Example Query:**
```javascript
const { data, error } = await supabase
  .from('tiktok_shop_credentials')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### Shipping Settings Table

The `shipping_settings` table stores shipping settings.

**Schema:**
```sql
CREATE TABLE shipping_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  shippo_api_key TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Example Query:**
```javascript
const { data, error } = await supabase
  .from('shipping_settings')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### Shipping Profiles Table

The `shipping_profiles` table stores shipping profiles.

**Schema:**
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

**Example Query:**
```javascript
const { data, error } = await supabase
  .from('shipping_profiles')
  .select('*')
  .eq('user_id', userId)
  .eq('is_default', true)
  .single();
```

### Subscriptions Table

The `subscriptions` table stores subscription information.

**Schema:**
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

**Example Query:**
```javascript
const { data, error } = await supabase
  .from('subscriptions')
  .select('*, subscription_items(*)')
  .eq('user_id', userId)
  .single();
```

## Real-time Subscriptions

Supabase provides real-time subscriptions to database changes. TikTokFlow uses this feature to update the UI in real-time when data changes.

### Subscribe to Orders

```javascript
const ordersSubscription = supabase
  .from('orders')
  .on('*', (payload) => {
    // Handle the change
    console.log('Change received!', payload);
    // Update the UI
  })
  .subscribe();
```

### Subscribe to Products

```javascript
const productsSubscription = supabase
  .from('products')
  .on('*', (payload) => {
    // Handle the change
    console.log('Change received!', payload);
    // Update the UI
  })
  .subscribe();
```

### Unsubscribe

```javascript
supabase.removeSubscription(ordersSubscription);
```

## Row Level Security (RLS)

Supabase uses PostgreSQL's Row Level Security (RLS) to restrict access to data. TikTokFlow implements the following RLS policies:

### Users Table

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

### Orders Table

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

### Products Table

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

## Error Handling

Supabase API calls return an object with `data` and `error` properties. TikTokFlow handles errors as follows:

```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

if (error) {
  console.error('Error fetching user:', error);
  // Handle the error
  return;
}

// Use the data
console.log('User:', data);
```

## Best Practices

1. **Authentication**: Use Supabase's built-in authentication system for secure user authentication.
2. **Row Level Security**: Implement RLS policies to restrict access to data.
3. **Error Handling**: Always check for errors in Supabase API responses.
4. **Real-time Subscriptions**: Use real-time subscriptions to update the UI when data changes.
5. **Transactions**: Use transactions for operations that require multiple database changes.

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth](https://supabase.com/docs/reference/javascript/auth-signup)
- [Supabase Database](https://supabase.com/docs/reference/javascript/select)
- [Supabase Real-time](https://supabase.com/docs/reference/javascript/subscribe)

