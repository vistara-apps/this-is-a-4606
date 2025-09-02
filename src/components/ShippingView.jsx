import React from 'react'
import { Truck, MapPin, Package } from 'lucide-react'

const ShippingView = ({ orders }) => {
  const shippedOrders = orders.filter(order => order.status === 'Shipped')

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-0">Shipping</h2>
        <div className="text-xs sm:text-sm text-gray-400">
          {shippedOrders.length} shipped orders
        </div>
      </div>

      {/* Shipping Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-dark-border">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex-shrink-0">
              <Package size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-400 text-xs sm:text-sm">Total Shipped</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{shippedOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-dark-border">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex-shrink-0">
              <Truck size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-400 text-xs sm:text-sm">In Transit</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{shippedOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-dark-border">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex-shrink-0">
              <MapPin size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-400 text-xs sm:text-sm">Delivered</p>
              <p className="text-xl sm:text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipped Orders List */}
      <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-dark-border">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Shipped Orders</h3>
        
        {shippedOrders.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {shippedOrders.map((order) => (
              <div key={order.orderId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-dark-surface/50 rounded-lg">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck size={16} className="text-white sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm sm:text-base">Order #{order.orderId}</p>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">{order.customerName}</p>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">{order.productName}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:items-end min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-gray-400 text-xs sm:text-sm">Tracking:</span>
                    <span className="text-green-400 font-mono text-xs sm:text-sm truncate">{order.trackingNumber}</span>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">{order.customerAddress}</p>
                  <button className="mt-2 text-purple-400 hover:text-purple-300 text-xs sm:text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <Truck size={40} className="mx-auto text-gray-400 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
            <p className="text-gray-400 text-sm sm:text-base">No shipped orders yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShippingView