import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Create a .env file with these variables for production
if (import.meta.env.DEV) {
  window.env = {
    VITE_SUPABASE_URL: 'https://your-project-url.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'your-anon-key',
    VITE_TIKTOK_SHOP_CLIENT_ID: 'your-tiktok-shop-client-id',
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
