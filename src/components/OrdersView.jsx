import React, { useState } from 'react'
import { Package, Truck, Calendar, User } from 'lucide-react'

const OrdersView = ({ orders, onGenerateLabel }) => {
  const [selectedOrders, setSelectedOrders] = useState([])
  const [filter, setFilter] = useState('all')

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status.toLowerCase() === filter
  })

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleBatchShipping = () => {
    selectedOrders.forEach(orderId => {
      onGenerateLabel(orderId)
    })
    setSelectedOrders([])
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-0">Orders</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-white text-sm sm:text-base"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
          </select>
          {selectedOrders.length > 0 && (
            <button
              onClick={handleBatchShipping}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm sm:text-base"
            >
              Generate Labels ({selectedOrders.length})
            </button>
          )}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
        {filteredOrders.map((order) => (
          <div key={order.orderId} className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-dark-border hover:border-purple-500/50 transition-colors">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order.orderId)}
                  onChange={() => handleSelectOrder(order.orderId)}
                  className="w-4 h-4 text-purple-600 bg-dark-surface border-dark-border rounded focus:ring-purple-500 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold text-sm sm:text-base">#{order.orderId}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Shipped' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 text-gray-400">
                <User size={16} className="flex-shrink-0" />
                <span className="text-white text-sm sm:text-base truncate">{order.customerName}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-400">
                <Package size={16} className="flex-shrink-0" />
                <span className="text-white text-sm sm:text-base truncate">{order.productName}</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-400">
                <Calendar size={16} className="flex-shrink-0" />
                <span className="text-white text-sm sm:text-base">{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>

              <div className="text-gray-400 text-xs sm:text-sm space-y-1">
                <div>Qty: {order.quantity}</div>
                <div className="truncate">Address: {order.customerAddress}</div>
              </div>

              {order.trackingNumber && (
                <div className="flex items-center space-x-2 text-gray-400">
                  <Truck size={16} className="flex-shrink-0" />
                  <span className="text-green-400 text-sm sm:text-base">{order.trackingNumber}</span>
                </div>
              )}
            </div>

            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-dark-border">
              {order.status === 'Pending' ? (
                <button
                  onClick={() => onGenerateLabel(order.orderId)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Generate Shipping Label
                </button>
              ) : (
                <button className="w-full bg-green-600 text-white py-2 px-3 sm:px-4 rounded-lg cursor-default text-sm sm:text-base">
                  Label Generated
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Package size={40} className="mx-auto text-gray-400 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
          <p className="text-gray-400 text-sm sm:text-base">No orders found matching your filter.</p>
        </div>
      )}
    </div>
  )
}

export default OrdersView