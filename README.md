# TikTokFlow

TikTokFlow is a web application for TikTok Shop creators to automate order capture, shipping, and inventory management, enabling them to scale operations without manual effort.

![TikTokFlow Dashboard](https://i.imgur.com/example.png)

## Features

- **Automated Order Ingestion**: Automatically pull all new TikTok Shop orders and their details directly into the TikTokFlow platform as they are placed.
- **One-Click Shipping Label Generation**: Generate shipping labels and tracking information for each order directly from the platform, integrating with major shipping carriers.
- **Real-time Inventory Sync**: Synchronize inventory levels across TikTok Shop and other sales channels to prevent overselling.
- **User-friendly Dashboard**: Get a quick overview of your orders, shipments, and inventory levels.
- **Subscription Plans**: Choose a plan that fits your business needs, from basic to premium.

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **APIs**: TikTok Shop API, Shippo API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- TikTok Shop Developer account
- Shippo account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/tiktokflow.git
cd tiktokflow
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_TIKTOK_SHOP_CLIENT_ID=your-tiktok-shop-client-id
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Database Setup

1. Create the following tables in your Supabase database:

- `users`
- `orders`
- `products`
- `tiktok_shop_credentials`
- `shipping_settings`
- `shipping_profiles`
- `subscriptions`

2. Set up Row Level Security (RLS) policies for each table.

3. Create the necessary indexes for performance optimization.

## Deployment

### Vercel Deployment

1. Push your code to a GitHub repository.

2. Connect your repository to Vercel.

3. Set the environment variables in the Vercel dashboard.

4. Deploy the application.

## API Documentation

- [TikTok Shop API](docs/api/tiktok-shop-api.md)
- [Shippo API](docs/api/shippo-api.md)
- [Supabase API](docs/api/supabase-api.md)

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [TikTok Shop](https://affiliate.tiktok.com/shop/api-docs/) for their API
- [Shippo](https://goshippo.com/docs/api) for their shipping API
- [Supabase](https://supabase.com/docs) for their backend services
- [Tailwind CSS](https://tailwindcss.com/) for their CSS framework
- [React](https://reactjs.org/) for their JavaScript library

