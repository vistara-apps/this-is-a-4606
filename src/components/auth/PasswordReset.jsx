import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';

// Form validation schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Form validation schema for reset password
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const PasswordReset = () => {
  const { resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if this is a reset password page (has access_token in URL)
  const isResetPage = location.hash.includes('access_token');

  // Setup form for forgot password
  const forgotPasswordForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Setup form for reset password
  const resetPasswordForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Handle forgot password submit
  const handleForgotPassword = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle reset password submit
  const handleResetPassword = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await updatePassword(data.password);
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      
      // Redirect to login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
            <h1 className="text-2xl font-bold text-white">TikTokFlow</h1>
          </div>
        </div>
        
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-8 border border-dark-border">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isResetPage ? 'Reset Your Password' : 'Forgot Your Password?'}
          </h2>
          
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {isResetPage ? 'Password Reset Successful!' : 'Check Your Email'}
              </h3>
              <p className="text-gray-400 mb-4">
                {isResetPage
                  ? 'Your password has been reset successfully. You will be redirected to the login page shortly.'
                  : 'We have sent a password reset link to your email address. Please check your inbox and follow the instructions.'}
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          ) : isResetPage ? (
            <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <div>
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  error={resetPasswordForm.formState.errors.password?.message}
                  {...resetPasswordForm.register('password')}
                />
              </div>
              
              <div>
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  error={resetPasswordForm.formState.errors.confirmPassword?.message}
                  {...resetPasswordForm.register('confirmPassword')}
                />
              </div>
              
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={loading}
                disabled={loading}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          ) : (
            <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
              <div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={forgotPasswordForm.formState.errors.email?.message}
                  {...forgotPasswordForm.register('email')}
                />
              </div>
              
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={loading}
                disabled={loading}
              >
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </div>
        
        <p className="text-center mt-6 text-gray-400">
          Remember your password?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PasswordReset;

