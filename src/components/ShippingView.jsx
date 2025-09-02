import React from 'react'
import { Truck, MapPin, Package } from 'lucide-react'

const ShippingView = ({ orders }) => {
  const shippedOrders = orders.filter(order => order.status === 'Shipped')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-0">Shipping</h2>
        <div className="text-sm text-gray-400">
          {shippedOrders.length} shipped orders
        </div>
      </div>

      {/* Shipping Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-6 border border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Shipped</p>
              <p className="text-2xl font-bold text-white">{shippedOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-6 border border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600">
              <Truck size={24} className="text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">In Transit</p>
              <p className="text-2xl font-bold text-white">{shippedOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-6 border border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
              <MapPin size={24} className="text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Delivered</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipped Orders List */}
      <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-4">Shipped Orders</h3>
        
        {shippedOrders.length > 0 ? (
          <div className="space-y-4">
            {shippedOrders.map((order) => (
              <div key={order.orderId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-dark-surface/50 rounded-lg">
                <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Truck size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Order #{order.orderId}</p>
                    <p className="text-gray-400 text-sm">{order.customerName}</p>
                    <p className="text-gray-400 text-sm">{order.productName}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:items-end">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-gray-400 text-sm">Tracking:</span>
                    <span className="text-green-400 font-mono text-sm">{order.trackingNumber}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{order.customerAddress}</p>
                  <button className="mt-2 text-purple-400 hover:text-purple-300 text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Truck size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400">No shipped orders yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShippingView