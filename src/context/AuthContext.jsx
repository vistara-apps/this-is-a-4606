import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { errorMessages } from '../config';
import toast from 'react-hot-toast';

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      try {
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          setUser(session.user);
          
          // Get the user profile
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }
          
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthError(error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        
        // Get the user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (!profileError) {
          setUserProfile(profile);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
      }
    });
    
    // Clean up the listener
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            onboardingCompleted: false,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Create a user profile
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            onboardingCompleted: false,
          });
          
        if (profileError) {
          throw profileError;
        }
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      
      // Get user-friendly error message
      let errorMessage = errorMessages.general.unexpectedError;
      
      if (error.message.includes('email')) {
        errorMessage = errorMessages.auth.emailInUse;
      } else if (error.message.includes('password')) {
        errorMessage = errorMessages.auth.weakPassword;
      }
      
      toast.error(errorMessage);
      return { data: null, error };
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      
      // Get user-friendly error message
      let errorMessage = errorMessages.general.unexpectedError;
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = errorMessages.auth.invalidCredentials;
      }
      
      toast.error(errorMessage);
      return { data: null, error };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error(errorMessages.general.unexpectedError);
      return { error };
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Password reset email sent. Check your inbox.');
      return { data, error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(errorMessages.general.unexpectedError);
      return { data: null, error };
    }
  };

  // Update password function
  const updatePassword = async (password) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Password updated successfully.');
      return { data, error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(errorMessages.general.unexpectedError);
      return { data: null, error };
    }
  };

  // Update profile function
  const updateProfile = async (updates) => {
    try {
      // Update the user profile
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      setUserProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(errorMessages.general.unexpectedError);
      return { data: null, error };
    }
  };

  // Auth context value
  const value = {
    user,
    userProfile,
    loading,
    authError,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

