import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import tiktokShopApi from '../../lib/tiktokShopApi';
import { tiktokShopConfig } from '../../config';
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const TikTokConnection = ({ onComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [shopInfo, setShopInfo] = useState(null);
  const [error, setError] = useState('');

  // Check if the user already has a TikTok Shop connection
  useEffect(() => {
    const checkConnection = async () => {
      setLoading(true);
      
      try {
        // Check if the user has TikTok Shop credentials in the database
        const { data, error } = await supabase
          .from('tiktok_shop_credentials')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (!error && data) {
          setConnected(true);
          setShopInfo({
            shopId: data.shop_id,
            sellerName: data.seller_name,
          });
          
          // If already connected, mark this step as complete
          onComplete();
        }
      } catch (error) {
        console.error('Error checking TikTok Shop connection:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      checkConnection();
    }
  }, [user, onComplete]);

  // Handle the OAuth redirect
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get('code');
      
      if (authCode) {
        setLoading(true);
        setError('');
        
        try {
          // Exchange the authorization code for an access token
          const data = await tiktokShopApi.connectTikTokShop(authCode, user.id);
          
          setConnected(true);
          setShopInfo({
            shopId: data.shop_id,
            sellerName: data.seller_name,
          });
          
          // Mark this step as complete
          onComplete();
          
          // Remove the code from the URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error connecting TikTok Shop account:', error);
          setError('Failed to connect your TikTok Shop account. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (user) {
      handleOAuthRedirect();
    }
  }, [user, onComplete]);

  // Handle the connect button click
  const handleConnect = () => {
    // TikTok Shop OAuth URL
    const { clientId, redirectUri, oauthUrl } = tiktokShopConfig;
    
    const authUrl = `${oauthUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${user.id}&response_type=code`;
    
    // Open the OAuth URL in a new window
    window.location.href = authUrl;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your TikTok Shop</h3>
        <p className="text-gray-400">
          Connect your TikTok Shop account to automatically import orders and sync inventory.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="bg-dark-surface/50 rounded-lg p-6 border border-dark-border">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 size={40} className="text-purple-500 animate-spin mb-4" />
            <p className="text-gray-400">Connecting to TikTok Shop...</p>
          </div>
        ) : connected ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">Successfully Connected!</h4>
            <p className="text-gray-400 mb-4">Your TikTok Shop account is now connected.</p>
            
            <div className="bg-dark-card rounded-lg p-4 w-full max-w-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Shop ID:</span>
                <span className="text-white font-mono">{shopInfo.shopId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Seller Name:</span>
                <span className="text-white">{shopInfo.sellerName}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <img
                src="https://sf16-scmcdn-va.ibytedtos.com/goofy/tiktok/web/node/_next/static/images/logo-5d12568bf09bbc1fd8558caae5cf77fc.svg"
                alt="TikTok Shop"
                className="w-8 h-8"
              />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">Connect to TikTok Shop</h4>
            <p className="text-gray-400 mb-6 text-center">
              You'll be redirected to TikTok Shop to authorize access to your account.
            </p>
            
            <button
              onClick={handleConnect}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <span>Connect TikTok Shop</span>
              <ExternalLink size={16} />
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-400 font-medium mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Why connect your TikTok Shop?
        </h4>
        <ul className="text-gray-400 space-y-2 ml-6 list-disc">
          <li>Automatically import orders as they're placed</li>
          <li>Sync inventory levels in real-time</li>
          <li>Update order status and tracking information</li>
          <li>No more manual data entry or spreadsheets</li>
        </ul>
      </div>
    </div>
  );
};

export default TikTokConnection;
