import React, { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import OrdersView from './components/OrdersView'
import ProductsView from './components/ProductsView'
import ShippingView from './components/ShippingView'
import { mockOrders, mockProducts } from './data/mockData'

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [orders, setOrders] = useState(mockOrders)
  const [products, setProducts] = useState(mockProducts)

  const handleGenerateLabel = (orderId) => {
    setOrders(orders.map(order => 
      order.orderId === orderId 
        ? { ...order, status: 'Shipped', trackingNumber: `TK${Date.now()}` }
        : order
    ))
  }

  const renderView = () => {
    switch (activeView) {
      case 'orders':
        return <OrdersView orders={orders} onGenerateLabel={handleGenerateLabel} />
      case 'products':
        return <ProductsView products={products} />
      case 'shipping':
        return <ShippingView orders={orders} />
      default:
        return <Dashboard orders={orders} products={products} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <div className="flex">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-0 sm:ml-64">
          <div className="max-w-6xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App