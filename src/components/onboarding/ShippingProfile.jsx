import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import shippoApi from '../../lib/shippoApi';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Form validation schema
const shippingProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Please enter a valid email address'),
  shippoApiKey: z.string().min(1, 'Shippo API key is required'),
});

const ShippingProfile = ({ onComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shippingProfileSchema),
    defaultValues: {
      name: '',
      company: '',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
      phone: '',
      email: user?.email || '',
      shippoApiKey: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      // First validate the Shippo API key
      const validation = await shippoApi.validateApiKey(data.shippoApiKey);
      
      if (!validation.valid) {
        setError('Invalid Shippo API key. Please check and try again.');
        setLoading(false);
        return;
      }
      
      // Save the API key
      await shippoApi.saveApiKey(data.shippoApiKey, user.id);
      
      // Save the shipping profile
      await shippoApi.saveShippingProfile(
        {
          ...data,
          is_default: true,
        },
        user.id
      );
      
      setSuccess(true);
      
      // Mark this step as complete
      onComplete();
    } catch (error) {
      console.error('Error saving shipping profile:', error);
      setError('Failed to save shipping profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Set Up Shipping</h3>
        <p className="text-gray-400">
          Configure your shipping settings to generate labels for your orders.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {success ? (
        <div className="bg-dark-surface/50 rounded-lg p-6 border border-dark-border">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">Shipping Profile Created!</h4>
            <p className="text-gray-400 mb-4">Your shipping profile has been set up successfully.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-dark-surface/50 rounded-lg p-6 border border-dark-border">
            <h4 className="text-lg font-medium text-white mb-4">Shippo API Integration</h4>
            <p className="text-gray-400 mb-4">
              TikTokFlow uses Shippo to generate shipping labels. You'll need a Shippo API key to continue.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="shippoApiKey" className="block text-sm font-medium text-gray-300 mb-1">
                  Shippo API Key
                </label>
                <input
                  id="shippoApiKey"
                  type="text"
                  {...register('shippoApiKey')}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="shippo_test_..."
                />
                {errors.shippoApiKey && (
                  <p className="mt-1 text-sm text-red-400">{errors.shippoApiKey.message}</p>
                )}
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  Don't have a Shippo account?{' '}
                  <a
                    href="https://goshippo.com/register"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 underline"
                  >
                    Sign up for free
                  </a>{' '}
                  and get your API key from the{' '}
                  <a
                    href="https://apps.goshippo.com/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 underline"
                  >
                    API page
                  </a>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-surface/50 rounded-lg p-6 border border-dark-border">
            <h4 className="text-lg font-medium text-white mb-4">Shipping Address</h4>
            <p className="text-gray-400 mb-4">
              This is the address your packages will be shipped from.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">
                  Company (Optional)
                </label>
                <input
                  id="company"
                  type="text"
                  {...register('company')}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your Company"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="street1" className="block text-sm font-medium text-gray-300 mb-1">
                  Street Address
                </label>
                <input
                  id="street1"
                  type="text"
                  {...register('street1')}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="123 Main St"
                />
                {errors.street1 && (
                  <p className="mt-1 text-sm text-red-400">{errors.street1.message}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="street2" className="block text-sm font-medium text-gray-300 mb-1">
                  Apartment, Suite, etc. (Optional)
                </label>
                <input
                  id="street2"
                  type="text"
                  {...register('street2')}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Apt 4B"
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  {...register('city')}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="New York"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-400">{errors.city.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-1">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  {...register('state')}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="NY"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-400">{errors.state.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-300 mb-1">
                  ZIP Code
                </label>
                <input
                  id="zip"
                  type="text"
                  {...register('zip')}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="10001"
                />
                {errors.zip && (
                  <p className="mt-1 text-sm text-red-400">{errors.zip.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  {...register('country')}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-400">{errors.country.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="(123) 456-7890"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Shipping Profile'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ShippingProfile;

