import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import OrdersView from './components/OrdersView'
import ProductsView from './components/ProductsView'
import ShippingView from './components/ShippingView'
import SignUp from './components/auth/SignUp'
import Login from './components/auth/Login'
import PasswordReset from './components/auth/PasswordReset'
import OnboardingFlow from './components/onboarding/OnboardingFlow'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { mockOrders, mockProducts } from './data/mockData'
import orderService from './services/orderService'
import inventoryService from './services/inventoryService'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Onboarding check component
const OnboardingCheck = ({ children }) => {
  const { userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (userProfile && !userProfile.onboardingCompleted) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return children;
};

// Main app layout
const AppLayout = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [orders, setOrders] = useState(mockOrders);
  const [products, setProducts] = useState(mockProducts);
  const { user } = useAuth();
  const location = useLocation();

  // Set active view based on current route
  useEffect(() => {
    const path = location.pathname.split('/')[1];
    if (path) {
      setActiveView(path);
    } else {
      setActiveView('dashboard');
    }
  }, [location]);

  // Fetch orders and products from API
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Fetch orders
          const { orders: fetchedOrders } = await orderService.getOrders(user.id);
          if (fetchedOrders) {
            setOrders(fetchedOrders);
          }

          // Fetch products
          const { products: fetchedProducts } = await inventoryService.getProducts(user.id);
          if (fetchedProducts) {
            setProducts(fetchedProducts);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [user]);

  const handleGenerateLabel = async (orderId) => {
    try {
      const updatedOrder = await orderService.generateShippingLabel(orderId, user.id);
      
      // Update the orders state
      setOrders(orders.map(order => 
        order.orderId === orderId 
          ? updatedOrder
          : order
      ));
    } catch (error) {
      console.error('Error generating shipping label:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <div className="flex">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-0 sm:ml-64">
          <div className="max-w-6xl mx-auto">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard orders={orders} products={products} />} />
                <Route path="/dashboard" element={<Dashboard orders={orders} products={products} />} />
                <Route path="/orders" element={<OrdersView orders={orders} onGenerateLabel={handleGenerateLabel} />} />
                <Route path="/products" element={<ProductsView products={products} />} />
                <Route path="/shipping" element={<ShippingView orders={orders} />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<PasswordReset />} />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <OnboardingFlow />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <AppLayout />
                  </OnboardingCheck>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </ErrorBoundary>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App
