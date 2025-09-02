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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-0">Orders</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
          </select>
          {selectedOrders.length > 0 && (
            <button
              onClick={handleBatchShipping}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Generate Labels ({selectedOrders.length})
            </button>
          )}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredOrders.map((order) => (
          <div key={order.orderId} className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-6 border border-dark-border hover:border-purple-500/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order.orderId)}
                  onChange={() => handleSelectOrder(order.orderId)}
                  className="w-4 h-4 text-purple-600 bg-dark-surface border-dark-border rounded focus:ring-purple-500"
                />
                <div>
                  <h3 className="text-white font-semibold">#{order.orderId}</h3>
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

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-400">
                <User size={16} />
                <span className="text-white">{order.customerName}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-400">
                <Package size={16} />
                <span className="text-white">{order.productName}</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-400">
                <Calendar size={16} />
                <span className="text-white">{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>

              <div className="text-gray-400 text-sm">
                <div>Qty: {order.quantity}</div>
                <div>Address: {order.customerAddress}</div>
              </div>

              {order.trackingNumber && (
                <div className="flex items-center space-x-2 text-gray-400">
                  <Truck size={16} />
                  <span className="text-green-400">{order.trackingNumber}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-dark-border">
              {order.status === 'Pending' ? (
                <button
                  onClick={() => onGenerateLabel(order.orderId)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Generate Shipping Label
                </button>
              ) : (
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg cursor-default">
                  Label Generated
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-400">No orders found matching your filter.</p>
        </div>
      )}
    </div>
  )
}

export default OrdersView